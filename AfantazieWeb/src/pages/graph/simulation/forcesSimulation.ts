import { useGraphStore } from "../state_and_parameters/GraphStore";
import {
    pullForce, backlinksNumberForceDivisor, pushForce, PUSH_THRESH, MAX_MOMENTUM_DAMPENING,
    FRAMES_WITH_OVERLAP, SLOW_SIM_EVERY_N_FRAMES, NODE_MASS_ON, MAX_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER, MIN_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER,
    SIM_HEIGHT, SIM_WIDTH, INFLUENCE_FADE_IN, MAX_MOVEMENT_SPEED, MAX_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER, MIN_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER,
    GRAVITY_FREE_RADIUS, gravityForce, MOMENTUM_DAMPENING_EASE_IN_FRAMES, MOMENTUM_DAMPENING_START_AT,
    FRAMES_WITH_NO_INFLUENCE,
    IDEAL_LINKED_DISTANCE,
    VIRTUAL_EDGE_PULL_FORCE_MULTIPLIER,
    VIRTUAL_EDGE_LINKED_DIST_MULTIPLIER,
    IDEAL_DIST_SIZE_MULTIPLIER,
    BORDERLESS_MODE_PUSH_THRESH_MULTIPLICATOR,
} from "../state_and_parameters/graphParameters";
import { RenderedThought } from "../model/renderedThought";
import { getThoughtsOnScreen } from "./thoughtsProvider";
import { useGraphControlsStore } from "../state_and_parameters/GraphControlsStore";
import { ExplorationMode } from "./modesManager";

export const get_border_distance = (thought1: RenderedThought, thought2: RenderedThought) => {
    const x1 = thought1.position.x;
    const y1 = thought1.position.y;
    const x2 = thought2.position.x;
    const y2 = thought2.position.y;
    const centerDistance = Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
    const borderDistance = centerDistance - thought1.radius - thought2.radius;
    // if (borderDistance > centerDistance) {
    //     return borderDistance - 
    // }

    return borderDistance;
}

const get_center_distance = (thought1: RenderedThought, thought2: RenderedThought) => {
    const x1 = thought1.position.x;
    const y1 = thought1.position.y;
    const x2 = thought2.position.x;
    const y2 = thought2.position.y;

    const dist = Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));

    // prevents division by zero (?)
    return dist === 0 ? 0.01 : dist;
}

export const simulate_one_frame_of_FDL = () => {
    const onScreenThoughts = getThoughtsOnScreen();
    const graphControlsState = useGraphControlsStore.getState();

    if (!graphControlsState.disableSimulation) {
        for (let i = 0; i < onScreenThoughts.length; i++) {
            const sourceThought = onScreenThoughts[i];
            handleOutOfBounds(sourceThought);
            if (!graphControlsState.noBorders) {
                handleOutOfBorders(sourceThought);
            }
            for (let j = 0; j < i; j++) {
                const targetThought = onScreenThoughts[j];
                if (sourceThought.id > targetThought.id) { //This relies on the fact that thoughts can only reference older ones... and sorted array...
                    const borderDistance = get_border_distance(sourceThought, targetThought);

                    if (sourceThought.links.includes(targetThought.id)) {
                        pull_or_push_connected_to_ideal_distance(
                            {
                                sourceThought, targetThought,
                                upFlow: graphControlsState.upFlowEnabled,
                                isVirtualEdge: false,
                                idealLength: graphControlsState.edgeLengthMultiplier * IDEAL_LINKED_DISTANCE
                            });
                    } else if (sourceThought.virtualLinks.includes(targetThought.id) && graphControlsState.explorationMode === ExplorationMode.PROFILE) {
                        pull_or_push_connected_to_ideal_distance(
                            {
                                sourceThought, targetThought,
                                upFlow: graphControlsState.upFlowEnabled,
                                isVirtualEdge: true,
                                idealLength: graphControlsState.edgeLengthMultiplier * IDEAL_LINKED_DISTANCE
                            });
                    }
                    else if (borderDistance < PUSH_THRESH) {
                        push_unconnected(sourceThought, targetThought);
                    }
                }
            }
            if (graphControlsState.gravityEnabled) {
                gravity_pull(sourceThought);
            }
        }
    }


    const frame = useGraphStore.getState().frame;
    onScreenThoughts.forEach(thought => {

        thought.timeOnScreen += 1;

        if (Math.abs(thought.momentum.x) < Math.abs(thought.forces.x)) {
            thought.momentum.x = Math.abs(thought.momentum.x) * Math.sign(thought.forces.x);
        }
        if (Math.abs(thought.momentum.y) < Math.abs(thought.forces.y)) {
            thought.momentum.y = Math.abs(thought.momentum.y) * Math.sign(thought.forces.y);
        }

        thought.momentum.x += thought.forces.x;
        thought.momentum.y += thought.forces.y;

        const frameAdjustedDampeningRate =
            MOMENTUM_DAMPENING_START_AT +
            Math.min(frame, MOMENTUM_DAMPENING_EASE_IN_FRAMES) / MOMENTUM_DAMPENING_EASE_IN_FRAMES * (MAX_MOMENTUM_DAMPENING - MOMENTUM_DAMPENING_START_AT);

        // console.log("frameAdjustedDampeningRate: ", frameAdjustedDampeningRate);

        thought.momentum.x /= frameAdjustedDampeningRate;
        thought.momentum.y /= frameAdjustedDampeningRate;

        // thought.momentum.x = Math.min(thought.momentum.x, MAX_MOMENTUM);
        // thought.momentum.y = Math.min(thought.momentum.y, MAX_MOMENTUM);

        thought.position.x += Math.max(Math.min(thought.momentum.x / (Math.floor(frame / SLOW_SIM_EVERY_N_FRAMES) + 1), MAX_MOVEMENT_SPEED), -MAX_MOVEMENT_SPEED); // not taking angle into account...
        thought.position.y += Math.max(Math.min(thought.momentum.y / (Math.floor(frame / SLOW_SIM_EVERY_N_FRAMES) + 1), MAX_MOVEMENT_SPEED), -MAX_MOVEMENT_SPEED); // not taking angle into account...

        thought.forces.x /= frameAdjustedDampeningRate;
        thought.forces.y /= frameAdjustedDampeningRate;
    });
}

