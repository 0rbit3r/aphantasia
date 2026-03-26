import { createContext, type JSX } from "solid-js";
import { initializeAphantasiaStore, type AphantasiaStoreGetAndSet } from "../stateManager/aphantasiaStore";

export const StoreContext = createContext<AphantasiaStoreGetAndSet>();


interface StoreContextProviderProps {
    children: JSX.Element;
}

export function StoreContextProvider(props: StoreContextProviderProps) {
  const store = initializeAphantasiaStore();

  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
}