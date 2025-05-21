export const getAuditoriasRendimiento = (dbName) => [
  {
    tema: "Rendimiento",
    nombre: "Tablas sin índices secundarios",
    descripcion:
      "Detecta tablas que no tienen ningún índice aparte del primario, lo que puede afectar el rendimiento de las consultas.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_name NOT IN (
          SELECT DISTINCT table_name
          FROM information_schema.statistics
          WHERE table_schema = '${dbName}'
            AND index_name != 'PRIMARY'
        );
    `,
    recomendacionOk:
      "Todas las tablas del esquema tienen índices secundarios. Esto mejora el rendimiento de las consultas.",
    recomendacionWarning:
      "Se detectaron tablas sin índices secundarios. Considera agregar índices en campos usados en WHERE o JOIN.",
  },
  {
    tema: "Rendimiento",
    nombre: "Columnas tipo FLOAT en vez de DECIMAL",
    descripcion:
      "Detecta columnas numéricas que usan FLOAT, lo cual puede causar imprecisiones en cálculos financieros.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND data_type = 'float';
    `,
    recomendacionOk:
      "No se encontraron columnas con tipo FLOAT. Se están usando tipos más precisos como DECIMAL.",
    recomendacionWarning:
      "Hay columnas con tipo FLOAT. Considera usar DECIMAL para cálculos financieros más precisos.",
  },
  {
    tema: "Rendimiento",
    nombre: "Tablas con más de 20 columnas",
    descripcion:
      "Detecta tablas que pueden estar mal diseñadas por tener demasiadas columnas, lo que afecta la lectura y mantenimiento.",
    sql: `
      SELECT table_name, COUNT(*) AS total_columnas
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
      GROUP BY table_name
      HAVING total_columnas > 20;
    `,
    recomendacionOk: "Todas las tablas tienen un número razonable de columnas.",
    recomendacionWarning:
      "Hay tablas con más de 20 columnas. Considera revisar la normalización del diseño.",
  },
  {
    tema: "Rendimiento",
    nombre: "Vistas sin cláusula WHERE",
    descripcion:
      "Detecta vistas que no filtran datos con WHERE, lo cual puede impactar el rendimiento al consultar grandes volúmenes.",
    sql: `
      SELECT table_name, view_definition
      FROM information_schema.views
      WHERE table_schema = '${dbName}'
        AND view_definition NOT LIKE '%WHERE%';
    `,
    recomendacionOk: "Todas las vistas filtran datos mediante cláusulas WHERE.",
    recomendacionWarning:
      "Se encontraron vistas sin cláusula WHERE. Esto puede afectar el rendimiento en consultas.",
  },
  {
    tema: "Rendimiento",
    nombre: "Vistas que usan SELECT *",
    descripcion:
      "Detecta vistas que seleccionan todas las columnas en lugar de solo las necesarias, lo cual afecta eficiencia.",
    sql: `
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = '${dbName}'
        AND view_definition LIKE '%*%';
    `,
    recomendacionOk:
      "No se encontraron vistas que usen SELECT *. Esto mejora la eficiencia de las vistas.",
    recomendacionWarning:
      "Hay vistas que usan SELECT *. Se recomienda limitar las columnas seleccionadas.",
  },
  {
    tema: "Rendimiento",
    nombre: "Falta de índices en claves foráneas",
    descripcion:
      "Detecta claves foráneas que no tienen un índice asociado, lo cual puede degradar el rendimiento en joins.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.key_column_usage
      WHERE table_schema = '${dbName}'
        AND referenced_table_name IS NOT NULL
        AND (table_name, column_name) NOT IN (
          SELECT table_name, column_name
          FROM information_schema.statistics
          WHERE table_schema = '${dbName}'
        );
    `,
    recomendacionOk: "Todas las claves foráneas tienen índices asociados.",
    recomendacionWarning:
      "Se detectaron claves foráneas sin índice. Esto puede ralentizar joins y restricciones.",
  },
  {
    tema: "Rendimiento",
    nombre: "Campos tipo TEXT o BLOB sin necesidad clara",
    descripcion:
      "Detecta columnas de tipo TEXT o BLOB que podrían usar tipos más ligeros si no requieren almacenar grandes cantidades de datos.",
    sql: `
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND data_type IN ('text', 'blob');
    `,
    recomendacionOk: "No se usan campos TEXT o BLOB innecesariamente.",
    recomendacionWarning:
      "Se encontraron campos tipo TEXT o BLOB. Evalúa si realmente necesitan almacenar tanto contenido.",
  },
  {
    tema: "Rendimiento",
    nombre: "Columnas con nombres que sugieren datos anidados",
    descripcion:
      "Detecta nombres como 'direccion1', 'direccion2', lo que indica posible denormalización del esquema.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND column_name REGEXP '.*[0-9]$';
    `,
    recomendacionOk:
      "No se encontraron columnas que sugieran datos anidados o repetidos.",
    recomendacionWarning:
      "Hay columnas con nombres que sugieren datos duplicados o mal normalizados. Considera reestructurar.",
  },
  {
    tema: "Rendimiento",
    nombre: "Tablas sin datos",
    descripcion:
      "Identifica tablas que no tienen registros. Esto puede indicar diseño innecesario o estructuras sin uso.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_rows = 0
        AND table_type = 'BASE TABLE';
    `,
    recomendacionOk:
      "Todas las tablas tienen registros. No hay estructuras vacías.",
    recomendacionWarning:
      "Se encontraron tablas sin registros. Revisa si son necesarias o deben poblarse.",
  },
  {
    tema: "Rendimiento",
    nombre: "Índices duplicados",
    descripcion:
      "Detecta índices creados sobre las mismas columnas más de una vez, lo que desperdicia espacio y reduce eficiencia.",
    sql: `
      SELECT table_name, index_name, COUNT(*) AS count
      FROM information_schema.statistics
      WHERE table_schema = '${dbName}'
      GROUP BY table_name, index_name
      HAVING count > 1;
    `,
    recomendacionOk: "No hay índices duplicados en las tablas.",
    recomendacionWarning:
      "Se encontraron índices duplicados. Elimina los innecesarios para mejorar el uso de recursos.",
  },
  {
    tema: "Rendimiento",
    nombre: "Tablas con más de 1000 registros sin índices",
    descripcion:
      "Identifica tablas grandes que no tienen índices secundarios, lo cual afecta el rendimiento en búsquedas y joins.",
    sql: `
      SELECT t.table_name
      FROM information_schema.tables t
      WHERE t.table_schema = '${dbName}'
        AND t.table_rows > 1000
        AND t.table_name NOT IN (
          SELECT DISTINCT table_name
          FROM information_schema.statistics
          WHERE table_schema = '${dbName}'
            AND index_name != 'PRIMARY'
        );
    `,
    recomendacionOk:
      "Las tablas con muchos registros tienen índices adecuados.",
    recomendacionWarning:
      "Se encontraron tablas grandes sin índices secundarios. Esto puede causar lentitud en búsquedas.",
  },
  {
    tema: "Rendimiento",
    nombre: "Tablas con múltiples columnas NULLABLE",
    descripcion:
      "Detecta tablas donde la mayoría de columnas permiten NULL, lo que puede afectar el uso de índices y performance.",
    sql: `
      SELECT table_name, COUNT(*) AS columnas_nullable
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND is_nullable = 'YES'
      GROUP BY table_name
      HAVING columnas_nullable > 10;
    `,
    recomendacionOk: "No hay tablas con un exceso de columnas NULLABLE.",
    recomendacionWarning:
      "Algunas tablas tienen muchas columnas NULLABLE. Considera si pueden establecerse como NOT NULL.",
  },
  {
    tema: "Rendimiento",
    nombre: "Claves primarias compuestas de más de 2 columnas",
    descripcion:
      "Detecta claves primarias demasiado largas que pueden afectar la eficiencia del almacenamiento y las relaciones.",
    sql: `
      SELECT tc.table_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage ku
        ON tc.constraint_name = ku.constraint_name
        AND tc.table_schema = ku.table_schema
        AND tc.table_name = ku.table_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'ventasdb'
      GROUP BY tc.table_name
      HAVING COUNT(ku.column_name) > 2;
    `,
    recomendacionOk:
      "Todas las claves primarias tienen una estructura simple o moderada.",
    recomendacionWarning:
      "Se encontraron claves primarias con más de 2 columnas. Considera simplificar su estructura si es posible.",
  },
  {
    tema: "Rendimiento",
    nombre: "Columnas tipo VARCHAR demasiado extensas",
    descripcion:
      "Detecta columnas VARCHAR mayores a 255 caracteres, que pueden ser costosas si no es necesario tanto espacio.",
    sql: `
      SELECT table_name, column_name, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND data_type = 'varchar'
        AND character_maximum_length > 255;
    `,
    recomendacionOk:
      "Todas las columnas VARCHAR tienen una longitud razonable.",
    recomendacionWarning:
      "Hay columnas VARCHAR demasiado largas. Evalúa si necesitan tanto espacio para mejorar rendimiento.",
  },
  {
    tema: "Rendimiento",
    nombre: "Uso de tipos de fecha como VARCHAR",
    descripcion:
      "Detecta columnas con nombres típicos de fecha pero definidas como VARCHAR, lo cual impide optimizaciones y ordenamientos.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND data_type = 'varchar'
        AND column_name REGEXP 'fecha|date|hora|tiempo';
    `,
    recomendacionOk:
      "No se encontraron columnas de tipo fecha mal definidas como VARCHAR.",
    recomendacionWarning:
      "Hay columnas tipo fecha definidas como VARCHAR. Usa tipos DATE o DATETIME para optimizar consultas y validaciones.",
  },
];

export default getAuditoriasRendimiento;
