import mongoose from "mongoose"

const userChatsSchema = new mongoose.Schema({
    userId :{
        type: String,
        required:true
    },
    chats:[
        {
            chatId:{
                type: String,
                required: true,
            },
            title:{
                type: String,
                required: true,
            },
            createdAt:{
                type: Date,
                default: Date.now()
            },
        },
    ],
},
{timestamps:true}
);

export default mongoose.models.UserChats || mongoose.model("UserChats", userChatsSchema);


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