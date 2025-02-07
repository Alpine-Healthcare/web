import pdos, { Core } from "./Core";
import { getAllRecords, sync } from "./actions/Data";
import { clearMessages, getMessages } from "./actions/Inbox";
import { addTreatment, getActiveTreatments, getTreatmentBinaryForTreatment, getTreatmentInstances } from "./actions/Treatments";
import PDFSNode from "./store/PDFSNode";

export const actions = {
  inbox: {
    getMessages,
    clearMessages,
  },
  treatments: {
    getActiveTreatments,
    getTreatmentInstances,
    getTreatmentBinaryForTreatment,
    addTreatment
  },
  data: {
    sync,
    getAllRecords
  }
}

if (typeof window !== "undefined") {
  (window as any).pdos_import = {
    Core,
    pdos
  }
} 

export { Core, PDFSNode }
export default pdos;


