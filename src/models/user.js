
const mongoose =require('mongoose')
const validator=require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, email: {
        type: String,
        unique:true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error("Please enter a valid email address")
        }
    }, password: {
        type: String,
        minlength: 6,
       // select:false,
        trim: true,
        validate(value) {

            if (value.toLowerCase().includes('password'))
                throw new Error("Password cannot be 'password'")
        }
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0)
                throw new Error("Age must be a positive number.")
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    } 
} ,{
    timestamps: true
})
//const Task = require('../models/task')
userSchema.virtual('tasks',{
    ref:'Task',
    localField: '_id',
    foreignField: 'owner'

})

userSchema.methods.generateAuthToken= async function (){
    const user = this
    const token=jwt.sign({ _id:user._id.toString()},process.env.JWT_SECRET)//id is not in string format
     user.tokens=user.tokens.concat({token})
     await user.save() //async due to this
    return token
}    
userSchema.methods.toJSON =  function (){
      const user = this
      var userObject=user.toObject()
      delete userObject.tokens
      delete userObject.password
      delete userObject.avatar
      return userObject
}
userSchema.statics.findByCredentials=async (email,password)=>{
         const user= await User.findOne({email})
         if(!user)
         throw new Error("Unable to login")
         isMatch=await bcrypt.compare(password,user.password)
         
         if(!isMatch)
           return new Error("Unable to login")
        else
             return user            
}

userSchema.pre('save',async function(next){
       //console.log('Works always')
     const user=this
     if(user.isModified('password')){//protect from further encryption....not at every update
        //console.log(user.password)
         user.password = await bcrypt.hash(user.password, 8)
     }
      next()
})
userSchema.pre('remove', async function(next){
      const user = this
      await Task.deleteMany({owner:user._id})
      next()
})
const User = mongoose.model('User',userSchema)//creating model using schema
module.exports= User
