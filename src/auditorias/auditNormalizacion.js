export const getAuditoriasNormalizacion = (dbName)=> [
  {
    tema: "Normalización",
    nombre: "Tablas sin clave primaria",
    descripcion: "Detecta tablas en el esquema que no tienen una clave primaria definida, lo cual rompe la integridad de la base de datos.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_name NOT IN (
          SELECT DISTINCT table_name
          FROM information_schema.table_constraints
          WHERE constraint_type = 'PRIMARY KEY'
            AND table_schema = '${dbName}'
        );
    `,
    recomendacionOk: "Todas las tablas tienen clave primaria definida correctamente.",
    recomendacionWarning: "Hay tablas sin clave primaria. Esto afecta la integridad de los datos y relaciones."
  },
  {
    tema: "Normalización",
    nombre: "Tablas sin claves foráneas",
    descripcion: "Detecta tablas que no tienen ninguna clave foránea, lo cual puede ser indicio de mal modelado relacional.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_name NOT IN (
          SELECT DISTINCT table_name
          FROM information_schema.referential_constraints
          WHERE constraint_schema = '${dbName}'
        );
    `,
    recomendacionOk: "Todas las tablas que lo requieren tienen claves foráneas definidas.",
    recomendacionWarning: "Se detectaron tablas sin claves foráneas. Revisa si deberían estar relacionadas con otras."
  },
  {
    tema: "Normalización",
    nombre: "Columnas repetidas que violan la primera forma normal (1FN)",
    descripcion: "Detecta columnas con nombres como direccion1, direccion2, etc., lo que viola la 1FN al almacenar listas en columnas.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND column_name REGEXP '.*[0-9]$';
    `,
    recomendacionOk: "No hay columnas que violen la Primera Forma Normal (1FN).",
    recomendacionWarning: "Se encontraron columnas repetidas (direccion1, direccion2...). Considera normalizar con una tabla relacionada."
  },
  {
    tema: "Normalización",
    nombre: "Uso de columnas compuestas sin dividir en entidades separadas",
    descripcion: "Detecta columnas que contienen múltiples valores en un solo campo (como nombre_completo o direccion_completa).",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND column_name REGEXP 'nombre_completo|direccion_completa|telefono_contacto|ubicacion';
    `,
    recomendacionOk: "No se detectaron columnas que agrupen múltiples datos en un solo campo.",
    recomendacionWarning: "Se encontraron columnas con datos compuestos. Divide los datos en columnas separadas para cumplir con 1FN."
  },
  {
    tema: "Normalización",
    nombre: "Tablas con datos duplicados potenciales",
    descripcion: "Detecta tablas sin restricciones únicas que podrían permitir duplicados en columnas clave.",
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${dbName}'
        AND table_name NOT IN (
          SELECT DISTINCT table_name
          FROM information_schema.table_constraints
          WHERE constraint_type = 'UNIQUE'
            AND table_schema = '${dbName}'
        );
    `,
    recomendacionOk: "Todas las tablas relevantes tienen restricciones UNIQUE que ayudan a evitar duplicados.",
    recomendacionWarning: "Se encontraron tablas sin restricciones únicas. Esto puede permitir registros duplicados no deseados."
  },
  {
    tema: "Normalización",
    nombre: "Campos booleanos representados con enteros",
    descripcion: "Detecta columnas BOOLEAN que están representadas con tipos como TINYINT o INT en lugar del tipo correcto.",
    sql: `
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND column_name REGEXP 'activo|habilitado|estado|visible'
        AND data_type IN ('int', 'tinyint');
    `,
    recomendacionOk: "Los campos booleanos usan el tipo adecuado.",
    recomendacionWarning: "Hay campos booleanos definidos como INT. Considera usar BOOLEAN o ENUM para mayor claridad."
  },
  {
    tema: "Normalización",
    nombre: "Violación de tercera forma normal (3FN) por redundancia de datos",
    descripcion: "Detecta columnas como nombre_producto en facturas que deberían provenir de una tabla relacionada.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND column_name REGEXP 'nombre_producto|nombre_cliente|nombre_categoria';
    `,
    recomendacionOk: "No se detectó redundancia en campos clave como nombres de entidades relacionadas.",
    recomendacionWarning: "Hay columnas que podrían estar redundando datos. Evalúa si deben estar normalizadas en otras tablas."
  },
  {
    tema: "Normalización",
    nombre: "Falta de relación entre tablas con nombres similares",
    descripcion: "Detecta tablas que podrían estar relacionadas por nombre (clientes y direcciones_clientes), pero no tienen FK definida.",
    sql: `
      SELECT c.table_name AS tabla_posible, r.table_name AS sin_fk
      FROM information_schema.columns c
      LEFT JOIN information_schema.referential_constraints r
        ON c.table_name = r.table_name
      WHERE c.table_schema = '${dbName}'
        AND c.column_name LIKE '%_id'
        AND r.table_name IS NULL;
    `,
    recomendacionOk: "Las posibles relaciones entre tablas están correctamente definidas mediante claves foráneas.",
    recomendacionWarning: "Existen columnas tipo _id que no están relacionadas formalmente. Revisa si falta una clave foránea."
  },
  {
    tema: "Normalización",
    nombre: "Campos fecha almacenados como texto",
    descripcion: "Detecta columnas con nombres tipo fecha pero que están mal definidas como VARCHAR.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND column_name REGEXP 'fecha|date'
        AND data_type = 'varchar';
    `,
    recomendacionOk: "Todos los campos de fecha usan tipos DATE o DATETIME.",
    recomendacionWarning: "Hay campos de fecha definidos como texto. Esto impide validaciones y ordenamiento adecuado."
  },
  {
    tema: "Normalización",
    nombre: "Tablas con campos de múltiples idiomas mezclados",
    descripcion: "Detecta tablas donde se mezclan idiomas en los nombres de columna, afectando la coherencia del diseño.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND (column_name REGEXP 'name' AND column_name NOT LIKE '%nombre%')
        OR (column_name REGEXP 'description' AND column_name NOT LIKE '%descripcion%');
    `,
    recomendacionOk: "No se encontraron mezclas de idiomas en el nombre de columnas.",
    recomendacionWarning: "Hay columnas con nombres en diferentes idiomas. Homogeneiza el lenguaje para mayor claridad del diseño."
  }, 
    {
    tema: "Normalización",
    nombre: "Columnas con múltiples significados en un solo campo",
    descripcion: "Detecta columnas que podrían contener más de un valor lógico, como info_general, datos_extra o campo1.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND column_name REGEXP 'info_general|datos_extra|campo[0-9]';
    `,
    recomendacionOk: "No se encontraron columnas con significados múltiples o vagos.",
    recomendacionWarning: "Hay columnas con múltiples significados. Se recomienda dividirlas en campos separados o entidades relacionadas."
  },
  {
    tema: "Normalización",
    nombre: "Uso de ENUMs con demasiadas opciones",
    descripcion: "Detecta ENUMs con muchas opciones, lo cual indica que debería ser una tabla relacionada en vez de un tipo enumerado.",
    sql: `
      SELECT table_name, column_name, column_type
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND data_type = 'enum'
        AND LENGTH(column_type) > 100;
    `,
    recomendacionOk: "Los ENUMs definidos están bien acotados y no sobrecargan la estructura.",
    recomendacionWarning: "Hay ENUMs con demasiadas opciones. Considera usar una tabla relacionada para mayor flexibilidad y normalización."
  },
  {
    tema: "Normalización",
    nombre: "Tablas con claves primarias que no son AUTO_INCREMENT",
    descripcion: "Detecta tablas con claves primarias que no se autogeneran, lo cual puede dificultar la inserción y la unicidad.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND column_key = 'PRI'
        AND extra NOT LIKE '%auto_increment%';
    `,
    recomendacionOk: "Todas las claves primarias están definidas como AUTO_INCREMENT.",
    recomendacionWarning: "Se encontraron claves primarias que no son AUTO_INCREMENT. Esto puede generar conflictos al insertar nuevos registros."
  },
  {
    tema: "Normalización",
    nombre: "Claves foráneas sin ON DELETE/UPDATE definido",
    descripcion: "Detecta claves foráneas sin políticas de eliminación o actualización, lo que puede dejar datos huérfanos.",
    sql: `
      SELECT table_name, constraint_name
      FROM information_schema.referential_constraints
      WHERE constraint_schema = '${dbName}'
        AND (delete_rule = 'NO ACTION' OR update_rule = 'NO ACTION');
    `,
    recomendacionOk: "Todas las claves foráneas tienen reglas definidas de eliminación o actualización.",
    recomendacionWarning: "Se detectaron claves foráneas sin ON DELETE/UPDATE. Considera agregar reglas para mantener integridad referencial."
  },
  {
    tema: "Normalización",
    nombre: "Campos que deberían estar normalizados en catálogos",
    descripcion: "Detecta columnas que podrían representarse como catálogos independientes, como tipo, estado o categoría.",
    sql: `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = '${dbName}'
        AND column_name REGEXP 'tipo|estado|categoria|nivel';
    `,
    recomendacionOk: "No se encontraron campos candidatos a ser normalizados en catálogos.",
    recomendacionWarning: "Hay campos que podrían estar en tablas de catálogo. Evalúa si necesitan relaciones para mayor integridad."
  }

];

export default getAuditoriasNormalizacion;
