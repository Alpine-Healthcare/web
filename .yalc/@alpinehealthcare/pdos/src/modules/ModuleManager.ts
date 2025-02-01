import AppManager from "./appManager/AppManager";
import Notification from "./notification/Notification";
import Auth from "./auth/Auth";
import DataRequest from "./dataRequest/DataRequest";
import Encryption from "./encryption/Encryption";

export default class ModuleManager {
    public appManager?: AppManager;
    public notification?: Notification;
    public auth?: Auth;
    public dataRequest?: DataRequest;
    public encryption?: Encryption;
}