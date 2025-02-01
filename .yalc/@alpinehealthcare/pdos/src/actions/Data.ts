import pdos from "../Core";
import { traverseTree } from "../store/NetworkMapper";
import PDFSNode from "../store/PDFSNode";

export const sync = async () => { 
  if (pdos().root === undefined) {
    return 
  }
  
  const treatmentBinaries: PDFSNode[] = [] 
  const metricsFound: any = {}


  traverseTree(pdos().root!, (node: any) => {
    if (node._nodeType.toLowerCase().includes("treatmentbinary")) {
      if (!metricsFound[node._rawNode.metric]) {
        treatmentBinaries.push(node)
        metricsFound[node._rawNode.metric] = true
      }
    }
  })

  for (let i=0; i<treatmentBinaries.length;i++) {
    const treatmentBinary: any = treatmentBinaries[i]
    await treatmentBinary.syncData()
    break
  }

  await pdos().tree.root.syncLocalRootHash()

}

export const getAllRecords = () => {
  const dataManifest = pdos().stores.userAccount.edges.e_out_DataManifest

  const metrics: any = {}
  if (!dataManifest) {
    return {}
  }

  Object.values(dataManifest.edges).forEach((node: any) => {
    metrics[node._rawNode.metric] = node._rawNode.records
  })

  return metrics
}