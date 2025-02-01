import { Core } from "../Core";
import DataGroup from "./DataGroup";
import { addNodeToNetworkMapper } from "./NetworkMapper";
import PDFSNode from "./PDFSNode";

export const toCamel = (s: string) => {
  const camelCase = s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });

  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

export default class DataManifest extends PDFSNode {
  public static _nodeType = "N_DataManifest"

  constructor(
    core : Core,
    treePath: string[],
    instanceType: string | undefined,
    hash?: string,
  ){
    super(core, treePath, "N_DataManifest", hash )
    addNodeToNetworkMapper('DataGroup', DataGroup)
  }
  
  public async getDataGroup(metric: string) {
    return Object.values(this.edges).find((edge) => edge._rawNode.metric === metric)
  }

  public async addDataGroup(
    dataMetric: string = '',
  ) {
    await this.addChild(
      DataGroup,
      toCamel(dataMetric),
      {
        "metric": dataMetric,
        "records": {},
      }
    )
  }

}

