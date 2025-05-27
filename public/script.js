const form = document.getElementById("db-connection-form");
const testBtn = document.getElementById("btn-test-connection");

testBtn.addEventListener("click", async function () {
  const dbEngine = form["db-engine"].value.trim();
  const dbPort = form["db-port"].value.trim();
  const dbName = form["db-name"].value.trim();
  const dbUser = form["db-user"].value.trim();
  const dbPass = form["db-pass"].value.trim();

  const data = {
    dbEngine,
    dbPort,
    dbName,
    dbUser,
    dbPass,
  };

  if(!dbEngine || !dbPort || !dbName || !dbUser || !dbPass){
     showToast("Llena los campos para continuar", "error");
  }else{
    try {
    const response = await fetch("/api/test-connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      showToast(result.message, "success");
    } else {
      showToast(result.message, "error");
    }
  } catch (error) {
    showToast("Error al intentar conectar: Revisa la config" + error.message, "error");
  }



  }

  
});

function showToast(message, type = "success", duration = 3000) {
  const container = document.getElementById("toastContainer");

  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.classList.add(type === "error" ? "toast-error" : "toast-success");
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      container.removeChild(toast);
    }, 300); // Tiempo para la transición de opacidad
  }, duration);
  toast.addEventListener("click", () => {
    container.removeChild(toast);
  });
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const dbEngine = form["db-engine"].value;
  const dbPort = form["db-port"].value;
  const dbName = form["db-name"].value;
  const dbUser = form["db-user"].value;
  const dbPass = form["db-pass"].value;

  const checkboxes = document.querySelectorAll('input[name="audit-goals"]');
  const checked = Array.from(checkboxes)
    .filter((chk) => chk.checked)
    .map((chk) => chk.value);
  if (checked.length === 0) {
    showToast("Selecciona al menos un objetivo de auditoría", "error");
    return;
  }

  const data = {
    dbEngine,
    dbPort,
    dbName,
    dbUser,
    dbPass,
    auditGoals: checked,
  };

  try {
    const response = await fetch("/api/audit-database", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      showToast("Auditoría completada", "success");
      renderAcordeon(result.resultados);
    } else {
      showToast(result.message, "error");
    }
  } catch (error) {
    showToast("Error al intentar conectar: " + error.message, "error");
  }
});

function renderAcordeon(auditorias) {
  const contenedor = document.getElementById("db-response");
  contenedor.innerHTML = "";

  const agrupadas = auditorias.reduce((acc, item) => {
    if (!acc[item.tema]) acc[item.tema] = [];
    acc[item.tema].push(item);
    return acc;
  }, {});

  for (const [tema, auditoriasDelTema] of Object.entries(agrupadas)) {
    const grupoWrapper = document.createElement("div");
    grupoWrapper.className = "grupo-acordeon";

    const titulo = document.createElement("h3");
    titulo.textContent = tema;
    grupoWrapper.appendChild(titulo);

    const acordeonContainer = document.createElement("div");
    acordeonContainer.className = "acordeon-container";

    auditoriasDelTema.forEach((auditoria) => {
      const acordeon = document.createElement("div");
      acordeon.className = "acordeon";

      const item = document.createElement("div");
      item.className = "acordeon-item";

      const header = document.createElement("div");
      header.className = `acordeon-header ${auditoria.estado}`;
      const iconoEstado =
        {
          ok: "👍",
          warning: "⚠️",
          error: "❌",
        }[auditoria.estado.toLowerCase()] || "";

      header.textContent = `${iconoEstado} ${auditoria.nombre}`;

      header.onclick = () => toggleAcordeon(header);

      const content = document.createElement("div");
      content.className = "acordeon-content";
      content.innerHTML = `
        <p><strong>Descripción:</strong> ${auditoria.descripcion}</p>
        ${
          auditoria.hallazgos?.length > 0
            ? `<pre><code>${JSON.stringify(
                auditoria.hallazgos,
                null,
                2
              )}</code></pre>`
            : "<p>No se encontraron hallazgos.</p>"
        }
         <p><strong>Recomendación:</strong> ${auditoria.recomendacion}</p>
      `;

      item.appendChild(header);
      item.appendChild(content);
      acordeon.appendChild(item);
      acordeonContainer.appendChild(acordeon); // Se agrupa por tema
    });

    grupoWrapper.appendChild(acordeonContainer);
    contenedor.appendChild(grupoWrapper);
  }

    renderAnalisisAi()

}

