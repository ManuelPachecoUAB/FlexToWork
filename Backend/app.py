from flask import Flask, request, jsonify, session
from flask_jwt_extended import JWTManager, create_access_token
from flask_bcrypt import Bcrypt
from flask_cors import CORS, cross_origin
from models import db, User

app = Flask(__name__)

app.config['SECRET_KEY'] = 'a34r435e354v&%&%&wsd534%&%&%&f4dsasd56r&%&%ety543g#$%"#%fg3544'
app.config['JWT_SECRET_KEY'] = 'a34r435sdf4fgdf#$&#$&r4533-ddd-346-7856fd7644$##$&gfd543-^3544'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///flaskdb.db'
jwt = JWTManager(app)

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
    equipa = request.json["equipa"]
    nivel = request.json["nivel"]

    # validations
    if len(email) < 5:
        return alert("email muito pequeno")
    if len(password) < 8:
        return alert("Password muito pequena")
    user_exists = User.query.filter_by(email=email).first() is not None
    if nivel > 4 or nivel < 1:
        return alert("Tipo de utilizador inexistente")
    if user_exists:
        return jsonify({"error": "Email já existe"}), 409

    hashed_password = bcrypt.generate_password_hash(password)
    new_user = User(email=email, password=hashed_password, idequipa=equipa,idnivel=nivel)
    db.session.add(new_user)
    db.session.commit()

    session["user_id"] = new_user.id

    return jsonify({
        "id": new_user.id,
        "email": new_user.email,
        "idequipa": new_user.idequipa,
        "idnivel": new_user.idnivel
    })

@app.route("/login", methods=["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token, id=user.id, email=user.email, idequipa=user.idequipa, idnivel=user.idnivel), 200

    return jsonify({"error": "Acesso não autorizado"}), 401

@app.route("/logout", methods=["GET"])
def logout():
    # Limpar sessão
    session.clear()
    # Pagina de login
    return "Logout"

if __name__ == "__main__":
    app.run(debug=True)