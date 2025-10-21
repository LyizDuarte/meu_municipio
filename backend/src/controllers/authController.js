const { registerUser, loginUser, getMe } = require('../services/authService');

async function register(req, res) {
  try {
    const { nome, email, senha, id_cidade, descricao, media_url } = req.body;
    const result = await registerUser({ nome, email, senha, id_cidade, descricao, media_url });
    return res.status(201).json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    const result = await loginUser({ email, senha });
    return res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function me(req, res) {
  try {
    const user = await getMe(req.user.id_usuario);
    return res.status(200).json(user);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

module.exports = {
  register,
  login,
  me,
};