const express=require('express');
const CustomError=require('./utils/CustomError')
const globelErrorHandler=require('./controllers/errorController')
//extra security
const helmet=require('helmet')
const cors=require('cors')
const xss=require('xss-clean')
const rateLimiter=require('express-rate-limit')
//extra security ends

const authprotect=require('./controllers/authController')
const authRouter=require('./routes/authroutes')
const jobsRouter=require('./routes/jobroutes')
const app=express();

// middleware
app.use(rateLimiter({
    windowMs:60*1000,//15 minutes
    max:60 //limit each ip top 60 request per windowMs
}))
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());



// route

app.get('/',(req,res)=>{
    res.send('hello jobs api')
})

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/jobs',authprotect.protect,jobsRouter);
app.all('*',(req,res,next)=>{
    const errMsg=`no route found on server with ${req.originalUrl}`;
    const err=new CustomError(errMsg,400);
    next(err)
})

app.use(globelErrorHandler)
module.exports=app;