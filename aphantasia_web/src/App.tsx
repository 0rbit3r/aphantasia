
import { AphantasiaStoreContextProvider } from "./contexts/aphantasiaStoreContext";
import { ScreenOrientationProvider } from "./contexts/screenOrientationContext";
import { AuthContextProvider } from "./contexts/authContext";
import { ExplorerInitializer } from "./components/ExplorerInitializer";

function App() {
    return (
        <ScreenOrientationProvider>
            <AphantasiaStoreContextProvider>
                <AuthContextProvider>                
                    <ExplorerInitializer>
                    </ExplorerInitializer>
                </AuthContextProvider>
            </AphantasiaStoreContextProvider>
        </ScreenOrientationProvider>
    )
}

export default App;

