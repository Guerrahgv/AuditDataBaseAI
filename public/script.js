document.getElementById("myForm").addEventListener("submit", async function(e) { 
        e.preventDefault(); 
        const response = await fetch('/api/audit', { method: 'POST', body: JSON.stringify(formData) });
        const report = await response.json();
        CreateReport(report);
})

function CreateReport() {
    const report = document.getElementById("report");
    report.innerHTML = ``;
}   