import { Application, Color, Container, Graphics, TextStyle, Text, Assets, Sprite, Texture, LineStyle, State } from "pixi.js";
import { ARROW_Z, NODES_Z, TEXT_Z } from "./zIndexes";
import {
    BACKDROP_ZOOM_THRESHOLD_FULLY_VISIBLE,
    BACKDROP_ZOOM_THRESHOLD_HIDDEN,
    BASE_EDGE_ALPHA, BASE_EDGE_WIDTH, BASE_RADIUS, GRAVITY_FREE_RADIUS, HIGHLIGHTED_EDGE_ALPHA, HIGHLIGHTED_EDGE_WIDTH, NEW_NODE_FADE_IN_FRAMES, NEW_NODE_INVISIBLE_FOR, SIM_HEIGHT,
    THOUGHT_BORDER_THICKNESS,
    UNHIGHLIGHTED_EDGE_ALPHA, UNHIGHLIGHTED_EDGE_WIDTH, ZOOM_TEXT_VISIBLE_THRESHOLD
} from "../state_and_parameters/graphParameters";
import { RenderedThought } from "../model/renderedThought";
import { addDraggableViewport } from "./ViewportInitializer";
import { XAndY } from "../model/xAndY";
import tinycolor from "tinycolor2";
import { useGraphStore } from "../state_and_parameters/GraphStore";
import { getThoughtsOnScreen } from "../simulation/thoughtsProvider";
import { EdgeType, useGraphControlsStore } from "../state_and_parameters/GraphControlsStore";
import { ThoughtColor, ThoughtShape } from "../model/thoughtShape";
import { ExplorationMode } from "../simulation/modesManager";

let lastZoom: number = -1;
// Threshold between clicking a node to open it and hoolding it to drag it around in ms
const DRAG_TIME_THRESHOLD = 200;
// const muffinSvg = await Assets.load(import.meta.env.VITE_PUBLIC_FOLDER + '/icons/muffin.svg');
// const thoughtNode = await Assets.load(import.meta.env.VITE_PUBLIC_FOLDER + '/icons/node.svg');
const backdrop = await Assets.load(import.meta.env.VITE_PUBLIC_FOLDER + '/backdrop.png');

