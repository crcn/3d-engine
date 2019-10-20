

const DPI = 96;
const IN_IN_MM = 25.4;
const PIXEL_MM_RATIO = IN_IN_MM / DPI;


type Vertex = [number, number, number];
type Face = Vertex[];
type Shape = Face[];

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = 1000;
canvas.height = 1000;

const createCube = (size: number): Shape => {
  let vertices: Vertex[] = [

    [0, 0, 0],
    [size, 0, 0],
    [size, size, 0],
    [0, size, 0],
  
    [0, 0, size],  
    [size, 0, size],
    [size, size, size],
    [0, size, size]
  ];

  vertices = moveVertices(vertices, calcVerticesCenter(vertices));


  const faces: Face[] = [

    // front
    [vertices[0], vertices[1], vertices[2], vertices[3]],

    // right
    [vertices[1], vertices[5], vertices[6], vertices[2]],

    // back
    [vertices[4], vertices[5], vertices[6], vertices[7]],
    
    // top
    [vertices[0], vertices[4], vertices[5], vertices[1]],

    // left
    [vertices[0], vertices[3], vertices[7], vertices[4]],

    // bottom
    [vertices[2], vertices[3], vertices[7], vertices[6]],
  ];

  return faces;
}


const shapes = [
  createCube(100),
  // translateShape(createCube(100), [100, 100, -100]),
  // translateShape(createCube(100), [200, 200, -100])
];

const FPS = 1000 / 30;


let pitch = 0;//degToRad(45);
let roll = 0;//degToRad(90);
let yaw = 0;//degToRad(45);
let tick = 0;
let tick2 = 0;
const angleOfView = 45;

const nextFrame = () => {

  pitch = degToRad(tick % 360);
  yaw = degToRad(tick % 360);
  // roll = degToRad(tick % 360);
  tick++;
  const newShapes = shapes.map(shape => {
    return shape.map(face => {
      return moveVertices(face.map(vertex => {
        vertex = rotateVertex(vertex, [pitch, yaw, roll]);
        vertex = scaleVertex(vertex, angleOfView);
        // vertex = applyProjection(vertex);
        return vertex;
      }), [-200, -200, 0])
    });
  });

  draw(newShapes);

  setTimeout(nextFrame, FPS);
}


nextFrame();

function draw(shapes: Shape[]) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const shape of shapes) {
    for (const face of shape) {

      const start = face[0];
      ctx.beginPath();
      ctx.fillStyle = 'transparent';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.moveTo(start[0], start[1]);
      for (let i = 1, {length} = face; i < length; i++) {
        const [x, y] = face[i];
        ctx.lineTo(x, y);
      }
      ctx.lineTo(start[0], start[1]);
      ctx.stroke();
      ctx.fill();
    }
  }
}

function translateShape(shape: Shape, point: Vertex) {
  return shape.map(face => moveVertices(face, point));
}

function rotateVertex([x, y, z]: Vertex, [rx, ry, rz]: Vertex): Vertex {

  // rx
  const x2 = x;
  const y2 = y * Math.cos(rx) - z * Math.sin(rx);
  const z2 = y * Math.sin(rx) + z * Math.cos(rx);

  // ry
  const x3 = x2 * Math.cos(ry) + z2 * Math.sin(ry);
  const y3 = y2;
  const z3 = x2 * -Math.sin(ry) + z2 * Math.cos(ry);

  // rz
  const x4 = x3 * Math.cos(rz) - y3 * Math.sin(rz);
  const y4 = x3 * Math.sin(rz) + y3 * Math.cos(rz);
  const z4 = z3;

  return [x4, y4, z4];
}

function applyProjection([x, y, z]: Vertex): Vertex {
  const w = 1;
  const ws = 1;
  const h = 1;
  const near = 1;
  return [
    x * (w / 2) + z * (w/2),
    y * h/2 + z * (h/2),
    1
  ];
}


function scaleVertex([x, y, z]: Vertex, angleOfView: number): Vertex {
  const hov = 2 * z * Math.tan(degToRad(angleOfView / 2));
  // console.log(x / hov * x, x);
  return [x, y, z];
  // return [x / hov * x, y / hov * y, z / hov * z];
}

function calcPoint(radius: number, theta: number, phi: number) {
  const x = radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.sin(theta) * Math.sin(phi);
  const z = radius * Math.cos(theta);
  return [x, y, z];
}

function calcTheta(radius: number, z: number) {
  return Math.acos(z / radius);
}


function calcPhi(y: number, x: number) {
  return Math.atan2(y, x);
}

// console.log(calcPoint(70.7106, calcTheta(70.7106, -50), calcPhi(-50, 0)));


function calcVerticesCenter(vertices: Vertex[]): Vertex {
  let ox = 0;
  let oy = 0;
  let oz = 0;
  for (const [x, y, z] of vertices) {
    ox += x;
    oy += y;
    oz += z;
  }

  return [ox / vertices.length, oy / vertices.length, oz / vertices.length];
}

function moveVertices(vertices: Vertex[], [x1, y1, z1]: Vertex): Vertex[] {
  return vertices.map(([x, y, z]) => [x - x1, y - y1, z - z1]);
}

// function calcPointDistance(point1: Vertex, point2: PoiVertexnt) {
//   return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2) + Math.pow(point1.z - point2.z, 2));
// }

function degToRad(deg: number) {
  return deg * Math.PI / 180;
}

function radToDeg(rad: number) {
  return rad * 180 / Math.PI;
}

// console.log("A", calcPoint(Math.sqrt(Math.pow(100, 2)*2), degToRad(360-90), 0));


function calcHfov(distance: number, afov: number) {
  return 2 * distance * Math.tan(afov / 2 * Math.PI / 180);
};

