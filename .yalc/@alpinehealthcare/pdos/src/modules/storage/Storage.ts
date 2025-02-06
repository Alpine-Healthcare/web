import Module from "../Module";
import { Core } from "../../Core";

export default class Storage extends Module {

  constructor(core : Core, private config : null, private dependencyInjection: null) {
    super(core);
  }

  protected async start() {

  }

  async addItem(key: string, value: string) {
    return localStorage.setItem(key, value);
  }

  async getItem(key: string) {
    return localStorage.getItem(key);
  }

}