import { Application } from 'pixi.js';
import { simulate_one_frame } from './forcesSimulation';
import { initGraphics } from '../view/GraphGraphics';
import { SIMULATION_FRAMES, THOUGHTS_CACHE_FRAME } from '../state_and_parameters/graphParameters';
import { useGraphStore } from '../state_and_parameters/GraphStore';
import { ThoughtPositionCache } from '../model/thoughtPositionCache';
import { updateTemporalThoughts } from './thoughtsProvider';

export default function runGraph(app: Application) {

    const initialGraphState = useGraphStore.getState();

    const thoughtGrabbed = () => {
        initialGraphState.setFrame(1);
    };

    const temporalThoughts = initialGraphState.temporalRenderedThoughts; //after dynamic loading this might need to move to ticker.

    const renderGraph = initGraphics(app, temporalThoughts, thoughtGrabbed);

    initialGraphState.setFrame(0);

    // main application loop
    app.ticker.add((_) => {
        const graphState = useGraphStore.getState();

        // cache thoughts
        if (graphState.frame === THOUGHTS_CACHE_FRAME) {
            // console.log('caching thoughts positions');

            const storage = localStorage.getItem('thoughts-cache'); //todo use set?

            const cachedPositions: ThoughtPositionCache[] = storage ? JSON.parse(storage) : [];
            // console.log(graphState.allRenderedThoughts);

            const combinedThoughts = [
                ...cachedPositions,
                ...graphState.temporalRenderedThoughts,
                ...graphState.neighborhoodThoughts
            ];
            
            // Use a Set to filter out duplicate thoughts by their id
            const uniqueThoughts = Array.from(
                new Map(
                    combinedThoughts.map(t => [t.id, t])
                ).values()
            );
            
            const thoughtsCache: ThoughtPositionCache[] = uniqueThoughts.map(t => ({
                id: t.id,
                position: t.position,
            }));
            
            localStorage.setItem('thoughts-cache', JSON.stringify(thoughtsCache));
        }
        
        // handle zoom input from user
        const zoomingControl = graphState.zoomingControl;
        if (zoomingControl !== 0) {
            graphState.viewport.zoomByButtonDelta(zoomingControl);
        }

        // handle TimeShift  control input from user
        const timeShiftControl = graphState.timeShiftControl;
        const timeShift = graphState.timeShift;
        const maxThoughtsOnScreen = graphState.maxThoughtsOnScreen;
        
        if ((timeShiftControl > 0 && timeShift < graphState.temporalRenderedThoughts.length)
            || (timeShiftControl < 0 && timeShift > -maxThoughtsOnScreen)) { //todo check the one
            graphState.setTimeShift(timeShift + timeShiftControl);
            graphState.setFrame(1);
        }
        
        // Update temporal thoughts
        updateTemporalThoughts();

        //move the viewport to the highlighted thought
        const lockedOnHighlighted = graphState.lockedOnHighlighted;
        if (lockedOnHighlighted) {
            const highlightedThought = graphState.highlightedThought;
            const viewport = graphState.viewport;
            if (highlightedThought !== null) {
                const dx = viewport.position.x + viewport.width / 2 / viewport.zoom - highlightedThought.position.x;
                const dy = viewport.position.y + viewport.height / 2 / viewport.zoom - highlightedThought.position.y;
                // console.log(dx, dy, lockedOnHighlighted);
                if (Math.abs(dx) > 0.01 && Math.abs(dy) > 0.01) {
                    graphState.viewport.moveBy({ x: dx / 10, y: dy / 10 });
                }
            }
        }

        // force simulation
        const frame = graphState.frame;
        if (frame < SIMULATION_FRAMES) {
            simulate_one_frame();
        }
        graphState.setFrame(frame + 1);

        // render the graph
        renderGraph();
    });
}