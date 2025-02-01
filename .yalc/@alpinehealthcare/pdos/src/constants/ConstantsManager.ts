import Authentication from "./Authentication";
import Connection from "./Connection";
import Platform from "./Platform";

export default class ConstantsManager { 
    public authentication: Authentication = new Authentication();
    public connection: Connection = new Connection();
    public platform: Platform = new Platform();
}