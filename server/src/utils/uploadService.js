const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine (stores temporarily on disk)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `item-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and WEBP image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

/**
 * Processes uploaded files, uploading to Cloudinary if available,
 * or serving from local server static folder if not.
 */
const processUploadedFiles = async (files, req) => {
  if (!files || files.length === 0) return [];

  const results = [];
  const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;

  for (const file of files) {
    if (isCloudinaryConfigured) {
      try {
        const uploadRes = await cloudinary.uploader.upload(file.path, {
          folder: 'campus_lost_found',
          transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
        });
        // Remove temp local file after remote upload
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          // ignore cleanup error
        }
        results.push({
          url: uploadRes.secure_url,
          publicId: uploadRes.public_id,
        });
      } catch (err) {
        console.error('[Cloudinary Upload Failed, falling back to local]:', err.message);
        results.push({
          url: `${serverUrl}/uploads/${file.filename}`,
          publicId: file.filename,
        });
      }
    } else {
      // Local disk fallback
      results.push({
        url: `${serverUrl}/uploads/${file.filename}`,
        publicId: file.filename,
      });
    }
  }

  return results;
};

module.exports = {
  upload,
  processUploadedFiles,
};
