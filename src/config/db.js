import mysql from 'mysql2/promise';

async function connect(dbConfig) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conexión exitosa a MySQL server');
    return connection;
  } catch (error) {
    console.error('Error al conectar a MySQL en el server:', error);
    throw error;
  }
}

export { connect };
