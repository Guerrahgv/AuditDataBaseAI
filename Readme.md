# 🛠 DB Auditor AI

![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Aplicación de auditoría automatizada para bases de datos relacionales que analiza seguridad, rendimiento y estructura usando IA (DeepSeek o modelos locales).

## 🌟 Características

### 🔍 Análisis Automatizado
- ✅ **Conexión en tiempo real** a MySQL, PostgreSQL, SQL Server y más
- 🤖 **Generación de consultas SQL** mediante IA para detectar problemas
- 📋 **Checklist automático** con:
  - 🛡️ **Seguridad**: 
    - Contraseñas sin cifrar
    - Permisos excesivos
    - Datos sensibles expuestos
  - ⚡ **Rendimiento**:
    - Índices faltantes
    - Consultas ineficientes
    - Particionamiento recomendado
  - 🏗️ **Normalización**: 
    - Verificación de 1FN, 2FN, 3FN
    - Redundancia de datos


## 🛠 Tecnologías

| Componente       | Tecnología                  |
|------------------|-----------------------------|
| Backend          | Node.js + Express           |
| IA               | DeepSeek API / LM Studio    |
| Frontend         | HTML5 + CSS3 + Vanilla JS   |
| Base de Datos    | mysql2 / pg / tedious       |
| Estilos          | Bootstrap (opcional)        |

## 🚀 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Guerrahgv/AuditDataBaseAI
cd db-auditor-ai
npm install
```