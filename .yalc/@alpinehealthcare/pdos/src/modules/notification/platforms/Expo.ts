import NotificationClass from "../AbstractNotification";
import { Core } from "../../../Core";
import { NotificationConfig } from "../Notification";

export interface ExpoDependencies {
  Notifications : any,
  Permissions : any,
  Platform : any
}

export default class ExpoNotification extends NotificationClass {
  protected hasPermission : boolean = false;
  protected listeners : ((data: any) => void)[] = [];

  private Notifications : any;
  private Permissions : any;
  private Platform : any;

  constructor(private core : Core, private config : NotificationConfig, expoDependencies : ExpoDependencies) {
    super();
    this.Notifications = expoDependencies.Notifications;
    this.Permissions = expoDependencies.Permissions;
    this.Platform = expoDependencies.Platform;
  }

  protected async checkPermission(){
    const { status  } = await this.Permissions.getAsync(this.Permissions.NOTIFICATIONS);
    if (status === "granted") {
      this.hasPermission = true;
      this.createChannels();
      return true;
    } else {
      this.hasPermission = false;
      return false;
    }
  }

  private async createChannels() {
    if (this.Platform.OS === 'android') {
      this.Notifications.createChannelAndroidAsync('default', {
        name: 'default',
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250],
      });
    }
  }

  protected async requestPermission(){
    const { status } = await this.Permissions.askAsync(this.Permissions.NOTIFICATIONS);

    if (status === "granted") {
      this.hasPermission = true;
      this.createChannels();
      this.updateToken()
      return;
    } else {
    }
  }

  private async getToken() {
    if (this.hasPermission) {
      const token = await this.Notifications.getExpoPushTokenAsync();
      return token;
    }
  }

  protected async updateToken() {
  }

  public addEventListener(cb : (data: any) => void) {
    //TODO : Handle unsubscription of listern callback
    this.Notifications.addEventListener(cb);
  }

  protected newNotification(){

  }

}