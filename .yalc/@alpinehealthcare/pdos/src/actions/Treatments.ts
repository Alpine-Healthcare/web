import pdos from "../Core"
import PDFSNode from "../store/PDFSNode"


export const addTreatment = async (name: string, hashId: string, intake: object) => {
  await pdos().tree.root.edges.e_out_TreatmentManifest.addTreatment(name, hashId, intake)
  await pdos().tree.root.syncLocalRootHash()
}

export const getActiveTreatments = () => {
  const activeTreatments =
    pdos().
      stores.
      userAccount?.
      edges?.
      e_out_TreatmentManifest?.
      treatments ?? []

  return activeTreatments
}

export const getTreatmentBinaryForTreatment = async (treatment: PDFSNode) => {
  return treatment.edges.e_out_TreatmentBinary
}

export const getTreatment = (treatment: string) => {
  return getActiveTreatments().find((t: any) => {
    return t._rawNode.data.treatmentName === treatment
  })
}

export const getTreatmentInstances = (treatment: string) => {
  const activeTreatment = getTreatment(treatment)

  if (!activeTreatment) {
    return []
  }

  const instances = Object.entries(activeTreatment.edges).filter(([key, value]: [string, any]) => {
    return key.startsWith("e_out_TreatmentInstance")
  })

  return instances.map(([key, value]: [string, any]) => {
    return value
  })
}
