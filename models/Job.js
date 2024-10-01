const mongoose=require('mongoose');


const JobsSchema=mongoose.Schema({
    company:{
        type:String,
        required:[true,'Please Provide Company Name'],
        maxlength:50
    },
    position:{
        type:String,
        required:[true,'Please Provide position'],
        maxlength:100
    },
    status:{
        type:String,
        required:[true,'Please Provide Status'],
        enum:['Interview','Declined','Pending'],
        default:'Pending'

    },
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:[true,'Please Provide User']
    }
},{timestamps:true})


module.exports=mongoose.model('Job',JobsSchema);