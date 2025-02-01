
export interface NotificationEvent {

}

export default abstract class NotificationInterface {
  protected hasPermission : boolean = false;
  protected listeners : ((data: any) => void)[] = [];

  protected abstract checkPermission(): Promise<boolean>;
  protected abstract requestPermission(): void;
  protected abstract updateToken(): void;
  public abstract addEventListener(data: any): void
  protected abstract newNotification(data: any): void;

}