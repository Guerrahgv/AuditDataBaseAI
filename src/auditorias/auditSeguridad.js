/**
 * auditoriasSeguridad.js
 *
 * Contiene un conjunto de auditorías SQL relacionadas con la seguridad del sistema y del esquema.
 *
 * Estructura de cada objeto:
 * - tema: categoría general de auditoría
 * - nombre: título descriptivo de la verificación
 * - descripcion: detalle de qué verifica y por qué
 * - sql: consulta SQL con template literal `${dbName}` para insertar dinámicamente el nombre de la base
 * - recomendacionOk: mensaje si la consulta NO devuelve filas (es decir, no se detecta problema)
 * - recomendacionWarning: mensaje si la consulta SÍ devuelve filas (es decir, hay algo que revisar)
 *
 * 📌 Lógica actual:
 *   → Todas las consultas están diseñadas para detectar posibles problemas de seguridad.
 *   → Por tanto:
 *     - Si la consulta devuelve resultados → hay un hallazgo a revisar → se usa `recomendacionWarning`
 *     - Si NO devuelve resultados → no hay hallazgos → se usa `recomendacionOk`
 *
 * ⚠️ Nota para futuras auditorías:
 *   Si en algún caso devolver resultados indica un estado saludable (como verificar que existen respaldos configurados),
 *   entonces deberás invertir la lógica del feedback y anotar ese caso claramente.
 */
