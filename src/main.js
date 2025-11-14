const form = document.getElementById("form");
const textarea = document.getElementById("textarea");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const texto = textarea.value;

  if (!texto.trim()) {
    alert("Digite algum texto!");
    return;
  }

  textarea.value = "";

  try {
    const resp = await fetch("http://localhost:3000/analisar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    });

    const data = await resp.json();

    document.querySelector(".category").textContent = data.categoria;
    document.querySelector(".response").textContent = data.resposta;

  } catch (error) {
    console.error("Erro ao conectar com o backend:", error);
    alert("Erro ao conectar com o servidor.");
  }
});
