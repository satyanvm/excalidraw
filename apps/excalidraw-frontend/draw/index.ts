import axios from "axios"

type Shape = {
    type: string,
    x: number,
    y: number,
    width: number,
    height: number 
} 
| {
     type: "circle";
     centerX: number,
     centerY: number,
     radius: number
}

export async function initDraw(canvas: any, roomId: string, socket: WebSocket){

             
       const ctx = canvas.getContext("2d");
        let existingShapes: Shape[] = await getExistingShapes(roomId);

            if(!ctx){
                return
            }

            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if(message.type == "chat"){

                    const parsedShape = JSON.parse(message.message);
                    existingShapes.push(
                        parsedShape
                    )
                    clearCanvas(existingShapes, canvas, ctx)
                }
            }
 
            clearCanvas(existingShapes, canvas, ctx);

            let clicked = false;
            let startX = 0;
            let startY = 0;

            canvas.addEventListener("mousedown", (e: any) =>{
                clicked = true
              startX = e.clientX;
              startY = e.clientY;
            })

            canvas.addEventListener("mouseup",(e: any) =>{
                clicked = false
                const width = e.clientX - startX;
                const height  = e.clientY - startY;
                
                const shape: Shape = {
                type: "rect",
                x: startX,
                y: startY,
                height,
                width
            }

            existingShapes.push(shape)

            socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({
                    shape
            })
            }))
            })

            canvas.addEventListener("mousemove", (e: any) => {
                if(clicked){
                const width = e.clientX - startX;
                const height = e.clientY - startY;
                
             clearCanvas(existingShapes, canvas, ctx);

                ctx.strokeStyle = "rgba(225,255,255)" 
                ctx.strokeRect(startX, startY, width, height)
                }
               
            })
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D){

    ctx.clearRect(0,0, canvas.width, canvas.height)
    ctx.fillStyle = "rgba(0,0,0)"
    ctx.fillRect(0,0, canvas.width, canvas.height)

    existingShapes.map((shape) => {
        if(shape.type === "rect"){
            ctx.strokeStyle = "rgba(255,255,255)"
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
            }
        })
    }
async function getExistingShapes(roomId: string) {

    const slug = await axios.get(`http://localhost:3001/roomchats/${roomId}`);

    console.log("The roomid from getExistingShapes is " + roomId);

    const res = await axios.get(`http://localhost:3001/chats/${slug}}`)
    const messages: string[] = [];
    res.data.map((chat: any, index: number) => {
            messages.push(chat.message.trim())
    })
    const shapes = messages.map(x => {
        //possibilities of problem here
        //@ts-ignore
        const messageData = JSON.parse(x.message)
        return messageData
    }) 
    return shapes
}