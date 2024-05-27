from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_cors import CORS, cross_origin
from models import db, users, feriasmarcadas, ausenciasmarcadas, presencialmarcadas
from datetime import datetime

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
    primeironome = request.json["primeironome"]
    segundonome = request.json["segundonome"]
    password = request.json["password"]
    equipa = request.json["equipa"]
    nivel = request.json["nivel"]

    # validations
    if len(email) < 5:
        return alert("email muito pequeno")
    if len(password) < 8:
        return alert("Password muito pequena")
    user_exists = users.query.filter_by(email=email).first() is not None
    if nivel > 5 or nivel < 1:
        return alert("Tipo de utilizador inexistente")
    if user_exists:
        return jsonify({"error": "Email já existe"}), 409

    hashed_password = bcrypt.generate_password_hash(password)
    new_user = users(email=email, password=hashed_password,primeironome=primeironome,segundonome=segundonome,idequipa=equipa,idnivel=nivel)
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

    user = users.query.filter_by(email=email).first()

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

@app.route("/api/users", methods=["POST"])
@jwt_required()  # Requer que o usuário esteja autenticado
def add_user():
    current_user_email = get_jwt_identity()
    current_user = users.query.filter_by(email=current_user_email).first()

    if not current_user or current_user.idnivel != 5:  # Verifica se é admin
        return jsonify({"error": "Acesso não autorizado"}), 403

    email = request.json["email"]
    primeironome = request.json["primeironome"]
    segundonome = request.json["segundonome"]
    password = request.json["password"]
    equipa = request.json["equipa"]
    nivel = request.json["nivel"]

    # validations
    if len(email) < 5:
        return jsonify({"error": "Email muito pequeno"}), 400
    if len(password) < 8:
        return jsonify({"error": "Senha muito pequena"}), 400
    if nivel > 5 or nivel < 1:
        return jsonify({"error": "Nível de usuário inexistente"}), 400
    user_exists = users.query.filter_by(email=email).first() is not None
    if user_exists:
        return jsonify({"error": "Email já existe"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = users(email=email, password=hashed_password, primeironome=primeironome, segundonome=segundonome, idequipa=equipa, idnivel=nivel)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "id": new_user.id,
        "email": new_user.email,
        "primeironome": new_user.primeironome,
        "segundonome": new_user.segundonome,
        "idequipa": new_user.idequipa,
        "idnivel": new_user.idnivel
    }), 201


#Listar Utilizadores
@app.route("/api/users", methods=["GET"])
def list_users():
    all_users = users.query.all()
    return jsonify([
        {"id": user.id, "email": user.email, "primeironome": user.primeironome,
         "segundonome": user.segundonome, "idequipa": user.idequipa, "idnivel": user.idnivel}
        for user in all_users
    ])

#Apagar Utilizadores
@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user_to_delete = users.query.filter_by(idutlizador=user_id).first()
    if user_to_delete:
        db.session.delete(user_to_delete)
        db.session.commit()
        return jsonify({"message": "Usuário deletado com sucesso"}), 200
    return jsonify({"error": "Usuário não encontrado"}), 404

#Modificar Utilizadores
@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user_to_update = users.query.filter_by(idutlizador=user_id).first()
    if user_to_update:
        user_to_update.email = request.json.get("email", user_to_update.email)
        user_to_update.primeironome = request.json.get("primeironome", user_to_update.primeironome)
        user_to_update.segundonome = request.json.get("segundonome", user_to_update.segundonome)
        user_to_update.idequipa = request.json.get("idequipa", user_to_update.idequipa)
        user_to_update.idnivel = request.json.get("idnivel", user_to_update.idnivel)

        db.session.commit()
        return jsonify({"message": "Usuário atualizado com sucesso"}), 200
    return jsonify({"error": "Usuário não encontrado"}), 404

@app.route("/api/ferias", methods=["POST"])
@jwt_required()
def add_ferias():
    try:
        current_user_email = get_jwt_identity()
        current_user = users.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({"error": "Acesso não autorizado"}), 403

        data = request.json["data"]
        duracao = request.json.get("duracao", 1)
        estado = 1  # Pendente de aprovação

        nova_ferias = feriasmarcadas(
            idcolaborador=current_user.idutlizador,
            duracao=duracao,
            data=datetime.strptime(data, '%Y-%m-%d').date(),
            estado=estado
        )
        db.session.add(nova_ferias)
        db.session.commit()

        return jsonify({"message": "Férias marcadas com sucesso"}), 201
    except Exception as e:
        print(f"Erro ao marcar férias: {e}")
        return jsonify({"error": f"Erro ao marcar férias: {e}"}), 500

