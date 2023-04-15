const express=require('express');
const login=require('../schema/loginSchema');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const protect=require('../middlewares/authMiddleware');

const generateJwt = (id) => {
    return jwt.sign({id} , process.env.JWT_SECRET, { expiresIn: "30m" });
};
async function invalidateToken(user) {
    await login.deleteOne({ _id: user._id });
  }
const router=express.Router();
router.route('/login')
.post(async(req,res)=>{
    try{
        const{userName,email,password}=req.body;
        if (!userName || !email || !password) {
            res.status(400);
            throw new Error("Enter all details");
        }
        const user=await login.findOne({email});
        console.log(user.id);
        console.log(user._id);
        if(user&&await bcrypt.compare(password,user.password)){
            res.status(200).json({
                _id: user.id,
                userName: user.userName,
                email: user.email,
                token: generateJwt(user.id),
            });
        }else {
            res.status(400);
            throw new Error("Wrong credentials");
        }
    }catch(error){
        console.log(error);
    }
})
router.route('/register')
.post(async(req,res)=>{
    try{
        const{userName,email,password}=req.body;
        if (!userName || !email || !password) {
            res.status(400);
            throw new Error("Enter all details");
        }
        const user=await login.findOne({email});
        if (user) {
            res.status(400);
            throw new Error("User already Exists");
        }
        const salt=await bcrypt.genSalt(10);
        const hashpass=await bcrypt.hash(password,salt);
        const u=await login.create({
            userName:userName,
            email:email,
            password:hashpass
        })
        res.status(200).json({
            _id: u._id,
            userName: u.userName,
            email: u.email,
            token: generateJwt(u._id)
        });

    }catch(error){
        console.log(error);
    }
})
router.route('/getMe')
.get(protect,async(req,res)=>{
    const { userName, email, _id } = req.user;
    res.status(200).json({
        id: _id,
        userName,
        email,
    });
})
router.route('/loginStatus')
.get(protect,async(req,res)=>{
    const { name, email, _id } = req.user;
    console.log(req.user);
    if(!name&&!email&&!_id){
        res.status(401).json(false);
    }else{
        res.status(200).json(true);   
    }
})
router.route('/logout')
.post(protect,async(req,res)=>{
    try{
        const user = req.user;
       await invalidateToken(user);
        res.sendStatus(200);
    }catch(error){
        res.status(500).send('Internal server error');
    }
})
module.exports=router;