// import { type Component, onMount, onCleanup, createSignal, Show } from 'solid-js';
// import { addGrafika, EdgeType, NodeShape } from 'grafika';
// import type { GrafikaInstance, GrafikaSettings, ProxyNode } from 'grafika';
// import { Locale } from '../../locales/localization';
// import styles from "../../styles/components/welcome.module.css";
// import { Quips } from '../../locales/quips';
// import { ThoughtViewer, type ThoughtViewerProps } from '../../components/contentViewers/ThoughtViewer';
// import { playTutorialStep, TUTORIAL_COLOR, TUTORIAL_START_ID } from './Tutorial';
// import SplitUI from '../../components/SplitUI';
// // import { initializeHud, type HUDControls } from './HUD';


// const backgroundColor = "#000000"
// // getComputedStyle(document.documentElement)
// //   .getPropertyValue('--color-background')
// //   .trim();

// const grafikaSettings: GrafikaSettings = {
//   data: {
//     nodes: [
//       { id: "0", text: Locale.HelloExplorer, blinkEffect: true, x: 0, y: 400 }]
//   },
//   graphics: {
//     antialiasing: true,
//     backgroundColor: backgroundColor,
//     initialZoom: 1 / 5,
//     floatingNodes: true,
//     defaultEdgeColor: "source",
//     defaultEdgeAlpha: 0.8,
//     colorfulText: true,
//     defaultEdgeType: EdgeType.Tapered,
//     backdrop: {
//       startAppearingAt: 0.01,
//       fullyVisibleAt: 0.1,
//       parallax: 0.75,
//       scale: 1,
//       url: "backdrop.png"
//     }
//   },
//   simulation: { defaultEdgeLength: 100 },
//   debug: { showFps: true }
// }

// const Welcome: Component = () => {
//   let graphElement!: HTMLDivElement;
//   let grafika: GrafikaInstance | undefined;
//   // const [hudMode, setHudMode] = createSignal<SplitUIMode>("full1");
//   const [visibleCorners, setVisibleCorners] = createSignal(false);
//   const [content, setContent] = createSignal({
//     text: "---",
//     color: "#cccccc",
//     title: "---"
//   } as ThoughtViewerProps);

//   onMount(() => {
//     // Initialize Grafika
//     grafika = addGrafika(graphElement, grafikaSettings);

//     grafika.interactionEvents.on("viewportMoved", () => grafika!.focusOn(null));

//     grafika.start();
//     grafika.simStart();

//     // Listen to interaction events
//     grafika.interactionEvents.on('nodeClicked', handleNodeClick);
//   });

//   onCleanup(() => {
//     // Clean up when component unmounts
//     if (grafika && !grafika.isDisposed()) {
//       grafika.dispose();
//     }
//   });

//   const [state, setState] = createSignal("hello");

//   const handleNodeClick = (node: ProxyNode) => {
//     if (!grafika) return;

//     if (node.id === "0" && state() === "hello") {
//       setState("menu");
//       node.text = "";
//       node.radius = 100;
//       node.blinkEffect = false;
//       node.shape = NodeShape.DownTriangle;
//       grafika.addData({
//         nodes: [
//           { id: TUTORIAL_START_ID, text: Locale.Join, x: node.x, y: node.y - 150, color: TUTORIAL_COLOR},
//           { id: "LOG_IN", text: Locale.LogIn, x: node.x + 150, y: node.y + 150, color: "#f5841b", timeToLiveFrom: -30 },
//           { id: "ABOUT", text: Locale.About, x: node.x - 150, y: node.y + 150, color: "#583bffff", timeToLiveFrom: -60 }
//         ], edges: [{ sourceId: TUTORIAL_START_ID, targetId: "0", type: EdgeType.CurvedLine }, { sourceId: "LOG_IN", targetId: "0", type: EdgeType.CurvedLine },
//         { sourceId: "ABOUT", targetId: "0", type: EdgeType.CurvedLine }]
//       });
//     }
//     if (node.id === TUTORIAL_START_ID && state() === "menu") {
//       setState("tutorial");
//     }

//     // if (state() === "tutorial") {
//     //   playTutorialStep({grafika, setVisibleCorners, setHudMode, setContent, node, hudMode});
//     // }
//   }

//   return (
//     <div>
//       <Show when={state() === "menu" || state() === "hello" || state() === "tutorial-interlude"}>
//         <div class={`${styles.header} ${(state() !== "menu" && state() !== "hello") ? styles.hidden : ""}`}>
//           <h1 class={styles.title}>{Locale.Title}</h1>
//           <p class={styles.quip}>{Quips[Math.floor(Math.random() * (Quips.length - 1))]}</p>
//         </div>
//       </Show>
//       <SplitUI
//         isLandscape={false}
//         layout={() => "graph"}
//         setLayout={()=>{}}
//         first={<div class={styles.graph_container} ref={graphElement} />}
//         second={<ThoughtViewer {...content()}
//         ></ThoughtViewer>}>
//       </SplitUI>
//     </div>

//   );
// };

// export default Welcome;

