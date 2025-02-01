import Module from "../Module";
import { Core } from "../../Core";
import NotificationClass from "./AbstractNotification";
import ExpoNotification, { ExpoDependencies } from "./platforms/Expo";
import WebNotification, { WebDependencies } from "./platforms/Web";
import { PlatformState } from "../../constants/Platform";

interface MobileConfig {
  type : "expo"
  pushTokenEndpoint : string
}

export interface NotificationConfig {
  version : string,
  platform : "Web" | "Mobile"
  mobile : MobileConfig
}

export default class Notification extends Module {

  private notify : NotificationClass | undefined;

  constructor(core : Core, private config : NotificationConfig, private dependencyInjection: ExpoDependencies) {
    super(core);
  }

  protected async start() {
    switch (PlatformState[this.config.platform]) {

      case PlatformState.Web :
        this.notify = new WebNotification(this.core, this.config);
        break;
      
      case PlatformState.Mobile :
        this.notify = new ExpoNotification(this.core, this.config, this.dependencyInjection);
        break;

      default :
        console.error("Not supported platform passed to Notification Module!")
        break;
    }

    if (!this.notify) 
      return;

    if(!(await (this.notify as any).checkPermission())) {
      await (this.notify as any).requestPermission();
    }

  }

  async addListener(listener : (data: any) => {}) {
    this.notify?.addEventListener(listener);
  }

}