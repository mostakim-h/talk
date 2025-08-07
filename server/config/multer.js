const multer = require('multer');
const storage = multer.diskStorage({});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = {
  single: upload.single('file'),
  array: upload.array('files', 10),
}
