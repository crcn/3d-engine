import {Observer, Observable} from "./observable";

export class Runtime {
  private _tickObservable: Observable<number> = new Observable();
  private _running: boolean;
  private _tick: number = 0;
  constructor() {

  };
  onTick(handler: Observer<number>) {
    this._tickObservable.observe(handler);
    return {
      dispose: () => this._tickObservable.unobserve(handler)
    }
  }
  start() {
    if (this._running) {
      return;
    }
    this._running = true;
    this.tick();
  }
  tick = () => {
    if (!this._running) {
      return;
    }
    this._tickObservable.dispatch(this._tick);
    this._tick += 0.05;
    setTimeout(this.tick, 20);
  }
  stop() {
    this._running = false;
  }
}