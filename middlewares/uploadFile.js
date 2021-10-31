const multer=require('multer')
  
// const storage = multer.memoryStorage()
// const upload = multer({ storage: storage });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './resources/uploads')
    },
    filename: function (req, file, cb) {
      let filename = (file.originalname).split('.')
      // cb(null, filename[0] + "-" + (new Date()).getTime() + "." + filename[1])
      cb(null, file.originalname)
    }
  })
   
const upload = multer({ storage: storage })


module.exports = upload;