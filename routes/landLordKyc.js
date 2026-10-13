const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { landLordKyc, propertyUpload, getLandLordKyc, updatePropertyUpload} = require('../controller/landLordKyc');
const { authenticate } = require('../middleware/auth');

router.post('/landlord-kyc', authenticate, upload.fields([
    { name: 'identification', maxCount: 2 },
    { name: 'selfie', maxCount: 1 }
  ]), landLordKyc);

router.post('/propertyUpload', authenticate, upload.fields([{ name: 'gallery', maxCount: 5 }]), propertyUpload);

router.get('/getLandLordKyc', authenticate, getLandLordKyc)

router.put('/updateProperty/:propertyId', authenticate,upload.fields([{ name: 'gallery', maxCount: 5 }]), updatePropertyUpload);

module.exports = router;