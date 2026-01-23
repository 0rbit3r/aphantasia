import { AphantasiaStoreContextProvider } from "./contexts/aphantasiaStoreContext";
import { ScreenOrientationProvider } from "./contexts/screenOrientationContext";
import { Explorer } from "./pages/Explorer/Explorer";
// import Welcome from "./pages/Welcome/Welcome";


function App() {
    // todo - consider access url, authentication etc. and pass it to the initialization
    return (
        // <Welcome></Welcome>
        <ScreenOrientationProvider>
            <AphantasiaStoreContextProvider>
                <Explorer></Explorer>
            </AphantasiaStoreContextProvider>
        </ScreenOrientationProvider>
    )
}

export default App;