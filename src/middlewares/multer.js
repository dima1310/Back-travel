import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

const TMP_DIR = path.resolve('tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TMP_DIR),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, `${unique}_${safe}`);
  },
});

export const upload = multer({ storage });
