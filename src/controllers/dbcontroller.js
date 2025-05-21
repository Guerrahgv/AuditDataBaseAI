import { connect } from '../config/db.js';
import auditoriasPorTema from '../auditorias/index.js';

export async function testConnection(req, res) {
  const { dbEngine, dbPort, dbName, dbUser, dbPass } = req.body;

  const dbConfig = {
    host: 'localhost',
    user: dbUser,
    password: dbPass,
    database: dbName,
    port: dbPort
  };

  try {
    const connection = await connect(dbConfig);
    await connection.execute('SELECT NOW() AS now');
    await connection.end();
    res.json({ message: 'Conexión exitosa con MySQL' });
  } catch (error) {
    res.status(500).json({ message: 'Error al conectar a MySQL: ' + error.message });
  }
}

/* 
export async function auditDataBase(req, res) {
  const { dbEngine, dbPort, dbName, dbUser, dbPass, auditGoals } = req.body;

  console.log('dbEngine:', dbEngine);
  console.log('dbPort:', dbPort);   
  console.log('dbName:', dbName);
  console.log('dbUser:', dbUser);
  console.log('dbPass:', dbPass);
  console.log('auditGoals:', auditGoals);
  


  res.status(200).json({ message: 'en proceso con MySQL' });
}
  */

export async function auditDataBase(req, res) {
  const { dbEngine, dbPort, dbName, dbUser, dbPass, auditGoals } = req.body;

  const dbConfig = {
    host: 'localhost',
    user: dbUser,
    password: dbPass,
    database: dbName,
    port: dbPort
  };

  try {
    const connection = await connect(dbConfig);
    let resultados = [];

    for (const tema of auditGoals) {
      const generarAuditorias = auditoriasPorTema[tema];
      if (!generarAuditorias) continue;

      const auditorias = generarAuditorias(dbName);

      for (const auditoria of auditorias) {
        try {
          const [rows] = await connection.execute(auditoria.sql);

          resultados.push({
            tema: auditoria.tema,
            nombre: auditoria.nombre,
            descripcion: auditoria.descripcion,
            hallazgos: rows,
            estado: rows.length === 0 ? 'ok' : 'warning',
            recomendacion:
              rows.length === 0
                ? auditoria.recomendacionOk
                : auditoria.recomendacionWarning
          });
        } catch (error) {
          resultados.push({
            tema: auditoria.tema,
            nombre: auditoria.nombre,
            descripcion: auditoria.descripcion,
            error: error.message,
            estado: 'error'
          });
        }
      }
    }

    await connection.end();
    console.log('Resultados de la auditoría:', resultados);
    res.json({ resultados });

  } catch (error) {
    res.status(500).json({ message: 'Error al auditar la base de datos: ' + error.message });
  }
}