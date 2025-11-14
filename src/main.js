const form = document.getElementById("form");
const textarea = document.getElementById("textarea");
const inputFile = document.querySelector(".input-file"); 

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const texto = textarea.value.trim();
  const arquivo = inputFile.files[0];

  if (!texto && !arquivo) {
    alert("Digite algum texto ou anexe um arquivo!");
    return;
  }
  
  textarea.value = ""; 
  inputFile.value = '';
  
  const formData = new FormData();

  if (arquivo) {
    formData.append("file", arquivo);
  } else if (texto) {
    formData.append("texto", texto);
  }

  try {
    const resp = await fetch("http://127.0.0.1:8000/analisar_upload", {
      method: "POST",
      body: formData 
    });
    
    if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(`Erro do Servidor: ${resp.status} - ${errorData.detail || 'Ocorreu um erro desconhecido.'}`);
    }

    const data = await resp.json();
    document.querySelector('main').innerHTML += `
    <div class="analysis-section">
          <div class="analysis-title">
            <h1 class="analysis-title">Resultado da Análise</h1>
            <h4 class="category-title">Classificação</h4>
          </div>


          <div id="category-section" class="${data.categoria.toLowerCase() == "produtivo" ? 'productive' : 'unproductive'}">
            <div class="dot ${data.categoria.toLowerCase() == "produtivo" ? 'pdot' : 'udot'}"></div>
            <p class="category">${data.categoria}</p>
          </div>

          <h4 class="response-title">Resposta Sugerida</h4>
          <div class="response-suggestion">
            
            <p class="response">${data.resposta}</p>
            <img src="./img/copy.png" alt="" class="copy-icon">

            
          </div>
    
    `
  
  } catch (error) {
    console.error("Erro ao conectar com o backend:", error);
    alert("Erro ao conectar com o servidor. Verifique o console para mais detalhes.");
  }
});