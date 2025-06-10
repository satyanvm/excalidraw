    import {WebSocketServer, WebSocket} from "ws";
    import jwt from "jsonwebtoken";
    const wss = new WebSocketServer({ port: 8080 });
    import { prismaClient } from "db/client";
    import { number } from "zod";

    const JWT_SECRET = "123123"
    interface User{
        ws: WebSocket,
        rooms: Number[],
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
                console.log("returning because of no url");
                return;
            }  

            const queryParams = new URLSearchParams(url.split('?')[1])
            const token = queryParams.get('token') || "";
            const userId  = checkUser(token);
            if(!userId){
                console.log("returning because of no user id")
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
            console.log("type of decoded is string and therefore returning")
            ws.close();
            return;
        } 

        if(!decoded || !decoded.userId){
            console.log("problem here")
            ws.close();
            return;
        }  

        ws.on('message', async function message(data){ 
            let parsedData;
            console.log(data);
                if (typeof data !== "string") {
                console.log("in !string if");
                    parsedData = JSON.parse(data.toString()); 
                } else {
                    console.log("in the else block")
                parsedData = JSON.parse(data); 
                console.log("the parsedData is " + parsedData.userId);
                }
       
                        console.log("parsedData is  " , parsedData);
                if(parsedData.type === "join_room"){
                       const  user = users.find(x => x.ws === ws); 
                user?.rooms.push(parsedData.roomId);
                console.log("message received");
                console.log(parsedData);
                console.log(parsedData.roomId);
            } 

            if(parsedData.type === "leave_room"){
                const user= users.find(x => x.ws === ws);
                if(!user){
                    return; 
                }  

                user.rooms = user?.rooms.filter(x => x === parsedData.room);
            }
            console.log("before chat and parsedData.roomId is " + parsedData.roomId);

            if(parsedData.type === "chat"){ 
                try{    
         -   console.log("after chat and parsedData.roomId is " + parsedData.roomId);
                const roomId = parsedData.roomId;
                console.log("the roomid is " + roomId);  
                const message = parsedData.message;
                const themessage = JSON.stringify(JSON.stringify(message));
                
                console.log("the userid from chatcreate is " + userId);
                await prismaClient.chat.create({
                    data:{          
                        roomId: roomId,    
                        message: themessage,
                        userId: userId  
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
            }catch(e){
                console.log("error in sending to users or something, error is " + e);
            }
                    console.log("message received for chat");
                console.log(parsedData);

            }
            
        })}
    )
    