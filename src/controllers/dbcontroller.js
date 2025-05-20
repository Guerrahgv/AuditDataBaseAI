import { connect } from '../config/db.js';

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