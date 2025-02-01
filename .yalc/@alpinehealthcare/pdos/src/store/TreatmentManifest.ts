import { action, computed, makeObservable, observable } from "mobx";
import { Core } from "../Core";
import PDFSNode from "./PDFSNode";
import Treatment from "./Treatment";
import { addNodeToNetworkMapper } from "./NetworkMapper";

export default class TreatmentManifest extends PDFSNode {
  public static _nodeType = "N_TreatmentManifest"

  constructor(core : Core, treePath: string[], instanceType?: string, hash?: string ){
    super(core, treePath, "N_TreatmentManifest", hash)
    makeObservable(this, {
      addTreatment: action,
      treatments: computed 
    })
    addNodeToNetworkMapper("Treatment", Treatment)
  }

  public get treatments(): Treatment[] {
    return Object.entries(this.edges).filter(([edgeType, edge]) => {
      if (edgeType.includes("Treatment")) {
        return true
      }

      return false
    }).map(([edgeType, edge]) => edge)
  }

  public async addTreatment(
    treatmentName: string = '',
    treatmentBinaryHash: string = '',
    intakeObject: object = {}
  ) {
    await this.addChild(
      Treatment,
      crypto.randomUUID(),
      {
        "is_active": true,
        "active_on": new Date().toISOString(),
        "intake": intakeObject,
        "treatmentName": treatmentName,
        "treatmentBinaryHash": treatmentBinaryHash
      },
      {
        "e_out_TreatmentBinary": treatmentBinaryHash 
      }
    )
  }

}