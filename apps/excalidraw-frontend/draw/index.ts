import axios from "axios";

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
    console.log("socket.onmessage's event.data is ", event.data);
    console.log("typeof event.data ", typeof event.data);

    console.log("inside else");
    console.log("event.data is ", event.data);
    console.log("typeof event.data is", typeof event.data);
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

    const shape = {
      type: "rect",
      x: startX,
      y: startY,
      height,
      width,
    };

    console.log("mouseup shape being pushed is ", shape);

    existingShapes.push(shape);

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
    console.log("inside existingShapes.map block");
    console.log("existingShapes is ", existingShapes);
 console.log("shapestr type ", typeof shapestr);
    console.log("shapestr is ", shapestr);

    if (typeof shapestr === 'object'){
      console.log("inside shapestr is object")
      console.log("shapestr is " , shapestr);
//  const theshape = JSON.parse(JSON.parse(shapestr));
 console.log("shapestr type ", typeof shapestr);
    console.log("shapestr is ", shapestr);

        if (shapestr.type === "rect") {
          console.log("inside shape.type = rect");
          ctx.strokeStyle = "rgba(255,255,255)";
          console.log(shapestr.x, shapestr.y, shapestr.width, shapestr.height);
          ctx.strokeRect(shapestr.x, shapestr.y, shapestr.width, shapestr.height);
}


    }    else{
   const theshape = JSON.parse(JSON.parse(JSON.parse(shapestr)));
 console.log("theshape type ", typeof theshape);
    console.log("theshape is ", theshape);

        if (theshape.type === "rect") {
          console.log("inside shape.type = rect");
          ctx.strokeStyle = "rgba(255,255,255)";
          console.log(theshape.x, theshape.y, theshape.width, theshape.height);
          ctx.strokeRect(theshape.x, theshape.y, theshape.width, theshape.height);
        } 
    } 
 
  });  
}

async function getExistingShapes(roomId: string) {
  const slug = await axios.get(`http://localhost:3001/roomchats/${roomId}`);

  console.log("The roomid from getExistingShapes is " + roomId);

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
