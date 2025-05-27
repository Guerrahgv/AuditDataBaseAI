import { connect } from "../config/db.js";
import auditoriasPorTema from "../auditorias/index.js";
import { sendPrompt } from '../config/ai.js';

let analisisAI = null;

export async function testConnection(req, res) {
  const { dbEngine, dbPort, dbName, dbUser, dbPass } = req.body;

  const dbConfig = {
    host: "localhost",
    user: dbUser,
    password: dbPass,
    database: dbName,
    port: dbPort,
  };

  try {
    const connection = await connect(dbConfig);
    await connection.execute("SELECT NOW() AS now");
    await connection.end();
    res.json({ message: "Conexión exitosa con MySQL" });
  } catch (error) {
    res.status(500).json({ message: "Error al conectar a MySQL: Revisar config " + error.message });
  }
}

export async function auditDataBase(req, res) {
  const { dbEngine, dbPort, dbName, dbUser, dbPass, auditGoals } = req.body;

  const dbConfig = {
    host: "localhost",
    user: dbUser,
    password: dbPass,
    database: dbName,
    port: dbPort,
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
            estado: rows.length === 0 ? "ok" : "warning",
            recomendacion:
              rows.length === 0
                ? auditoria.recomendacionOk
                : auditoria.recomendacionWarning,
          });
        } catch (error) {
          resultados.push({
            tema: auditoria.tema,
            nombre: auditoria.nombre,
            descripcion: auditoria.descripcion,
            error: error.message,
            estado: "error",
          });
        }
      }
    }

    await connection.end();
    analisisAI = resultados;  // guardas los resultados de auditoría
    res.json({ resultados });
  } catch (error) {
    res.status(500).json({ message: "Error al auditar la base de datos: " + error.message });
  }
}

async function getLmStudio(resultados) {
  const prompt = `Responde únicamente en español
Solo dame una lista corta y clara de recomendaciones para mejorar la base de datos, basadas en problemas detectados (estado distinto de "ok").
No incluyas explicaciones, solo recomendaciones directas y concisas.
No incluyas texto adicional ni explicaciones.  
sin viñetas ni numeración, máximo 350 palabras.  
Datos JSON:  
${JSON.stringify(resultados, null, 2)}`;

  try {
    return await sendPrompt(prompt);
  } catch (error) {
    console.error("Error en IA:", error);
    return "No fue posible generar análisis AI en este momento.";
  }
}

export async function getAuditAi(req, res) {
  if (!analisisAI) {
    return res.status(400).json({ message: "No hay resultados de auditoría disponibles para analizar." });
  }

  const analisis = await getLmStudio(analisisAI);
  res.json({ analisis });
}
