import express from "express"
import cors from "cors";
import ImageKit from "imagekit";
import mongoose from "mongoose";

const port = process.env.PORT || 3000;
const app = express();
app.use(
    cors({
    origon:process.env.CLIENT_URL,
})
);

app.use(express.json())

const connect = async ()=> {
    try{
        await mongoose.connect(process.env.MONGO)
        console.log("Connected to MongoDB")
    }catch(err){
        console.log(err)
    }
}
const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY
    
});
  //process.env.IMAGE_KIT_PUBLIC_KEY,
app.get("/api/upload",(req,res)=>{
    
    const result = imagekit.getAuthenticationParameters();
    res.send(result);

})

app.post("/api/chats",(req,res)=>{
   const {text} = req.body 
   console.log(text)
   
})

app.listen(port,()=>{
    connect()
    console.log(`Server is running on port ${port}`);
});


/*
app.get("/test",(req,res)=>{
    
    const result = imagekit.getAuthenticationParameters();
    res.send(result);

    //res.send('it works fk');
    
})*/


//console.log(`Server is running on port123rs`);





