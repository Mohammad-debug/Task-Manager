const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useFindAndModify:false,useUnifiedTopology:true,useCreateIndex:true})

//module.exports=mongoose