import { FullScreenControl, SigmaContainer, ZoomControl } from "@react-sigma/core";
import { createNodeImageProgram } from "@sigma/node-image";
import { DirectedGraph } from "graphology";
import { constant, keyBy, mapValues } from "lodash";
import { FC, useEffect, useMemo, useState } from "react";
import { BiBookContent, BiRadioCircleMarked } from "react-icons/bi";
import { BsArrowsFullscreen, BsFullscreenExit, BsZoomIn, BsZoomOut } from "react-icons/bs";
import { GrClose } from "react-icons/gr";
import { Settings } from "sigma/settings";

import { drawHover, drawLabel } from "../canvas-utils";
import { Dataset, FiltersState } from "../types";
//import ClustersPanel from "./ClustersPanel";
import GraphDataController from "./GraphDataController";
import GraphEventsController from "./GraphEventsController";
//import SearchField from "./SearchField";
import Mountains from "../images/mountains.webp";
import Logo from "../images/logo.png";

// @ts-ignore 
import pdos from "@alpinehealthcare/pdos";




import { getTreeGraphSnapshot, startPDOS } from "../pdos";
import { CLUSTERS } from "../pdos";
import { TAGS } from "../pdos";
import Panel from "./Panel";
import ReactJson from "react-json-view";
import Account from "./Account";
import { observer } from "mobx-react-lite";

startPDOS()

const Root: FC = observer(function Root(){
  const [showContents, setShowContents] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [filtersState, setFiltersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
  });
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [ viewAccount, setViewAccount ] = useState(true);

  const sigmaSettings: Partial<Settings> = useMemo(
    () => ({
      nodeProgramClasses: {
        image: createNodeImageProgram({
          size: { mode: "force", value: 256 },
        }),
      },
      defaultDrawNodeLabel: drawLabel,
      defaultDrawNodeHover: drawHover,
      defaultNodeType: "image",
      defaultEdgeType: "arrow",
      labelDensity: 0.07,
      labelGridCellSize: 60,
      labelRenderedSizeThreshold: 15,
      labelFont: "Lato, sans-serif",
      zIndex: true,
    }),
    [],
  );

  // Load data on mount:
  useEffect(() => {
    if (!pdos().started) return;

    if (!pdos().modules?.auth?.info.isAuthenticated) {
      return
    }

    if (pdos().modules?.auth?.info.pdosRoot) {
      setDataset({
        ...getTreeGraphSnapshot(),
        clusters: CLUSTERS,
        tags: TAGS,
      })
      setFiltersState({
        clusters: mapValues(keyBy(CLUSTERS, "key"), constant(true)),
        tags: mapValues(keyBy(TAGS, "key"), constant(true)),
      });

      setDataReady(true);

    }
  }, [ pdos().started,  pdos().modules?.auth?.info.pdosRoot, pdos().modules?.auth?.info.isAuthenticated]);


  const isAuthenticated = pdos().modules?.auth?.info.isAuthenticated;

  return (
    <div
      id="app-root"
      className={showContents ? "show-contents" : ""}
      style={{ display: 'flex', flexDirection: 'row'}}
    >
      {isAuthenticated && (
        <div
          style={{
            display: 'flex',
            flexDirection: "row",
          position: 'absolute',
          top: 15,
          left: 80,
          zIndex: 100,
          gap: '10px'
          }}
        >
        <button onClick={async () => {
          await pdos().modules?.auth.disconnectWalletUser()
          location.reload()
        }}>Disconnect</button>
        <button onClick={() => setViewAccount(!viewAccount)}>{viewAccount ? "View PDOS" : "View Account"}</button>
      </div>)}
      <img src={Logo} width={50} height={50}  style={{ zIndex: 110, position : 'absolute', top: 15, left: 5}} />
      <img src={Mountains} width={40}  style={{ zIndex: 100, height: '100vh', width: "60px", objectFit: 'cover' }} />
      <div style={{ position: 'relative', paddingLeft: '60px', height: "100vh", width: 'calc(100vw - 60px)'}}>

      {viewAccount ? (
        <Account />
      ): (
        <SigmaContainer graph={DirectedGraph} settings={sigmaSettings} className="react-sigma">
        <GraphEventsController setHoveredNode={setHoveredNode} />
        {dataset && <GraphDataController dataset={dataset} filters={filtersState} />}

        {dataReady && (
          <>
            <div className="controls">
              <div className="react-sigma-control ico">
                <button
                  type="button"
                  className="show-contents"
                  onClick={() => setShowContents(true)}
                  title="Show caption and description"
                >
                  <BiBookContent />
                </button>
              </div>
              <FullScreenControl className="ico">
                <BsArrowsFullscreen />
                <BsFullscreenExit />
              </FullScreenControl>

              <ZoomControl className="ico">
                <BsZoomIn />
                <BsZoomOut />
                <BiRadioCircleMarked />
              </ZoomControl>
            </div>
            <div className="contents">
              <div className="ico">
                <button
                  type="button"
                  className="ico hide-contents"
                  onClick={() => setShowContents(false)}
                  title="Show caption and description"
                >
                  <GrClose />
                </button>
              </div>
              <div className="panels">
                {/*<SearchField filters={filtersState} placeholder="Root Hash" />
                <SearchField filters={filtersState} placeholder="" />
                <ClustersPanel
                  clusters={dataset.clusters}
                  filters={filtersState}
                  setClusters={(clusters) =>
                    setFiltersState((filters) => ({
                      ...filters,
                      clusters,
                    }))
                  }
                  toggleCluster={(cluster) => {
                    setFiltersState((filters) => ({
                      ...filters,
                      clusters: filters.clusters[cluster]
                        ? omit(filters.clusters, cluster)
                        : { ...filters.clusters, [cluster]: true },
                    }));
                  }}
                />*/}
                {typeof hoveredNode == "object" && <Panel 
                  initiallyDeployed
                  title={<>
                  </>}
                >
                  <div style={{ width: "450px", overflowX: 'scroll'}}>
                    {hoveredNode && <ReactJson  src={hoveredNode} />}
                  </div>
                  </Panel>}
              </div>
            </div>
          </>
        )}
      </SigmaContainer>

      )}



     




      </div>

    </div>
  );
});

export default Root;