@app.route("/api/ausencias", methods=["POST"])
@jwt_required()
def add_ausencias():
    try:
        current_user_email = get_jwt_identity()
        current_user = users.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({"error": "Acesso não autorizado"}), 403

        data = request.json["data"]
        duracao = request.json.get("duracao", 1)
        estado = 1  # Pendente de aprovação

        nova_ausencia = ausenciasmarcadas(
            idcolaborador=current_user.idutlizador,
            duracao=duracao,
            data=datetime.strptime(data, '%Y-%m-%d').date(),
            estado=estado
        )
        db.session.add(nova_ausencia)
        db.session.commit()

        return jsonify({"message": "Ausência marcada com sucesso"}), 201
    except Exception as e:
        print(f"Erro ao marcar ausência: {e}")
        return jsonify({"error": f"Erro ao marcar ausência: {e}"}), 500

@app.route("/api/presencial", methods=["POST"])
@jwt_required()
def add_presencial():
    try:
        current_user_email = get_jwt_identity()
        current_user = users.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({"error": "Acesso não autorizado"}), 403

        data = request.json["data"]
        estado = 1  # Pendente de aprovação

        nova_presencial = presencialmarcadas(
            idcolaborador=current_user.idutlizador,
            data=datetime.strptime(data, '%Y-%m-%d').date(),
            estado=estado
        )
        db.session.add(nova_presencial)
        db.session.commit()

        return jsonify({"message": "Presencial marcada com sucesso"}), 201
    except Exception as e:
        print(f"Erro ao marcar presencial: {e}")
        return jsonify({"error": f"Erro ao marcar presencial: {e}"}), 500

@app.route("/api/get_user_events", methods=["GET"])
@jwt_required()
def get_user_events():
    try:
        current_user_email = get_jwt_identity()
        current_user = users.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({"error": "Acesso não autorizado"}), 403

        ferias = feriasmarcadas.query.filter_by(idcolaborador=current_user.idutlizador).all()
        ausencias = ausenciasmarcadas.query.filter_by(idcolaborador=current_user.idutlizador).all()
        presenciais = presencialmarcadas.query.filter_by(idcolaborador=current_user.idutlizador).all()

        events = {
            "ferias": [{"id": f.id, "data": f.data, "estado": f.estado} for f in ferias],
            "ausencias": [{"id": a.id, "data": a.data, "estado": a.estado} for a in ausencias],
            "presenciais": [{"id": p.id, "data": p.data, "estado": p.estado} for p in presenciais]
        }

        return jsonify(events), 200
    except Exception as e:
        print(f"Erro ao obter eventos do usuário: {e}")
        return jsonify({"error": f"Erro ao obter eventos do usuário: {e}"}), 500


@app.route("/api/ferias/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_ferias(id):
    try:
        current_user_email = get_jwt_identity()
        current_user = users.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({"error": "Acesso não autorizado"}), 403

        ferias = feriasmarcadas.query.filter_by(id=id, idcolaborador=current_user.idutlizador).first()
        if ferias:
            db.session.delete(ferias)
            db.session.commit()
            return jsonify({"message": "Férias removidas com sucesso"}), 200
        return jsonify({"error": "Férias não encontradas"}), 404
    except Exception as e:
        print(f"Erro ao remover férias: {e}")
        return jsonify({"error": f"Erro ao remover férias: {e}"}), 500

@app.route("/api/ausencias/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_ausencias(id):
    try:
        current_user_email = get_jwt_identity()
        current_user = users.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({"error": "Acesso não autorizado"}), 403

        ausencia = ausenciasmarcadas.query.filter_by(id=id, idcolaborador=current_user.idutlizador).first()
        if ausencia:
            db.session.delete(ausencia)
            db.session.commit()
            return jsonify({"message": "Ausência removida com sucesso"}), 200
        return jsonify({"error": "Ausência não encontrada"}), 404
    except Exception as e:
        print(f"Erro ao remover ausência: {e}")
        return jsonify({"error": f"Erro ao remover ausência: {e}"}), 500

@app.route("/api/presencial/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_presencial(id):
    try:
        current_user_email = get_jwt_identity()
        current_user = users.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({"error": "Acesso não autorizado"}), 403

        presencial = presencialmarcadas.query.filter_by(id=id, idcolaborador=current_user.idutlizador).first()
        if presencial:
            db.session.delete(presencial)
            db.session.commit()
            return jsonify({"message": "Presencial removido com sucesso"}), 200
        return jsonify({"error": "Presencial não encontrado"}), 404
    except Exception as e:
        print(f"Erro ao remover presencial: {e}")
        return jsonify({"error": f"Erro ao remover presencial: {e}"}), 500

if __name__ == "__main__":
    app.run(debug=True)