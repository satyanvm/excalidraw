import { getExistingShapes } from "./http";

type Tool = "circle" | "pencil" | "rect"

type Shape = {   
    type: "rect";
    x: number;
    y: number;
    width: number;         
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number; 
} | {
    type: "pencil";
    startX: number;
    startY: number;
    clientX: number;
    clientY: number;
    BufferStroke: any;
}

export class Game {
    
    private canvas: HTMLCanvasElement;     
    private ctx: CanvasRenderingContext2D; 
    private existingShapes: Shape[]
    private roomId: Number; 
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private lastX = 0;
    private lastY = 0;
    private selectedTool: Tool = "circle";
    private BufferStroke: number[][];
    private scale: number = 1
    private panX: number = 0
    private panY: number = 0
    socket: WebSocket;     


    constructor(canvas: HTMLCanvasElement, roomId: Number, socket: WebSocket) {  
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.BufferStroke = []
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.canvas.width = document.body.clientWidth
        this.canvas.height = document.body.clientHeight
        this.init();
        this.initHandlers();    
        this.initMouseHandlers();
    } 
     
    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)
          
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.removeEventListener("wheel", this.mouseWheelHandler)
    }
      
    setTool(tool: "circle" | "pencil" | "rect") {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);     
        console.log(this.existingShapes);
        this.clearCanvas();     
    }                                    

    initHandlers() {
        this.socket.onmessage = (event) => {         
            const themessage = JSON.parse(event.data); 

            const message = JSON.parse(JSON.parse(JSON.parse(event.data).message));

            if (themessage.type == "chat")  {  
             
                console.log("entered here") 
                this.existingShapes.push(message)
                this.clearCanvas();     

            }   
                this.clearCanvas();
        } 
    }

    clearCanvas() {     
        this.ctx.setTransform(this.scale, 0, 0, this.scale, this.panX, this.panY);
        this.ctx.clearRect( 

            -this.panX / this.scale, 
            -this.panY / this.scale, 

            this.canvas.width / this.scale, 
            this.canvas.height/ this.scale);
            
            this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(  
            // Adjusts the offset of the canvas
            -this.panX / this.scale, 
            -this.panY / this.scale, 
            // Adjusts the scale of the canvas
            this.canvas.width/ this.scale, 
            this.canvas.height / this.scale);

        this.existingShapes.map((shape) => {
            if(typeof shape === 'object'){
     if (shape.type === "rect") {
            this.ctx.strokeStyle = "rgba(255, 255, 255)"
            this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") { 
                console.log(shape);
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            } else if(shape.type === "pencil"){
                    this.ctx.lineWidth = 1;              
                    this.ctx.strokeStyle = 'rgba(255, 255, 255)'; // Low opacity for soft pencil look
                    this.ctx.lineCap = 'round';          // Round edges for smoother strokes
                    this.ctx.lineJoin = 'round'; 

          if (shape.BufferStroke.length < 2) return;

          this.ctx.beginPath(); 
        this.ctx.moveTo(shape.BufferStroke[0][0], shape.BufferStroke[0][1]);

          for (let i = 1; i < shape.BufferStroke.length; i++) {
            this.ctx.lineTo(shape.BufferStroke[i][0], shape.BufferStroke[i][1]);
          } 

          this.ctx.stroke();
            }
            } else{    
            const theshape = JSON.parse(JSON.parse(JSON.parse(shape)))
            console.log("typeof shape is", typeof theshape);          
            console.log("shape is ", theshape);
            if (theshape.type === "rect"){
                this.ctx.strokeStyle = "rgba(255,255,255)";
                this.ctx.strokeRect(theshape.x, theshape.y, theshape.width, theshape.height)
            } else if(theshape.type === "circle"){
                this.ctx.strokeStyle = "rgba(255,255,255)";
                this.ctx.beginPath();
                
                this.ctx.arc(theshape.centerX, theshape.centerY, Math.abs(theshape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
            } else if(theshape.type === "pencil"){
                this.ctx.lineWidth = 1;              
                this.ctx.strokeStyle = 'rgba(255,255,255)'; 
                this.ctx.lineCap = 'round';          
                this.ctx.lineJoin = 'round';   

                if (theshape.BufferStroke.length < 2) return;

                this.ctx.beginPath();
                this.ctx.moveTo(theshape.BufferStroke[0][0], theshape.BufferStroke[0][1]);
                
                for (let i = 1; i < theshape.BufferStroke.length; i++) {
                this.ctx.lineTo(theshape.BufferStroke[i][0], theshape.BufferStroke[i][1]);
                } 
                
                this.ctx.stroke();
            } 
    }

       
        })
    }

    mouseDownHandler = (e: any) => {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY
        this.lastX = e.offsetX
        this.lastY = e.offsetY
        this.BufferStroke = []
        this.BufferStroke.push([this.lastX, this.lastY])
    }
    mouseUpHandler = (e: any) => {
        this.clicked = false
        const width = (e.clientX - this.startX) / this.scale;
        const height = (e.clientY - this.startY) / this.scale;
        const clientX = e.clientX;
        const clientY = e.clientY; 
        const selectedTool = this.selectedTool;     
        let shape: Shape | null = null;
        if (selectedTool === "rect") {   

            shape = {
                type: "rect",
                x: (this.startX - this.panX) / this.scale,
                y: (this.startY - this.panY) / this.scale,
                height,
                width
            }
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: ((this.startX - this.panX) / this.scale) + radius,
                centerY: ((this.startY - this.panY) / this.scale) + radius,
            }
        } else if(selectedTool === "pencil"){

            shape = {
                type: "pencil",
                startX: (this.startX - this.panX) / this.scale,
                startY: (this.startY - this.panY) / this.scale,
                clientX: (e.clientX - this.panX) / this.scale,
                clientY: (e.clientY - this.panY) / this.scale,
                BufferStroke: this.BufferStroke
            }
        }

        if (!shape) {
            console.log("returning because of no shape")
            return;
        }

        console.log("this.selectedTool is " + this.selectedTool);
        console.log("past not shape check")

        this.existingShapes.push(shape);
        this.lastX = e.offsetX;
        this.lastY = e.offsetY;

        this.socket.send(JSON.stringify({
            type: "chat",   
            message: JSON.stringify(JSON.stringify(shape)),
            roomId: this.roomId 
        }))
    } 
    mouseMoveHandler = (e: any) => {
        if (this.clicked) { 
            const width = (e.clientX - this.startX) / this.scale;
            const height = (e.clientY - this.startY) / this.scale;  

            if(this.selectedTool === "rect" || this.selectedTool === "circle"){
            this.clearCanvas();
            }

              this.ctx.strokeStyle = "rgba(255, 255, 255)"  

            const selectedTool = this.selectedTool;

            console.log(selectedTool)

            if (selectedTool === "rect") {
                this.ctx.strokeRect(
                    (this.startX - this.panX) / this.scale,
                    (this.startY - this.panY) / this.scale,
                    width,
                    height
                );
                    } else if (selectedTool === "circle") {  
                const radius = Math.max(width, height) / 2;
                const centerX = (this.startX - this.panX) / this.scale + radius;
                const centerY = (this.startY - this.panY) / this.scale + radius;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke(); 
                this.ctx.closePath();   

            } else if(selectedTool === "pencil"){ 
        this.ctx.lineWidth = 1;              
        this.ctx.strokeStyle = 'rgba(255, 255, 255)';
        this.ctx.lineCap = 'round';          
        this.ctx.lineJoin = 'round';  

        const point = [e.offsetX, e.offsetY]
        //@ts-ignore 
        this.BufferStroke.push(point)

        this.ctx.beginPath() 
        // this.ctx.moveTo(this.lastX, this.lastY) 
        // this.ctx.lineTo(e.offsetX, e.offsetY);

                        this.ctx.moveTo(
                    (this.lastX - this.panX) / this.scale,
                    (this.lastY - this.panY) / this.scale
                );
                this.ctx.lineTo(
                    (e.offsetX - this.panX) / this.scale,
                    (e.offsetY - this.panY) / this.scale
                );
                
        this.ctx.stroke(); 

        this.lastX = e.offsetX;
        this.lastY = e.offsetY;
      }    
        }
    }

mouseWheelHandler = (e: any) => {
        e.preventDefault();

        const scaleAmount = -e.deltaY / 500;
        const newScale = this.scale * (1 + scaleAmount); 

        const mouseX = e.clientX - this.canvas.offsetLeft;
        const mouseY = e.clientY - this.canvas.offsetTop;
        // Position of cursor on canvas
        const canvasMouseX = (mouseX - this.panX) / this.scale;
        const canvasMouseY = (mouseY - this.panY) / this.scale;

        this.panX -= (canvasMouseX * newScale - canvasMouseX * this.scale);
        this.panY -= (canvasMouseY * newScale - canvasMouseY * this.scale);

        this.scale = newScale;

        this.clearCanvas();

    };


    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)    
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)  

        this.canvas.addEventListener("wheel", this.mouseWheelHandler)

    }
}

    //  zoomKeyHandler = (e) => {

    // if (!e.ctrlKey) return;

    // let scaleAmount = 0;

    // if (e.key === "=" || e.key === "+") {
    //     scaleAmount = 0.1; // Zoom in
    // } else if (e.key === "-") {
    //     scaleAmount = -0.1; // Zoom out
    // } else {
    //     return;
    // }

    //     e.preventDefault();

    //     // const scaleAmount = -e.deltaY / 500;          
    //     const newScale = this.scale * (1 + scaleAmount); 

    //     const mouseX = e.clientX - this.canvas.offsetLeft;
    //     const mouseY = e.clientY - this.canvas.offsetTop;

    //     // Position of cursor on canvas                 
    //     const canvasMouseX = (mouseX - this.panX) / this.scale;   
    //     const canvasMouseY = (mouseY - this.panY) / this.scale;

    //     this.panX -= (canvasMouseX * newScale - canvasMouseX * this.scale);
    //     this.panY -= (canvasMouseY * newScale - canvasMouseY * this.scale);

    //     this.scale = newScale;

    //     this.clearCanvas();

    // };    
    
    


    // initMouseHandlers() {
    //     this.canvas.addEventListener("mousedown", this.mouseDownHandler)

    //     this.canvas.addEventListener("mouseup", this.mouseUpHandler)

    //     // this.canvas.addEventListener("mousemove", this.zoomKeyHandler)    

    //     // this.canvas.addEventListener("wheel", this.mouseWheelHandler)

    //     this.canvas.addEventListener("wheel", this.mouseWheelHandler)
    // }
