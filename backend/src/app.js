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
app.use('/api', routes);

// Exporta o app (não inicia o servidor aqui)
module.exports = app;