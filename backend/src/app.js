const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static('src/uploads'));

// Rota principal
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger');
app.use('/api', routes);

// Documentação Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Exporta o app (não inicia o servidor aqui)
module.exports = app;