import { Core } from "../Core";
import PDFSNode from "./PDFSNode";

export default class DataGroup extends PDFSNode {
  public static _nodeType = "N_DataGroup_I"

  constructor(
    core : Core,
    treePath: string[],
    instanceType: string | undefined,
    hash?: string,
  ){
    super(core, treePath, "N_DataGroup_" + instanceType, hash )
  }

  public async updateData() {
    const updateValue = await this.core?.modules?.dataRequest?.getTodaysValue(this._rawNode.metric)

    if (!updateValue) {
      return
    }

    if (updateValue !== undefined) {
      const records = this._rawNode.records
      records[new Date().getTime()] = updateValue
      await this.update({
        ...this._rawNode,
        records
      })
    }
  }

}

