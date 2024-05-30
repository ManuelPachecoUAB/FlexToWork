from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_cors import CORS, cross_origin
from models import db, users, ferias, presencial, feriasmarcadas, ausenciasmarcadas, presencialmarcadas
from datetime import datetime

app = Flask(__name__)

app.config['SECRET_KEY'] = 'a34r435e354v&%&%&wsd534%&%&%&f4dsasd56r&%&%ety543g#$%"#%fg3544'
app.config['JWT_SECRET_KEY'] = 'a34r435sdf4fgdf#$&#$&r4533-ddd-346-7856fd7644$##$&gfd543-^3544'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///flaskdb.db'
jwt = JWTManager(app)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

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

    # Inicializar 25 dias de férias para o novo utilizador
    ano_atual = datetime.now().year
    new_ferias = ferias(idcolaborador=new_user.idutlizador,ano=ano_atual)
    db.session.add(new_ferias)
    db.session.commit()

    # Inicializar 10 dias de presencial por mês para o novo utilizador
    for mes in range(1, 13):
        new_presencial = presencial(idcolaborador=new_user.idutlizador, ano=ano_atual, mes=mes)
        db.session.add(new_presencial)

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

        datas = request.json.get("datas", [])
        if not datas:
            return jsonify({"error": "Nenhuma data fornecida"}), 400

        # Calcular a duração das férias
        duracao = len(datas)
        estado = 1  # Pendente de aprovação

        # Verificar se há dias de férias suficientes
        ferias_registro = ferias.query.filter_by(idcolaborador=current_user.idutlizador, ano=datetime.now().year).first()
        if ferias_registro.feriasdisponiveis < duracao:
            return jsonify({"error": "Não há dias de férias suficientes disponíveis"}), 400

        for data in datas:
            nova_ferias = feriasmarcadas(
                idcolaborador=current_user.idutlizador,
                duracao=1,  # Cada dia é um registro separado
                data=datetime.strptime(data, '%Y-%m-%d').date(),
                estado=estado
            )
            db.session.add(nova_ferias)

        # Atualizar feriasdisponiveis
        ferias_registro.feriasdisponiveis -= duracao
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

        datas = request.json.get("datas", [])
        if not datas:
            return jsonify({"error": "Nenhuma data fornecida"}), 400

        estado = 1  # Pendente de aprovação

        for data in datas:
            nova_ausencia = ausenciasmarcadas(
                idcolaborador=current_user.idutlizador,
                duracao=1,
                data=datetime.strptime(data, '%Y-%m-%d').date(),
                estado=estado
            )
            db.session.add(nova_ausencia)

        db.session.commit()

        return jsonify({"message": "Ausências marcadas com sucesso"}), 201
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

        datas = request.json.get("datas", [])
        if not datas:
            return jsonify({"error": "Nenhuma data fornecida"}), 400

        estado = 1  # Pendente de aprovação

        for data in datas:
            nova_presencial = presencialmarcadas(
                idcolaborador=current_user.idutlizador,
                data=datetime.strptime(data, '%Y-%m-%d').date(),
                estado=estado
            )
            db.session.add(nova_presencial)

        db.session.commit()

        return jsonify({"message": "Presenciais marcadas com sucesso"}), 201
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

        ano = request.args.get("ano", type=int)
        mes = request.args.get("mes", type=int)

        if not ano:
            return jsonify({"error": "Ano é obrigatório"}), 400

        ferias_marcadas = feriasmarcadas.query.filter_by(idcolaborador=current_user.idutlizador).filter(
            db.extract('year', feriasmarcadas.data) == ano
        ).all()

        ausencias = ausenciasmarcadas.query.filter_by(idcolaborador=current_user.idutlizador).filter(
            db.extract('year', ausenciasmarcadas.data) == ano
        ).all()

        presenciais = presencialmarcadas.query.filter_by(idcolaborador=current_user.idutlizador).filter(
            db.extract('year', presencialmarcadas.data) == ano,
            db.extract('month', presencialmarcadas.data) == mes
        ).all()

        # Recuperar o registro de férias do colaborador
        ferias_registro = ferias.query.filter_by(idcolaborador=current_user.idutlizador, ano=ano).first()
        ferias_disponiveis = ferias_registro.feriasdisponiveis if ferias_registro else 0

        events = {
            "ferias": [{"id": f.id, "data": f.data, "estado": f.estado} for f in ferias_marcadas],
            "ausencias": [{"id": a.id, "data": a.data, "estado": a.estado} for a in ausencias],
            "presenciais": [{"id": p.id, "data": p.data, "estado": p.estado} for p in presenciais],
            "ferias_disponiveis": ferias_disponiveis
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

        ferias_registro = ferias.query.filter_by(idcolaborador=current_user.idutlizador, ano=datetime.now().year).first()
        ferias_marcada = feriasmarcadas.query.filter_by(id=id, idcolaborador=current_user.idutlizador).first()

        if ferias_marcada:
            duracao = ferias_marcada.duracao
            db.session.delete(ferias_marcada)

            # Atualizar feriasdisponiveis
            ferias_registro.feriasdisponiveis += duracao
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

@app.route("/api/get_team_events", methods=["GET"])
@jwt_required()
def get_team_events():
    try:
        current_user_email = get_jwt_identity()
        current_user = users.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({"error": "Acesso não autorizado"}), 403

        if current_user.idnivel not in [2, 4, 5]:  # Verifica se o nível do usuário é 2, 4 ou 5
            print(f"Acesso negado para {current_user_email}, nível {current_user.idnivel}")
            return jsonify({"error": "Acesso não autorizado"}), 403

        team_members = users.query.filter_by(idequipa=current_user.idequipa).all()
        team_member_ids = [member.idutlizador for member in team_members]

        ferias = db.session.query(feriasmarcadas, users).join(users, feriasmarcadas.idcolaborador == users.idutlizador).filter(feriasmarcadas.idcolaborador.in_(team_member_ids), feriasmarcadas.estado == 1).all()
        ausencias = db.session.query(ausenciasmarcadas, users).join(users, ausenciasmarcadas.idcolaborador == users.idutlizador).filter(ausenciasmarcadas.idcolaborador.in_(team_member_ids), ausenciasmarcadas.estado == 1).all()
        presenciais = db.session.query(presencialmarcadas, users).join(users, presencialmarcadas.idcolaborador == users.idutlizador).filter(presencialmarcadas.idcolaborador.in_(team_member_ids), presencialmarcadas.estado == 1).all()

        events = [
            {"id": f.feriasmarcadas.id, "date": f.feriasmarcadas.data, "title": "Férias", "type": "ferias", "user": f.users.primeironome + ' ' + f.users.segundonome} for f in ferias
        ] + [
            {"id": a.ausenciasmarcadas.id, "date": a.ausenciasmarcadas.data, "title": "Ausência", "type": "ausencias", "user": a.users.primeironome + ' ' + a.users.segundonome} for a in ausencias
        ] + [
            {"id": p.presencialmarcadas.id, "date": p.presencialmarcadas.data, "title": "Presencial", "type": "presencial", "user": p.users.primeironome + ' ' + p.users.segundonome} for p in presenciais
        ]

        return jsonify(events), 200
    except Exception as e:
        print(f"Erro ao obter eventos da equipe: {e}")
        return jsonify({"error": f"Erro ao obter eventos da equipe: {e}"}), 500


@app.route("/api/ferias/approve/<int:id>", methods=["PUT"])
@app.route("/api/ausencias/approve/<int:id>", methods=["PUT"])
@app.route("/api/presencial/approve/<int:id>", methods=["PUT"])
@jwt_required()
def approve_event(id):
    current_user_email = get_jwt_identity()
    current_user = users.query.filter_by(email=current_user_email).first()

    if not current_user or current_user.idnivel not in [2, 4, 5]:  # Verifica se é gerente ou autorizado
        return jsonify({"error": "Acesso não autorizado"}), 403

    if 'ferias' in request.path:
        event = feriasmarcadas.query.get(id)
    elif 'ausencias' in request.path:
        event = ausenciasmarcadas.query.get(id)
    elif 'presencial' in request.path:
        event = presencialmarcadas.query.get(id)
    else:
        return jsonify({"error": "Evento não encontrado"}), 404

    if event:
        event.estado = 2  # Aprovado
        db.session.commit()
        return jsonify({"message": "Evento aprovado com sucesso"}), 200
    return jsonify({"error": "Evento não encontrado"}), 404

@app.route("/api/ferias/reject/<int:id>", methods=["PUT"])
@app.route("/api/ausencias/reject/<int:id>", methods=["PUT"])
@app.route("/api/presencial/reject/<int:id>", methods=["PUT"])
@jwt_required()
def reject_event(id):
    current_user_email = get_jwt_identity()
    current_user = users.query.filter_by(email=current_user_email).first()

    if not current_user or current_user.idnivel not in [2, 4, 5]:  # Verifica se é gerente ou autorizado
        return jsonify({"error": "Acesso não autorizado"}), 403

    if 'ferias' in request.path:
        event = feriasmarcadas.query.get(id)
    elif 'ausencias' in request.path:
        event = ausenciasmarcadas.query.get(id)
    elif 'presencial' in request.path:
        event = presencialmarcadas.query.get(id)
    else:
        return jsonify({"error": "Evento não encontrado"}), 404

    if event:
        event.estado = 3  # Rejeitado
        db.session.commit()
        return jsonify({"message": "Evento rejeitado com sucesso"}), 200
    return jsonify({"error": "Evento não encontrado"}), 404

@app.route("/api/presencial_obrigatorios", methods=["GET"])
@jwt_required()
def get_presencial_obrigatorios():
    try:
        current_user_email = get_jwt_identity()
        current_user = users.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({"error": "Acesso não autorizado"}), 403

        ano = request.args.get("ano", type=int)
        mes = request.args.get("mes", type=int)

        if not ano or not mes:
            return jsonify({"error": "Ano e mês são obrigatórios"}), 400

        presenciais = presencial.query.filter_by(idcolaborador=current_user.idutlizador, ano=ano, mes=mes).first()

        if presenciais:
            total_presencial = presenciais.totalpresencial
        else:
            total_presencial = 0

        return jsonify({"total_presencial": total_presencial}), 200
    except Exception as e:
        print(f"Erro ao obter presenciais obrigatórios: {e}")
        return jsonify({"error": f"Erro ao obter presenciais obrigatórios: {e}"}), 500

@app.route("/api/presencial_mes", methods=["GET"])
@jwt_required()
def get_presencial_mes():
    try:
        current_user_email = get_jwt_identity()
        current_user = users.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({"error": "Acesso não autorizado"}), 403

        ano = request.args.get("ano", type=int)
        mes = request.args.get("mes", type=int)

        if not ano or not mes:
            return jsonify({"error": "Ano e mês são obrigatórios"}), 400

        presenciais = presencialmarcadas.query.filter_by(idcolaborador=current_user.idutlizador).filter(
            db.extract('year', presencialmarcadas.data) == ano,
            db.extract('month', presencialmarcadas.data) == mes
        ).all()

        presenciais_aprovadas = sum(1 for p in presenciais if p.estado == 2)
        presenciais_pendentes = sum(1 for p in presenciais if p.estado == 1)

        return jsonify({
            "presenciais_aprovadas": presenciais_aprovadas,
            "presenciais_pendentes": presenciais_pendentes
        }), 200
    except Exception as e:
        print(f"Erro ao obter presenciais por mês: {e}")
        return jsonify({"error": f"Erro ao obter presenciais por mês: {e}"}), 500

@app.route("/api/team_members", methods=["GET"])
@jwt_required()
def get_team_members():
    try:
        current_user_email = get_jwt_identity()
        current_user = users.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({"error": "Acesso não autorizado"}), 403

        team_members = users.query.filter_by(idequipa=current_user.idequipa).all()

        # Dicionário de mapeamento de níveis para descrições de posições
        posicoes = {
            1: "Colaborador",
            2: "Manager",
            3: "RH",
            4: "RH Manager",
            5: "Administrador"
        }

        # Ordenar os membros da equipe pelo nível, colocando os de nível 2 no topo
        sorted_team_members = sorted(team_members, key=lambda member: (member.idnivel != 2, member.idnivel))

        team_members_list = [
            {
                "id": member.idutlizador,
                "primeironome": member.primeironome,
                "segundonome": member.segundonome,
                "idnivel": member.idnivel,
                "posicao": posicoes.get(member.idnivel, "Desconhecido"),
                "ordem": index + 1
            }
            for index, member in enumerate(sorted_team_members)
        ]

        return jsonify(team_members_list), 200
    except Exception as e:
        print(f"Erro ao obter membros da equipe: {e}")
        return jsonify({"error": f"Erro ao obter membros da equipe: {e}"}), 500





if __name__ == "__main__":
    app.run(debug=True)