from flask import Flask, request, jsonify, session
from flask_bcrypt import
from flask_cors import CORS, cross_origin
from models import db, User

app = Flask(__name__)

app.config['SECRET_KEY'] = 'a34r435e354vwsd534f4565433544'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///flaskdb.db'

SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = True

bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/")
def hello():
    if session.get("user_id") is None:
        return redirect("/login")
    return "Proximas paginas"

@app.route("/signup", methods=["POST"])
def signup():
    email = request.json["email"]
    password = request.json["password"]

    # validations
    if len(username) < 5:
        return alert("Username muito pequeno")
    if len(password) < 8:
        return alert("Password muito pequena")
    user_exists = User.query.filter_by(email=email).first() is not None
    if user_exists:
        return jsonify({"error": "Email já existe"}), 409

    hashed_password = bcrypt.generate_password_hash(password)
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    session["user_id"] = new_user.id

    return jsonify({
        "id": new_user.id,
        "email": new_user.email
    })

@app.route("/login", methods=["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"error": "Acesso não autorizado"}), 401

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Não autorizado"}), 401

    session["user_id"] = user.id

    return jsonify({
        "id": user.id,
        "email": user.email
    })

@app.route("/logout")
def logout():
    # Limpar sessão
    session.clear()
    # Pagina de login
    return redirect("/login")

if __name__ == "__main__":
    app.run(debug=True)