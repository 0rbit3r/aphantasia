import { createContext, createSignal, onCleanup, onMount, type JSX } from "solid-js";

interface ScreenOrientationProps {
    children: JSX.Element;
}

export const ScreenOrientation = createContext<{isLandscape: () => boolean}>(
    {isLandscape: () => document.documentElement.clientWidth > document.documentElement.clientHeight}
);

export const ScreenOrientationProvider = (props: ScreenOrientationProps) => {
    const [isLandscape, setIsLandScape] = createSignal(
        document.documentElement.clientWidth > document.documentElement.clientHeight);

    const handleScreenSizeChange = () => {
        setIsLandScape(document.documentElement.clientWidth > document.documentElement.clientHeight);
    }

    const observer = new ResizeObserver(() => handleScreenSizeChange());
    onMount(() => {
        observer.observe(document.documentElement);
    });

    onCleanup(() => {
        observer.disconnect();
    });

    return (<ScreenOrientation.Provider value={{isLandscape: isLandscape}}>
        {props.children}
    </ScreenOrientation.Provider>);
}