const CustomError=require('./../utils/CustomError')

const devsError=(res,error)=>{
    res.status(error.statusCode).json({
        status:error.status,
        message:error.message,
        stackTrace:error.stack,
        error:error
    })
}
const validationErrorHandler=(err)=>{
    const errors=Object.values(err.errors).map(val=>val.message);
    const errorMessage=errors.join('. ');
    const message=`Invalid Input : ${errorMessage}`;
    return new CustomError(message,400);
}

const castErrorHandler=(err)=>{
    const message=`Invalid value for ${err.path} : ${err.value}`;
    return new CustomError(message,400);
}

const duplicateErrorHandler=(err)=>{
    const message=`Data Already Exist with ${err.keyValue.name}`;
    return new CustomError(message,400);
}
const typeErrorHandler=(err)=>{
    const message=`Invalid Status ${err.keyValue.name}`;
    return new CustomError(message,400);

}

const referenceErrorHandler=(err)=>{
    const message=`Uncaught Exception Occured`;
    return new CustomError(message,400);
}


const prodError=(res,error)=>{
    if(error.isOperational){
        res.status(error.statusCode).json({
            status:error.status,
            message:error.message

        })
    }else{
        error.statusCode=500;
        error.status='Error';
        res.status(error.statusCode).json({
            status:error.status,
            message:'Somthing went wrong please try again'
        })

    }
}

module.exports=(error,req,res,next)=>{
    error.statusCode=error.statusCode || 500;
    error.status=error.status || 'Error';
    
    if(process.env.NODE_ENV=='development'){


        devsError(res,error);
    }else if(process.env.NODE_ENV=='production'){
        if(error.name==='ValidationError') error=validationErrorHandler(error);
        if(error.name==='CastError') error=castErrorHandler(error);
        if(error.code===11000) error=duplicateErrorHandler(error);
        if(error.name==='TypeError') error=typeErrorHandler(error);

        prodError(res,error);
    }
}