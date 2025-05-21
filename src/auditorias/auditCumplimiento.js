export const getAuditoriasCumplimiento = (dbName) => [
  {
    tema: "Cumplimiento",
    nombre: "Tablas sin campos de auditoría",
    descripcion:
      "Detecta tablas que no incluyen campos como created_at o updated_at, esenciales para trazabilidad.",
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
      "Todas las tablas tienen campos de auditoría temporal definidos, Cumple con registros de eventos internos (auditoría de datos)",
    recomendacionWarning:
      "Hay tablas sin campos de auditoría como created_at o updated_at. Se recomienda agregarlos para trazabilidad.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Columnas sin comentario definido",
    descripcion:
      "Detecta columnas que no tienen comentarios descriptivos, lo que dificulta el mantenimiento y comprensión.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND (column_comment IS NULL OR column_comment = '');
    `,
    recomendacionOk:
      "Las columnas tienen comentarios definidos para facilitar su comprensión, Cumpliendo con buenas prácticas de documentación",
    recomendacionWarning:
      "Se detectaron columnas sin comentario. Agrega descripciones para facilitar mantenimiento y auditorías externas.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Tablas sin comentario definido",
    descripcion:
      "Detecta tablas sin comentario en su definición, lo cual afecta la documentación del esquema.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND (table_comment IS NULL OR table_comment = '');
    `,
    recomendacionOk:
      "Todas las tablas tienen comentarios definidos, facilitando la mantenibilidad y el cumplimiento de estándares de diseño documentado.",
    recomendacionWarning:
      "Hay tablas sin comentario. Agrega descripciones para mejorar la documentación formal del sistema.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Ausencia de campos created_by y updated_by",
    descripcion:
      "Detecta si las tablas no registran qué usuario creó o modificó los datos.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_name NOT IN (
          SELECT table_name
          FROM information_schema.columns
          WHERE table_schema = '${dbName}'
            AND column_name IN ('created_by', 'updated_by')
          GROUP BY table_name
        );
    `,
    recomendacionOk:
      "Todas las tablas incluyen campos de trazabilidad de usuarios, cumpliendo con políticas de auditoría de acciones por usuario.",
    recomendacionWarning:
      "Faltan campos de trazabilidad de usuarios. Agrega created_by y updated_by en tablas críticas.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Falta de restricciones CHECK o ENUM en columnas de estado",
    descripcion:
      "Detecta columnas como estado o tipo sin validación formal definida (ni CHECK ni ENUM).",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND column_name REGEXP 'estado|tipo|nivel'
        AND data_type NOT IN ('enum')
        AND column_type NOT LIKE '%CHECK%';
    `,
    recomendacionOk:
      "Las columnas críticas usan ENUMs o CHECKs, cumpliendo con controles de integridad y validación de datos aceptables.",
    recomendacionWarning:
      "Se detectaron columnas sin validación formal. Agrega ENUMs o restricciones CHECK para evitar valores inválidos.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Uso de nombres genéricos en tablas",
    descripcion:
      "Detecta nombres de tabla como data, info, test, temp que son poco descriptivos.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_name REGEXP '(^|_)data|info|temp|test|prueba';
    `,
    recomendacionOk:
      "Los nombres de las tablas son claros y específicos, cumpliendo con estándares de nomenclatura profesional.",
    recomendacionWarning:
      "Se encontraron nombres de tabla genéricos. Usa nombres significativos que reflejen su propósito.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Columnas que no siguen una convención de nombres",
    descripcion:
      "Detecta columnas con mezcla de estilos: snake_case, camelCase, mayúsculas, etc.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND (column_name REGEXP '[A-Z]' OR column_name LIKE '% %');
    `,
    recomendacionOk:
      "Los nombres de columna siguen una convención uniforme, cumpliendo con estándares de legibilidad y consistencia.",
    recomendacionWarning:
      "Se detectaron columnas con estilos inconsistentes. Usa una convención uniforme para todo el esquema.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Campos numéricos sin precisión definida",
    descripcion:
      "Detecta campos DECIMAL sin precisión (e.g. DECIMAL sin (10,2)), lo que puede causar errores en cálculos.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND data_type = 'decimal'
        AND numeric_precision IS NULL;
    `,
    recomendacionOk:
      "Todos los campos DECIMAL tienen precisión y escala definidas, cumpliendo con requisitos de precisión financiera.",
    recomendacionWarning:
      "Hay campos DECIMAL sin precisión. Define escala y precisión para evitar errores financieros.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Ausencia de políticas de expiración o control de acceso",
    descripcion:
      "Detecta si hay tablas de usuarios sin campos como password_expired, intentos_login, etc.",
    sql: `
      SELECT table_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND table_name LIKE '%usuario%'
        GROUP BY table_name
        HAVING SUM(column_name IN ('password_expired', 'intentos_login', 'ultimo_acceso')) = 0;
    `,
    recomendacionOk:
      "Las tablas de usuarios contemplan políticas de seguridad, cumpliendo con buenas prácticas de gestión de acceso.",
    recomendacionWarning:
      "No se detectaron campos de control de acceso en tablas de usuarios. Se recomienda agregarlos.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Falta de bitácoras o historial de cambios",
    descripcion:
      "Detecta si hay ausencia de tablas que registren eventos, logs o acciones del sistema.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_name REGEXP 'log|bitacora|historial|auditoria';
    `,
    recomendacionOk:
      "Existen estructuras para logs o historial de acciones, cumpliendo con requisitos de auditoría y trazabilidad operativa.",
    recomendacionWarning:
      "No se detectaron estructuras de auditoría. Agrega bitácoras para trazabilidad en entornos regulados.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Vistas que utilizan SELECT *",
    descripcion:
      "Detecta vistas que usan SELECT * en su definición, lo cual dificulta el control sobre los campos expuestos y puede generar problemas futuros.",
    sql: `
    SELECT table_name, view_definition
    FROM information_schema.views
    WHERE table_schema = '${dbName}'
      AND view_definition LIKE '%*%';
  `,
    recomendacionOk:
      "No se encontraron vistas con SELECT *. Esto indica un buen control sobre las columnas expuestas.",
    recomendacionWarning:
      "Se detectaron vistas que usan SELECT *. Reemplaza esta práctica por una lista explícita de columnas para mejorar mantenibilidad y seguridad.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Ausencia de tablas de configuración o parámetros del sistema",
    descripcion:
      "Detecta si el esquema no contiene tablas de parámetros, ajustes o configuración, lo cual afecta la escalabilidad y auditoría.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_name REGEXP 'config|parametro|ajuste'
    `,
    recomendacionOk:
      "El sistema contiene tablas de configuración, cumpliendo con principios de centralización de reglas y escalabilidad.",
    recomendacionWarning:
      "No se detectaron tablas de configuración o parámetros. Evalúa crear una para centralizar reglas del sistema.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Ausencia de control de versión en estructuras",
    descripcion:
      "Evalúa si existe alguna tabla que registre versiones de cambios, como versiones de scripts o metadatos.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_name REGEXP 'version|schema_migrations|migraciones';
    `,
    recomendacionOk:
      "Existe control de versiones del esquema, cumpliendo con trazabilidad estructural y buenas prácticas de evolución del modelo.",
    recomendacionWarning:
      "No se encontró control de versiones. Agrega una tabla de migraciones para registrar cambios estructurales.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Columnas sin tipo definido (uso de tipos genéricos TEXT o BLOB)",
    descripcion:
      "Detecta columnas con tipos muy genéricos como TEXT o BLOB que no tienen restricciones adicionales.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND data_type IN ('text', 'blob')
        AND column_type NOT LIKE '%CHECK%';
    `,
    recomendacionOk:
      "No se encontraron columnas con tipos genéricos sin restricción, cumpliendo con control de estructura y contenido válido.",
    recomendacionWarning:
      "Se detectaron columnas TEXT o BLOB sin restricciones. Evalúa definir su uso o limitar contenido.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Uso de campos ambiguos como 'valor', 'dato', 'detalle'",
    descripcion:
      "Detecta nombres de columnas genéricos o ambiguos que dificultan la comprensión del modelo.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND column_name REGEXP '^valor$|^dato$|^detalle$';
    `,
    recomendacionOk:
      "No se encontraron columnas con nombres ambiguos, cumpliendo con buenas prácticas de semántica y legibilidad del modelo.",
    recomendacionWarning:
      "Se detectaron columnas con nombres genéricos. Cambia por nombres más específicos para mejorar legibilidad y cumplimiento.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Convención de nombres en plural para tablas",
    descripcion:
      "Verifica si los nombres de tablas están en plural, siguiendo buenas prácticas de modelado.",
    sql: `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = '${dbName}'
      AND table_name NOT REGEXP 's$';
  `,
    recomendacionOk:
      "Los nombres de las tablas están en plural, siguiendo buenas prácticas de modelado relacional.",
    recomendacionWarning:
      "Algunas tablas no siguen la convención plural. Aunque no es obligatorio, se recomienda para mantener consistencia y claridad.",
  },
  {
    tema: "Cumplimiento",
    nombre: "Columnas con nombres en plural",
    descripcion:
      "Detecta columnas cuyo nombre está en plural, lo cual no es recomendable ya que representan un solo valor por fila.",
    sql: `
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = '${dbName}'
      AND column_name REGEXP 's$'
      AND column_name NOT LIKE '%_ids';  -- Excluye casos válidos como producto_ids
  `,
    recomendacionOk:
      "Todas las columnas están nombradas en singular, siguiendo buenas prácticas de atomicidad y claridad.",
    recomendacionWarning:
      "Se detectaron columnas con nombres en plural. Cambia a singular para representar mejor un único valor por fila.",
  },
];

export default getAuditoriasCumplimiento;
