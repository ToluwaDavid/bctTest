import express from 'express';
import User from "./model/User.js";
import jwt from "jsonwebtoken"
import mongoose from 'mongoose';

const app = express();

const port = 8000;

app.use(express.json())


//Connect to mongodb
mongoose.connect( process.env.MONGO_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Create transporter for the email
// const transporter = nodemailer.createTransport({
//     service: //email Service 
//     auth: {
//       user: company-email,
//       pass: company-password,
//     },
//   });
  

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY , { expiresIn: "30d" });
};


//Sign Up user
app.post('/signup' , (req, res)=>{
   try {
        const {name, email, password } = req.body;
        const userexist = User.findOne({email}).exec();

        //verify user email
        if(userexist) return res.send("Email has been taken")

        let user = User.create({
            name,
            email,
            password
        })
    if(user){
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id)
        })

        //Send verification email to the user
        // const data = {
        //     from: 'your-email@gmail.com',
        //     to: req.body.email,
        //     subject: 'Account Verification',
        //     text: `Please click this link to verify your account:  `,
        //   };
        //Send final email
        transporter.sendEmail(data)
    }else{
        res.status(400);
        throw new Error("Invalid user data");   
    }

   } catch (error) {
    res.status(500).json({ error: error.message });
   }
})


//Authenticate a user
app.post('/login', (req, res)=>{
   const {email, password} = req.body;
   if(!email || !password){
    res.status(400);
    throw new Error("Email and Password cannot be empty")
   }

   const user = User.findOne({email});
   if(user){
    res.status(201).json({
        message: "User logged in successfully",
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id)
    })
   } else{
    res.status(400);
    throw new Error("Incorrect login details")
   }
})

//reset password
app.put('/reset/:id' , async(req, res)=>{
    try {
        const newpassword = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { password: newpassword }, { new: true });
        res.json{
            {
                message : "New Password was updated"
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message });  
    }
})


//

app.listen(port, ()=> console.log("Server is running on port 8000"))