
import { EdgeType, type GrafikaSettings } from "grafika";
import { downloadedAphantasiaAll } from "./aphantasiaDataAll";
import { AphantasiaStoreContextProvider } from "./contexts/aphantasiaStoreContext";
import { ScreenOrientationProvider } from "./contexts/screenOrientationContext";
import { AuthContextProvider } from "./contexts/authContext";
import { Explorer } from "./components/Explorer";
import { fetchEpoch } from "./api/fetchEpoch";
import { fetchBase } from "./api/fetchBase";
import { convertThoughtToNode } from "./utility/thoughtToNodeConvertor";
import { getEdgesFromNodes } from "./utility/edgesFromThoughts";

// import Welcome from "./pages/Welcome/Welcome";


function App() {
    // todo - consider access url, authentication etc. and pass it to the initialization
    return (
        // <Welcome></Welcome>
        <ScreenOrientationProvider>
            <AphantasiaStoreContextProvider>
                <AuthContextProvider>                
                    <Explorer grafikaSettings={grafikaSettings}
                        loadData={(store) => {

                        }}
                    >
                    </Explorer>
                </AuthContextProvider>
            </AphantasiaStoreContextProvider>
        </ScreenOrientationProvider>
    )
}

export default App;

const dtoThoughts = (await fetchEpoch()).thoughts;

const nodes = dtoThoughts.map(convertThoughtToNode)

const edges = getEdgesFromNodes(dtoThoughts);

const grafikaSettings = {
    data: {nodes, edges},


    graphics: {
        antialiasing: false,
        backgroundColor: '#000000',
        initialZoom: 1 / 5,
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
        // overlay: {
        //     scale: 28,
        //     startDisappearingAt: 1 / 60,
        //     disappearCompletelyAt: 1 / 30,
        //     url: "overlay.png"
        // }
    },
    simulation: { defaultEdgeLength: 300, pushThreshold: 3000 },
    debug: { showFps: true }
} satisfies GrafikaSettings;
