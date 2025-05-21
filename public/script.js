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
    showToast("Error al intentar conectar: " + error.message, "error");
  }
});

function showToast(message, type = "success", duration = 4000) {
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

   //BotonImprimir();

}

function toggleAcordeon(element) {
  const content = element.nextElementSibling;
  const isActive = content.classList.contains("active");

  // Cierra todos los contenidos abiertos
  document
    .querySelectorAll(".acordeon-content")
    .forEach((c) => c.classList.remove("active"));

  if (!isActive) {
    content.classList.add("active");
  }
}

function BotonImprimir() {
 
  if (document.getElementById("print-report-btn")) return;

  const boton = document.createElement("button");
  boton.id = "print-report-btn";
  boton.innerHTML = "🖨️ Imprimir reporte";
  boton.onclick = () => window.print();

  document.body.appendChild(boton);
}
