// import type { GrafikaInstance } from "grafika"
// import type { GraphEdge } from "../../../../grafika/dist/api/dataTypes";
// import type { ProxyNode } from "../../../../grafika/dist/api/proxyNode"
// import type { ThoughtViewerProps } from "../../components/contentViewers/ThoughtViewer"
// import type { SplitUIMode } from "../../components/SplitUIOld";
// import type { Thought } from "../../model/thought";

// import _tutorialThoughts from "./tutorialThoughts.json";
// const tutorialThoughts = _tutorialThoughts as Thought[];
// const edges = tutorialThoughts.flatMap(t => t.links.map<GraphEdge>(l => ({ sourceId: l, targetId: t.id })));

// console.log(tutorialThoughts[0])
// export const TUTORIAL_COLOR = "#27b909ff";
// export const TUTORIAL_START_ID = "TUTORIAL_START";

// export interface TutorialContext {
//     grafika: GrafikaInstance;
//     setVisibleCorners: (visible: boolean) => void;
//     setHudMode: (mode: SplitUIMode) => void;
//     setContent: (content: ThoughtViewerProps) => void;
//     node: ProxyNode;
//     hudMode: () => SplitUIMode;
// }

// const visited = new Map<string, boolean>();

// let initialized = false;
// const init = (grafika: GrafikaInstance) => {
//     initialized = true;
//     grafika.addData({ edges: edges });
// }

// export const playTutorialStep = (context: TutorialContext) => {
//     const {
//         grafika,
//         setVisibleCorners,
//         setHudMode,
//         setContent,
//         node,
//     } = context;

//     if (!initialized) init(grafika);

//     switch (node.id) {
//         case TUTORIAL_START_ID:
//             setVisibleCorners(true);
//         default:
//             openThoughtAndAddNeighbors(context);
//     }
// }

// let highlightedNode: ProxyNode | undefined;

// const openThoughtAndAddNeighbors = (context: TutorialContext) => {
//     const {
//         grafika,
//         setVisibleCorners,
//         setHudMode,
//         setContent,
//         node,
//         hudMode
//     } = context;

//     grafika.focusOn(node);
//     if (hudMode() === "full1") setHudMode("half");
//     const tutorialThought = tutorialThoughts.find(n => node.id === n.id);
//     if (!tutorialThought) return;
//     setContent({ text: tutorialThought.content ?? "---", title: node.text, color: node.color });

//     if (highlightedNode !== undefined) {
//         highlightedNode.glowEffect = false;
//     }
//     node.glowEffect = true;
//     highlightedNode = node;

//     if (!visited.has(tutorialThought.id)) {
//         node.hollowEffect = false;
//         visited.set(tutorialThought.id, true);
//         const neighborIds = tutorialThought.replies.concat(tutorialThought.links);
//         const newNeighborIds = neighborIds.filter(id => !grafika.getData().nodes.some(n => n.id === id));
//         const newNeighbors = tutorialThoughts.filter(t => newNeighborIds.includes(t.id));
//         let delay = 0;
//         grafika.addData({
//             nodes: newNeighbors.map(n => {
//                 const hasUnseenNeighbors = grafika.getData().unusedEdges
//                     .some(e => e.targetId === n.id || e.sourceId === n.id)// a
//                 delay += 45;
//                 return {
//                     id: n.id, text: n.title, color: n.author.color ?? TUTORIAL_COLOR, timeToLiveFrom: -delay,
//                     hollowEffect: true
//                 }
//             })
//         });

//     }
// }


// function onlyUnique<T>(value: T, index: number, array: T[]) {
//     return array.indexOf(value) === index;
// }