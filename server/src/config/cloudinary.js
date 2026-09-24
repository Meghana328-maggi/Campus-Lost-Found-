const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Cloudinary] Cloudinary configured for remote image uploads.');
} else {
  console.log('[Cloudinary] Keys not provided. Falling back to local disk storage for image uploads.');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
};