export const initGraphics = (
    app: Application, renderedThoughts: RenderedThought[],
    thoughtGrabbed: () => void) => {

    app.stage.eventMode = 'static';

    const zSortedContainer = new Container();
    zSortedContainer.sortableChildren = true;
    app.stage.addChild(zSortedContainer);

    const nodeContainer = new Graphics();

    const initialViewport = addDraggableViewport(app, zSortedContainer);

    useGraphStore.getState().setViewport(initialViewport);

    // nodeGraphics.sortableChildren = true;
    nodeContainer.zIndex = NODES_Z;

    zSortedContainer.addChild(nodeContainer);

    const textContainer = new Container();
    textContainer.zIndex = TEXT_Z;

    zSortedContainer.addChild(textContainer);

    // zSortedContainer.sortChildren();

    const initializeGraphicsForThought = (thought: RenderedThought) => {
        const circle = new Graphics();
        thought.graphics = circle;

        //interactivity
        circle.eventMode = 'static';
        circle.cursor = 'pointer';

        let holdStartTime = 0;

        circle.on('globalpointermove', e => {
            if (thought.held) {
                thought.position.x += e.movementX / initialViewport.zoom;
                thought.position.y += e.movementY / initialViewport.zoom;
            }
        });

        circle.on('pointerdown', () => {
            thoughtGrabbed();
            thought.held = true;
            holdStartTime = performance.now();
        });

        circle.on('pointerover', () => {
            thought.hovered = true;
        });
        circle.on('pointerout', () => {
            thought.hovered = false;
        });
        circle.on('pointerupoutside', () => {
            thought.held = false;
            thought.hovered = false;
        });
        circle.on('wheel', (e) => {
            initialViewport.zoomByWheelDelta(-e.deltaY);
        });

        // opens the thought if the click was short
        app.stage.on('pointerup', () => {
            if (thought.held && performance.now() - holdStartTime < DRAG_TIME_THRESHOLD) {
                // setTimeout(() => thoughtClicked(thought.id), 30); //timeout to prevent overlay from registering the click too
                useGraphStore.getState().setHighlightedThought(thought);
            }
            thought.held = false;
            initialViewport.dragged = false;
        });

        nodeContainer.addChild(circle);

        const style = new TextStyle({
            breakWords: false,
            wordWrap: true,
            fontFamily: 'Arial',
            fontSize: 15,
            fontWeight: 'bold',
            fill: 'white',
            wordWrapWidth: thought.radius * 4,
            stroke: "#000000",
            strokeThickness: 3,
            // dropShadow: true,
            // dropShadowDistance: 2,
        });

        const text = new Text(thought.title, style);
        text.zIndex = TEXT_Z;
        text.x = thought.position.x - text.width / 2;
        text.y = thought.position.y - text.height / 2 + text.height / 2 + BASE_RADIUS + 5;
        thought.text = text;

        textContainer.addChild(text);
    };

    renderedThoughts.forEach(thought => {
        initializeGraphicsForThought(thought);
    });

    const fpsCounter: Text = new Text('0', new TextStyle({ fontSize: 20, fill: useGraphStore.getState().userSettings.color }));
    fpsCounter.x = 20;
    fpsCounter.y = app.screen.height - 40;

    const renderTimeDeltas: number[] = [1];
    let lastRenderTime = performance.now();


    const backdropTexture = new Sprite(backdrop as Texture);
    backdropTexture.width = 100;
    backdropTexture.height = 100;
    backdropTexture.position.set(- backdropTexture.width / 2, - backdropTexture.height / 2);

    backdropTexture.alpha = 1;
    backdropTexture.interactive = false;
    backdropTexture.hitArea = null;
    backdropTexture.zIndex = -1;

    zSortedContainer.addChild(backdropTexture);
    zSortedContainer.sortChildren();

    const renderGraph = () => {
        const graphState = useGraphStore.getState();
        const graphControlsState = useGraphControlsStore.getState();

        // clear textContainer
        textContainer.removeChildren();

        // FPS counter
        const computeEveryNFrames = 10;
        if (graphControlsState.showFpsEnabled) {
            const currentTime = performance.now();
            if (graphState.frame % computeEveryNFrames === 0 && graphState.frame >= 10) {
                //compute FPS
                const averageDelta = renderTimeDeltas.reduce((acc, cur) => acc + cur, 0) / renderTimeDeltas.length;
                const fps = Math.round(1000 / averageDelta);
                fpsCounter.text = fps.toString();
            }

            renderTimeDeltas.push(currentTime - lastRenderTime);
            lastRenderTime = currentTime;

            if (renderTimeDeltas.length > computeEveryNFrames) {
                renderTimeDeltas.shift();
            }
            textContainer.addChild(fpsCounter);
        }


        const onScreenThoughts = getThoughtsOnScreen()
            .concat(graphState.fadeOutThoughts);

        const stateViewport = graphState.viewport;
        if (stateViewport === null) {
            return;
        }

        nodeContainer.clear();

        // nodeContainer.children.forEach(child => {
        //     if (child instanceof Graphics) {
        //         child.clear();
        //     }
        // });




        const sizeOnScreen = 27.75 * graphState.viewport.zoom;
        const onScreenCoors = graphState.viewport.toViewportCoordinates(
            { x: -41600, y: -41600 }
        );

        backdropTexture.setTransform(
            onScreenCoors.x, onScreenCoors.y,
            sizeOnScreen, sizeOnScreen);

        const backdropOpacity = 1 - Math.min(1, Math.max(0, graphState.viewport.zoom - BACKDROP_ZOOM_THRESHOLD_FULLY_VISIBLE)
            / (BACKDROP_ZOOM_THRESHOLD_HIDDEN - BACKDROP_ZOOM_THRESHOLD_FULLY_VISIBLE));

        backdropTexture.alpha = backdropOpacity;

        nodeContainer.alpha = 1 - backdropOpacity;

        if (graphState.viewport.zoom < BACKDROP_ZOOM_THRESHOLD_FULLY_VISIBLE)
            graphState.temporalRenderedThoughts.concat(graphState.neighborhoodThoughts)
                .forEach(t => {
                    if (!onScreenThoughts.includes(t))
                        t.graphics?.clear();
            });
        // nodes and edges
        onScreenThoughts.forEach(thought => {

            const TimeAffectedRadius = (thought.radius * (1 - THOUGHT_BORDER_THICKNESS / 2))
                * (thought.timeOnScreen < NEW_NODE_INVISIBLE_FOR ? 0 :
                    Math.min(1, (thought.timeOnScreen - NEW_NODE_INVISIBLE_FOR) / NEW_NODE_FADE_IN_FRAMES)
                );
            // if (thought.graphics === undefined) {
            //     console.log('undefined id', thought.id);
            // }

            if (thought.graphics === undefined) {
                initializeGraphicsForThought(thought);
            }

            // indicate that htere are neighbors not currently on screen
            // const explorable = (thought.links.some(l => onScreenThoughts.filter(t => t.id === l).length === 0) || // any links or replies outside onscreen thoughts check 
            // thought.backlinks.some(l => onScreenThoughts.filter(t => t.id === l).length === 0));

            const explorable = false;

            const circle = thought.graphics as Graphics;

            // circle.clear();

            // if the node is out of screen, don't draw it
            const circleCoors = stateViewport.toViewportCoordinates({ x: thought.position.x, y: thought.position.y });
            if (circleCoors.x < -thought.radius * graphState.viewport.zoom || circleCoors.x > stateViewport.width + thought.radius * graphState.viewport.zoom
                || circleCoors.y < -thought.radius * graphState.viewport.zoom || circleCoors.y > stateViewport.height + thought.radius * graphState.viewport.zoom) {
                circle.clear();
                return;
            }
            // console.log("last zoom: " , + lastZoom + " zoom: " + graphState.viewport.zoom);
            if (lastZoom === graphState.viewport.zoom) {
                // if (thought.id === 1) console.log(circle.transform.position.x);
                const pos = graphState.viewport.toViewportCoordinates(thought.position);
                circle.setTransform(pos.x, pos.y);
            }
            // draw node
            else if (thought.timeOnScreen > NEW_NODE_INVISIBLE_FOR && lastZoom !== graphState.viewport.zoom) {
                circle.clear();
                const opacity = Math.min(1, (thought.timeOnScreen - NEW_NODE_INVISIBLE_FOR) / NEW_NODE_FADE_IN_FRAMES);
                const selectedColor = thought.selectedColor == ThoughtColor.None
                    ? thought.authorColor
                    : getSelectedColorHex(thought.selectedColor);

                // pulsating color if the node is explorable
                const pulsingColor = graphState.frame % 150 < 50 &&
                    explorable
                    ? tinycolor(selectedColor).lighten(30 - (graphState.frame % 50) / 50 * 30).toString()
                    : selectedColor;
                const thoughtLineStyle =
                    thought.selectedColor === ThoughtColor.None
                        ? { width: thought.radius * THOUGHT_BORDER_THICKNESS * stateViewport.zoom, color: tinycolor(thought.authorColor).toString(), alpha: opacity }
                        : { width: thought.radius * THOUGHT_BORDER_THICKNESS * stateViewport.zoom, color: tinycolor(thought.authorColor).toString(), alpha: opacity };
                // : { width: thought.radius * 0.1 * stateViewport.zoom, color: getSelectedColorHex(thought.selectedColor), alpha: opacity }
                const thoughtFillStyle = { color: pulsingColor, alpha: opacity };


                circle.beginFill(tinycolor(thoughtFillStyle.color).lighten(5).toString(), thoughtFillStyle.alpha);
                circle.lineStyle(thoughtLineStyle);

                if (circle.children.length == 0)
                    switch (thought.shape) {
                        case ThoughtShape.Circle:
                            circle.drawCircle(0, 0, stateViewport.zoom * TimeAffectedRadius);
                            break;
                        case ThoughtShape.Square:
                            circle.drawRoundedRect(
                                - TimeAffectedRadius / 3 * 2 * stateViewport.zoom, - TimeAffectedRadius / 3 * 2 * stateViewport.zoom,
                                TimeAffectedRadius * 4 / 3 * stateViewport.zoom, TimeAffectedRadius * 4 / 3 * stateViewport.zoom, TimeAffectedRadius / 3 * stateViewport.zoom
                            );
                            break;
                        case ThoughtShape.UpTriangle:
                            circle.moveTo(0, 0 - stateViewport.zoom * TimeAffectedRadius);
                            circle.lineTo(0 - stateViewport.zoom * TimeAffectedRadius * Math.sqrt(3) / 2, 0 + stateViewport.zoom * TimeAffectedRadius / 2);
                            circle.lineTo(0 + stateViewport.zoom * TimeAffectedRadius * Math.sqrt(3) / 2, 0 + stateViewport.zoom * TimeAffectedRadius / 2);
                            circle.lineTo(0, 0 - stateViewport.zoom * TimeAffectedRadius);
                            // circle.lineStyle(thoughtLineStyle.width / 2, thoughtLineStyle.color, thoughtLineStyle.alpha, 1);
                            // circle.drawCircle(0, 0 - stateViewport.zoom * thought.radius, thoughtLineStyle.width / 4 );
                            break;

                        case ThoughtShape.DownTriangle:
                            circle.moveTo(0, 0 + stateViewport.zoom * TimeAffectedRadius);
                            circle.lineTo(0 - stateViewport.zoom * TimeAffectedRadius * Math.sqrt(3) / 2, 0 - stateViewport.zoom * TimeAffectedRadius / 2);
                            circle.lineTo(0 + stateViewport.zoom * TimeAffectedRadius * Math.sqrt(3) / 2, 0 - stateViewport.zoom * TimeAffectedRadius / 2);
                            circle.lineTo(0, 0 + stateViewport.zoom * TimeAffectedRadius);
                            break;

                        case ThoughtShape.Diamond:
                            circle.lineStyle();
                            circle.endFill();
                            // circle.moveTo(0 - thought.radius * 2 / 16 * stateViewport.zoom, 0 - stateViewport.zoom * (thought.radius * 14 / 16));
                            circle.moveTo(0, 0 - stateViewport.zoom * TimeAffectedRadius);
                            circle.arcTo(0 - stateViewport.zoom * TimeAffectedRadius, 0, 0, 0 + stateViewport.zoom * TimeAffectedRadius, TimeAffectedRadius / 3 * stateViewport.zoom);
                            circle.beginFill(thoughtFillStyle.color, thoughtFillStyle.alpha);
                            circle.lineStyle(thoughtLineStyle);
                            circle.arcTo(0, 0 + stateViewport.zoom * TimeAffectedRadius, 0 + stateViewport.zoom * TimeAffectedRadius, 0, TimeAffectedRadius / 3 * stateViewport.zoom);
                            circle.arcTo(0 + stateViewport.zoom * TimeAffectedRadius, 0, 0, 0 - stateViewport.zoom * TimeAffectedRadius, TimeAffectedRadius / 3 * stateViewport.zoom);
                            circle.arcTo(0, 0 - stateViewport.zoom * TimeAffectedRadius, 0 - stateViewport.zoom * TimeAffectedRadius, 0, TimeAffectedRadius / 3 * stateViewport.zoom);
                            circle.arcTo(0 - stateViewport.zoom * TimeAffectedRadius, 0, 0, 0 + stateViewport.zoom * TimeAffectedRadius, TimeAffectedRadius / 3 * stateViewport.zoom);
                            break;
                        case ThoughtShape.Cross:
                            circle.lineStyle();
                            circle.beginFill(thoughtLineStyle.color);
                            const gridSize = TimeAffectedRadius / 7 * 3 * stateViewport.zoom;
                            const smallerGridSize = gridSize * 0.5;

                            circle.moveTo(0, 0 - gridSize);
                            circle.lineTo(0 - gridSize, 0 - gridSize * 2);
                            circle.lineTo(0 - gridSize * 2, 0 - gridSize);
                            circle.lineTo(0 - gridSize, 0);
                            circle.lineTo(0 - gridSize * 2, 0 + gridSize);
                            circle.lineTo(0 - gridSize, 0 + gridSize * 2);
                            circle.lineTo(0, 0 + gridSize);
                            circle.lineTo(0 + gridSize, 0 + gridSize * 2);
                            circle.lineTo(0 + gridSize * 2, 0 + gridSize);
                            circle.lineTo(0 + gridSize, 0);
                            circle.lineTo(0 + gridSize * 2, 0 - gridSize);
                            circle.lineTo(0 + gridSize, 0 - gridSize * 2);
                            circle.lineTo(0, 0 - gridSize);

                            circle.endFill();
                            circle.moveTo(0, 0 - smallerGridSize);
                            circle.beginFill(thoughtFillStyle.color);
                            circle.lineTo(0 - smallerGridSize, 0 - smallerGridSize * 2);
                            circle.lineTo(0 - smallerGridSize * 2, 0 - smallerGridSize);
                            circle.lineTo(0 - smallerGridSize, 0);
                            circle.lineTo(0 - smallerGridSize * 2, 0 + smallerGridSize);
                            circle.lineTo(0 - smallerGridSize, 0 + smallerGridSize * 2);
                            circle.lineTo(0, 0 + smallerGridSize);
                            circle.lineTo(0 + smallerGridSize, 0 + smallerGridSize * 2);
                            circle.lineTo(0 + smallerGridSize * 2, 0 + smallerGridSize);
                            circle.lineTo(0 + smallerGridSize, 0);
                            circle.lineTo(0 + smallerGridSize * 2, 0 - smallerGridSize);
                            circle.lineTo(0 + smallerGridSize, 0 - smallerGridSize * 2);
                            circle.lineTo(0, 0 - smallerGridSize);

                            break;
                        default:
                            circle.drawCircle(0, 0, stateViewport.zoom * TimeAffectedRadius);
                            break;
                    }
                circle.endFill();



                if (explorable) {
                    circle.beginFill("black", 1);
                    circle.lineStyle(thought.radius * 0.1 * stateViewport.zoom, tinycolor(thought.authorColor).lighten(15).toString(), 1);
                    circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * (TimeAffectedRadius * 0.5));
                    circle.endFill();
                } else {
                    // const explorableLowestTimeOnScreen = onScreenThoughts
                    //     .filter(t => thought.links.includes(t.id) || thought.backlinks.includes(t.id))
                    //     .map(t => t.timeOnScreen)
                    //     .reduce((min, cur) => Math.min(min, cur), Number.MAX_SAFE_INTEGER);

                    // const blackDotOpacity = explorableLowestTimeOnScreen > NEW_NODE_INVISIBLE_FOR
                    //     ? 0
                    //     : Math.min(1, (thought.timeOnScreen - NEW_NODE_INVISIBLE_FOR) / NEW_NODE_FADE_IN_FRAMES);

                    // circle.beginFill("black", blackDotOpacity);
                    // circle.lineStyle(thought.radius * 0.1 * stateViewport.zoom, tinycolor(thought.color).lighten(15).toString(), blackDotOpacity);
                    // circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * (TimeAffectedRadius * 0.5));
                    // circle.endFill();
                }

                // muffins!

                // (async () => {
                //     const muffinTexture = new Sprite(muffinSvg as Texture);;
                //     muffinTexture.width = (thought.radius * 2) * stateViewport.zoom;
                //     muffinTexture.height = (thought.radius * 2) * stateViewport.zoom;
                //     muffinTexture.position.set((circleCoors.x - muffinTexture.width / 2), (circleCoors.y - muffinTexture.height / 2));
                //     muffinTexture.interactive = false;

                //     circle.removeChildren();
                //     circle.addChild(muffinTexture);
                // })();

                // texture approach
                // (async () => {
                //     if (circle.children.length > 0)
                //         return;
                //     const nodeTexture = new Sprite(thoughtNode as Texture);
                //     nodeTexture.width = (thought.radius * 2) * stateViewport.zoom;
                //     nodeTexture.height = (thought.radius * 2) * stateViewport.zoom;
                //     nodeTexture.position.set(- nodeTexture.width / 2,  - nodeTexture.height / 2);
                //     nodeTexture.interactive = false;

                //     circle.removeChildren();
                //     circle.addChild(nodeTexture);
                // })();

                //graphics approach
                // (async () => {
                //     if (circle.children.length > 0)
                //         return;
                //     const nodeTexture = new Sprite(thoughtNode as Texture);
                //     nodeTexture.width = (thought.radius * 2) * stateViewport.zoom;
                //     nodeTexture.height = (thought.radius * 2) * stateViewport.zoom;
                //     nodeTexture.position.set(- nodeTexture.width / 2,  - nodeTexture.height / 2);
                //     nodeTexture.interactive = false;

                //     circle.removeChildren();
                //     circle.addChild(nodeTexture);
                // })();

                // const scale = graphState.viewport.zoom * thought.radius / 2;
                // circle.scale = { x: scale, y: scale };
                circle.position = graphState.viewport.toViewportCoordinates({ x: thought.position.x, y: thought.position.y });

                if (thought.highlighted) {
                    circle.lineStyle(500 * stateViewport.zoom, thought.authorColor, 0.05);
                    circle.drawCircle(0, 0, stateViewport.zoom * (TimeAffectedRadius + 400));

                    circle.lineStyle(400 * stateViewport.zoom, thought.authorColor, 0.05);
                    circle.drawCircle(0, 0, stateViewport.zoom * (TimeAffectedRadius + 350));

                    circle.lineStyle(300 * stateViewport.zoom, thought.authorColor, 0.05);
                    circle.drawCircle(0, 0, stateViewport.zoom * (TimeAffectedRadius + 300));

                    circle.lineStyle(200 * stateViewport.zoom, thought.authorColor, 0.05);
                    circle.drawCircle(0, 0, stateViewport.zoom * (TimeAffectedRadius + 250));

                    circle.lineStyle(100 * stateViewport.zoom, thought.authorColor, 0.2);
                    circle.drawCircle(0, 0, stateViewport.zoom * (TimeAffectedRadius + 200));
                }
                // if (thought.size <= 3) {
                //     circle.lineStyle(0);
                //     circle.beginFill("#000000", 0.001);//this is here only to make the hit area bigger
                //     circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * TimeAffectedRadius + 8);
                //     circle.endFill();
                // }
            }
            

            const text = thought.text as Text;
            // console.log(graphState.viewport.zoom, ZOOM_TEXT_VISIBLE_THRESHOLD);
            if ((graphState.viewport.zoom > graphControlsState.titleVisibilityThresholdMultiplier * ZOOM_TEXT_VISIBLE_THRESHOLD && thought.timeOnScreen > NEW_NODE_INVISIBLE_FOR)
                || (thought.hovered && graphControlsState.titleOnHoverEnabled)) {

                const textCoors = graphState.viewport.toViewportCoordinates({
                    x: thought.position.x,
                    y: thought.position.y + TimeAffectedRadius
                });
                textCoors.y += (graphControlsState.titleOnHoverEnabled && graphState.viewport.zoom <= ZOOM_TEXT_VISIBLE_THRESHOLD ? 20 : 5);
                textCoors.x -= text.width / 2;
                text.x = textCoors.x;
                text.y = textCoors.y;
                text.alpha = Math.min(1, (thought.timeOnScreen - NEW_NODE_INVISIBLE_FOR) / NEW_NODE_FADE_IN_FRAMES);

                textContainer.addChild(text);
            }

            const highlightedThought = graphState.highlightedThought;

            thought.links.forEach(referencedThoughtId => {
                const referencedThought = onScreenThoughts.filter(t => t.id == referencedThoughtId)[0];
                // handle dynamic edge appearance based on highlighted thought
                if (referencedThought) {
                    // const arrowColor = highlightedThought === null
                    //     ? referencedThought.color
                    //     : highlightedThought === thought || highlightedThought === referencedThought
                    //         ? tinycolor(referencedThought.color).lighten(5).toString()
                    //         : tinycolor(referencedThought.color).darken(10).toString();
                    const arrowColor = referencedThought.authorColor;
                    const arrowThickness = highlightedThought === null
                        ? BASE_EDGE_WIDTH
                        : highlightedThought === thought || highlightedThought === referencedThought
                            ? HIGHLIGHTED_EDGE_WIDTH
                            : UNHIGHLIGHTED_EDGE_WIDTH;
                    const arrowAlpha = highlightedThought === null
                        ? BASE_EDGE_ALPHA
                        : highlightedThought === thought || highlightedThought === referencedThought
                            ? HIGHLIGHTED_EDGE_ALPHA
                            : UNHIGHLIGHTED_EDGE_ALPHA;

                    const sourceOpacity = Math.min(1, (thought.timeOnScreen - NEW_NODE_INVISIBLE_FOR) / NEW_NODE_FADE_IN_FRAMES);
                    const targetOpacity = referencedThought.timeOnScreen <= NEW_NODE_INVISIBLE_FOR
                        ? 0
                        : Math.min(1, (referencedThought.timeOnScreen - NEW_NODE_INVISIBLE_FOR) / NEW_NODE_FADE_IN_FRAMES);

                    const edgeOpacity = Math.min(sourceOpacity, targetOpacity, arrowAlpha);
                    draw_edge(
                        nodeContainer,
                        stateViewport.toViewportCoordinates({ x: referencedThought.position.x, y: referencedThought.position.y }),
                        stateViewport.toViewportCoordinates({ x: thought.position.x, y: thought.position.y }),
                        arrowColor, stateViewport.zoom, thought.radius, arrowThickness, edgeOpacity);
                }
            });
            // Render virtual edges when in profile mode
            if (graphControlsState.explorationMode === ExplorationMode.PROFILE)
                thought.virtualLinks.forEach(referencedThoughtId => {
                    const referencedThought = onScreenThoughts.filter(t => t.id == referencedThoughtId)[0];
                    // handle dynamic edge appearance based on highlighted thought
                    if (referencedThought) {
                        // const arrowColor = highlightedThought === null
                        //     ? referencedThought.color
                        //     : highlightedThought === thought || highlightedThought === referencedThought
                        //         ? tinycolor(referencedThought.color).lighten(5).toString()
                        //         : tinycolor(referencedThought.color).darken(10).toString();
                        // const arrowColor = referencedThought.color;
                        const arrowThickness = UNHIGHLIGHTED_EDGE_WIDTH / 2;
                        const arrowAlpha = UNHIGHLIGHTED_EDGE_ALPHA / 4;

                        const sourceOpacity = Math.min(1, (thought.timeOnScreen - NEW_NODE_INVISIBLE_FOR) / NEW_NODE_FADE_IN_FRAMES);
                        const targetOpacity = referencedThought.timeOnScreen <= NEW_NODE_INVISIBLE_FOR
                            ? 0
                            : Math.min(1, (referencedThought.timeOnScreen - NEW_NODE_INVISIBLE_FOR) / NEW_NODE_FADE_IN_FRAMES);

                        const edgeOpacity = Math.min(sourceOpacity, targetOpacity, arrowAlpha);
                        draw_edge(
                            nodeContainer,
                            stateViewport.toViewportCoordinates({ x: referencedThought.position.x, y: referencedThought.position.y }),
                            stateViewport.toViewportCoordinates({ x: thought.position.x, y: thought.position.y }),
                            "#ffffff", stateViewport.zoom, thought.radius, arrowThickness, edgeOpacity);
                    }
                });
        });
        lastZoom = graphState.viewport.zoom;

        // boundaries
        nodeContainer.lineStyle(2, graphState.userSettings.color, 1);
        if (!graphControlsState.noBorders) {
            // nodeContainer.drawRect(
            //     stateViewport.toViewportCoordinates({ x: 0, y: 0 }).x,
            //     stateViewport.toViewportCoordinates({ x: 0, y: 0 }).y,
            //     SIM_WIDTH * stateViewport.zoom,
            //     SIM_HEIGHT * stateViewport.zoom
            // );

            nodeContainer.drawCircle(
                stateViewport.toViewportCoordinates({ x: 0, y: 0 }).x,
                stateViewport.toViewportCoordinates({ x: 0, y: 0 }).y,
                GRAVITY_FREE_RADIUS * graphState.viewport.zoom)
        } else {
            const CROSS_SIZE = SIM_HEIGHT / 100;
            const pointAbove = stateViewport.toViewportCoordinates({ x: 0, y: 0 - CROSS_SIZE });
            const pointBelow = stateViewport.toViewportCoordinates({ x: 0, y: 0 + CROSS_SIZE });
            const pointLeft = stateViewport.toViewportCoordinates({ x: 0 - CROSS_SIZE, y: 0 });
            const pointRight = stateViewport.toViewportCoordinates({ x: 0 + CROSS_SIZE, y: 0 });
            nodeContainer.moveTo(pointAbove.x, pointAbove.y);
            nodeContainer.lineTo(pointBelow.x, pointBelow.y);
            nodeContainer.moveTo(pointLeft.x, pointLeft.y);
            nodeContainer.lineTo(pointRight.x, pointRight.y);
        }
    };

    renderGraph();

    return renderGraph;
};

