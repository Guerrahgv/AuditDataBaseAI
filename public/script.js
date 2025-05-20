const form = document.getElementById("db-connection-form");
const testBtn = document.getElementById("btn-test-connection");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const dbEngine = form["db-engine"].value;
  const dbPort = form["db-port"].value;
  const dbName = form["db-name"].value;
  const dbUser = form["db-user"].value;
  const dbPass = form["db-pass"].value;

  const checkboxes = document.querySelectorAll('input[name="audit-goals"]');
  const checked = Array.from(checkboxes).filter((chk) => chk.checked).map((chk) => chk.value);

  const data = {
    dbEngine,
    dbPort,
    dbName,
    dbUser,
    dbPass,
    auditGoals: checked,
  };

  alert("Formulario enviado: " + JSON.stringify(data));

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
      showToast(result.message, "success");
    } else {
      showToast(result.message, "error");
    }
  } catch (error) {
    showToast("Error al intentar conectar: " + error.message, "error");
  }

});

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
