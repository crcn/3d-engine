

const DPI = 96;
const IN_IN_MM = 25.4;
const PIXEL_MM_RATIO = IN_IN_MM / DPI;


type Vertex = [number, number, number];
type Face = Vertex[];
type Shape = Face[];
type World = Shape[];
type Projection = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number]
]

type Camera = {
// fdfsdfsdfsfdsfsdfsdfds
};

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = 1000;
canvas.height = 1000;

const createCube = (size: number): Shape => {
  const mult = 5;
  const v: Vertex[] = [

    [0, 0, 0],
    [size, 0, 0],
    [size, size, 0],
    [0, size, 0],
  
    [0, 0, size * mult],  
    [size, 0, size * mult],
    [size, size, size * mult],
    [0, size, size * 4]
  ];

  return [

    // front
    [v[0], v[1], v[2], v[3]],

    // right
    [v[1], v[5], v[6], v[2]],

    // back
    [v[4], v[5], v[6], v[7]],
    
    // top
    [v[0], v[4], v[5], v[1]],

    // left
    [v[0], v[3], v[7], v[4]],

    // bottom
    [v[2], v[3], v[7], v[6]],
  ];
}

function createTriangle(size: number): Shape {
  const hyp = Math.sqrt(Math.pow(size, 2) - Math.pow(size/2, 2));
  const v: Vertex[] = [
    [0, 0, 0],
    [size, 0, 0],
    [size/2, hyp, hyp/2],

    // z
    [size/2, 0, size],
  ];

  return [

    // front
    [v[0], v[1], v[2]],

    // right
    [v[1], v[2], v[3]],

    // left
    [v[0], v[2], v[3]],

    // // bottom
    // [v[0], v[1], v[3]]
  ];
}



let world = [
  rotateShape(translateShape(createCube(100), [300, 300, 0]), [0.3, 1, 0]),
  // translateShape(createCube(100), [300, 300, 0]),
  // translateShape(createTriangle(100), [400, 100, 0]),
];

const FPS = 1000 / 20;



const nextFrame = () => {
  world = world.map(world => {
    return rotateShape(world, [0.05, 0.02, 0]);
  });

  const projection = createProjectionMatrix(100, 50, 100);
  console.log(projection);

  const pworld = world.map(shape => mapShapeVertices(shape, vertex => (
    applyProjectionMatrix(vertex, projection)
  )));

  draw(pworld);

  // setTimeout(nextFrame, FPS);
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

function createProjectionMatrix(angleOfView: number, near: number, far: number): Projection {
  const aspect = 1;
  const q = 1 / Math.tan(degToRad(angleOfView/2));
  const a = q / aspect;
  const b = (far + near) / (near - far);
  const c = (2 * far * near) / (near - far);
  const r = 1;

  return [
    [a, 0, 0, 0],
    [0, q, 0, 0],
    [0, 0, b, c],
    [0, 0, -1, 0],
  ]
}

function applyProjectionMatrix([x, y, z]: Vertex, [a, b, c, d]: Projection): Vertex {

  /*

  let x2 = x * a[0] + y * b[0] + z * c[0];
  let y2 = x * a[1] + y * b[1] + z * c[2];
  let z2 = x * a[2] + y * c[1] + z * c[2];
  let w1 = x * a[3] + y * d[1] + z * c[2];

  */

  let x2 = x * a[0] + y * b[0] + z * c[0];
  let y2 = x * a[1] + y * b[1] + z * c[1];
  let z2 = x * a[2] + y * b[2] + z * c[2];
  // let w1 = x * a[3] + y * b[3] + z * c[3];

  return [
    x2,
    y2,
    z2
  ]
}



// function multiplyMatrix<TMatrix extends number[]>(a: TMatrix, b: number[][]): TMatrix {
//   return a.map((v, i) => {
//     return b[i].reduce((sum, column) => {
//       return sum + column * a[i];
//     }, 0);
//   }) as TMatrix;
// }

function rotateShape(shape: Shape, rotation: Vertex): Shape {
  const [cx, cy, cz] = calcShapeCenter(shape);
  shape = translateShape(shape, [-cx, -cy, -cz]);
  shape = mapShapeVertices(shape, vertex => rotateVertex(vertex, rotation));
  shape = translateShape(shape, [cx, cy, cz]);
  return shape;
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

function calcShapeCenter(shape: Shape): Vertex {
  let ox = 0;
  let oy = 0;
  let oz = 0;
  let vertexCount = 0;
  for (const face of shape) {
    for (const [x, y, z] of face) {
      vertexCount++;
      ox += x;
      oy += y;
      oz += z;
    }
  }

  return [ox / vertexCount, oy / vertexCount, oz / vertexCount];
}

function translateShape(shape: Shape, [x1, y1, z1]: Vertex): Shape {
  return mapShapeVertices(shape, ([x, y, z]) => [x + x1, y + y1, z + z1]);
}

function mapShapeVertices(shape: Shape, map: (vertex: Vertex) => Vertex): Shape {
  return shape.map(face => face.map(map));
}

function degToRad(deg: number) {
  return deg * Math.PI / 180;
}

function radToDeg(rad: number) {
  return rad * 180 / Math.PI;
}


function calcHfov(distance: number, afov: number) {
  return 2 * distance * Math.tan(afov / 2 * Math.PI / 180);
};

