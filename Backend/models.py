from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

# Inicializa o SQLAlchemy
db = SQLAlchemy()

# Função para gerar um UUID único
def get_uuid():
    return uuid4().hex

# Tabela Utilizadores
class users(db.Model):
    __tablename__ = "users"
    # Coluna para armazenar um identificador único
    id = db.Column(db.String(11), unique=True, default=get_uuid)
    # Coluna para armazenar o ID do utilizador, chave primária
    idutilizador = db.Column(db.Integer, primary_key=True, unique=True)
    # Coluna para armazenar o email, deve ser único
    email = db.Column(db.String(150), unique=True)
    # Colunas para armazenar os nomes do utilizador
    primeironome = db.Column(db.Text, nullable=False)
    segundonome = db.Column(db.Text, nullable=False)
    # Coluna para armazenar a senha
    password = db.Column(db.Text, nullable=False)
    # Colunas para armazenar o ID da equipa e o nível de acesso
    idequipa = db.Column(db.Integer, db.ForeignKey('equipa.idequipa'))
    idnivel = db.Column(db.Integer, db.ForeignKey('nivelacesso.id'))
    # Relacionamento um-para-um com a tabela ferias
    ferias = db.relationship('ferias', backref='users', lazy=True, uselist=False)

# Tabela Ferias
class ferias(db.Model):
    __tablename__ = "ferias"
    # Coluna para armazenar o ID, chave primária
    id = db.Column(db.Integer, unique=True, primary_key=True)
    # Coluna para armazenar o ID do colaborador, chave estrangeira referenciando users.idutilizador
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutilizador'))
    # Colunas para armazenar o total de férias e as férias disponíveis
    totalferias = db.Column(db.Integer, default=25)  # Inicialmente 25 dias de férias
    feriasdisponiveis = db.Column(db.Integer, default=25)
    # Coluna para armazenar o ano
    ano = db.Column(db.Integer, nullable=False)

    # Construtor para inicializar a tabela
    def __init__(self, idcolaborador, ano):
        self.idcolaborador = idcolaborador
        self.ano = ano
        self.totalferias = 25
        self.feriasdisponiveis = 25

# Tabela Presencial
class presencial(db.Model):
    __tablename__ = "presencial"
    # Coluna para armazenar o ID, chave primária
    id = db.Column(db.Integer, unique=True, primary_key=True)
    # Coluna para armazenar o ID do colaborador, chave estrangeira referenciando users.idutilizador
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutilizador'))
    # Coluna para armazenar o total de dias presenciais
    totalpresencial = db.Column(db.Integer, nullable=False, default=10)
    # Colunas para armazenar o ano e o mês
    ano = db.Column(db.Integer, nullable=False)
    mes = db.Column(db.Integer, nullable=False)

    # Construtor para inicializar a tabela
    def __init__(self, idcolaborador, ano, mes):
        self.idcolaborador = idcolaborador
        self.ano = ano
        self.mes = mes
        self.totalpresencial = 10

# Tabela Equipa
class equipa(db.Model):
    __tablename__ = "equipa"
    # Coluna para armazenar o ID da equipa, chave primária
    idequipa = db.Column(db.Integer, unique=True, primary_key=True)
    # Coluna para armazenar o nome da equipa
    nomeequipa = db.Column(db.Text, nullable=False)

# Tabela Nivel Acesso
class nivelacesso(db.Model):
    __tablename__ = "nivelacesso"
    # Coluna para armazenar o ID, chave primária
    id = db.Column(db.Integer, unique=True, primary_key=True)
    # Coluna para armazenar o tipo de utilizador
    tipoutilizador = db.Column(db.Text, nullable=False)

# Tabela Zona
class zona(db.Model):
    __tablename__ = "zona"
    # Coluna para armazenar o ID da zona, chave primária
    idzona = db.Column(db.Integer, unique=True, primary_key=True)
    # Coluna para armazenar o nome da zona
    nomezona = db.Column(db.Text, nullable=False)
    # Coluna para armazenar a capacidade total da zona
    capacidadetotalzona = db.Column(db.Integer, nullable=False)