export const getAuditoriasSeguridad = (dbName) => [
  {
    tema: "Seguridad",
    nombre: "Usuarios con privilegios amplios (ALL PRIVILEGES)",
    descripcion:
      "Detecta usuarios que tienen acceso completo a la base de datos, lo que puede representar un riesgo si no está justificado.",
    sql: `SELECT grantee, privilege_type, table_schema
      FROM information_schema.schema_privileges
      WHERE privilege_type = 'ALL PRIVILEGES'
        AND table_schema = '${dbName}';`,
    recomendacionOk:
      "No se encontraron usuarios con ALL PRIVILEGES en el esquema. Esto indica una buena segmentación de permisos.",
    recomendacionWarning:
      "Hay usuarios con ALL PRIVILEGES sobre el esquema. Revisa si realmente necesitan ese nivel de acceso.",
  },
  {
    tema: "Seguridad",
    nombre: "Usuarios con acceso remoto (%)",
    descripcion:
      "Identifica usuarios que pueden conectarse desde cualquier IP ('%'), lo cual representa un alto riesgo de seguridad.",
    sql: `
      SELECT user, host
      FROM mysql.user
      WHERE host = '%';
    `,
    recomendacionOk:
      "No hay usuarios con acceso remoto. Esto mejora la seguridad de conexión al servidor.",
    recomendacionWarning:
      "Se detectaron usuarios que permiten conexiones desde cualquier IP ('%'). Se recomienda restringir los accesos por host.",
  },
  {
    tema: "Seguridad",
    nombre: "Usuarios sin contraseña configurada",
    descripcion:
      "Detecta cuentas que no tienen contraseña configurada o están vacías, lo cual compromete la seguridad del sistema.",
    sql: `
      SELECT user, host
      FROM mysql.user
      WHERE authentication_string IS NULL OR authentication_string = '';
    `,
    recomendacionOk:
      "Todas las cuentas tienen contraseñas configuradas correctamente.",
    recomendacionWarning:
      "Hay cuentas sin contraseña configurada. Se recomienda revisar y asignar contraseñas seguras.",
  },
  {
    tema: "Seguridad",
    nombre: "Usuarios con privilegios en múltiples bases de datos",
    descripcion:
      "Detecta usuarios que tienen acceso a más de una base de datos, lo cual puede ser un problema si no hay separación de ambientes.",
    sql: `
      SELECT grantee, COUNT(DISTINCT table_schema) AS bases_con_acceso
      FROM information_schema.schema_privileges
      GROUP BY grantee
      HAVING bases_con_acceso > 1;
    `,
    recomendacionOk:
      "Todos los usuarios tienen acceso limitado a una sola base, lo cual favorece la separación de ambientes.",
    recomendacionWarning:
      "Algunos usuarios tienen acceso a múltiples bases. Evalúa si es necesario o conviene restringir sus permisos.",
  },
  {
    tema: "Seguridad",
    nombre: "Usuarios con capacidad de otorgar permisos (GRANT OPTION)",
    descripcion:
      "Identifica usuarios que pueden otorgar privilegios a otros, lo cual debe estar estrictamente controlado.",
    sql: `SELECT grantee, privilege_type, is_grantable
      FROM information_schema.schema_privileges
      WHERE is_grantable = 'YES'
        AND table_schema = '${dbName}';`,
    recomendacionOk:
      "Ningún usuario puede otorgar permisos a otros en este esquema. Esto reduce el riesgo de escalada de privilegios.",
    recomendacionWarning:
      "Se encontraron usuarios que pueden otorgar permisos. Verifica si realmente deben tener ese privilegio.",
  },
  {
    tema: "Seguridad",
    nombre: "Tablas sin claves primarias definidas",
    descripcion:
      "Detecta tablas en el esquema que no tienen clave primaria, lo cual afecta la integridad de los datos.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_name NOT IN (
          SELECT table_name
          FROM information_schema.table_constraints
          WHERE constraint_type = 'PRIMARY KEY'
            AND table_schema = '${dbName}'
        );
    `,
    recomendacionOk:
      "Todas las tablas del esquema tienen clave primaria definida.",
    recomendacionWarning:
      "Existen tablas sin clave primaria. Se recomienda establecer una para garantizar integridad y eficiencia.",
  },
  {
    tema: "Seguridad",
    nombre: "Tablas con datos potencialmente sensibles",
    descripcion:
      "Busca columnas que podrían contener información sensible como contraseñas, correos o identificaciones.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND column_name REGEXP 'password|correo|email|clave|rfc|documento';
    `,
    recomendacionOk:
      "No se detectaron columnas sensibles. El esquema no almacena datos críticos sin clasificar.",
    recomendacionWarning:
      "Se encontraron posibles columnas sensibles. Asegúrate de que estén cifradas y gestionadas con medidas de seguridad adecuadas.",
  },
  {
    tema: "Seguridad",
    nombre: "Tablas sin campos de auditoría (created_at, updated_at)",
    descripcion:
      "Detecta si las tablas no registran cuándo fueron creados o modificados los registros, lo cual es clave para trazabilidad.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_name NOT IN (
          SELECT table_name
          FROM information_schema.columns
          WHERE table_schema = '${dbName}'
          AND column_name IN ('created_at', 'updated_at')
          GROUP BY table_name
        );
    `,
    recomendacionOk:
      "Todas las tablas tienen campos de auditoría. Esto facilita la trazabilidad de los datos.",
    recomendacionWarning:
      "Hay tablas que no registran cuándo se crearon o actualizaron sus datos. Considera agregar campos de auditoría.",
  },
  {
    tema: "Seguridad",
    nombre: "Usuarios con privilegios de administración global",
    descripcion:
      "Detecta usuarios que tienen privilegios administrativos como SUPER, FILE, PROCESS, RELOAD o SHUTDOWN, lo cual debe estar estrictamente controlado.",
    sql: `
      SELECT user, host, Super_priv, File_priv, Process_priv, Reload_priv, Shutdown_priv
      FROM mysql.user
      WHERE Super_priv = 'Y' OR File_priv = 'Y' OR Process_priv = 'Y' OR Reload_priv = 'Y' OR Shutdown_priv = 'Y';
    `,
    recomendacionOk:
      "No hay usuarios con privilegios de administración global. Esto reduce riesgos en el sistema.",
    recomendacionWarning:
      "Se detectaron usuarios con privilegios administrativos globales. Verifica si son necesarios o si pueden delegarse.",
  },
  {
    tema: "Seguridad",
    nombre: "Usuarios sin expiración de contraseña",
    descripcion:
      "Verifica si las contraseñas de los usuarios tienen una política de expiración habilitada.",
    sql: `
      SELECT user, host, password_expired
      FROM mysql.user
      WHERE password_expired = 'N';
    `,
    recomendacionOk:
      "Todos los usuarios tienen políticas de expiración activas para sus contraseñas.",
    recomendacionWarning:
      "Hay cuentas sin expiración de contraseña. Se recomienda habilitar esta política para fortalecer la seguridad.",
  },
  {
    tema: "Seguridad",
    nombre: "Tablas con nombres ambiguos o poco descriptivos",
    descripcion:
      "Identifica tablas con nombres genéricos como datos, temp, info, tabla1, etc., que dificultan la gestión segura del esquema.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_name REGEXP 'datos|temp|info|prueba|tabla[0-9]';
    `,
    recomendacionOk:
      "Todas las tablas del esquema tienen nombres descriptivos y apropiados.",
    recomendacionWarning:
      "Hay tablas con nombres ambiguos. Se recomienda usar nombres claros que reflejen el contenido o propósito.",
  },
  {
    tema: "Seguridad",
    nombre: "Esquema con más privilegios que el necesario",
    descripcion:
      "Detecta si hay privilegios a nivel de esquema que otorgan más acceso del que se necesita (como INSERT sin control de contexto).",
    sql: `
      SELECT grantee, privilege_type
      FROM information_schema.schema_privileges
      WHERE table_schema = '${dbName}'
        AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE');
    `,
    recomendacionOk: "No se detectaron privilegios excesivos sobre el esquema.",
    recomendacionWarning:
      "Hay usuarios con permisos de modificación (INSERT, UPDATE, DELETE). Revisa si es necesario o se puede reducir.",
  },
  {
    tema: "Seguridad",
    nombre: "Procedimientos almacenados sin control de acceso",
    descripcion:
      "Detecta procedimientos almacenados creados sin definir un definer seguro, lo que puede representar un agujero de seguridad.",
    sql: `
      SELECT routine_name, definer
      FROM information_schema.routines
      WHERE routine_schema = '${dbName}'
        AND definer LIKE '%@%';
    `,
    recomendacionOk:
      "Todos los procedimientos están definidos con un definer claro y controlado.",
    recomendacionWarning:
      "Se encontraron procedimientos sin definer seguro. Asegúrate de definirlos bajo cuentas controladas y restringidas.",
  },
  {
    tema: "Seguridad",
    nombre: "Vistas que exponen demasiada información",
    descripcion:
      "Detecta vistas que utilizan SELECT * y hacen JOIN entre muchas tablas, lo que puede filtrar información innecesaria.",
    sql: `
      SELECT table_name, view_definition
      FROM information_schema.views
      WHERE table_schema = '${dbName}'
        AND view_definition LIKE '%*%'
        AND view_definition LIKE '%JOIN%';
    `,
    recomendacionOk:
      "No se encontraron vistas que expongan información excesiva.",
    recomendacionWarning:
      "Hay vistas que usan SELECT * con JOIN. Revisa su definición para limitar la información expuesta.",
  },
  {
    tema: "Seguridad",
    nombre: "Usuarios definidos con múltiples hosts",
    descripcion:
      "Detecta si un mismo usuario está definido varias veces en diferentes hosts, lo cual puede provocar dificultades de gestión y control de permisos.",
    sql: `
    SELECT user, COUNT(*) AS num_hosts
    FROM mysql.user
    GROUP BY user
    HAVING num_hosts > 1;
  `,
    recomendacionOk:
      "No se detectaron usuarios definidos con múltiples hosts. La configuración de acceso es clara y centralizada.",
    recomendacionWarning:
      "Se detectaron usuarios definidos con múltiples hosts. Esto puede generar configuraciones inconsistentes y es recomendable consolidarlos.",
  },
  {
    tema: "Seguridad",
    nombre: "Usuarios sin plugin de autenticación definido",
    descripcion:
      "Verifica si existen usuarios que no tienen un plugin de autenticación especificado, lo cual puede comprometer el proceso de inicio de sesión seguro.",
    sql: `
    SELECT user, host, plugin
    FROM mysql.user
    WHERE plugin IS NULL OR plugin = '';
  `,
    recomendacionOk:
      "Todos los usuarios tienen un plugin de autenticación definido, asegurando un mecanismo de login controlado.",
    recomendacionWarning:
      "Hay usuarios sin plugin de autenticación definido. Esto puede derivar en accesos inseguros o fallos de autenticación.",
  },
];

export default getAuditoriasSeguridad;
