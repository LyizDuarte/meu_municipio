# Meu Município

Aplicativo mobile para que cidadãos possam **sugerir** e **reclamar** sobre questões do seu município, acompanhar o andamento e interagir com outras publicações.

## Sobre o projeto

O **Meu Município** é uma plataforma cívica que conecta moradores à sua cidade. O usuário se cadastra vinculado a um estado e cidade, e pode:

- **Publicar** sugestões ou reclamações por categoria (iluminação, saneamento, transporte, etc.)
- **Anexar fotos** e **localização** aos posts
- **Acompanhar o status** das publicações: aberto, em análise, resolvido ou arquivado
- **Interagir** com outras publicações: comentar, apoiar (curtir/descurtir) e compartilhar
- **Ver o feed** de posts da sua cidade e gerenciar seu perfil

O backend expõe uma API REST (Node.js + Express) com autenticação JWT; o app consome essa API e roda em dispositivos móveis via **Expo** (React Native).

## Tecnologias

| Camada      | Stack |
|------------|--------|
| **Frontend** | React Native, Expo, Axios |
| **Backend**  | Node.js, Express 5 |
| **Banco**    | MySQL |
| **Auth**     | JWT, bcrypt |

## Estrutura do repositório

```
meu_municipio/
├── backend/          # API REST (Express, MySQL)
│   └── src/
│       ├── config/   # database, db.sql
│       ├── routes/   # auth, posts, categories, locations
│       └── ...
├── frontend/         # App mobile (Expo / React Native)
│   └── src/
│       ├── screens/  # Login, Register, Feed, CreatePost, Profile
│       ├── components/
│       └── api/
└── README.MD
```

## Como executar o projeto

### 1. Banco de dados

O banco é **local** (MySQL).

1. Crie o banco e as tabelas executando o script:  
   `backend/src/config/db.sql`
2. Configure usuário e senha em:  
   `backend/src/config/database.js`

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend

Em **outro terminal**:

```bash
cd frontend
npm install
npx expo start
```

### 4. Emulador

Com o Expo em execução, pressione **A** no terminal para abrir o app no emulador Android (ou siga as instruções do Expo para iOS/simulador).

---

> **Importante:** mantenha o backend rodando enquanto usar o app; as credenciais do MySQL devem estar corretas em `backend/src/config/database.js`.
