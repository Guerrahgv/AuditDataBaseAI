import { Router } from 'express'; 
import { testConnection, auditDataBase } from '../controllers/dbController.js';  

const router = Router();


router.post('/test-connection', testConnection);
router.post('/audit-database', auditDataBase);  


export default router;
