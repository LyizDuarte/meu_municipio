const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUsuarioByEmail, createUsuario, findUsuarioById, updateUsuario } = require('../models/usuarioModel');

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'jwt_dev_secret_change_me';
  return jwt.sign({ id_usuario: user.id_usuario, email: user.email }, secret, { expiresIn: '7d' });
}

async function registerUser({ nome, email, senha, id_cidade, descricao = null, media_url = null }) {
  if (!nome || !email || !senha || !id_cidade) {
    const err = new Error('Campos obrigatórios: nome, email, senha, id_cidade');
    err.status = 400;
    throw err;
  }

  const existing = await findUsuarioByEmail(email);
  if (existing) {
    const err = new Error('E-mail já cadastrado');
    err.status = 409;
    throw err;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  let user;
  try {
    user = await createUsuario({ nome, email, descricao, senhaHash, media_url, id_cidade });
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') {
      const err = new Error('E-mail já cadastrado');
      err.status = 409;
      throw err;
    }
    e.status = 500;
    throw e;
  }

  const token = generateToken(user);
  if (user && user.senha) delete user.senha;
  return { token, user };
}

async function loginUser({ email, senha }) {
  if (!email || !senha) {
    const err = new Error('Campos obrigatórios: email e senha');
    err.status = 400;
    throw err;
  }

  const user = await findUsuarioByEmail(email);
  if (!user) {
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(senha, user.senha);
  if (!ok) {
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }

  const token = generateToken(user);
  if (user && user.senha) delete user.senha;
  return { token, user };
}

async function getMe(id_usuario) {
  const user = await findUsuarioById(id_usuario);
  if (!user) {
    const err = new Error('Usuário não encontrado');
    err.status = 404;
    throw err;
  }
  if (user && user.senha) delete user.senha;
  return user;
}

async function updateMe(id_usuario, payload) {
  const { nome, descricao, id_cidade, media_url } = payload;
  if ([nome, descricao, id_cidade, media_url].every((v) => v === undefined)) {
    const err = new Error('Nenhuma alteração enviada');
    err.status = 400;
    throw err;
  }

  const ok = await updateUsuario(id_usuario, { nome, descricao, id_cidade, media_url });
  if (!ok) {
    const err = new Error('Usuário não encontrado');
    err.status = 404;
    throw err;
  }
  const user = await findUsuarioById(id_usuario);
  if (user && user.senha) delete user.senha;
  return user;
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  generateToken,
  updateMe,
};
