import express from 'express';  
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dbRoutes from './routes/dbRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(bodyParser.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rutas para la conexión a la base de datos
app.use('/api', dbRoutes);

export default app;  
