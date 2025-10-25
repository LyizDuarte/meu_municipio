const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Criar diretório de uploads se não existir
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único: timestamp + random + extensão original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro de arquivos - apenas imagens e vídeos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem (JPEG, PNG, GIF, WebP) e vídeo (MP4, MOV, AVI, WebM) são permitidos'));
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por arquivo
    files: 5 // Máximo 5 arquivos por upload
  },
  fileFilter: fileFilter
});

// Middleware para upload múltiplo
const uploadMultiple = upload.array('midias', 5);

// Middleware com tratamento de erro
const uploadMiddleware = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Arquivo muito grande. Máximo 10MB por arquivo.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Muitos arquivos. Máximo 5 arquivos por upload.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Campo de arquivo inesperado.' });
      }
      return res.status(400).json({ message: 'Erro no upload: ' + err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Função para gerar URL da mídia
const getMediaUrl = (filename) => {
  return `/uploads/${filename}`;
};

// Função para deletar arquivo
const deleteFile = (filename) => {
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

module.exports = {
  uploadMiddleware,
  getMediaUrl,
  deleteFile
};