export type Observer<TMessage> = (message: TMessage) => void;
export class Observable<TMessage> {
  private _handlers: Observer<TMessage>[] = [];
  observe(handler: Observer<TMessage>) {
    if (this._handlers.indexOf(handler) !== -1) {
      throw new Error(`observer already exists`);
    }
    this._handlers.push(handler);
  }
  dispatch(message: TMessage) {
    for (const handler of this._handlers) {
      handler(message);
    }
  }
  unobserve(handler: Observer<TMessage>) {
    const i = this._handlers.indexOf(handler);
    if (i === -1) {
      throw new Error(`observer doesn't exist`);
    }
    this._handlers.splice(i, 1);
  }
}
