const express = require('express')
require('./db/mongoose')//just run the file

const routerUser = require('./routes/user')
const routerTask= require('./routes/task')


const app = express()
const port = process.env.PORT 

const  multer=require('multer')
const upload =multer({
    dest:'images',
    limits:{fileSize:1000000},
    fileFilter(req,file,cb){
        // To reject this file pass `false`, like so:
       // cb(null, false)
       if(!file.originalname.match(/\.(doc|docx)$/)){
           return cb(new Error('File is not Word Documnet'))
       }

        // To accept the file pass `true`, like so:
        cb(null, true)

        // You can always pass an error if something goes wrong:
       // cb(new Error('I don\'t have a clue!'))
    }
})
const errorMiddlewre=(req,res,next)=>{
    throw new Error ("From My middleWare")
}
app.post('/upload', upload.single('upload'),(req,res)=>{
    try{
    res.send()
    }catch(e){
        console.log(e)
    }
},(error,req,res,next)=>{
    res.status(400).send({error:"FROM my middleware"})
})


app.use(express.json())//this is  important//here we are using a middleware or between request and post to parse with incoming json data.
app.use(routerUser)//this should be at last because here it is json is not parsed
app.use(routerTask)


app.listen(port,(req,response)=>{
    console.log("Server is up and running on port "+port) 
})




const Task =require('./models/task')//Task table or model
const User = require('./models/user')//Task table or model

