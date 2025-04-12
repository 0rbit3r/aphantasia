import { Application, Color, Container, Graphics, TextStyle, Text } from "pixi.js";
import { ARROW_Z, NODES_Z, TEXT_Z } from "./zIndexes";
import { BASE_EDGE_ALPHA, BASE_EDGE_WIDTH, BASE_RADIUS, HIGHLIGHTED_EDGE_ALPHA, HIGHLIGHTED_EDGE_WIDTH, NEW_NODE_FADE_IN_FRAMES, NEW_NODE_INVISIBLE_FOR, SIM_HEIGHT, SIM_WIDTH, UNHIGHLIGHTED_EDGE_ALPHA, UNHIGHLIGHTED_EDGE_WIDTH, ZOOM_TEXT_VISIBLE_THRESHOLD } from "../state_and_parameters/graphParameters";
import { RenderedThought } from "../model/renderedThought";
import { addDraggableViewport } from "./ViewportInitializer";
import { XAndY } from "../model/xAndY";
import tinycolor from "tinycolor2";
import { useGraphStore } from "../state_and_parameters/GraphStore";
import { getThoughtsOnScreen } from "../simulation/thoughtsProvider";
import { EdgeType, useGraphControlsStore } from "../state_and_parameters/GraphControlsStore";
import { ThoughtShape } from "../model/thoughtShape";
import { ExplorationMode } from "../simulation/modesManager";


