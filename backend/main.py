import os
from fastapi import File, UploadFile, Form
import io
import docx 
from pypdf import PdfReader 
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

try:
    client = genai.Client() 
except Exception as e:
    print(f"Erro ao inicializar o cliente Gemini: {e}")

# Inicializa o FastAPI
app = FastAPI()

# Configuração do CORS
origins = [
    "https://hermes-ai-inky.vercel.app",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_file(file: UploadFile) -> str:
    """Extrai texto de arquivos .txt, .pdf e .docx."""
    content = ""
    file_extension = file.filename.split('.')[-1].lower()

    try:
        if file_extension == 'txt':
            # Arquivo de texto simples
            content = file.file.read().decode('utf-8')
        
        elif file_extension == 'pdf':
            # Arquivo PDF
            reader = PdfReader(file.file)
            for page in reader.pages:
                content += page.extract_text()
        
        elif file_extension in ('docx', 'doc'):
            # Arquivo DOCX/DOC
            doc = docx.Document(file.file)
            for paragraph in doc.paragraphs:
                content += paragraph.text + '\n'
        
        else:
            raise ValueError(f"Formato de arquivo não suportado: .{file_extension}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo: {e}")

    return content

# --- Schemas Pydantic (Sem alteração) ---

class EmailAnalysisRequest(BaseModel):
    """Schema para o corpo da requisição POST."""
    texto: str

class AnalysisResponse(BaseModel):
    """Schema para a resposta que será enviada ao frontend."""
    categoria: str
    resposta: str

# --- Função de Análise com Gemini (Sem alteração) ---

def analyze_email_with_gemini(email_text: str) -> dict:
    """
    Chama a API Gemini para classificar e responder ao e-mail.
    """
    
    # Prompt estruturado para garantir a saída desejada (JSON) 
    system_instruction = (
        "Você é um assistente de análise de e-mails. Sua tarefa é analisar o texto de um e-mail "
        "e fornecer dois resultados: a 'categoria' do e-mail (que deve ser estritamente 'Produtivo' ou 'Improdutivo') "
        "e uma 'resposta' curta, profissional e apropriada para o e-mail. "
        "Se a categoria for 'Improdutivo' (ex: spam, distrações, notícias irrelevantes), a resposta deve ser breve e polida. "
        "Se a categoria for 'Produtivo' a resposta deve ser direta e profissional, com no máximo 50 palavras. "
        "Retorne a saída estritamente em formato JSON com as chaves 'categoria' e 'resposta'."
    )
    
    # Definição do esquema JSON de saída
    response_schema = types.Schema(
        type=types.Type.OBJECT,
        properties={
            "categoria": types.Schema(
                type=types.Type.STRING, 
                enum=["Produtivo", "Improdutivo"],
                description="A classificação do e-mail: Produtivo, Improdutivo."
            ),
            "resposta": types.Schema(
                type=types.Type.STRING, 
                description="Uma resposta curta e profissional para o e-mail (máx. 50 palavras)."
            )
        },
        required=["categoria", "resposta"]
    )
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[email_text],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=response_schema
            )
        )
        
        # O resultado vem como uma string JSON que precisa ser analisada
        import json
        return json.loads(response.text)
        
    except Exception as e:
        # Se houver erro de autenticação (chave inválida), ele aparecerá aqui
        print(f"Erro na chamada da API Gemini: {e}")
        return {"categoria": "Erro", "resposta": f"Não foi possível analisar o e-mail: {e}"}


# --- Rota da API (Sem alteração) ---

@app.post("/analisar_upload", response_model=AnalysisResponse) 
async def analisar_email_upload(
    file: UploadFile | None = File(None),  # Pode ser um arquivo
    texto: str | None = Form(None)        # Ou texto direto do form-data
):
    """
    Endpoint para receber texto (Form) ou um arquivo (File) e retornar a análise do Gemini.
    """
    email_text = ""
    
    if file:
        # Se um arquivo foi enviado, extrai o texto dele
        email_text = extract_text_from_file(file)
    elif texto:
        # Se apenas o texto direto foi enviado, usa-o
        email_text = texto
    else:
        # Nenhum texto ou arquivo enviado
        raise HTTPException(status_code=400, detail="Por favor, forneça o texto de um e-mail ou anexe um arquivo.")

    if not email_text.strip():
        raise HTTPException(status_code=400, detail="O texto extraído do arquivo está vazio. Por favor, verifique o conteúdo.")

    # Chama a função de análise Gemini (a mesma que você já tinha)
    analysis_result = analyze_email_with_gemini(email_text)
    
    if analysis_result.get("categoria") == "Erro":
         raise HTTPException(status_code=500, detail=analysis_result.get("resposta"))

    return analysis_result