# Tabela Capacidade Zona
class capacidadezona(db.Model):
    __tablename__ = "capacidadezona"
    # Coluna para armazenar o ID da capacidade da zona, chave primária
    idcapacidadezona = db.Column(db.Integer, unique=True, primary_key=True)
    # Coluna para armazenar o ID da zona, chave estrangeira referenciando zona.idzona
    idzona = db.Column(db.Integer, db.ForeignKey('zona.idzona'))
    # Coluna para armazenar o número de lugares livres
    lugareslivres = db.Column(db.Integer, nullable=False)
    # Coluna para armazenar a data
    data = db.Column(db.Date, nullable=False)

# Tabela Ferias Marcadas
class feriasmarcadas(db.Model):
    __tablename__ = "feriasmarcadas"
    # Coluna para armazenar o ID, chave primária
    id = db.Column(db.Integer, unique=True, primary_key=True)
    # Coluna para armazenar o ID do colaborador, chave estrangeira referenciando users.idutilizador
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutilizador'))
    # Coluna para armazenar a duração das férias
    duracao = db.Column(db.Integer, nullable=False)
    # Coluna para armazenar a data
    data = db.Column(db.Date, nullable=False)
    # Coluna para armazenar o estado das férias
    estado = db.Column(db.Integer, nullable=False)

# Tabela Ausencias
class ausencias(db.Model):
    __tablename__ = "ausencias"
    # Coluna para armazenar o ID, chave primária
    id = db.Column(db.Integer, unique=True, primary_key=True)
    # Coluna para armazenar o ID do colaborador, chave estrangeira referenciando users.idutilizador
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutilizador'))
    # Coluna para armazenar o total de ausências
    totalausencias = db.Column(db.Integer, nullable=False)
    # Coluna para armazenar o ano
    ano = db.Column(db.Integer, nullable=False)

# Tabela Ausencias Marcadas
class ausenciasmarcadas(db.Model):
    __tablename__ = "ausenciasmarcadas"
    # Coluna para armazenar o ID, chave primária
    id = db.Column(db.Integer, unique=True, primary_key=True)
    # Coluna para armazenar o ID do colaborador, chave estrangeira referenciando users.idutilizador
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutilizador'))
    # Coluna para armazenar a duração das ausências
    duracao = db.Column(db.Integer, nullable=False)
    # Coluna para armazenar a data
    data = db.Column(db.Date, nullable=False)
    # Coluna para armazenar o estado das ausências
    estado = db.Column(db.Integer, nullable=False)

# Tabela Presencial Marcadas
class presencialmarcadas(db.Model):
    __tablename__ = "presencialmarcadas"
    # Coluna para armazenar o ID, chave primária
    id = db.Column(db.Integer, unique=True, primary_key=True)
    # Coluna para armazenar o ID do colaborador, chave estrangeira referenciando users.idutilizador
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutilizador'))
    # Coluna para armazenar a data
    data = db.Column(db.Date, nullable=False)
    # Coluna para armazenar o estado
    estado = db.Column(db.Integer, nullable=False)

# Tabela Notificacoes
class notificacoes(db.Model):
    __tablename__ = "notificacoes"
    # Coluna para armazenar o ID, chave primária
    id = db.Column(db.Integer, unique=True, primary_key=True)
    # Coluna para armazenar o ID do colaborador, chave estrangeira referenciando users.idutilizador
    idcolaborador = db.Column(db.Integer, db.ForeignKey('users.idutilizador'))
    # Coluna para armazenar a data da notificação
    data = db.Column(db.Date, nullable=False)
    # Coluna para armazenar o conteúdo da notificação
    conteudo = db.Column(db.Text, nullable=False)
    # Coluna para armazenar o tipo de notificação
    tipo = db.Column(db.Text, nullable=False)