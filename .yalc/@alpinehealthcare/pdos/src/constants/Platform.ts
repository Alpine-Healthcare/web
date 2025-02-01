import Constant from "./libs/Constant";

export enum PlatformState { 
  Web,
  Mobile,
  Node
}

export default class Platform extends Constant<PlatformState> {
    public state : PlatformState;
    constructor(){
        super();
        if (typeof document != 'undefined') {
            this.state = PlatformState.Web
        } else if (typeof navigator != 'undefined' && navigator.product == 'ReactNative') {
            this.state = PlatformState.Mobile
        } else {
            this.state = PlatformState.Node
        }
    }

    public update(){};
}