const User=require('./../models/User')
const asyncWraper=require('./../utils/asyncWraper')
const CustomError=require('../utils/CustomError');
const jwt=require('jsonwebtoken');
const utils=require('util');

const signInToken=user=>{
    return jwt.sign({id:user._id,email:user.email},process.env.LOGIN_SECRET_STR,{
        expiresIn:process.env.LOGIN_EXPIRES
    })
}

const createSendResponse=(user,statusCode,res)=>{
    //const token=signInToken(user._id);
    //one way to create token like upper signinToken in controller and second way by usinig model like below
    const token=user.createSignInToken();
    const options={
        expiresIn:process.env.LOGIN_EXPIRES,
        httpOnly:true
    };
    if(process.env.NODE_ENV==='production')
        options.secure=true;

    res.cookie('jwt',token,options);
    user.password=undefined;
    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}





exports.register=asyncWraper(async(req,res,next)=>{
    const {name,email,password,confirmPassword}=req.body
    if(!name || !email || !password || !confirmPassword){
        const err=new CustomError('Please fill all fields',400);
        next(err);
    }
    const newUser=await User.create({...req.body});
   
   if(!newUser){
    const msg=`User Not Created`;
    const err=new CustomError(msg,400);
    next(err);
   }

   createSendResponse(newUser,200,res);

})

exports.signin=asyncWraper(async(req,res,next)=>{
    const {email,password}=req.body;
    if(!email || !password){
        next(new CustomError('Please Enter Email or Password',400));
    }
    const user=await User.findOne({email});
    if(!user){
        return next(new CustomError('Invalid Email or Password',400));
    }
    const isMatched=await user.comparePasswordInDb(password,user.password);
    if(!user || !isMatched){
        const err=new CustomError('Email or Password Not Matched',400);
        return next(err);
    }
    
    createSendResponse(user,201,res);
    
})

exports.protect=asyncWraper(async(req,res,next)=>{
    const testToken=req.headers.authorization;
    let token;
    if(testToken && testToken.startsWith('Bearer')){
        token=testToken.split(' ')[1];

    }
    
    if(!token){
        return next(new CustomError('You are not logged in',401));
    }

    const jwtDecodeToken=await utils.promisify(jwt.verify)(token,process.env.LOGIN_SECRET_STR);

    const user=await User.findById(jwtDecodeToken.id).select('-password');
    if(!user){
        return  next(new CustomError('Invalid User',401));
    }
    
    
    const passwordChanged=await user.isPasswordChanged(jwtDecodeToken.iat);
    if(passwordChanged){
        return  next(new CustomError('password changed please logged in again',401))
    }
    req.user=user;
    next()
})
