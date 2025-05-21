# 🛠 DB Auditor

![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Aplicación web para la **auditoría automatizada de bases de datos MySQL**. Permite evaluar la calidad, seguridad y estructura de una base de datos mediante **consultas SQL predefinidas agrupadas por objetivos**.

---

## 🌟 Características

### 🔍 Auditoría Inteligente por Objetivos

- ✅ **Conexión directa** a instancias MySQL locales
- 🧠 **Auditorías agrupadas** por temas:

  - 🛡️ **Seguridad**  
    - Usuarios con permisos peligrosos  
    - Acceso remoto habilitado  
    - Contraseñas vacías o sin políticas  

  - ⚡ **Rendimiento**  
    - Tablas sin índices  
    - Consultas costosas  
    - Claves primarias compuestas  

  - 🏗️ **Normalización**  
    - Violaciones a 1FN, 2FN, 3FN  
    - Columnas multivalor  
    - Redundancia de datos  

  - 📋 **Cumplimiento**  
    - Falta de comentarios en tablas  
    - Ausencia de campos de auditoría  
    - Nombres poco descriptivos

### 📊 Resultados visuales

- ✅ Se muestran agrupados por tema
- 📥 Opción para **imprimir el reporte en PDF**
- 🎯 Recomendaciones automáticas según cada hallazgo

---

## 🛠 Tecnologías

| Componente       | Tecnología                         |
|------------------|------------------------------------|
| Backend          | Node.js + Express                  |
| Base de datos    | MySQL + mysql2                     |
| Frontend         | HTML + CSS + Vanilla JS            |
| Estilos          | Estilos propios (personalizados)   |
| Exportación      | `window.print()` para PDF dinámico |

---

## 🚀 Instalación

```bash
git clone https://github.com/Guerrahgv/AuditDataBaseAI
cd AuditDataBaseAI
npm install
```