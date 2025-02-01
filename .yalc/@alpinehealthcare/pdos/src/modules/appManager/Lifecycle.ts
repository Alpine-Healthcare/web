
export type Callback = () => void;

export enum LifecycleState {
    active,
    inactive
}

export default class Lifecycle {
    public state: LifecycleState = LifecycleState.inactive;

    protected initCallbacks: Array<Callback> = new Array<Callback>();
    protected foregroundCallbacks: Array<Callback> = new Array<Callback>();
    protected backgroundCallbacks: Array<Callback> = new Array<Callback>();

    public addInitCallback = (cb : Callback) => this.initCallbacks.push(cb);
    public addForegroundCallback = (cb : Callback) => this.foregroundCallbacks.push(cb);
    public addBackgroundCallback = (cb : Callback) => this.backgroundCallbacks.push(cb);

    protected start(){};
}