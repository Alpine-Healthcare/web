import { makeObservable, observable, reaction } from "mobx";
import { Core } from "../Core";
import { logger } from "../utils/logger";
import DataManifest from "./DataManifest";
import Inbox from "./Inbox";
import { addNodeToNetworkMapper } from "./NetworkMapper";
import PDFSNode from "./PDFSNode";
import TreatmentManifest from "./TreatmentManifest";
import { getUserHashId } from "../utils/mutex";
import { AuthType } from "../modules/auth/Auth";
import { hash } from "crypto";


export default class UserAccount extends PDFSNode {

  public isRefreshing: boolean = false
  public isLoaded: boolean = false
  public lastUpdateTimestamp: number = 0

  constructor(core : Core){
    super(core, [], "N_UserAccount")
    makeObservable(this, {
      isLoaded: observable,
      isRefreshing: observable,
    })

    addNodeToNetworkMapper("TreatmentManifest", TreatmentManifest)
    addNodeToNetworkMapper("DataManifest", DataManifest)
    addNodeToNetworkMapper("Inbox", Inbox)
  }

  public async checkPDOSTreeIsMostRecent(){
    let hashId;

    if (this.core.modules.auth?.authType === AuthType.WALLET) {
      hashId = await this.core.modules.auth?.getPDOSRoot() 
    } else {
      hashId = await getUserHashId(this._rawNode.credentials[0].id)
    }

    if (hashId === this._hash) {
      return true
    }
    this.edges = {}
    await this.init(hashId)
    return false
  }
  
  public async syncLocalRootHash(addressToUpdate?: string){
    if (this.core.modules.auth?.authType === AuthType.WALLET) {
      const hashId = await this.core.modules.auth?.getPDOSRoot(addressToUpdate) 
      if (this._hash !== hashId) {
        await this.core.modules.auth.updatePDOSRoot(this._hash, addressToUpdate ?? this.core.modules.auth.publicKey )
        console.log("# pdos : new root - " + this._hash)
      }
    } 
  }

  public async init(hash: string) {
    this.isLoaded = false
    this._hash = hash
    await this.node
    await this.refreshChildren
    this.isLoaded = true
    return this._hash
  }

  public async refresh(oldTreePath: string[], updateTreePath: string[]) {
    this.isRefreshing = true
    logger.tree("\n\n\n\nTree Refresh!")
    logger.tree("---------------------------------")
    logger.tree("oldTreePath: ", oldTreePath)
    logger.tree("updateTreePath: ", updateTreePath)
    const updateFunctions: any = []

    const getTreeUpdateFunctions = (
      currentNode: any,
      currentDepth: number,
      oldTreePath: string[],
      updatedTreePath: string[]
    ): void => {

      updateFunctions.push(
        async () => {
          const newTreePath = updatedTreePath.slice(0, currentDepth)
          currentNode._hash = updatedTreePath[currentDepth]
          currentNode._treePath = newTreePath 
          currentNode._treePathInclusive = [...newTreePath, currentNode._hash] 

          await currentNode.node
        }
      )

      const nextDepth = currentDepth + 1
      if (nextDepth > oldTreePath.length - 1) {
        return
      }

      const nextHash = oldTreePath[nextDepth]

      const nodeInQuestion = Object.values(currentNode.edges).find((edge: any) => {
        return edge._hash === nextHash
      })

      if (!nodeInQuestion) {
        throw new Error("No Edge Found")
      }

      return getTreeUpdateFunctions(
        nodeInQuestion,
        nextDepth,
        oldTreePath,
        updateTreePath
      )

    }

    await getTreeUpdateFunctions(this, 0, oldTreePath, updateTreePath)

    for (const i in updateFunctions.reverse()) {
      await updateFunctions[i]()
    }

    this.isRefreshing = false
    this._hash = updateTreePath[0]
    this.core.tree.root = this
  }

}