

interface N_Treatment {
    treatment_access_key: string
}



interface N_TreatmentManifest {
    treatments: N_Treatment[]
}

export const getEdgeInfo = (edgeType: string) => {
  const edgeSplit = edgeType.split("_")

  return {
    coreType: edgeSplit[2],
    instanceType: edgeSplit.length > 3 ? edgeSplit[3] : undefined
  }
}


