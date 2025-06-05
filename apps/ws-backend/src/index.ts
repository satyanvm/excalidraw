import {WebSocketServer, WebSocket} from "ws";
import jwt from "jsonwebtoken";
const wss = new WebSocketServer({ port: 8080 });
// import {JWT_SECRET} from "@repo/backend-common/config";
import { prismaClient } from "db/client";
import { number } from "zod";

const JWT_SECRET = "123123"
interface User{
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = []

function checkUser(token: string): string | null{
     
    const decoded = jwt.verify(token, JWT_SECRET);
    if(typeof decoded == "string"){
        return null;
    }
    if(!decoded || !decoded.userId){
        return null;
    }
    return decoded.userId;
}


wss.on('connection', function connection(ws, request){
    const url = request.url;
    if(!url){
        return;
    } 

    const queryParams = new URLSearchParams(url.split('?')[1])
    const token = queryParams.get('token') || "";
    const userId  = checkUser(token);
    if(!userId){
        ws.close()
        return;
    }

    users.push({
        userId,   
        rooms: [],
        ws: ws
    }) 
    const decoded = jwt.verify(token ?? "", JWT_SECRET)

    if(typeof decoded == "string"){
        ws.close();
        return;
    }

    if(!decoded || !decoded.userId){
        ws.close();
        return;
    }
    ws.on('message', async function message(data){
   let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
    }
    //@ts-ignore
    // parsedData = JSON.parse(data)

            if(parsedData.type === "join_room"){
            const  user = users.find(x => x.ws === ws);
            user?.rooms.push(parsedData.roomId);
        } 

        if(parsedData.type === "leave_room"){
            const user= users.find(x => x.ws === ws);
            if(!user){
                return;
            }

            user.rooms = user?.rooms.filter(x => x === parsedData.room);
        }

        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            
            await prismaClient.chat.create({
                data:{
                    roomId,
                    message,
                    userId
                }
            })
            users.forEach(user => {
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId
                    }))
                }
            })

        }

    })}
)
 