function toggleAcordeon(element) {
  const content = element.nextElementSibling;
  const isActive = content.classList.contains("active");

 
  document
    .querySelectorAll(".acordeon-content")
    .forEach((c) => c.classList.remove("active"));

  if (!isActive) {
    content.classList.add("active");
  }
}

async function renderAnalisisAi() {
  const contenedor = document.getElementById("ai-response");
  const imgAI = `<img id="ai-img" class="ai-img" src="./assets/robot.gif" alt="Image" style="width:100px; cursor:pointer;">`;
  contenedor.innerHTML = imgAI;

  let popup = document.getElementById('popup');
  let popupContent;

  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'popup';
    popup.style.cssText = `
      display:none;
      position:fixed;
      top:0; left:0; width:100%; height:100%;
      background:rgba(0,0,0,0.5);
      justify-content:center;
      align-items:center;
      z-index:9999;
    `;

    popupContent = document.createElement('div');
    popupContent.style.cssText = `
      background:#fff;
      padding:20px;
      border-radius:8px;
      width:300px;
      text-align:center;
      box-shadow:0 2px 10px rgba(0,0,0,0.3);
    `;

    popup.appendChild(popupContent);
    document.body.appendChild(popup);

    // Cerrar popup al hacer click fuera
    popup.addEventListener('click', e => {
      if (e.target === popup) popup.style.display = 'none';
    });
  } else {
    popupContent = popup.firstChild;
  }

  // Evento para abrir popup
  const aiImg = document.getElementById('ai-img');
  aiImg.onclick = () => {
    popup.style.display = 'flex';
  };


  popupContent.innerHTML = `
    <h2>¡Hola!</h2>
    <p>Mis recomendaciones están cargando...</p>
    <button id="close-popup-btn" style="
      background:#f44336; color:#fff; border:none; padding:8px 16px; 
      margin-top:15px; cursor:pointer; border-radius:4px;
    ">Cerrar</button>
  `;

  // Agregar evento cerrar al botón
  popupContent.querySelector('#close-popup-btn').onclick = () => {
    popup.style.display = 'none';
  };

  try {
    const response = await fetch('/api/auditAi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const data = await response.json();

    // Actualizar contenido con resultado
    popupContent.innerHTML = `
      <h2>¡Hola Auditor!</h2>
      <p>Mis recomendaciones son las siguientes:</p>
      <pre style="text-align:left; white-space: pre-wrap;">${data.analisis}</pre>
      <button id="close-popup-btn" style="
        background:#f44336; color:#fff; border:none; padding:8px 16px; 
        margin-top:15px; cursor:pointer; border-radius:4px;
      ">Cerrar</button>
    `;

    // Re-agregar evento cerrar
    popupContent.querySelector('#close-popup-btn').onclick = () => {
      popup.style.display = 'none';
    };

  } catch (error) {
    popupContent.innerHTML = `
      <h2>¡Hola Auditor!</h2>
      <p>Error al cargar análisis: ${error.message}</p>
      <button id="close-popup-btn" style="
        background:#f44336; color:#fff; border:none; padding:8px 16px; 
        margin-top:15px; cursor:pointer; border-radius:4px;
      ">Cerrar</button>
    `;
    popupContent.querySelector('#close-popup-btn').onclick = () => {
      popup.style.display = 'none';
    };
  }
}


