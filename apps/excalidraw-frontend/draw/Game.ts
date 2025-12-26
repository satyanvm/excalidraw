import { getExistingShapes } from "./http";

type Tool = "circle" | "pencil" | "rect" | "hand" | "eraser";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      startX: number;
      startY: number;
      clientX: number;
      clientY: number;
      BufferStroke: any;
    }
  | {
      type: "eraser";
      startX: number;
      startY: number;
      clientX: number;
      clientY: number;
      BufferStroke: any;
  };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: Number;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private selectedTool: Tool = "circle";
  private BufferStroke: number[][];
  private scale: number = 1;
  private panX: number = 0;
  private panY: number = 0;
  private isPanning: boolean = false;
  private noPanAndDraw: boolean = true;
  private isPan: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private allRectX: any[];
  private allRect: any[];
  private allShapeXRect: any[];
  private allShapeYRect: any[];
  socket: WebSocket;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: Number,
    socket: WebSocket,
    existingShapes: any,
    allShapeXRect: any,
    allShapeYRect: any,
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = existingShapes;
    this.BufferStroke = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    this.allRectX = [];
    this.allRect = [];
    this.allShapeXRect = allShapeXRect;
    this.allShapeYRect = allShapeYRect;

    this.init();

    this.initHandlers();
    this.initMouseHandlers();
    this.checkX(0, 0);
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);

    this.canvas.removeEventListener("wheel", this.mouseWheelHandler);
  }

  setTool(tool: "circle" | "pencil" | "rect" | "hand" | "eraser") {
    this.selectedTool = tool;
  }

  async init() {
    console.log("init is called");

    this.clearCanvas();
  }

  checkX(x: number, y: number) {
    console.log("this.allShapeYRect is " + this.allShapeYRect);
    if (this.allShapeXRect.includes(x) && this.allShapeYRect.includes(y)) {
      console.log("Triggered at X =", x);
      this.canvas.style.cursor = "nwse-resize";
      setTimeout(() => {
        this.canvas.style.cursor = "default";
      }, 100);
    }
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const themessage = JSON.parse(event.data);

      const message = JSON.parse(JSON.parse(JSON.parse(event.data).message));

      console.log("before chat message.type");

      if (themessage.type == "chat") {
        console.log("came inside chat of socket.onmessage");
        this.existingShapes.push(message);
        this.clearCanvas();
      }
      this.clearCanvas();
    };
  }

  forPanClearCanvas() {
    this.ctx.setTransform(this.scale, 0, 0, this.scale, this.panX, this.panY);
    this.ctx.clearRect(
      -this.panX / this.scale,
      -this.panY / this.scale,

      this.canvas.width / this.scale,
      this.canvas.height / this.scale,
    );

    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(
      -this.panX / this.scale,
      -this.panY / this.scale,
      this.canvas.width / this.scale,
      this.canvas.height / this.scale,
    );

    this.existingShapes.map((shape) => {
      if (typeof shape === "object") {
        if (shape.type === "rect") {
          this.ctx.strokeStyle = "rgba(255, 255, 255)";
          this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "circle") {
          this.ctx.beginPath();
          this.ctx.arc(
            shape.centerX,
            shape.centerY,
            Math.abs(shape.radius),
            0,
            Math.PI * 2,
          );
          this.ctx.stroke();
          this.ctx.closePath();
        } else if (shape.type === "pencil") {
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle = "rgba(255, 255, 255)";
          this.ctx.lineCap = "round";
          this.ctx.lineJoin = "round";

          if (shape.BufferStroke.length < 2) return;

          this.ctx.beginPath();
          this.ctx.moveTo(shape.BufferStroke[0][0], shape.BufferStroke[0][1]);

          for (let i = 1; i < shape.BufferStroke.length; i++) {
            this.ctx.lineTo(shape.BufferStroke[i][0], shape.BufferStroke[i][1]);
          }

          this.ctx.stroke();
        }
      } else {
        const theshape = JSON.parse(JSON.parse(JSON.parse(shape)));

        if (theshape.type === "rect") {
          this.ctx.strokeStyle = "rgba(255,255,255)";
          this.ctx.strokeRect(
            theshape.x,
            theshape.y,
            theshape.width,
            theshape.height,
          );
        } else if (theshape.type === "circle") {
          this.ctx.strokeStyle = "rgba(255,255,255)";
          this.ctx.beginPath();

          this.ctx.arc(
            theshape.centerX,
            theshape.centerY,
            Math.abs(theshape.radius),
            0,
            Math.PI * 2,
          );
          this.ctx.stroke();
        } else if (theshape.type === "pencil") {
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle = "rgba(255,255,255)";
          this.ctx.lineCap = "round";
          this.ctx.lineJoin = "round";

          if (theshape.BufferStroke.length < 2) return;

          this.ctx.beginPath();
          this.ctx.moveTo(
            theshape.BufferStroke[0][0],
            theshape.BufferStroke[0][1],
          );

          for (let i = 1; i < theshape.BufferStroke.length; i++) {
            this.ctx.lineTo(
              theshape.BufferStroke[i][0],
              theshape.BufferStroke[i][1],
            );
          }

          this.ctx.stroke();
        }
      }
    });
  }
  clearCanvas() {
    this.ctx.setTransform(this.scale, 0, 0, this.scale, this.panX, this.panY);
    this.ctx.clearRect(
      -this.panX / this.scale,
      -this.panY / this.scale,

      this.canvas.width / this.scale,
      this.canvas.height / this.scale,
    );

    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(
      -this.panX / this.scale,
      -this.panY / this.scale,
      this.canvas.width / this.scale,
      this.canvas.height / this.scale,
    );

    this.existingShapes.map((shape) => {
      if (typeof shape === "object") {
        if (shape.type === "rect") {
          this.ctx.strokeStyle = "rgba(255, 255, 255)";
          this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "circle") {
          this.ctx.beginPath();
          this.ctx.arc(
            shape.centerX,
            shape.centerY,
            Math.abs(shape.radius),
            0,
            Math.PI * 2,
          );
          this.ctx.stroke();
          this.ctx.closePath();
        } else if (shape.type === "pencil") {
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle = "rgba(255, 255, 255)";
          this.ctx.lineCap = "round";
          this.ctx.lineJoin = "round";

          if (shape.BufferStroke.length < 2) return;

          this.ctx.beginPath();
          this.ctx.moveTo(shape.BufferStroke[0][0], shape.BufferStroke[0][1]);

          for (let i = 1; i < shape.BufferStroke.length; i++) {
            this.ctx.lineTo(shape.BufferStroke[i][0], shape.BufferStroke[i][1]);
          }

          this.ctx.stroke();
        }
      } else {
        const theshape = JSON.parse(JSON.parse(JSON.parse(shape)));

        if (theshape.type === "rect") {
          this.ctx.strokeStyle = "rgba(255,255,255)";
          this.ctx.strokeRect(
            theshape.x,
            theshape.y,
            theshape.width,
            theshape.height,
          );
        } else if (theshape.type === "circle") {
          this.ctx.strokeStyle = "rgba(255,255,255)";
          this.ctx.beginPath();

          this.ctx.arc(
            theshape.centerX,
            theshape.centerY,
            Math.abs(theshape.radius),
            0,
            Math.PI * 2,
          );
          this.ctx.stroke();
        } else if (theshape.type === "pencil") {
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle = "rgba(255,255,255)";
          this.ctx.lineCap = "round";
          this.ctx.lineJoin = "round";

          if (theshape.BufferStroke.length < 2) return;

          this.ctx.beginPath();
          this.ctx.moveTo(
            // x coordinate of the first point
            theshape.BufferStroke[0][0],
            // y coordinate of the first point
            theshape.BufferStroke[0][1],
          );

          for (let i = 1; i < theshape.BufferStroke.length; i++) {
            this.ctx.lineTo(
              // x coordinate of the ith point
              theshape.BufferStroke[i][0],
              // y coordinate of the ith point
              theshape.BufferStroke[i][1],
            );
          }

          this.ctx.stroke();
        }
      }
    });
  }

  mouseDownHandler = (e: any) => {
    if (this.selectedTool === "hand") {
      this.isPanning = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }

    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.lastX = e.offsetX;
    this.lastY = e.offsetY;
    this.BufferStroke = [];
    this.BufferStroke.push([
      (this.lastX - this.panX) / this.scale,
      (this.lastY - this.panY) / this.scale,
    ]);
  };
  mouseUpHandler = (e: any) => {
    this.isPanning = false;
    console.log(
      "mouseup happened and here this.isPanning is " + this.isPanning,
    );
    this.clicked = false;
    const width = (e.clientX - this.startX) / this.scale;
    const height = (e.clientY - this.startY) / this.scale;
    const clientX = e.clientX;
    const clientY = e.clientY;
    const selectedTool = this.selectedTool;
    if (this.isPan) {
      this.noPanAndDraw = true;
    }
    let shape: Shape | null = null;
    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: (this.startX - this.panX) / this.scale,
        y: (this.startY - this.panY) / this.scale,
        height,
        width,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        radius: radius,
        centerX: (this.startX - this.panX) / this.scale + radius,
        centerY: (this.startY - this.panY) / this.scale + radius,
      };
    } else if (selectedTool === "pencil") {
      shape = {
        type: "pencil",
        startX: (this.startX - this.panX) / this.scale,
        startY: (this.startY - this.panY) / this.scale,
        clientX: (e.clientX - this.panX) / this.scale,
        clientY: (e.clientY - this.panY) / this.scale,
        BufferStroke: this.BufferStroke,
      };
    } 
    if (!shape) {
      console.log("returning because of no shape");
      return;
    }

    this.existingShapes.push(shape);
    this.lastX = e.offsetX;
    this.lastY = e.offsetY;

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify(JSON.stringify(shape)),
        roomId: this.roomId,
      }),
    );
  };

  mouseMoveHandler = (e: any) => {
    console.log("right now this.isPanning is " + this.isPanning);

    const mouseX = e.clientX - this.canvas.offsetLeft;
    const mouseY = e.clientY - this.canvas.offsetTop;
    const canvasMouseX = (mouseX - this.panX) / this.scale;
    const canvasMouseY = (mouseY - this.panY) / this.scale;

    console.log("this.existingShapes is " + this.existingShapes);

    console.log("before checkx function");
    this.checkX(mouseX, mouseY);

    if (this.clicked) {
      if (this.isPanning) {
        if (this.selectedTool === "hand") {
          const deltaX = mouseX - this.lastMouseX;
          const deltaY = mouseY - this.lastMouseY;

          this.panX += deltaX;
          this.panY += deltaY;

          this.lastMouseX = mouseX;
          this.lastMouseY = mouseY;

          this.forPanClearCanvas();
        }
      } else {
        const width = (e.clientX - this.startX) / this.scale;
        const height = (e.clientY - this.startY) / this.scale;

        if (this.selectedTool === "rect" || this.selectedTool === "circle") {
          this.clearCanvas();
        }

        this.ctx.strokeStyle = "rgba(255, 255, 255)";

        const selectedTool = this.selectedTool;

        if (selectedTool === "rect") {
          this.ctx.strokeRect(
            (this.startX - this.panX) / this.scale,
            (this.startY - this.panY) / this.scale,
            width,
            height,
          );
        } else if (selectedTool === "circle") {
          const radius = Math.max(width, height) / 2;
          const centerX = (this.startX - this.panX) / this.scale + radius;
          const centerY = (this.startY - this.panY) / this.scale + radius;
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.closePath();
        } else if (selectedTool === "pencil") {
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle = "rgba(255, 255, 255)";
          this.ctx.lineCap = "round";
          this.ctx.lineJoin = "round";

          const point = [
            (e.offsetX - this.panX) / this.scale,
            (e.offsetY - this.panY) / this.scale,
          ];
          //@ts-ignore
          this.BufferStroke.push(point);

          this.ctx.beginPath();

          this.ctx.moveTo(
            (this.lastX - this.panX) / this.scale,
            (this.lastY - this.panY) / this.scale,
          );
          this.ctx.lineTo(
            (e.offsetX - this.panX) / this.scale,
            (e.offsetY - this.panY) / this.scale,
          );

          this.ctx.stroke();

          this.lastX = e.offsetX;
          this.lastY = e.offsetY;
        } else if (selectedTool === "eraser") {
          this.ctx.lineWidth = 10;
          this.ctx.lineCap = "round";
          this.ctx.lineJoin = "round";
          const eraserX = (e.offsetX - this.panX) / this.scale;
          const eraserY = (e.offsetY - this.panY) / this.scale;
          const eraserRadius = 10;

          this.ctx.beginPath();

          this.ctx.moveTo(
            (this.lastX - this.panX) / this.scale,
            (this.lastY - this.panY) / this.scale,
          );

          this.ctx.stroke();

          // We will do bounds intersection check for eraser
          // if the eraser is intersecting with any shape, then clear that shape
          // first fetch the path of the existing shapes
          // first implementing only for pencils
          this.existingShapes = this.existingShapes.filter((shape) => {
            if (shape.type === "pencil") {
              // Check if any point in the stroke is within eraser radius
              for (const point of shape.BufferStroke) {
                const dx = point[0] - eraserX;
                const dy = point[1] - eraserY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < eraserRadius) {
                  return false; // Remove this shape (eraser touched it)
                }
              }
            }
            return true; // Keep this shape
          });
        }
      }
    }
  };

  mouseWheelHandler = (e: any) => {
    const isZoom = e.ctrlKey;
    if (isZoom) {
      e.preventDefault();

      const scaleAmount = -e.deltaY / 500;
      const newScale = this.scale * (1 + scaleAmount);

      const mouseX = e.clientX - this.canvas.offsetLeft;
      const mouseY = e.clientY - this.canvas.offsetTop;
      const canvasMouseX = (mouseX - this.panX) / this.scale;
      const canvasMouseY = (mouseY - this.panY) / this.scale;

      this.panX -= canvasMouseX * newScale - canvasMouseX * this.scale;
      this.panY -= canvasMouseY * newScale - canvasMouseY * this.scale;

      this.scale = newScale;

      this.clearCanvas();
    } else if (this.isPanning) {
      this.clicked = false;
      console.log(this.clicked);

      console.log("entered this.isPanning");

      const mouseX = e.clientX - this.canvas.offsetLeft;
      const mouseY = e.clientY - this.canvas.offsetTop;

      const deltaX = mouseX - this.lastMouseX;
      const deltaY = mouseY - this.lastMouseY;

      this.panX += deltaX;
      this.panY += deltaY;

      this.lastMouseX = mouseX;
      this.lastMouseY = mouseY;

      this.forPanClearCanvas();
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("wheel", this.mouseWheelHandler);
  }
}
