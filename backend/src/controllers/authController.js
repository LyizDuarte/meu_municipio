const { registerUser, loginUser, getMe, updateMe } = require('../services/authService');
const { getMediaUrl } = require('../middlewares/upload');

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

async function patchMe(req, res) {
  try {
    const user = await updateMe(req.user.id_usuario, req.body);
    return res.status(200).json(user);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function patchAvatar(req, res) {
  try {
    if (!req.file) {
      const err = new Error('Nenhum arquivo enviado');
      err.status = 400;
      throw err;
    }
    const url = getMediaUrl(req.file.filename);
    const user = await updateMe(req.user.id_usuario, { media_url: url });
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
  patchMe,
  patchAvatar,
};