const draw_edge = (
    graphics: Graphics,
    from: XAndY,
    to: XAndY,
    color: string,
    zoom: number,
    targetThoughtRadius: number,
    thickness = 1,
    alpha = 1
) => {

    const graphControlsStore = useGraphControlsStore.getState();

    const x1 = from.x;
    const y1 = from.y;
    const x2 = to.x;
    const y2 = to.y;

    // Calculate the angle of the arrow line
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Calculate the position where the arrow should end (radius distance from (x2, y2))
    const arrowTipX = x2 - targetThoughtRadius * zoom * Math.cos(angle);
    const arrowTipY = y2 - targetThoughtRadius * zoom * Math.sin(angle);

    // Draw the main line (shaft of the arrow) ending at (arrowTipX, arrowTipY)

    graphics.moveTo(x1, y1);

    graphics.zIndex = ARROW_Z;
    switch (graphControlsStore.edgeType) {
        case EdgeType.NONE:
            break;
        case EdgeType.SIMPLE:
            graphics.lineStyle({ color: new Color(color), width: zoom * thickness, alpha: alpha });
            graphics.lineTo(arrowTipX, arrowTipY);
            break;
        case EdgeType.ARRROW:
            // bezier curved edges
            graphics.lineStyle({ color: new Color(color), width: zoom * thickness, alpha: alpha });
            const normal = { x: y1 - y2, y: x2 - x1 };
            const bezier1 = { x: x1 - ((x1 - arrowTipX) / 3) + normal.x * 0.1, y: y1 - ((y1 - arrowTipY) / 3) + normal.y * 0.1 };
            const bezier2 = { x: x1 - ((x1 - arrowTipX) * 2 / 3), y: y1 - ((y1 - arrowTipY) * 2 / 3) };
            graphics.bezierCurveTo(bezier1.x, bezier1.y, bezier2.x, bezier2.y, arrowTipX, arrowTipY);

            // simple arrows    


            // Arrowhead properties
            const arrowLength = 70 * zoom;
            const baseAngle = Math.PI / 5; // Base angle for the segments
            const numSegments = 6; // Number of segments

            const step = baseAngle / (numSegments - 1);

            // Set line style
            graphics.lineStyle({ color: new Color(color), width: zoom * thickness * 1.2, alpha: alpha });

            for (let i = 0; i < numSegments; i++) {
                const offsetAngle = baseAngle - i * step;

                const arrowXLeft = arrowTipX - arrowLength * Math.cos(angle - offsetAngle);
                const arrowYLeft = arrowTipY - arrowLength * Math.sin(angle - offsetAngle);
                graphics.moveTo(arrowTipX, arrowTipY);
                graphics.lineTo(arrowXLeft, arrowYLeft);

                const arrowXRight = arrowTipX - arrowLength * Math.cos(angle + offsetAngle);
                const arrowYRight = arrowTipY - arrowLength * Math.sin(angle + offsetAngle);
                graphics.moveTo(arrowTipX, arrowTipY);
                graphics.lineTo(arrowXRight, arrowYRight);
            } //todo - use arc
            break;
        case EdgeType.ANIMATED:
            //animated edges
            const segments: { x: number, y: number }[] = [];
            const segmentSize = 8;
            const edgeLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const segmentCount = Math.floor(edgeLength / segmentSize + 1);

            const frame = useGraphStore.getState().frame;
            const cyclePeriod = 30;
            const offset = frame % cyclePeriod;

            for (let i = 0; i < segmentCount; i++) {
                const segmentX = x1 + (x2 - x1) * (i - 1 + offset / cyclePeriod * 2) / segmentCount;
                const segmentY = y1 + (y2 - y1) * (i - 1 + offset / cyclePeriod * 2) / segmentCount;
                segments.push({ x: segmentX, y: segmentY });
            }

            segments.forEach((segment, index) => {
                if (index % 2 === 0) {
                    graphics.lineStyle({ color: new Color(color), width: zoom * thickness * 5, alpha: alpha / 2 });
                }
                else {
                    graphics.lineStyle();
                }
                if (index < segments.length - 1) {
                    const nextSegment = segments[index + 1];
                    graphics.moveTo(segment.x, segment.y);
                    graphics.lineTo(nextSegment.x, nextSegment.y);
                }
            });
            break;
        case EdgeType.GRADIENT:
            //compute segments of the gradient - ie full, first half, first third, etc.

            // const gradientSegments = 10;
            // graphics.lineStyle({ color: new Color(color), width: zoom * thickness, alpha: alpha });
            // for (let i = 1; i < gradientSegments; i++) {
            //     const segmentX = x1 + (x2 - x1) * (i - 1) / gradientSegments;
            //     const segmentY = y1 + (y2 - y1) * (i - 1) / gradientSegments;
            //     graphics.moveTo(segmentX, segmentY);
            //     graphics.lineStyle({
            //         color: new Color(color),
            //         width: zoom * thickness / gradientSegments * (gradientSegments - i) * 6,
            //         alpha: alpha * ((gradientSegments - i) / gradientSegments)
            //     });
            //     graphics.lineTo(segmentX + (x2 - x1) / gradientSegments, segmentY + (y2 - y1) / gradientSegments);
            // }
            drawFadingTaperedEdge(graphics, x1, y1, x2, y2, {
                color: color,
                thickness: thickness * 4,
                alpha: alpha,
                zoom: zoom,
                segments: 20,
            });
            break;
    }
};

