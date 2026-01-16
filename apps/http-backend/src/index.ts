import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./UserMiddleware";
import { CreateUserSchema } from "@repo/common/config";
import { prismaClient } from "db/client";
import cors from "cors";
import { env } from "process";
import { JWT_SECRET } from "@repo/backend-common/config";

const app = express();
app.use(express.json());
app.use(cors());
// add zod validation

app.post("/signup", async (req, res) => {
    const data = CreateUserSchema.safeParse(req.body);

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    try {
        const user = await prismaClient.user.create({
            data: {
                email: email,
                name: name,
                password: password,
            },
        });
        res.json({
            userId: user.id,
        });
    } catch (e) {
        res.json({
            message: "either the email already exists or the db is down",
        });
    }
});

//@ts-ignore
app.post("/signin", async (req, res) => {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;

    try {
        const user = await prismaClient.user.findFirst({
            where: {
                email: email,
            },
        });

        if (!user) {
            return res.status(401).json({
                message: "user not found",
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "password not correct"
            })
        }
        const userId = user.id;

      const token = jwt.sign(
  {
    userId,
  },
  JWT_SECRET
);

        res.json({
            token,
        });
    } catch (e) {
        res.json({
            message: "some error signing in, error is " + e,
            error: e as Error,
        });
    }
});

app.post("/room", middleware, async (req, res) => {
    const slug = req.body.slug;
    //@ts-ignore
    const userId = req.userId;
    const chat = req.body.chat;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: slug,
                adminId: userId,
            },
        });

        res.json({
            roomId: room.id,
        });
    } catch (e) {
    }
});

app.get("/chats/:slug", async (req, res) => {
    const slug = req.params.slug;

    const room = await prismaClient.room.findFirst({
        where: {
            slug: slug,
        },
        include: {
            chats: true,
        },
    });

    const roomArray = room?.chats ?? [];

    const messages = [];
    for (const chat of roomArray) {
        try {
            if (typeof chat.message === "string") {
                messages.push(chat.message);
            } else {
                //@ts-ignore
                messages.push(...chat.message);
            }
        } catch (e) {
            res.json({
                message: "some issue ",
            });
        }
    }
    res.json({
        messages,
    });
});

app.post("/savemessage", (req: Request, res: Response) => {
    const chat = req.body.chat;
    const slug = req.body.slug;

    const room = prismaClient.room.findFirst({
        where: {
            slug: slug,
        },
    });

    //logic to push chat to db
});

app.get("/roomchats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);

        const room = await prismaClient.room.findFirst({
            where: {
                id: roomId,
            },
        });

        res.json({
            slug: room?.slug,
        });
    } catch (e) {
        res.json({
            messages: "Issue in fetching",
        });
    }
});

// endpoint to delete a shape from the db
//@ts-ignore
app.post("/deletechat/:slug", async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug;
        const type = req.body.type;
        const startX = req.body.startX;
        const startY = req.body.startY;
        const endX = req.body.endX;
        const endY = req.body.endY;
        const roomResponse = await prismaClient.room.findFirst({
            where: {
                slug: slug
            }
        });
        const roomId = roomResponse?.id;
        
        if (!roomId) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        
        const shape = await prismaClient.chat.findFirst({
            where: {
                roomId: roomId,
                type: type,
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY
            }
        });
        
        if (!shape) {
            return res.status(404).json({
                message: "Shape not found"
            });
        }
        
        const response = await prismaClient.chat.delete({
            //@ts-ignore
            where: {
                roomId: roomId,
                id: shape.id
            }
        });
        
        if(response){
            res.json({
                "message": "Deletion successfull"
            });
        } else {
            res.json({
                "message": "Deletion unsuccessfull"
            });
        }
    } catch (e) {
        res.status(500).json({
            message: "Error deleting shape",
            error: e
        });
    }
})

// endpoint to delete a shape by properties (for client-side calls)
//@ts-ignore
app.post("/deleteshape/:roomId", async (req: Request, res: Response) => {
    try {
        const roomId = Number(req.params.roomId);
        const { type, startX, startY, endX, endY } = req.body;
        
        // Find the room to get the slug
        const room = await prismaClient.room.findFirst({
            where: {
                id: roomId
            }
        });
        
        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        const chat = await prismaClient.chat.findFirst({
            where: {
                roomId: roomId,
                type: type,
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY
            }
        });
        
        if (!chat) {
            return res.status(404).json({
                message: "Shape not found"
            });
        }
        
        // Delete the chat
        await prismaClient.chat.delete({
            where: {
                id: chat.id
            }
        });
        
        res.json({
            message: "Deletion successful"
        });
    } catch (e) {
        res.status(500).json({
            message: "Deletion unsuccessful",
            error: e
        });
    }
})

//@ts-ignore
app.get("/room/slug/:slug", async (req, res) => {
    const slug = req.params.slug;
    try {
        const room = await prismaClient.room.findFirst({
            where: {
                slug: slug
            },
        });
        if(!room){
            return res.status(404).json({ error: "Room not found" });
        }
        res.json({
            id: room?.id,
        });
    } catch (e) {
        res.status(500).json({ error: "Database error" });
    }
});

app.get("/room/id/:roomId", async(req, res) => {
    const roomId = Number(req.params.roomId);
    const room = await prismaClient.room.findFirst({
        where: {
            id: roomId
        }
    });
    const slug = room?.slug;
    res.json({
        slug: slug
    })
})

app.post("/createroom/:slug", async (req, res) => {
    const slug = req.params.slug;
    try{
        const room = await prismaClient.room.create({
            data: {
                adminId: req.body.adminId,
                slug: slug,
            },
        })
        res.json({
            roomId: room.id,
        })
    }catch(e){
        res.json({
            error: e as Error,
            //@ts-ignore
            messages: `Issue in creating: ${e.message}`,
        })
    }
})
app.listen(3001);