const DRAG_TIME_THRESHOLD = 200;
// const muffinSvg = await Assets.load(import.meta.env.VITE_PUBLIC_FOLDER + '/icons/muffin.svg');

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

    const fpsCounter: Text = new Text('0', new TextStyle({ fontSize: 20, fill: 'yellow' }));
    fpsCounter.x = 20;
    fpsCounter.y = app.screen.height - 40;

    const renderTimeDeltas: number[] = [1];
    let lastRenderTime = performance.now();

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
        nodeContainer.children.forEach(child => {
            if (child instanceof Graphics) {
                child.clear();
            }
        });

        // nodes
        onScreenThoughts.forEach(thought => {

            // if (thought.graphics === undefined) {
            //     console.log('undefined id', thought.id);
            // }

            if (thought.graphics === undefined) {
                initializeGraphicsForThought(thought);
            }

            // indicate that htere are neighbors not currently on screen
            const explorable = (thought.links.some(l => onScreenThoughts.filter(t => t.id === l).length === 0) || // any links or replies outside onscreen thoughts check 
                thought.backlinks.some(l => onScreenThoughts.filter(t => t.id === l).length === 0));

            const circle = thought.graphics as Graphics;

            circle.clear();

            // if the node is out of screen, don't draw it
            const circleCoors = stateViewport.toViewportCoordinates({ x: thought.position.x, y: thought.position.y });
            if (circleCoors.x < -thought.radius * 3 || circleCoors.x > stateViewport.width + thought.radius * 3
                || circleCoors.y < -thought.radius * 3 || circleCoors.y > stateViewport.height + thought.radius * 3) {
                return;
            }

            // draw node
            if (thought.timeOnScreen > NEW_NODE_INVISIBLE_FOR) {

                const opacity = Math.min(1, (thought.timeOnScreen - NEW_NODE_INVISIBLE_FOR) / NEW_NODE_FADE_IN_FRAMES);

                // pulsating color if the node is explorable
                const pulsingColor = graphState.frame % 150 < 50 &&
                    explorable
                    ? tinycolor(thought.color).lighten(30 - (graphState.frame % 50) / 50 * 30).toString()
                    : thought.color;
                const thoughtLineStyle = { width: 10 * stateViewport.zoom, color: tinycolor(pulsingColor).lighten(15).toString(), alpha: opacity };
                const thoughtFillStyle = { color: pulsingColor, alpha: opacity };

                circle.beginFill(thoughtFillStyle.color, thoughtFillStyle.alpha);
                circle.lineStyle(thoughtLineStyle);

                switch (thought.shape) {
                    case ThoughtShape.Circle:
                        circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * thought.radius);
                        break;
                    case ThoughtShape.Square:
                        circle.drawRoundedRect(
                            circleCoors.x - thought.radius / 3 * 2 * stateViewport.zoom, circleCoors.y - thought.radius / 3 * 2 * stateViewport.zoom,
                            thought.radius * 4 / 3 * stateViewport.zoom, thought.radius * 4 / 3 * stateViewport.zoom, thought.radius / 3 * stateViewport.zoom
                        );
                        break;
                    case ThoughtShape.UpTriangle:
                        circle.moveTo(circleCoors.x, circleCoors.y - stateViewport.zoom * thought.radius);
                        circle.lineTo(circleCoors.x - stateViewport.zoom * thought.radius * Math.sqrt(3) / 2, circleCoors.y + stateViewport.zoom * thought.radius / 2);
                        circle.lineTo(circleCoors.x + stateViewport.zoom * thought.radius * Math.sqrt(3) / 2, circleCoors.y + stateViewport.zoom * thought.radius / 2);
                        circle.lineTo(circleCoors.x, circleCoors.y - stateViewport.zoom * thought.radius);
                        // circle.lineStyle(thoughtLineStyle.width / 2, thoughtLineStyle.color, thoughtLineStyle.alpha, 1);
                        // circle.drawCircle(circleCoors.x, circleCoors.y - stateViewport.zoom * thought.radius, thoughtLineStyle.width / 4 );
                        break;

                    case ThoughtShape.DownTriangle:
                        circle.moveTo(circleCoors.x, circleCoors.y + stateViewport.zoom * thought.radius);
                        circle.lineTo(circleCoors.x - stateViewport.zoom * thought.radius * Math.sqrt(3) / 2, circleCoors.y - stateViewport.zoom * thought.radius / 2);
                        circle.lineTo(circleCoors.x + stateViewport.zoom * thought.radius * Math.sqrt(3) / 2, circleCoors.y - stateViewport.zoom * thought.radius / 2);
                        circle.lineTo(circleCoors.x, circleCoors.y + stateViewport.zoom * thought.radius);
                        break;

                    case ThoughtShape.Diamond:
                        circle.lineStyle();
                        circle.endFill();
                        // circle.moveTo(circleCoors.x - thought.radius * 2 / 16 * stateViewport.zoom, circleCoors.y - stateViewport.zoom * (thought.radius * 14 / 16));
                        circle.moveTo(circleCoors.x, circleCoors.y - stateViewport.zoom * thought.radius);
                        circle.arcTo(circleCoors.x - stateViewport.zoom * thought.radius, circleCoors.y, circleCoors.x, circleCoors.y + stateViewport.zoom * thought.radius, thought.radius / 3 * stateViewport.zoom);
                        circle.beginFill(thoughtFillStyle.color, thoughtFillStyle.alpha);
                        circle.lineStyle(thoughtLineStyle);
                        circle.arcTo(circleCoors.x, circleCoors.y + stateViewport.zoom * thought.radius, circleCoors.x + stateViewport.zoom * thought.radius, circleCoors.y, thought.radius / 3 * stateViewport.zoom);
                        circle.arcTo(circleCoors.x + stateViewport.zoom * thought.radius, circleCoors.y, circleCoors.x, circleCoors.y - stateViewport.zoom * thought.radius, thought.radius / 3 * stateViewport.zoom);
                        circle.arcTo(circleCoors.x, circleCoors.y - stateViewport.zoom * thought.radius, circleCoors.x - stateViewport.zoom * thought.radius, circleCoors.y, thought.radius / 3 * stateViewport.zoom);
                        circle.arcTo(circleCoors.x - stateViewport.zoom * thought.radius, circleCoors.y, circleCoors.x, circleCoors.y + stateViewport.zoom * thought.radius, thought.radius / 3 * stateViewport.zoom);
                        break;
                    case ThoughtShape.Cross:
                        const gridSize = thought.radius / 7 * 3 * stateViewport.zoom;

                        circle.moveTo(circleCoors.x, circleCoors.y - gridSize);
                        circle.lineTo(circleCoors.x - gridSize, circleCoors.y - gridSize * 2);
                        circle.lineTo(circleCoors.x - gridSize * 2, circleCoors.y - gridSize);
                        circle.lineTo(circleCoors.x - gridSize, circleCoors.y);
                        circle.lineTo(circleCoors.x - gridSize * 2, circleCoors.y + gridSize);
                        circle.lineTo(circleCoors.x - gridSize, circleCoors.y + gridSize * 2);
                        circle.lineTo(circleCoors.x, circleCoors.y + gridSize);
                        circle.lineTo(circleCoors.x + gridSize, circleCoors.y + gridSize * 2);
                        circle.lineTo(circleCoors.x + gridSize * 2, circleCoors.y + gridSize);
                        circle.lineTo(circleCoors.x + gridSize, circleCoors.y);
                        circle.lineTo(circleCoors.x + gridSize * 2, circleCoors.y - gridSize);
                        circle.lineTo(circleCoors.x + gridSize, circleCoors.y - gridSize * 2);
                        circle.lineTo(circleCoors.x, circleCoors.y - gridSize);
                        break;
                    default:
                        circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * thought.radius);
                        break;
                }
                circle.endFill();

                if (explorable) {
                    circle.beginFill("black", 1);
                    circle.lineStyle(10 * stateViewport.zoom, tinycolor(pulsingColor).lighten(15).toString(), 1);
                    circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * (thought.radius * 0.5));
                    circle.endFill();
                } else {
                    const explorableLowestTimeOnScreen = onScreenThoughts
                        .filter(t => thought.links.includes(t.id) || thought.backlinks.includes(t.id))
                        .map(t => t.timeOnScreen)
                        .reduce((min, cur) => Math.min(min, cur), Number.MAX_SAFE_INTEGER);

                    const blackDotOpacity = explorableLowestTimeOnScreen > NEW_NODE_INVISIBLE_FOR
                        ? 0
                        : Math.min(1, (thought.timeOnScreen - NEW_NODE_INVISIBLE_FOR) / NEW_NODE_FADE_IN_FRAMES);

                    circle.beginFill("black", blackDotOpacity);
                    circle.lineStyle(10 * stateViewport.zoom, tinycolor(pulsingColor).lighten(15).toString(), blackDotOpacity);
                    circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * (thought.radius * 0.5));
                    circle.endFill();
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


                if (thought.highlighted) {
                    circle.lineStyle(500 * stateViewport.zoom, thought.color, 0.05);
                    circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * (thought.radius + 400));

                    circle.lineStyle(400 * stateViewport.zoom, thought.color, 0.05);
                    circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * (thought.radius + 350));

                    circle.lineStyle(300 * stateViewport.zoom, thought.color, 0.05);
                    circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * (thought.radius + 300));

                    circle.lineStyle(200 * stateViewport.zoom, thought.color, 0.05);
                    circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * (thought.radius + 250));

                    circle.lineStyle(100 * stateViewport.zoom, thought.color, 0.2);
                    circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * (thought.radius + 200));
                }
                if (thought.size <= 3) {
                    circle.lineStyle(0);
                    circle.beginFill("#000000", 0.001);//this is here only to make the hit area bigger
                    circle.drawCircle(circleCoors.x, circleCoors.y, stateViewport.zoom * thought.radius + 5);
                    circle.endFill();
                }
            }

            const text = thought.text as Text;
            // console.log(graphState.viewport.zoom, ZOOM_TEXT_VISIBLE_THRESHOLD);
            if ((graphState.viewport.zoom > graphControlsState.titleVisibilityThresholdMultiplier * ZOOM_TEXT_VISIBLE_THRESHOLD && thought.timeOnScreen > NEW_NODE_INVISIBLE_FOR)
                || (thought.hovered && graphControlsState.titleOnHoverEnabled)) {

                const textCoors = graphState.viewport.toViewportCoordinates({
                    x: thought.position.x,
                    y: thought.position.y + thought.radius
                });
                textCoors.y += (graphControlsState.titleOnHoverEnabled && graphState.viewport.zoom <= ZOOM_TEXT_VISIBLE_THRESHOLD ? 20 : 5);
                textCoors.x -= text.width / 2;
                text.x = textCoors.x;
                text.y = textCoors.y;
                text.alpha = Math.min(1, (thought.timeOnScreen - NEW_NODE_INVISIBLE_FOR) / NEW_NODE_FADE_IN_FRAMES);

                textContainer.addChild(text);
            }
        });

        // edges
        onScreenThoughts.forEach(thought => {
            const highlightedThought = useGraphStore.getState().highlightedThought;

            thought.links.forEach(referencedThoughtId => {
                const referencedThought = onScreenThoughts.filter(t => t.id == referencedThoughtId)[0];
                // handle dynamic edge appearance based on highlighted thought
                if (referencedThought) {
                    // const arrowColor = highlightedThought === null
                    //     ? referencedThought.color
                    //     : highlightedThought === thought || highlightedThought === referencedThought
                    //         ? tinycolor(referencedThought.color).lighten(5).toString()
                    //         : tinycolor(referencedThought.color).darken(10).toString();
                    const arrowColor = referencedThought.color;
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
                        const arrowColor = referencedThought.color;
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
                            arrowColor, stateViewport.zoom, thought.radius, arrowThickness, edgeOpacity);
                    }
                });

        });

        // boundaries
        nodeContainer.lineStyle(2, graphState.userSettings.color, 0.2);
        if (!graphControlsState.noBorders) {
            nodeContainer.drawRect(
                stateViewport.toViewportCoordinates({ x: 0, y: 0 }).x,
                stateViewport.toViewportCoordinates({ x: 0, y: 0 }).y,
                SIM_WIDTH * stateViewport.zoom,
                SIM_HEIGHT * stateViewport.zoom
            );
        } else {
            const CROSS_SIZE = SIM_HEIGHT / 100;
            const pointAbove = stateViewport.toViewportCoordinates({ x: SIM_HEIGHT / 2, y: SIM_HEIGHT / 2 - CROSS_SIZE });
            const pointBelow = stateViewport.toViewportCoordinates({ x: SIM_HEIGHT / 2, y: SIM_HEIGHT / 2 + CROSS_SIZE });
            const pointLeft = stateViewport.toViewportCoordinates({ x: SIM_HEIGHT / 2 - CROSS_SIZE, y: SIM_HEIGHT / 2 });
            const pointRight = stateViewport.toViewportCoordinates({ x: SIM_HEIGHT / 2 + CROSS_SIZE, y: SIM_HEIGHT / 2 });
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
    ;
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