function drawFadingTaperedEdge(
    graphics: Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options: {
        color: string;
        thickness: number;
        alpha?: number;
        zoom?: number;
        segments?: number;
    }
) {
    const {
        color,
        thickness,
        alpha = 1,
        zoom = 1,
        segments = 10
    } = options;

    graphics.lineStyle(0); // Disable line style for the polygon

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);

    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;

    for (let i = 0; i < segments; i++) {
        const t0 = i / segments;
        const t1 = (i + 1) / segments;

        const startX = x1 + ux * len * t0;
        const startY = y1 + uy * len * t0;
        const endX = x1 + ux * len * t1;
        const endY = y1 + uy * len * t1;

        const w0 = (1 - t0) * thickness * zoom;
        const w1 = (1 - t1) * thickness * zoom;

        const quad = [
            startX + px * w0 / 2, startY + py * w0 / 2,
            startX - px * w0 / 2, startY - py * w0 / 2,
            endX - px * w1 / 2, endY - py * w1 / 2,
            endX + px * w1 / 2, endY + py * w1 / 2,
        ];

        const segmentAlpha = alpha * (1 - t0); // fade out

        graphics.beginFill(color, segmentAlpha);
        graphics.drawPolygon(quad);
        graphics.endFill();
    }
}

const getSelectedColorHex = (color: ThoughtColor) => {
    switch (color) {
        case ThoughtColor.None:
            return "#000000";
        case ThoughtColor.Red:
            return "#ba4745";
        case ThoughtColor.Orange:
            return "#ba7f45";
        case ThoughtColor.Yellow:
            return "#b4ba45";
        case ThoughtColor.Green:
            return "#58ba45";
        case ThoughtColor.Cyan:
            return "#45b5ba";
        case ThoughtColor.Blue:
            return "#4547ba";
        case ThoughtColor.Violet:
            return "#b745ba";
        case ThoughtColor.White:
            return "#eeeeee ";
    }
}