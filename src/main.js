const form = document.getElementById("form");
const textarea = document.getElementById("textarea");
const inputFile = document.querySelector(".input-file");
const mainContainer = document.querySelector('main');
const exampleButtons = document.querySelectorAll(".card-btn"); 

const LOADING_ID = "analysis-loading-section"; 
const ANALYSIS_URL = "http://127.0.0.1:8000/analisar_upload";


function removerResultadosAnteriores() {
    const existingAnalysis = document.querySelector(".analysis-section");
    if (existingAnalysis) {
        existingAnalysis.remove();
    }
    const existingLoading = document.getElementById(LOADING_ID);
    if (existingLoading) {
        existingLoading.remove();
    }
}

function exibirLoading() {
    removerResultadosAnteriores(); 

    mainContainer.insertAdjacentHTML('beforeend', `
        <div id="${LOADING_ID}" class="analysis-section" style="text-align: center; padding: 20px;">
            <p style="font-size: 1.2rem; font-weight: 600; color: #1976d2;">Analisando E-mail... 🤖</p>
            <p>Aguarde enquanto o Hermes AI processa sua solicitação.</p>
        </div>
    `);
}

function exibirResultado(data) {
    const loadingElement = document.getElementById(LOADING_ID);
    if (loadingElement) {
        loadingElement.remove();
    }
    
    const categoriaLower = data.categoria.toLowerCase();

    mainContainer.insertAdjacentHTML('beforeend', `
        <div class="analysis-section">
            <div class="analysis-title">
                <h1 class="analysis-title">Resultado da Análise</h1>
                <h4 class="category-title">Classificação</h4>
            </div>

            <div id="category-section" class="${categoriaLower == "produtivo" ? "productive" : "unproductive"}">
                <div class="dot ${categoriaLower == "produtivo" ? "pdot" : "udot"}"></div>
                <p class="category">${data.categoria}</p>
            </div>

            <h4 class="response-title">Resposta Sugerida</h4>
            <div class="response-suggestion">
                <p class="response">${data.resposta}</p>
            </div>
        </div>
    `);
}


async function enviarTextoParaAnalise(textoParaAnalise) {
    if (!textoParaAnalise.trim()) {
        alert("O texto de análise está vazio.");
        return;
    }

    exibirLoading();

    const formData = new FormData();
    formData.append("texto", textoParaAnalise);

    try {
        const resp = await fetch(ANALYSIS_URL, {
            method: "POST",
            body: formData 
        });
        
        if (!resp.ok) {
            const errorData = await resp.json();
            throw new Error(`Erro do Servidor: ${resp.status} - ${errorData.detail || 'Ocorreu um erro desconhecido.'}`);
        }

        const data = await resp.json();
        exibirResultado(data);
        
    } catch (error) {
        removerResultadosAnteriores();
        console.error("Erro ao conectar com o backend:", error);
        alert("Hermes está muito ocupado no momento, tente novamente. Verifique o console para mais detalhes.");
    }
}

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
    
    if (arquivo) {
        exibirLoading();
        const formData = new FormData();
        formData.append("file", arquivo);

        try {
            const resp = await fetch(ANALYSIS_URL, {
                method: "POST",
                body: formData 
            });
            
            if (!resp.ok) {
                const errorData = await resp.json();
                throw new Error(`Erro do Servidor: ${resp.status} - ${errorData.detail || 'Ocorreu um erro desconhecido.'}`);
            }

            const data = await resp.json();
            exibirResultado(data);

        } catch (error) {
            removerResultadosAnteriores();
            console.error("Erro ao processar arquivo:", error);
            alert("Erro ao processar arquivo.");
        }
    } else if (texto) {
        await enviarTextoParaAnalise(texto);
    }
});


exampleButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const card = button.closest('.card-example');
        const exampleTextElement = card.querySelector('.card-text');
        const emailText = exampleTextElement.textContent.trim();
        
        await enviarTextoParaAnalise(emailText);
    });
});