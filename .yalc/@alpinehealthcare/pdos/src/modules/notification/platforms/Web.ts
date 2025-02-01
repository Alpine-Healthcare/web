import NotificationClass from "../AbstractNotification";
import { Core } from "../../../Core";
import { NotificationConfig } from "../Notification";

export enum WebDependencies {
  window
}

interface NotificationData {
  title : string,
  text : string
}

export default class WebNotification extends NotificationClass {
  public hasPermission : boolean = false;
  public listeners : ((data: any) => void)[] = [];

  constructor(private core : Core, private config : NotificationConfig) {
    super();

  }

  protected async checkPermission(){
    if (Notification.permission === "granted") {
      this.hasPermission = true;
      return true;
    } else { 
      return false
    }

  }

  protected async requestPermission(){
    const permission = await Notification.requestPermission();   
    if (permission === "granted") {
      this.hasPermission = true;
    } else {
      this.hasPermission = false;
    }
  }

  public addEventListener(cb : (data: any) => void) {

  }

  protected updateToken() {

  }

  public newNotification(data : NotificationData) {  
    if (this.hasPermission) {
      let n = new Notification(data.title, { body : data.text})

      //TODO : Implement this!!
      n.onclick = () => {

      }
      n.onclose = () => {

      }
    }

  }

}