export interface EdgeForceOptions {
    sourceThought: RenderedThought;
    targetThought: RenderedThought;
    upFlow?: boolean;
    isVirtualEdge?: boolean;
    idealLength?: number;
}

export const pull_or_push_connected_to_ideal_distance = (opts: EdgeForceOptions) => {
    if (!opts.idealLength) {
        opts.idealLength = IDEAL_LINKED_DISTANCE;
    }

    const dx = opts.targetThought.position.x - opts.sourceThought.position.x;
    const dy = opts.targetThought.position.y - opts.sourceThought.position.y;
    const centerDistance = get_center_distance(opts.sourceThought, opts.targetThought);
    const borderDistance = get_border_distance(opts.sourceThought, opts.targetThought);
    // const borderDistance = get_border_distance(sourceThought, targetThought);
    // if (borderDistance < 0) {
    //     return;
    // }

    const idealDistanceAdjustedByFactors = opts.idealLength
        * Math.max(opts.targetThought.size * IDEAL_DIST_SIZE_MULTIPLIER, 1)
        * (opts.isVirtualEdge ? VIRTUAL_EDGE_LINKED_DIST_MULTIPLIER : 1);

    const force = pullForce(borderDistance, idealDistanceAdjustedByFactors) / backlinksNumberForceDivisor(opts.targetThought.backlinks.length)

    const nodeMassMultiplier = NODE_MASS_ON
        ? Math.min(Math.max(opts.targetThought.radius / opts.sourceThought.radius, MIN_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER), MAX_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER)
        : 1;

    const sourceThoughtTimeOnScreenMultiplier = opts.targetThought.timeOnScreen < FRAMES_WITH_NO_INFLUENCE
        ? 0
        : Math.min(1, (opts.targetThought.timeOnScreen - FRAMES_WITH_NO_INFLUENCE) / INFLUENCE_FADE_IN);

    const targetThoughtTimeOnScreenMultiplier = opts.sourceThought.timeOnScreen < FRAMES_WITH_NO_INFLUENCE
        ? 0
        : Math.min(1, (opts.sourceThought.timeOnScreen - FRAMES_WITH_NO_INFLUENCE) / INFLUENCE_FADE_IN);

    const virtualAdjustedForce = force * (opts.isVirtualEdge ? VIRTUAL_EDGE_PULL_FORCE_MULTIPLIER : 1);

    // get the x / y component of the force vector and multiply by the scalar compponent;
    opts.sourceThought.forces.x += (opts.sourceThought.held ? 0 : (dx / centerDistance) * virtualAdjustedForce)
        * nodeMassMultiplier
        * sourceThoughtTimeOnScreenMultiplier;
    opts.sourceThought.forces.y += (opts.sourceThought.held ? 0 : (dy / centerDistance) * virtualAdjustedForce - (opts.upFlow ? 2 : 0))
        * nodeMassMultiplier
        * sourceThoughtTimeOnScreenMultiplier;
    opts.targetThought.forces.x -= (opts.targetThought.held ? 0 : (dx / centerDistance) * virtualAdjustedForce)
        / nodeMassMultiplier
        * targetThoughtTimeOnScreenMultiplier;
    opts.targetThought.forces.y -= (opts.targetThought.held ? 0 : (dy / centerDistance) * virtualAdjustedForce - (opts.upFlow ? 2 : 0))
        / nodeMassMultiplier
        * targetThoughtTimeOnScreenMultiplier;
}

