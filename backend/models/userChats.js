import mongoose from "mongoose"

const userChatsSchema = new mongoose.Schema({
    userId :{
        type: String,
        required:true
    },
    chats:[
        {
            _id:{
                type:String,
                enum:["user"|"model"],
                required:true,
            },
            title:{
                type: String,
                enum:["user"|"model"],
                required:true,
            },
            createdAt:{
                type:Date,
                default:Date.now()
                
            },
            // here goe the comment part
        },
    ],
},
{timestamps:true}
);

export default mongoose.models.userChats || mongoose.models("userChats",userChatsScema);


// parts:[
//     {
//         text:{
//             type:String,
//             required:true,
//         },
//     },
// ],
// img:{
//     type:String,
//     required: false,
// },