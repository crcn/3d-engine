import { Point } from "./point";
import { Runtime } from "./runtime";

class Camera {
  public roll: number = 0;
  public pitch: number = 0;
  public yaw: number = 0;
  public zoom: number = 100;
  public point: Point = {x: 0, y: 0, z: 0};
  constructor() {

  }
  rotate(step: number = 1) {
    this.roll = (this.roll + step) % 360;
    return this;
  }
}

interface Shape {
  element: HTMLElement;
  update: (camera: Camera) => void;
}

class Dot implements Shape {
  readonly element: HTMLElement;
  constructor(public point: Point, public diameter: number = 10) {
    this.element = document.createElement("div");
    Object.assign(this.element.style, {
      position: 'absolute',
      borderRadius: `${this.diameter}px`,
      width: `${diameter}px`,
      height: `${diameter}px`,
      background: `red`
    });
  }
  update({point, pitch, yaw, roll}: Camera) {

    // console.log(rotation / 360)

    const x = Math.cos(roll * Math.PI / 180) * this.point.z;
    const y = Math.sin(roll * Math.PI / 180) * this.point.z;
    
    
    Object.assign(this.element.style, {
      left: `${x}px`,
      top: `${y}px`
    })
  }
}

class Container implements Shape {
  readonly element: HTMLElement;
  private _children: Shape[];
  constructor() {
    this.element = document.createElement("div");
    Object.assign(this.element.style, {
      position: 'absolute',
      left: '200px',
      top: '200px'
    });
    this._children = [];
  }
  update(camera: Camera) {
    for (const child of this._children) {
      child.update(camera);
    }
  }
  addChild(child: Shape) {
    this._children.push(child);
    this.element.appendChild(child.element);
  }
}


const container = new Container();

const d1 = new Dot({ x: 0, y: 0, z: 0});
const d2 = new Dot({ x: 100, y: 0, z: 100});


container.addChild(d1);
container.addChild(d2);

document.body.appendChild(container.element);

const runtime = new Runtime();
const camera = new Camera();

camera.point.x = 0;
camera.point.y = 0;
camera.point.z = -100;
camera.pitch = 0;
camera.yaw = 0;
camera.roll = 0;

runtime.onTick(() => {
  container.update(camera);

}); 
runtime.start();