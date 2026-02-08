import { aphantasiaTimesFour, downloadedAphantasiaAll } from "../../aphantasiaDataAll";
import { HolisticUI } from "../../components/HolisticUI";
import { addGrafika, EdgeType, type GrafikaSettings, type ProxyNode } from "grafika";
import { AphantasiaStoreContext } from "../../contexts/aphantasiaStoreContext";
import { useContext } from "solid-js";
import { handleForwardExploration } from "../../stateManager/handleForwardExploration";
import { getCurrentExpState } from "../../stateManager/getCurrentExpState";
import type { AphantasiaStoreGetAndSet } from "../../stateManager/aphantasiaStore";
import type { ExplorationStateDescriptor } from "../../model/explorationMode";
import data from '../../data.json';

export interface ExplorerProps {


    loadData: (store: AphantasiaStoreGetAndSet, state: ExplorationStateDescriptor) => void;


    // here is where to resume - load data will just implement 

}

export const Explorer = (_props: ExplorerProps) => {
    const store = useContext(AphantasiaStoreContext)!;

    const handleGrafikaRef = (element: HTMLDivElement) => {
        if (!element) return;
        store.set('grafika', addGrafika(element, grafikaSettings));
        store.get.grafika.simStart();
        store.get.grafika.focusOn('all');
        store.get.grafika.interactionEvents.on('nodeClicked', (node: ProxyNode) => {
            handleForwardExploration({ get: store.get, set: store.set }, {
                mode: getCurrentExpState(store).mode,
                focus: node.id
            });
        });
        store.get.grafika.interactionEvents.on('viewportMoved', () => {
            store.get.grafika.focusOn(null);
        });
    };

    return <HolisticUI store={store} onGrafikaRef={handleGrafikaRef}></HolisticUI>;
}

const grafikaSettings: GrafikaSettings = {
    data: {
  "nodes": [
    {
      "id": "Aphant.Boot.WebServer",
      "color": "#FF0E0E",
      "shape": 0
    },
    {
      "id": "Aphant.Client.WebApi",
      "color": "#941FC2",
      "shape": 0
    },
    {
      "id": "Aphant.Core.Dto",
      "color": "#0ACBBF",
      "shape": 0
    },
    {
      "id": "Aphant.Core.Interface",
      "color": "#0ACBBF",
      "shape": 0
    },
    {
      "id": "Aphant.Core.Database",
      "color": "#0ACBBF",
      "shape": 0
    },
    {
      "id": "Aphant.Impl.DbRepository",
      "color": "#F5C70F",
      "shape": 0
    },
    {
      "id": "Aphant.Impl.Logic",
      "color": "#F5C70F",
      "shape": 0
    },
    {
      "id": "Aphant.Impl.Auth",
      "color": "#F5C70F",
      "shape": 0
    }
  ],
  "edges": [
    {
      "sourceId": "Aphant.Boot.WebServer",
      "targetId": "Aphant.Client.WebApi",
      "color": "#941FC2"
    },
    {
      "sourceId": "Aphant.Boot.WebServer",
      "targetId": "Aphant.Impl.DbRepository",
      "color": "#F5C70F"
    },
    {
      "sourceId": "Aphant.Boot.WebServer",
      "targetId": "Aphant.Impl.Logic",
      "color": "#F5C70F"
    },
    {
      "sourceId": "Aphant.Boot.WebServer",
      "targetId": "Aphant.Impl.Auth",
      "color": "#F5C70F"
    },
    {
      "sourceId": "Aphant.Client.WebApi",
      "targetId": "Aphant.Core.Interface",
      "color": "#0ACBBF"
    },
    {
      "sourceId": "Aphant.Core.Interface",
      "targetId": "Aphant.Core.Dto",
      "color": "#0ACBBF"
    },
    {
      "sourceId": "Aphant.Impl.DbRepository",
      "targetId": "Aphant.Core.Database",
      "color": "#0ACBBF"
    },
    {
      "sourceId": "Aphant.Impl.DbRepository",
      "targetId": "Aphant.Core.Interface",
      "color": "#0ACBBF"
    },
    {
      "sourceId": "Aphant.Impl.Logic",
      "targetId": "Aphant.Core.Interface",
      "color": "#0ACBBF"
    },
    {
      "sourceId": "Aphant.Impl.Auth",
      "targetId": "Aphant.Core.Interface",
      "color": "#0ACBBF"
    },
    {
      "sourceId": "Aphant.Impl.Auth",
      "targetId": "Aphant.Core.Database",
      "color": "#0ACBBF"
    }
  ]
}


    ,
    graphics: {
        antialiasing: false,
        backgroundColor: '#000000',
        initialZoom: 1 / 180,
        // floatingNodes: true,
        defaultEdgeColor: "source",
        defaultEdgeAlpha: 0.6,
        colorfulText: true,
        defaultEdgeType: EdgeType.Tapered,
        // backdrop: {
        //     startAppearingAt: 0.001,
        //     fullyVisibleAt: 0.1,
        //     parallax: 0.75,
        //     scale: 5,
        //     url: "backdrop.png"
        // },
        backdrop: {
            startAppearingAt: 0.001,
            fullyVisibleAt: 3,
            parallax: 0.8,
            scale: 8,
            url: "generic_space.jpg"
        },
        overlay: {
            scale: 28,
            startDisappearingAt: 1 / 60,
            disappearCompletelyAt: 1 / 30,
            url: "overlay.png"
        }
    },
    simulation: { defaultEdgeLength: 300, pushThreshold: 1000 },
    debug: { showFps: true }
}