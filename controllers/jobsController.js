const JobModel=require('./../models/Job')
const asyncWraper=require('./../utils/asyncWraper')
const CustomError=require('./../utils/CustomError')

const getAllJobs=asyncWraper(async(req,res,next)=>{
    const userID=req.user._id;
    const jobs=await JobModel.find({'createdBy':userID});
    if(!jobs){
        return next(new CustomError('No job found',400));
    }
   
 res.status(200).json({
    status:'success',
    count:jobs.length,
    data:{
        jobs
    }
 });
})
const createJob=asyncWraper(async(req,res,next)=>{
    req.body.createdBy=req.user._id
    const {company,position,status}=req.body;
    if(!company || !position){
        return next(new CustomError('Empty fields not allowed'),400)
    }
    const job=await JobModel.create({...req.body});
    if(!job){
        next(new CustomError('Jons not saved',400));
    }
    
    res.status(200).json({
       status:'success',
       data:{
           job
       }
    });
   })
   
   const getJob=asyncWraper(async(req,res,next)=>{
    const jobID=req.params.id;
    const userID=req.user._id;
    const job=await JobModel.findOne({'_id':jobID,'createdBy':userID})
    if(!job){
        return next(new CustomError(`no job find with id ${jobID}`,400))
    }
    res.status(200).json({
       status:'success',
       data:{
           job
       }
    });
   })
   const deleteJob=asyncWraper(async(req,res,next)=>{
    const jobID=req.params.id;
    const userID=req.user._id;
     const job=await JobModel.findOneAndDelete({'_id':jobID,'createdBy':userID})
    if(!job){
      return  next(new CustomError(`no job find with id ${jobID}`,400))
    }
    res.status(200).json({
       status:'success',
       data:{
           job
       }
    });
   })

   const updateJob=asyncWraper(async(req,res,next)=>{
    const jobID=req.params.id;
    const userID=req.user._id;
    const {company,position}=req.body;
    if(!company || !position){
       return next(new CustomError('Please provide company name and position',400))
    }
    const job=await JobModel.findOneAndUpdate({'_id':jobID,'createdBy':userID},req.body,{
        new:true,
        runValidators:true
    })
    if(!job){
        return next(new CustomError(`No Job Found With ID : ${jobID}`,400))
    }
    res.status(200).json({
        status:'success',
        data:{
            job
        }
    })
    
   })



   module.exports={getAllJobs,createJob,getJob,deleteJob,updateJob}

