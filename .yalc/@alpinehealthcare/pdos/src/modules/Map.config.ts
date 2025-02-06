import AppManager from "./appManager/AppManager";
import Notification from "./notification/Notification";
import Auth from "./auth/Auth";
import DataRequest from "./dataRequest/DataRequest";
import Encryption from "./encryption/Encryption";
import Storage from "./storage/Storage";

export default { 
  appManager : AppManager,
  auth : Auth,
  dataRequest: DataRequest,
  encryption: Encryption,
  notification : Notification,
  storage: Storage
}