export const push_unconnected = (sourceThought: RenderedThought, targetThought: RenderedThought) => {
    const graphControlsState = useGraphControlsStore.getState();

    const dx = targetThought.position.x - sourceThought.position.x;
    const dy = targetThought.position.y - sourceThought.position.y;
    const centerDistance = get_center_distance(sourceThought, targetThought);
    const borderDistance = get_border_distance(sourceThought, targetThought);

    // const force = borderDistance < 0 && useGraphStore.getState().frame > FRAMES_WITH_OVERLAP
    //     ? -borderDistance
    //     : pushForce(centerDistance);
    // const force = pushForce(centerDistance);

    const modeDependentPushThresh = graphControlsState.noBorders
        ? PUSH_THRESH * BORDERLESS_MODE_PUSH_THRESH_MULTIPLICATOR
        : PUSH_THRESH;

    const forceAtPushThresh = pushForce(modeDependentPushThresh); //this might be a bit inefficient and weird but hey... it works to eliminate the noncontinuity of the push force at the edge

    const force = useGraphStore.getState().frame > FRAMES_WITH_OVERLAP
        ? pushForce(borderDistance) - forceAtPushThresh
        : 0;

    const nodeMassMultiplier = NODE_MASS_ON
        ? Math.min(Math.max(targetThought.radius / sourceThought.radius, MIN_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER), MAX_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER)
        : 1;

    const sourceThoughtTimeOnScreenMultiplier = targetThought.timeOnScreen < FRAMES_WITH_NO_INFLUENCE
        ? 0
        : Math.min(1, (targetThought.timeOnScreen - FRAMES_WITH_NO_INFLUENCE) / INFLUENCE_FADE_IN);

    const targetThoughtTimeOnScreenMultiplier = sourceThought.timeOnScreen < FRAMES_WITH_NO_INFLUENCE
        ? 0
        : Math.min(1, (sourceThought.timeOnScreen - FRAMES_WITH_NO_INFLUENCE) / INFLUENCE_FADE_IN);

    sourceThought.forces.x -= (sourceThought.held ? 0 : (dx / centerDistance) * force)
        * nodeMassMultiplier
        * sourceThoughtTimeOnScreenMultiplier;
    sourceThought.forces.y -= (sourceThought.held ? 0 : (dy / centerDistance) * force)
        * nodeMassMultiplier
        * sourceThoughtTimeOnScreenMultiplier;
    targetThought.forces.x += (targetThought.held ? 0 : (dx / centerDistance) * force)
        / nodeMassMultiplier
        * targetThoughtTimeOnScreenMultiplier;
    targetThought.forces.y += (targetThought.held ? 0 : (dy / centerDistance) * force)
        / nodeMassMultiplier
        * targetThoughtTimeOnScreenMultiplier;
}

// Adds force pulling the thought towards the center of the graph
export const gravity_pull = (thought: RenderedThought) => {
    if (thought.held) {
        return;
    }
    const dx = SIM_WIDTH / 2 - thought.position.x;
    const dy = SIM_HEIGHT / 2 - thought.position.y;
    const centerDistance = Math.sqrt(dx * dx + dy * dy);
    if (centerDistance < GRAVITY_FREE_RADIUS) {
        return;
    }

    const timeOnScreenMultiplier = thought.timeOnScreen < FRAMES_WITH_NO_INFLUENCE
        ? 0
        : Math.min(1, (thought.timeOnScreen - FRAMES_WITH_NO_INFLUENCE) / INFLUENCE_FADE_IN);

    const force = gravityForce(centerDistance) * timeOnScreenMultiplier;

    const forceX = force * (dx / centerDistance);
    const forceY = force * (dy / centerDistance);

    thought.forces.x += forceX;
    thought.forces.y += forceY;
}

const handleOutOfBounds = (thought: RenderedThought) => {
    if (!thought.position.x || !thought.position.y) {
        console.log("thought out of bounds: ", thought.id);
        thought.position.x = SIM_WIDTH / 2;
        thought.position.y = SIM_HEIGHT / 2;
    }
}

const handleOutOfBorders = (thought: RenderedThought) => {
    if (thought.position.x < thought.radius) {
        thought.position.x = thought.radius;
    }
    if (thought.position.x > SIM_WIDTH - thought.radius) {
        thought.position.x = SIM_WIDTH - thought.radius;
    }
    if (thought.position.y < thought.radius) {
        thought.position.y = thought.radius ;
    }
    if (thought.position.y > SIM_HEIGHT - thought.radius) {
        thought.position.y = SIM_HEIGHT - thought.radius;
    }
}
