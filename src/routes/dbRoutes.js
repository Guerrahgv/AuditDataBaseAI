import { Router } from 'express'; 
import { testConnection, auditDataBase, getAuditAi } from '../controllers/dbcontroller.js';  

const router = Router();


router.post('/test-connection', testConnection);
router.post('/audit-database', auditDataBase);  
router.post('/auditAi', getAuditAi);

export default router;
