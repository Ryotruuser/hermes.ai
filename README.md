# ⚡ Hermes AI: Classificador e Gerador de Respostas de E-mail

Este projeto utiliza o FastAPI (Python) no backend para interagir com a API Google Gemini, classificando e-mails como "Produtivos", "Improdutivos" ou "Outros" e gerando sugestões de respostas profissionais. O frontend é uma aplicação web estática simples construída com HTML, CSS e JavaScript (Vite).

## 🚀 Estrutura do Projeto

O repositório está organizado em dois diretórios principais:

- ***backend/:*** Contém o código Python (FastAPI) e as configurações de servidor (main.py, requirements.txt, Procfile).

- ***Root do Repositório:*** Contém os arquivos do cliente web (index.html, src/main.js, src/style.css), o package.json, e a pasta src/public.

## ⚙️ 1. Configuração Local

Para executar a aplicação em seu ambiente local, você precisará ter o Node.js (para o frontend Vite) e o Python 3.10+ (para o backend FastAPI) instalados.

### 1.1. Chave Gemini API

Você precisará de uma chave de API do Google Gemini.

1. Acesse o Google AI Studio.

2. Crie sua chave de API e guarde-a em um local seguro.

### 1.2. Backend Python (FastAPI)

### A. Instalação das Dependências

Navegue até o diretório backend/ e instale todas as dependências, preferencialmente dentro de um ambiente virtual:

``` bash
cd backend/
# 1. Cria e ativa o ambiente virtual (opcional)
python -m venv venv
source venv/bin/activate  # Linux/macOS
# .\venv\Scripts\activate # Windows/CMD
```

### B. Instala todas as dependências (inclui FastAPI, google-genai, gunicorn, etc.)
```bash
pip install -r requirements.txt
```

### C. Definição da Chave de Ambiente

No terminal onde você for rodar o servidor, defina a variável GEMINI_API_KEY:

```bash
# Substitua SUA_CHAVE_AQUI pelo valor real
export GEMINI_API_KEY="SUA_CHAVE_AQUI" 
# Windows/CMD: set GEMINI_API_KEY=SUA_CHAVE_AQUI
# Windows/PowerShell: $env:GEMINI_API_KEY="SUA_CHAVE_AQUI"
```

### D. Iniciar o Servidor

Execute o servidor de desenvolvimento Uvicorn (comando recomendado para desenvolvimento):
```bash
# Garante que você está no diretório backend/
uvicorn main:app --reload --host 127.0.0.1 --port 8000
# Ou: python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

***O backend estará ativo em http://127.0.0.1:8000.***

## 2. Frontend (Vite)

### 2.1 Instalação de Pacotes

Navegue para a raiz do repositório e instale as dependências JavaScript:

***Retorna para a raiz do projeto***
```bash
cd ..
```

### Instala dependências JavaScript (na raiz do repositório)
```bash
npm install
```

### 2.1 Iniciar o Servidor de Desenvolvimento

Execute o servidor de desenvolvimento do Vite (na raiz do projeto):
```bash
npm run dev
```

***O frontend estará ativo, geralmente em http://localhost:5173.***

***Observação sobre CORS:*** A porta do servidor Vite (http://localhost:5173) deve estar listada no array origins do arquivo backend/main.py. Caso utilize outra porta para o frontend, será necessário ajustar esta lista.

### 🌐 Deploy em Nível Gratuito

### O deploy deste projeto utiliza a arquitetura de monorepo em serviços free tier:

Frontend: Vercel (Site Estático).

Backend: Render (Web Service).

Configurações de Deploy (Render)

Se você precisar reconfigurar o serviço backend no Render, as regras são:

Root Directory: Defina como backend se todos os arquivos de configuração estiverem na pasta backend/.
Start Command: Use o comando de produção: gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT.
Variável de Ambiente: A chave API deve ser injetada de forma segura como GEMINI_API_KEY.
CORS: A lista de origens no main.py deve incluir a URL pública do Vercel (ex: https://hermes-ai-three.vercel.app).
