import axios from "axios";

export async function initDraw(canvas: any, roomId: string, socket: WebSocket) {

  //@ts-ignore
  let shape:any;

  const ctx = canvas.getContext("2d");
  let existingShapes: any = await getExistingShapes(roomId);

  clearCanvas(existingShapes, canvas, ctx);

  if (!ctx) {        
    console.log("returning because of no ctx");
    return;
  } 


  socket.onmessage = (event) => {
  
    const hehe = JSON.parse(event.data);

    const themessage = JSON.parse(JSON.parse(JSON.parse(event.data).message));

    if (hehe.type == "chat") {
      console.log("inside message.type = chat");
      existingShapes.push(themessage);
      clearCanvas(existingShapes, canvas, ctx);
    } 
  };

  clearCanvas(existingShapes, canvas, ctx);

  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e: any) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e: any) => {
    clicked = false;
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    //@ts-ignore
    const selectedTool = window.selectedTool

    if(selectedTool === "rect"){
      shape = {
        type: "rect",
        x: startX,
        y: startY,
        height: height,
        width: width,
      }
    } else if(selectedTool === "circle"){
      const radius = Math.max(height, width)/2;
      shape = {
        type: "circle",
        radius: radius,
        centerX: startX + radius,
        centerY: startY + radius

      }
    }


    existingShapes.push(shape);

    socket.send(
      JSON.stringify({
        type: "chat", 
        roomId: Number(roomId),
        message: JSON.stringify(JSON.stringify(shape)),
      })
    );

    
  });

  canvas.addEventListener("mousemove", (e: any) => {
    if (clicked) {
      //@ts-ignore
      if(window.selectedTool === "rect"){
      const width = e.clientX - startX;
      const height = e.clientY - startY;

      clearCanvas(existingShapes, canvas, ctx);

      ctx.strokeStyle = "rgba(225,255,255)";
      ctx.strokeRect(startX, startY, width, height);
      
      //@ts-ignore
      } else if(window.selectedTool === "circle"){
          const width = e.clientX - startX;
          const height = e.clientY - startY;
          const radius = Math.max(width,height)/2; 
          const centerX = startX + radius ;
          const centerY = startY + radius ;
          
          clearCanvas(existingShapes, canvas, ctx);
      
          ctx.strokeStyle = "rgba(225,255,255)";
          ctx.beginPath();
          ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
          ctx.stroke();
      }
    
    }
  });
}

function clearCanvas(
  existingShapes: any,
  canvas: HTMLCanvasElement, 
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  existingShapes.map((shapestr: any) => {

    if (typeof shapestr === 'object'){
        if (shapestr.type === "rect") { 
          ctx.strokeStyle = "rgba(255,255,255)";
          ctx.strokeRect(shapestr.x, shapestr.y, shapestr.width, shapestr.height);
}    
     else if(shapestr.type === "circle"){

          ctx.strokeStyle = "rgba(255,255,255)";
          ctx.beginPath();
        
          ctx.arc(shapestr.centerX, shapestr.centerY, Math.abs(shapestr.radius), 0, Math.PI * 2);
          ctx.stroke();     
     }
      
    }    else{
      const shape = JSON.parse(JSON.parse(JSON.parse(shapestr)))
      console.log("typeof shape is", typeof shape);
      console.log("shape is ", shape);
       if (shape.type === "rect"){
        ctx.strokeStyle = "rgba(255,255,255)";
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
       } else{
          ctx.strokeStyle = "rgba(255,255,255)";
          ctx.beginPath();
          
          ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
          ctx.stroke();
       }
    }
 
  });  
}

async function getExistingShapes(roomId: string) {
  const slug = await axios.get(`http://localhost:3001/roomchats/${roomId}`);

  const res = await axios.get(`http://localhost:3001/chats/chatroom`);

  const messages: string[] = res.data.messages;

  const shapes: any = messages
    .map((str) => {
      try {
        return JSON.parse(str);
      } catch (err) {
        console.error("Failed to parse message:", str, err);
        return null;
      }
    })
    .filter(Boolean);

  return shapes;
}
