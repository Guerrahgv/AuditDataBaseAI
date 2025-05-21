import { getAuditoriasSeguridad } from './auditSeguridad.js';
import { getAuditoriasRendimiento } from './auditRendimiento.js';
import { getAuditoriasNormalizacion } from './auditNormalizacion.js';
import { getAuditoriasCumplimiento } from './auditCumplimiento.js';

const obtenerAuditoriasPorTema = {
  seguridad: getAuditoriasSeguridad,
  rendimiento: getAuditoriasRendimiento,
  normalizacion: getAuditoriasNormalizacion,
  cumplimiento: getAuditoriasCumplimiento
};

export default obtenerAuditoriasPorTema;
/*import auditorias from '../auditorias/index.js';

const auditoriasSeleccionadas = auditorias['seguridad'];*/ 