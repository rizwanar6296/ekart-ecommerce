const multer= require('multer')

// handle storage using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/ekart/products')
    },
    filename: (req, file, cb) => {
        cb(null,  Date.now()+ '-' +file.originalname )
    }
});
console.log()
 const productUpload = multer({ storage: storage });


// handle storage using multer
const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/ekart/category/brands')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+ '-' +file.originalname)
    }
});
const brandUpload = multer({ storage: storage2 });


const storage3 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/ekart/banners')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+ '-' +file.originalname)
    }
});
 const bannerUpload = multer({ storage: storage3 });


 module.exports= {
    productUpload,
    brandUpload,
    bannerUpload
};