import PDFSNode from "./PDFSNode"

export const NetworkMapper: any = {}
export const addNodeToNetworkMapper = (nodeType: string, nodeClass: any) => NetworkMapper[nodeType] = nodeClass

export const traverseTree = (root: PDFSNode, callback: (node: PDFSNode) => void) => {

  callback(root)

  const edgeNodes = root.edges ? Object.values(root.edges) : undefined

  if (edgeNodes) {
    Object.values(root.edges).forEach((node) => {
      traverseTree(node, callback)
    })
  }
}

export const doesPDFSNodeExist = (
  name: string,
  root: PDFSNode
) => {

  let foundNode = false
  traverseTree(root, (node: PDFSNode) => {
    if (node._nodeType.toLowerCase().includes(name)){
      foundNode = true
    }
  })

  return foundNode
}