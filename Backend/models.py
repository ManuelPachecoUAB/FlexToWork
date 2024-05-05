from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

# Tabela Utilizadores
class users(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(11), unique=True, default=get_uuid)
    idutlizador = db.Column(db.Integer, primary_key=True, unique=True)
    email = db.Column(db.String(150), unique=True)
    primeironome = db.Column(db.Text, nullable=False)
    segundonome = db.Column(db.Text, nullable=False)
    password = db.Column(db.Text, nullable=False)
    idequipa = db.Column(db.Integer, nullable=False)
    idnivel = db.Column(db.Integer, nullable=False)

# Tabela Equipa
class equipa(db.Model):
    __tablename__ = "equipa"
    idequipa = db.Column(db.Integer, primary_key=True)
    nomeequipa = db.Column(db.Text, nullable=False)

# Nivel Acesso
class nivelacesso(db.Model):
    __tablename__ = "nivelacesso"
    id = db.Column(db.Integer, primary_key=True)
    tipoutilizador = db.Column(db.Text, nullable=False)

# Zona
class zona(db.Model):
    __tablename__ = "zona"
    idzona = db.Column(db.Integer, primary_key=True)
    nomezona = db.Column(db.Text, nullable=False)
    capacidadetotalzona = db.Column(db.Integer, nullable=False)

# Capacidade Zona
class capacidadezona(db.Model):
    __tablename__ = "capacidadezona"
    idcapacidadezona = db.Column(db.Integer, primary_key=True)
    idzona = db.Column(db.Integer, db.ForeignKey('zona.idzona'))
    lugareslivres = db.Column(db.Integer, nullable=False)
    data = db.Column(db.Date, nullable=False)

# Ferias
class ferias(db.Model):
    __tablename__ = "ferias"
    id = db.Column(db.Integer, primary_key=True)
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutlizador'))
    totalferias = db.Column(db.Integer, nullable=False)
    feriasdisponiveis = db.Column(db.Integer, nullable=False)
    ano = db.Column(db.Integer, nullable=False)

# Ferias Marcadas
class feriasmarcadas(db.Model):
    __tablename__ = "feriasmarcadas"
    id = db.Column(db.Integer, primary_key=True)
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutlizador'))
    duracao = db.Column(db.Integer, nullable=False)
    data = db.Column(db.Date, nullable=False)
    estado = db.Column(db.Integer, nullable=False)

# Ausencias
class ausencias(db.Model):
    __tablename__ = "ausencias"
    id = db.Column(db.Integer, primary_key=True)
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutlizador'))
    totalausencias = db.Column(db.Integer, nullable=False)
    ano = db.Column(db.Integer, nullable=False)


# Ausencias Marcadas
class ausenciasmarcadas(db.Model):
    __tablename__ = "ausenciasmarcadas"
    id = db.Column(db.Integer, primary_key=True)
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutlizador'))
    duracao = db.Column(db.Integer, nullable=False)
    data = db.Column(db.Date, nullable=False)
    estado = db.Column(db.Integer, nullable=False)

class presencial(db.Model):
    __tablename__ = "presencial"
    id = db.Column(db.Integer, primary_key=True)
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutlizador'))
    totalpresencial = db.Column(db.Integer, nullable=False)
    ano = db.Column(db.Integer, nullable=False)
    mes = db.Column(db.Integer, nullable=False)


# Ausencias Marcadas
class presencialmarcadas(db.Model):
    __tablename__ = "presencialmarcadas"
    id = db.Column(db.Integer, primary_key=True)
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutlizador'))
    data = db.Column(db.Date, nullable=False)
    estado = db.Column(db.Integer, nullable=False)