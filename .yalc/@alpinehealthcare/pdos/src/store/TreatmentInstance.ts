import { Core } from "../Core";
import PDFSNode from "./PDFSNode";

export default class TreatmentInstance extends PDFSNode {
  public static _nodeType = "N_TreatmentInstance_I"

  constructor(
    core : Core,
    treePath: string[],
    instanceType: string | undefined,
    hash?: string,
  ){
    super(core, treePath, "N_TreatmentInstance_" + instanceType, hash )
  }


}

