import axios from "axios";

// type Shape =
//   | {
//       type: string;
//       x: number;
//       y: number;
//       width: number;
//       height: number;
//     }
//   | {
//       type: "circle";
//       centerX: number;
//       centerY: number;
//       radius: number;
//     };

export async function initDraw(canvas: any, roomId: string, socket: WebSocket) {
  console.log("initDraw is rendered");

  const ctx = canvas.getContext("2d");
  let existingShapes: any = await getExistingShapes(roomId);

  clearCanvas(existingShapes, canvas, ctx);

  console.log("existingShapes is " + existingShapes);
  console.log("before ctx if");
  if (!ctx) {
    console.log("returning because of no ctx");
    return;
  }
  console.log("passed no return and above socket.onmessage");
  console.log("Socket state:", socket.readyState);

  socket.onmessage = (event) => { 
    console.log("socket.onmessage's event is", event);
    console.log("socket.onmessage's event.data is ", event.data)
    console.log("typeof event.data ", typeof event.data)

    
        console.log("inside else")
          console.log("event.data is ", event.data);
          console.log("typeof event.data is", typeof event.data)
 const hehe = JSON.parse(event.data)

    const themessage = JSON.parse(JSON.parse(JSON.parse(event.data).message));

 if (hehe.type == "chat") {
      console.log("inside message.type = chat")
      existingShapes.push(themessage);
      clearCanvas(existingShapes, canvas, ctx);
    }

//     if(event.data.message){
//       try{
//         console.log("inside if");
//     const themessageToAdd = JSON.stringify(JSON.stringify(event.data));
//     const messageToAdd = JSON.stringify(themessageToAdd)
//     const themessage = JSON.parse(event.data);
//     const message = JSON.parse(JSON.parse(themessage.message));
//     console.log("socket.onmessage triggered");
//     console.log("message is ", message); 
// console.log("typeof message.type:", typeof message);
// console.log("message.type as JSON string:", JSON.stringify(message.type));
// console.log("Comparison result:", message.type === "rect");
//  if (themessage.type == "chat") {
//       console.log("inside message.type = chat")
//       const parsedShape = JSON.parse(themessage.message);
//       console.log("The parsedShape from draw is ", parsedShape); 
//       existingShapes.push(hehe);
//       clearCanvas(existingShapes, canvas, ctx);
//     }

//   }catch(e){
//     console.log("error is " + e);
//   }
//     } else{
//          try{ 
//           console.log("inside else")
//           console.log("event.data is ", event.data);
//           console.log("typeof event.data is", typeof event.data)
//  const hehe = JSON.parse(event.data)

//     const themessage = JSON.parse(event.data);

//  if (themessage.type == "chat") {
//       console.log("inside message.type = chat")
//       const parsedShape = JSON.parse(themessage.message);
//       console.log("The parsedShape from draw is ", parsedShape); 
//       existingShapes.push(JSON.stringify(parsedShape));
//       clearCanvas(existingShapes, canvas, ctx);
//     }

//   }catch(e){
//     console.log("error is " + e);
//   }
//     } 
  
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

    const shape = {
      type: "rect",
      x: startX,
      y: startY,
      height,
      width,
    };

    console.log("mouseup shape being pushed is ", shape );

    existingShapes.push(shape)

    socket.send(
      JSON.stringify({
        type: "chat",
        roomId: Number(roomId),
        message: JSON.stringify(JSON.stringify(shape)),
      }) 
    );
    
    console.log(
      "the socket.send is " +
        JSON.stringify({
          type: "chat",
          roomId: Number(roomId),
          message: JSON.stringify({
            shape,
          }),
        })
    );
  });

  canvas.addEventListener("mousemove", (e: any) => {
    if (clicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;

      clearCanvas(existingShapes, canvas, ctx);

      ctx.strokeStyle = "rgba(225,255,255)";
      ctx.strokeRect(startX, startY, width, height);
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

  console.log("existingShapes from clearCanvas is " + existingShapes);

    existingShapes.map((shapestr: any) => {
      console.log("inside existingShapes.map block")
      console.log("existingShapes is " , existingShapes); 
      console.log("shapestr type " , typeof shapestr);
      console.log("shapestr is " , shapestr);
      
      if(typeof shapestr === "string"){
        try{
      const shape = JSON.parse(shapestr)
      console.log("Parsed theshape: ", typeof shape);
      

    
      if (shape.type === "rect") {
        console.log("inside shape.type = rect")
        ctx.strokeStyle = "rgba(255,255,255)";
      console.log(shape.x, shape.y, shape.width, shape.height);
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
  } catch(e){
    console.log("the error is " + e);
  } 
  }
else{
   try{
    
      if (shapestr.type === "rect") {
        console.log("inside shape.type = rect")
        ctx.strokeStyle = "rgba(255,255,255)";
      console.log(shapestr.x, shapestr.y, shapestr.width, shapestr.height);
      ctx.strokeRect(shapestr.x, shapestr.y, shapestr.width, shapestr.height);    
  }
} catch(e){
  console.log("error is " + e);
}
    }

})
}

async function getExistingShapes(roomId: string) {
    const slug = await axios.get(`http://localhost:3001/roomchats/${roomId}`);

    console.log("The roomid from getExistingShapes is " + roomId);

  const res = await axios.get(`http://localhost:3001/chats/chatroom`);

// res.data is an array of JSON strings
const messages: string[] = res.data.messages;
  
// Convert each string to a Shape object
const shapes: any = messages.map((str) => {
  try {
    return JSON.parse(str); 
  } catch (err) {
    console.error("Failed to parse message:", str, err);
    return null; // or filter it out later
  }
}).filter(Boolean); // removes null values
// //@ts-ignore
// const shapeStrings = shapes.map(shape => JSON.stringify(shape));
// console.log(shapeStrings);
return shapes;

  // const messages = res.data.messages;

  //     const shapes = messages.map((x: {message: string}) => {
  //         const messageData = JSON.parse(x.message)
  //         return messageData.shape;
  //     })

  //     return shapes;
}
