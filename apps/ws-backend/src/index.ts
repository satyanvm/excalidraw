import { WebSocketServer, WebSocket } from "ws";
import { prismaClient } from "db/client";

interface User {
    ws: WebSocket;
    rooms: number[];
    userId: string;
}

const users: User[] = [];
const wss = new WebSocketServer({ port: 8080 });
async function checkUser(sessionToken: string): Promise<string | null> {
    if (!sessionToken) {
        console.log("No session token provided");
        return null;
    }

    try {
        // Query the database directly to verify the session token
        // Using raw SQL since Prisma client might not have session model available
        const sessions = await prismaClient.$queryRaw<
            Array<{ userId: string; expiresAt: Date }>
        >`
            SELECT "userId", "expiresAt" 
            FROM "session" 
            WHERE token = ${sessionToken}
            LIMIT 1
        `;

        if (!sessions || sessions.length === 0) {
            console.log("Session not found in database");
            return null;
        }

        const session = sessions[0];
        
        if (!session) {
            console.log("Session data is null");
            return null;
        }

        // Check if session has expired
        if (session.expiresAt < new Date()) {
            console.log("Session expired");
            return null;
        }

        // Return the user ID
        return session.userId;
    } catch (err) {
        console.log("Session verification failed:", err);
        return null;
    }
}

wss.on("connection", async function connection(ws, request) {
    const url = request.url;
    if (!url) {
        console.log("returning because of no url");
        return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const sessionToken = queryParams.get("token") || "";
    const userId = await checkUser(sessionToken);
    
    if (!userId) {
        console.log("returning because of no user id");
        ws.close();
        return;
    }

    console.log(`User ${userId} connected`);

    const currentUser = {
        userId,
        rooms: [] as number[],
        ws: ws,
    };
    
    users.push(currentUser);

    ws.on("message", async function message(data) {
        let parsedData;
        if (typeof data !== "string") {
            parsedData = JSON.parse(data.toString());
        } else {
            parsedData = JSON.parse(data);
        }
        
        console.log(`Received message type: ${parsedData.type}, roomId: ${parsedData.roomId}`);

        if (parsedData.type === "join_room") {
            const roomId = Number(parsedData.roomId);
            const user = users.find((x) => x.ws === ws);
            if (user && !user.rooms.includes(roomId)) {
                user.rooms.push(roomId);
                console.log(`User ${user.userId} joined room ${roomId}. Total users in room: ${users.filter(u => u.rooms.includes(roomId)).length}`);
            } else if (user) {
                console.log(`User ${user.userId} already in room ${roomId}`);
            }
        }

        if (parsedData.type === "leave_room") {
            const user = users.find((x) => x.ws === ws);
            if (!user) {
                return;
            }
            const roomId = Number(parsedData.room);
            user.rooms = user.rooms.filter((x) => x !== roomId);
        }

        if (parsedData.type === "chat") {
            try {
                const roomId = Number(parsedData.roomId);
                // The client sends message as double-encoded JSON string
                // Parse it to get the actual shape object
                const shapeMessage = typeof parsedData.message === "string" 
                    ? JSON.parse(JSON.parse(parsedData.message))
                    : parsedData.message;
                
                // Find the current user to use their userId
                const user = users.find((x) => x.ws === ws);
                if (!user) {
                    console.error("User not found in users array");
                    return;
                }

                // Process pencil messages
                if(shapeMessage.type === "pencil"){
                    if (!shapeMessage.BufferStroke || shapeMessage.BufferStroke.length === 0) {
                        console.error("Invalid pencil message: BufferStroke is empty or missing");
                        return;
                    }
                    shapeMessage.endX = shapeMessage.BufferStroke[shapeMessage.BufferStroke.length - 1][0];
                    shapeMessage.endY = shapeMessage.BufferStroke[shapeMessage.BufferStroke.length - 1][1];
                }
                
                // Double-stringify for database storage (as the client expects)
                const themessage = JSON.stringify(JSON.stringify(shapeMessage));
                
                // Save to database
                if(shapeMessage.type === "pencil"){
                    await prismaClient.chat.create({
                        data: {
                            roomId: roomId,
                            type: shapeMessage.type,
                            startX: shapeMessage.startX,
                            startY: shapeMessage.startY,
                            endX: shapeMessage.endX,
                            endY: shapeMessage.endY,
                            message: themessage,
                            userId: user.userId,
                        },
                    });
                } else{
                    await prismaClient.chat.create({
                        data: {
                            roomId: roomId,
                            message: themessage,
                            userId: user.userId,
                        },
                    });
                }
                
                // Broadcast to all users in the room (including sender)
                // Send the message in the format the client expects: double-encoded JSON string
                const broadcastMessage = JSON.stringify(JSON.stringify(shapeMessage));
                const usersInRoom = users.filter((u) => u.rooms.includes(roomId));
                console.log(`Broadcasting message to ${usersInRoom.length} users in room ${roomId} (current user: ${user.userId})`);
                
                usersInRoom.forEach((targetUser) => {
                    if (targetUser.ws.readyState === WebSocket.OPEN) {
                        targetUser.ws.send(
                            JSON.stringify({
                                type: "chat",
                                message: broadcastMessage,
                                roomId,
                            }),
                        );
                    } else {
                        console.log(`Skipping user ${targetUser.userId} - WebSocket not open (state: ${targetUser.ws.readyState})`);
                    }
                });
            } catch (e) {
                console.error("error in sending to users or something, error is " + e);
                console.error("Stack:", e instanceof Error ? e.stack : "");
            }
        }
    });

    ws.on("close", () => {
        const index = users.findIndex((x) => x.ws === ws);
        if (index !== -1) {
            const disconnectedUser = users[index];
            if (disconnectedUser) {
                console.log(`User ${disconnectedUser.userId} disconnected`);
            }
            users.splice(index, 1);
        }
    });
});