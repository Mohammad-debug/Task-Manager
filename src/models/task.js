const mongoose=require('mongoose')
const validator = require('validator')
const taskSchema = new mongoose.Schema({
    description: {
    type: String,
    required: true,
    trim: true,
},
    completed: {
    type: Boolean,
    default: false
},
owner:{
    required:true,
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
}
},{
    timestamps:true
})
const task = mongoose.model('Task', taskSchema)

module.exports=task