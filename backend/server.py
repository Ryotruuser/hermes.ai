from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/analisar", methods=["POST"])
def analisar_email():
    data = request.get_json()
    texto = data.get("texto", "")
    
    return jsonify({
        "categoria": "Teste OK",
        "resposta": f"Recebi o texto: {texto}"
    })

if __name__ == "__main__":
    app.run(port=3000, debug=True)
