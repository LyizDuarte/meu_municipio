-- -----------------------------------------------------
-- 1. Tabelas Independentes (Nível 0)
-- -----------------------------------------------------

-- Tabela de Estados
CREATE TABLE Estados (
    id_estado INT NOT NULL AUTO_INCREMENT,
    nome_estado VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_estado)
) ENGINE=InnoDB;

-- Tabela de Categorias
CREATE TABLE Categorias (
    id_categoria INT NOT NULL AUTO_INCREMENT,
    nome_categoria VARCHAR(100) NOT NULL,
    descricao TEXT NULL,
    PRIMARY KEY (id_categoria)
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- 2. Tabelas Dependentes (Nível 1)
-- -----------------------------------------------------

-- Tabela de Cidades (depende de Estados)
CREATE TABLE Cidades (
    id_cidade INT NOT NULL AUTO_INCREMENT,
    nome_cidade VARCHAR(255) NOT NULL,
    id_estado INT NOT NULL,
    PRIMARY KEY (id_cidade),
    FOREIGN KEY (id_estado) REFERENCES Estados(id_estado)
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- 3. Tabelas Dependentes (Nível 2)
-- -----------------------------------------------------

-- Tabela de Usuários (depende de Cidades)
CREATE TABLE Usuarios (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT NULL,
    senha VARCHAR(255) NOT NULL, -- Lembre-se de armazenar um HASH, não a senha pura
    media_url VARCHAR(500) NULL, -- URL da foto de perfil
    id_cidade INT NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    numero_visualizacoes INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_cidade) REFERENCES Cidades(id_cidade)
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- 4. Tabelas Dependentes (Nível 3)
-- -----------------------------------------------------

-- Tabela de Posts (depende de Usuarios, Categorias, Cidades)
CREATE TABLE Posts (
    id_post INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_categoria INT NOT NULL,
    id_cidade INT NOT NULL,
    tipo_post ENUM('sugestao', 'reclamacao') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    local_latitude DECIMAL(10, 8) NULL,
    local_longitude DECIMAL(11, 8) NULL,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status_post ENUM('aberto', 'em_analise', 'resolvido', 'arquivado') NOT NULL DEFAULT 'aberto',
    PRIMARY KEY (id_post),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria),
    FOREIGN KEY (id_cidade) REFERENCES Cidades(id_cidade)
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- 5. Tabelas Associativas e Dependentes de Post (Nível 4)
-- -----------------------------------------------------

-- Tabela de Mídias dos Posts (depende de Posts)
CREATE TABLE PostsMidias (
    id_midia INT NOT NULL AUTO_INCREMENT,
    id_post INT NOT NULL,
    midia_url VARCHAR(500) NOT NULL,
    PRIMARY KEY (id_midia),
    FOREIGN KEY (id_post) REFERENCES Posts(id_post) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de Apoios/Likes (depende de Usuarios e Posts)
CREATE TABLE Apoios (
    id_apoio INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_post INT NOT NULL,
    tipo_apoio ENUM('curtir', 'descurtir') NOT NULL,
    PRIMARY KEY (id_apoio),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_post) REFERENCES Posts(id_post) ON DELETE CASCADE,
    UNIQUE KEY uk_usuario_post (id_usuario, id_post) -- Garante que um usuário só pode apoiar um post uma vez
) ENGINE=InnoDB;

-- Tabela de Compartilhamentos (depende de Usuarios e Posts)
CREATE TABLE Compartilhamentos (
    id_compartilhamento INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_post INT NOT NULL,
    data_compartilhamento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_compartilhamento),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_post) REFERENCES Posts(id_post) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de Comentários (depende de Usuarios, Posts, e dela mesma)
CREATE TABLE Comentarios (
    id_comentario INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_post INT NOT NULL,
    conteudo TEXT NOT NULL,
    data_comentario DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_comentario_pai INT NULL, -- Chave para respostas de comentários
    PRIMARY KEY (id_comentario),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_post) REFERENCES Posts(id_post) ON DELETE CASCADE,
    FOREIGN KEY (id_comentario_pai) REFERENCES Comentarios(id_comentario) ON DELETE CASCADE -- Auto-relacionamento
) ENGINE=InnoDB;