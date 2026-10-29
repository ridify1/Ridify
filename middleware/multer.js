const multer = require('multer');
const fs = require("fs")

const uploadFolder = "./uploads";

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const fileFilter = (req, file, cb)=> {
    console.log('File: ',file);
    console.log('File Mimetype: ', file.mimetype);
    
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else{
        cb(new Error('Invalid image format, only images allowed'))
    }
}

const limits = {
    fileSize: 1024 * 1024 * 5
}

const upload =multer({
    storage,
    fileFilter,
    limits
})

module.exports = upload;