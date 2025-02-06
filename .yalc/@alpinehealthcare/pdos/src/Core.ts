
import { reaction, makeAutoObservable } from "mobx";

import PDFSNode from "./store/PDFSNode";

/**
 * Modules 
 */
import MapConfig from "./modules/Map.config";
import Module from "./modules/Module";
import ModuleManager from "./modules/ModuleManager";


/**
 * Constants
 */
import ConstantsManager from "./constants/ConstantsManager";
import { AuthenticationState } from "./constants/Authentication";
export let coreConstants: ConstantsManager;

import { configure } from "mobx"

import UserAccount from "./store/UserAccount";
import { ConfigValidationError, ModuleNotFoundError } from "./Errors";

configure({
  enforceActions: "never",
})

let mainCore: Core;

let pdos = () => {
  return mainCore 
}
export default pdos;

interface TestConfiguration {
  initCredentialId?: string
}

interface Context {
  gatewayURL: string;
  isComputeNode?: boolean;
}

interface CoreConfig {
  env: 'marigold';
  context: Context;
  test?: TestConfiguration;
  modules?: any;
}

export class Core { 
    private static rootInstance = UserAccount
    public root: PDFSNode | undefined = undefined

    public constants: ConstantsManager;
    public modules: ModuleManager = {};

    public stores: any = {};

    private delayedInit : any = [];
    public started: boolean = false;

    public isComputeNode: boolean = false;
    public gatewayURL: string = "";
    public test: TestConfiguration = {};


    constructor(private config : CoreConfig) {
      this.validateConfig(config);

      mainCore = this;
      makeAutoObservable(this);

      this.constants = new ConstantsManager();
      coreConstants = this.constants

      this.onAuthChanged();

      try {
        this.isComputeNode = this.config.context.isComputeNode ?? false;
        this.gatewayURL = this.config.context.gatewayURL ?? ''
        this.test = this.config.test ?? {}
      } catch {
        throw new ConfigValidationError("Failed to parse context");
      }

      console.log("# pdos config : ", config);
    }

    /**
     * Assures that the instantiation object given to pdo is valid
     * and will boot up a healthy instance of pdos
     * 
     * @param config Instantiation object given to pdos
     */
    private validateConfig(config: CoreConfig){

      // Check the env that is requested is available
      const acceptedEnvs = ['marigold'];
      if (config.env && !acceptedEnvs.includes(config.env)){
        throw new ConfigValidationError("Invalid environment given."); 
      }

    }

    public get initConfig(){
      return this.config
    }

    private async onAuthChanged(){
      reaction(
        () => this.constants.authentication.state,
        async (arg: AuthenticationState) => {
          if (!this.started){
            return; 
          }
        }
      )
    } 

    public get tree(){
      return this.stores;
    }

    /*************************
     * Module Lifecycle Methods 
     *************************/

    /**
     * Initializes and starts the modules requested by the client. 
     * Then,
     * Instatiates and creates the client stores.
     *  
     * @param dependencyInjection 
     */
    public async start(dependencyInjection? : any): Promise<Core> {

      //default in case its loaded with require
      const requestedModules = this.config.modules;

      // FIXME: Module dependency stuff is VERY barbones
      // talk to sunny for more info 

      //Check our dependencies across our modules
        const independentModules: Array<String> = []
        const dependentModules: Array<String> = []
        const missingModuleDepdendencies = (modules: any) => {
          return Array.from(Object.keys(modules)).find(moduleName => {
            const dependencies = modules[moduleName].dependencies;
            if (!dependencies) {
              independentModules.push(moduleName)
              return false;
            }

            return !!dependencies.find((dependency: any) => {
              if (!modules[dependency.package])
                return true
              else {
                if (modules[dependency.package].version !== dependency.version) 
                  return true

                dependentModules.push(moduleName) 
                return false
              }
            })
          })
        }

        if (missingModuleDepdendencies(requestedModules))
          throw new Error("Bad Module Configuration! Missing dependencies");

        // TODO: Load and start dependent modules first!!
        const modules = independentModules.concat(dependentModules)

        //load and start all of our modules
        const loadedModules: Array<Promise<void>> = [];
        const errors: Array<any> = []
        modules.forEach((moduleName: any) => {

          //Get the module from the map
          const moduleConfig = requestedModules[moduleName];
          const Module = (MapConfig as any)[moduleName];

          if (!Module) {
            throw new ModuleNotFoundError(`Module ${moduleName} not found in MapConfig`);
          }

          //grab any injected dependencies
          let dependencies;
          if (dependencyInjection) {
            dependencies = dependencyInjection[moduleName];
          }
          
          //Initialize the module and add to core
          Module.init(this, moduleName, moduleConfig, dependencies);
   
          //Start the Module, the module name is camelCased
            loadedModules.push((async () => {
              try {
                await (this.modules as any)[moduleName].start(false)
                console.log(`# ${moduleName} : started`)
              } catch (e) {
                errors.push({
                  type : "critical",
                })
                console.log(`# ${moduleName} : failed to start`, "color:red", e);
              }
            })());
        })

        await Promise.all(loadedModules);

        await this.startStores();

        //Run callbacks for anyone who is waiting for everything to start up.
        await this.postStart();
        this.delayedInit.forEach((func : any) => func())

        console.log("# pdos : successfully started")
        this.started = true;

      return this;
    }

    /**
     * Called after all modules started and stores instantiated.
     */
    private async postStart(){
      return Promise.all(this.liveModules.map(m => {
        if((m as any).postStart)
          (m as any).postStart()
      }));
    }

    public async reset(){
      return Promise.all(this.liveModules.map(m => (m as any).restart()));
    }

    /*************************
     * Module Helper Methods
     *************************/

    /**
     * Returns current modules on the core.
     */
    private get liveModules(){
      return Array.from(Object.keys(this.config.modules)).map((moduleName) => {
        return ((this.modules as any)[moduleName] as Module);
      })
    }

    /*************************
     * Store Lifecycle Methods 
     *************************/

    private async startStores(){
      //start our stores or any injected class (classes that are using the @jscore)

      const capitalizeFirstLetter = (word: string) =>  {
        return word.charAt(0).toLowerCase() + word.slice(1);
      }

      this.root = new Core.rootInstance(this)
        
      if (Core.rootInstance.name) {
          this.stores[capitalizeFirstLetter(Core.rootInstance.name)] = this.root;
      } else {
          this.stores[Core.rootInstance.constructor.name] = this.root;
          this.stores[Core.rootInstance.constructor.name]._();
      }

      this.stores['root'] = this.root;

    }

}

