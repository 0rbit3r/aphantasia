import { createContext, type JSX } from "solid-js";
import { initializeAphantasiaStore, type AphantasiaStoreGetAndSet } from "../stateManager/aphantasiaStore";

export const AphantasiaStoreContext = createContext<AphantasiaStoreGetAndSet>();


interface AphantasiaStoreContextProviderProps {
    children: JSX.Element;
}

export function AphantasiaStoreContextProvider(props: AphantasiaStoreContextProviderProps) {
  const store = initializeAphantasiaStore();

  return (
    <AphantasiaStoreContext.Provider value={store}>
      {props.children}
    </AphantasiaStoreContext.Provider>
  );
}