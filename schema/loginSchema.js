const mongoose=require('mongoose');
const schema=mongoose.Schema;

const LoginSchema=new schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
},{
    timestamps:true
})
module.exports=mongoose.model("users",LoginSchema);