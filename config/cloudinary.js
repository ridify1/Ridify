require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const api_key = process.env.CLOUDINARY_API_KEY || process.env.API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET;
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUDNAME || process.env.API_CLOUDNAME;

if (!api_key || !api_secret || !cloud_name) {
  throw new Error(
    'Cloudinary configuration error: missing env vars. Set CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME or API_KEY, API_SECRET, API_CLOUDNAME.'
  );
}

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

module.exports = cloudinary;