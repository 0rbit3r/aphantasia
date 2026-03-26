
import { StoreContextProvider } from "./contexts/storeContext";
import { ScreenOrientationProvider } from "./contexts/screenOrientationContext";
import { AuthContextProvider } from "./contexts/authContext";
import { AphantasiaContainer } from "./components/AphantasiaContainer";

function App() {
    return (
        <ScreenOrientationProvider>
            <StoreContextProvider>
                <AuthContextProvider>                
                    <AphantasiaContainer>
                    </AphantasiaContainer>
                </AuthContextProvider>
            </StoreContextProvider>
        </ScreenOrientationProvider>
    )
}

export default App;

