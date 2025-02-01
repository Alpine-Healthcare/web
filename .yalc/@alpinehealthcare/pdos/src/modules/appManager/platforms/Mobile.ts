
import Lifecycle, { LifecycleState } from "../Lifecycle";

export interface MobileLifecycleDependencies {
    AppState : any
}

export default class MobileLifecycle extends Lifecycle {

    constructor(private dependencies: MobileLifecycleDependencies){
        super();
    }

    protected start(){
        this.initCallbacks.forEach(cb => cb());

        if (this.dependencies.AppState.currentState === "active") {
          this.foregroundCallbacks.forEach(cb => cb());
        }

        this.dependencies.AppState.addEventListener("change", async (state : any) => {

            switch (state) {

                case "active" :
                    this.foregroundCallbacks.forEach(cb => cb());
                    this.state = LifecycleState.active;
                    break;

                case "inactive" :
                    this.backgroundCallbacks.forEach(cb => cb());
                    this.state = LifecycleState.inactive 
                    break; 

                default : 
                    break;

            }

        })

    }

}

