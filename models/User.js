const mongoose=require('mongoose');
const validator=require('validator')
const bcrypt=require('bcryptjs')
const crypto=require('crypto');
const jwt=require('jsonwebtoken');

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please provide valid name']
    },
    email:{
        type:String,
        required:[true,'Please provide valid Email'],
        isLowercase:true,
        unique:true,
        validate:{
            validator:val=>validator.isEmail(val,['en-us']),
            message:'please provide valid email'
        }
    },
    password:{
        type:String,
        required:[true,'Please provide password']
    },
    confirmPassword:{
        type:String,
        required:[true,'please provide confirm password'],
        validate:{
            validator:function(val){
                return val==this.password
            },
            message:'password not matched'
        }
    },
    passwordChangedAt:{
        type:Date
    },
    resetPasswordToken:{
        type:String
    },
    resetPasswordTokenExpiryTime:{
        type:Date
    }
});

UserSchema.pre('save',async function(next) {
    if(!this.isModified('password')) return next();
    this.password=await bcrypt.hash(this.password,12);
    this.confirmPassword=undefined;
    next();
    
});


UserSchema.methods.comparePasswordInDb=async function(pass){
    return await bcrypt.compare(pass,this.password);
}

UserSchema.methods.isPasswordChanged=async function(jwtPasswordChangedTime) {
    if(this.passwordChangedAt){
        const passwordChangedTime=parseInt(this.passwordChangedAt.getTime()/1000,10);
        return jwtPasswordChangedTime<passwordChangedTime
    }
    return false;
    
}

UserSchema.methods.createPasswordResetToken=function(){
    const resetToken=crypto.rendomBytes(32).toString('hex');
    this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordTokenExpiryTime=Date.now()+10*60*1000;
    return resetToken;
}

UserSchema.methods.getName=function(){
    return this.name;
}

UserSchema.methods.createSignInToken=function(){
    return jwt.sign({id:this._id,name:this.name},process.env.LOGIN_SECRET_STR,{
        expiresIn:process.env.LOGIN_EXPIRES
    })
}

module.exports=mongoose.model('User',UserSchema);