import pdos from "../Core";

export const getFromPdfs = async(
  hash: string,
) => {
  const response = await fetch(
    `${pdos().gatewayURL + "/pdos"}?hash=${hash}`
  )

  return JSON.parse(await response.json())
}

export const addToPdfs = async(
  treePath: string[],
  newNodeData: any,
  newNodeType: string
) => {
  const node_data = JSON.stringify(newNodeData)
  const addRes = await fetch(pdos().gatewayURL + "/pdos", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      new_node_data: node_data,
      new_node_type: newNodeType,

      tree_path: treePath 
    })
  })

  const addResJson = await addRes.json()

  return {
    rawNode: addResJson.new_node,
    hash: addResJson.new_node.hash_id,
    newTreePath: addResJson.new_tree_path,
    oldTreePath: [...treePath, addResJson.new_node.hash_id] 
  }
}