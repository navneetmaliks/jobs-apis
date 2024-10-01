const mongoose=require('mongoose')

const connectDb=(DB_STR)=>{
       return mongoose.connect(DB_STR)
   
}
module.exports=connectDb;