const pool = require('../config/database');

async function listEstados() {
  const [rows] = await pool.execute('SELECT id_estado, nome_estado FROM Estados ORDER BY nome_estado');
  return rows || [];
}

module.exports = {
  listEstados,
};