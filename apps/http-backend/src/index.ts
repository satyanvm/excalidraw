import express, { Request, Response } from "express"
import jwt from "jsonwebtoken";
import { middleware } from "./UserMiddleware";
import { CreateUserSchema } from "@repo/common/config"
import { prismaClient} from "db/client";
import cors from "cors";
     
const app = express();
app.use(express.json());
app.use(cors())
const JWT_SECRET = "123123";
// add zod validation

app.post('/signup', async (req,res) => {
    const data = CreateUserSchema.safeParse(req.body);
 
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    
    try{
    const user = await prismaClient.user.create({
            data: {
                email: email,
                name: name,
                password: password
            }
        })
          res.json({
        userId :user.id
    })
    } catch(e){
        console.log("the error is "+ e);
        res.json({
            message: "either the email already exists or the db is down"
        }) 
    }

}) 

 
app.post('/signin', async (req,res) => {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;

    try{ 
        const user = await prismaClient.user.findFirst({
        where:{
            email: email
        } 
    })

    const userId = user?.id;     

        const token = jwt.sign({
            userId 
        }, JWT_SECRET as string)
        res.json({  
            token
        })

    } catch(e){
        console.log(e);
        res.json({
            message: "some error signing in"
        })
    }
    
})

app.post('/room', middleware, async (req,res) => {

    const slug = req.body.slug;
    //@ts-ignore
    const userId = req.userId;
    const chat = req.body.chat;
    
    try{
    const room = await prismaClient.room.create({
        data:{
            slug: slug,
            adminId: userId 
          }
    }); 

        res.json({
        roomId: room.id
    }) 
}catch(e){
    console.log("The error is " + e);
}
})


app.get('/chats/:slug', async (req,res) => {

const slug = req.params.slug;

   const room = await prismaClient.room.findFirst({
    where: {
      slug: slug 
    }, 
    include: {    
      chats: true   
    }
  });
              
  const roomArray = room?.chats ?? [];

  const messages = [];
  for (const chat of roomArray) {
    try {
      if (typeof chat.message === 'string') {
      messages.push(chat.message);
      console.log("inside if string and chat.message is " + chat.message)
    } else{
        //@ts-ignore
              messages.push(...chat.message);
              console.log("i passed chat.message to messages.push which is " + chat.message)
    }
    } catch (e) {
        console.log("the error here is "+ e);
res.json({
    message: "some issue "
})    }
  }
  console.log(messages);
  res.json({
    messages
  });

})

app.post('/savemessage', (req,res) => {
    const chat = req.body.chat;
    const slug = req.body.slug;

    const room = prismaClient.room.findFirst({
        where:{
            slug: slug
} 
})

    //logic to push chat to db
})


app.get("/roomchats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);


    
        const room = await prismaClient.room.findFirst(
        {
        where: {
                id: roomId
            }
        }
        );
            

        res.json({
            slug: room?.slug
        })

    } catch(e) {
        console.log("error in /id endpoint is " + e);
        res.json({
            messages: "Issue in fetching"
        })
    }
})

app.get("/room/:slug", async (req,res) => {
    const slug = req.params.slug; 
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    })
    res.json({
        id: room?.id
    })
})


app.listen(3001);