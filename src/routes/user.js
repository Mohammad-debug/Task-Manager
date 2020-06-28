const express = require('express')
const User = require('../models/user')
const auth= require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp');
const routerUser= new express.Router()
const { sendWelcomeMail, sendWExitMail } = require('../emails/account')





routerUser.get('/users/me',auth, async (req, res) => {
    try {
        res.send(req.user)
    
    } catch (error) {

        res.status(404).send()

    }
})


routerUser.post('/users', async (req, res) => {//something that sever recieves is request//create user
    const user = new User(req.body)

    try {
        const token= await user.generateAuthToken()
        
        await user.save();
       sendWelcomeMail(user.email,user.name)
       
        res.status(201).send({user,token})
       // res.status(201).send()
    } catch (error) {
        console.log(error)
        res.status(400).send()
    }
}) 


routerUser.post('/users/login',async (req,res)=>{
    try{

        const user = await User.findByCredentials(req.body.email,req.body.password)//first we verify credentials then generate token
        const token= await user.generateAuthToken()
       
        res.status(200).send({user,token})//short hand syntax   "Successfully logged in!"   


    }catch(e){
       // console.log(e)
        res.status(400).send()
    }

})


routerUser.post('/users/logout',auth,async (req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((token)=>{
              return token.token!==req.token;
             
        })
        await req.user.save()
        res.status(200).send("Successfully logout!")
        } 
    catch (error) {
        console.log(error)
        res.status(500).send(error)

    }
})


routerUser.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens =[]
        await req.user.save()
        res.status(200).send("Successfully logout from all sessions!")
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error)

    }
})


const upload = multer({
    limits:{fileSize:1000000},
    fileFilter(req,file,cb){
    if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
        return cb(new Error('Please upload jpg,jpeg,png file'))
       }
       cb(null,true)
    }
})

routerUser.post('/users/me/avatar',auth, upload.single('avatar'), async (req, res) => {
       const buffer=await sharp(req.file.buffer).resize({ height:250,width:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()

    try {
        res.send()
    } catch (e) {
        console.log(e)
    }
},(error, req, res, next) => {
        res.status(400).send({ error: error.message  })//
})


routerUser.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar=undefined
        await req.user.save()
        res.status(200).send(req.user)
        
    } catch (e) {
       // console.log(e)
        res.status(500).send()
    }
})

routerUser.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user= await User.findById(req.params.id)
        if(!user || !user.avatar){
            return new Error()
        }
        res.set('Content-Type','image/png')
        res.status(200).send(user.avatar)
    }catch(e){
       // console.log(e)
        res.status(404).send(e)
    }
})

routerUser.patch('/users/me',auth, async (req, res) => {//update user
   // console.log(req.body)

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const valid = updates.every((up) => allowedUpdates.includes(up))

    if (!valid)
        res.status(400).send({'error':'Invalid Operations'})
    try {
       // var i;
        // for(i=0;i<updates.length;i++){
        //     user[updates[i]]=req.body[updates[i]]
        // }
        updates.forEach((update) => req.user[update] = req.body[update])
        ///const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
         await  req.user.save()
        res.send(req.user)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }

})


routerUser.delete('/users/me',auth, async (req, res) => {
    try {
       await  req.user.remove()
    sendWExitMail(req.user.email,req.user.name)
       res.status(200).send(req.user)
       
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})


module.exports=routerUser









