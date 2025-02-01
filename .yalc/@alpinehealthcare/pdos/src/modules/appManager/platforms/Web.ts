import Lifecycle, { LifecycleState } from "../Lifecycle";

export default class WebLifecycle extends Lifecycle {

    constructor(){
        super();
    }

    protected start(){
        this.initCallbacks.forEach(cb => cb());

        if (document.visibilityState === "visible") {
          this.foregroundCallbacks.forEach(cb => cb());
        }

        document.addEventListener('visibilitychange', () => {

            if (document.hidden) {
                this.backgroundCallbacks.forEach(cb => cb());
                this.state = LifecycleState.inactive 
            } else {
                this.foregroundCallbacks.forEach(cb => cb());
                this.state = LifecycleState.active;
            }

        });
    

    }

}

