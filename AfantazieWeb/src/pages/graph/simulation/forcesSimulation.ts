import { useGraphStore } from "../state_and_parameters/GraphStore";
import { pullForce, backlinksNumberForceDivisor, pushForce, PUSH_THRESH, MAX_MOMENTUM_DAMPENING, FRAMES_WITH_OVERLAP, SLOW_SIM_EVERY_N_FRAMES, NODE_MASS_ON, MAX_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER, MIN_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER, SIM_HEIGHT, SIM_WIDTH, FRAMES_WITH_LESS_INFLUENCE, MAX_MOVEMENT_SPEED, MAX_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER, MIN_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER, GRAVITY_FREE_RADIUS, gravityForce, MOMENTUM_DAMPENING_EASE_IN_FRAMES, MOMENTUM_DAMPENING_START_AT, GRAVITY_ON } from "../state_and_parameters/graphParameters";
import { RenderedThought } from "../model/renderedThought";
import { getThoughtsOnScreen } from "./thoughtsProvider";

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
    return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
}

export const simulate_one_frame = () => {
    const onScreenThoughts = getThoughtsOnScreen();

    for (let i = 0; i < onScreenThoughts.length; i++) {
        const thought = onScreenThoughts[i];
        handleOutOfBounds(thought);

        for (let j = 0; j < i; j++) {
            const otherThought = onScreenThoughts[j];
            if (thought.id > otherThought.id) { //This relies on the fact that thoughts can only reference older ones... and sorted array...
                const borderDistance = get_border_distance(thought, otherThought);

                if (thought.links.includes(otherThought.id)) {
                    pull_or_push_connected_to_ideal_distance(thought, otherThought);
                } else if (borderDistance < PUSH_THRESH) {
                    push_unconnected(thought, otherThought);
                }
            }
        }
        if (GRAVITY_ON){
            gravity_pull(thought);
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

export const pull_or_push_connected_to_ideal_distance = (sourceThought: RenderedThought, targetThought: RenderedThought) => {
    const dx = targetThought.position.x - sourceThought.position.x;
    const dy = targetThought.position.y - sourceThought.position.y;
    const centerDistance = get_center_distance(sourceThought, targetThought);
    const borderDistance = get_border_distance(sourceThought, targetThought);
    // const borderDistance = get_border_distance(sourceThought, targetThought);
    // if (borderDistance < 0) {
    //     return;
    // }
    const force = pullForce(borderDistance) / backlinksNumberForceDivisor(targetThought.backlinks.length)

    const nodeMassMultiplier = NODE_MASS_ON
        ? Math.min(Math.max(targetThought.radius / sourceThought.radius, MIN_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER), MAX_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER)
        : 1;

    const sourceThoughtTimeOnScreenMultiplier = Math.min(targetThought.timeOnScreen, FRAMES_WITH_LESS_INFLUENCE) / FRAMES_WITH_LESS_INFLUENCE;
    const targetThoughtTimeOnScreenMultiplier = Math.min(sourceThought.timeOnScreen, FRAMES_WITH_LESS_INFLUENCE) / FRAMES_WITH_LESS_INFLUENCE;


    // get the x / y component of the force vector and multiply by the scalar compponent;
    sourceThought.forces.x += (sourceThought.held ? 0 : (dx / centerDistance) * force)
        * nodeMassMultiplier
        * sourceThoughtTimeOnScreenMultiplier;
    sourceThought.forces.y += (sourceThought.held ? 0 : (dy / centerDistance) * force)
        * nodeMassMultiplier
        * sourceThoughtTimeOnScreenMultiplier;
    targetThought.forces.x -= (targetThought.held ? 0 : (dx / centerDistance) * force)
        / nodeMassMultiplier
        * targetThoughtTimeOnScreenMultiplier;
    targetThought.forces.y -= (targetThought.held ? 0 : (dy / centerDistance) * force)
        / nodeMassMultiplier
        * targetThoughtTimeOnScreenMultiplier;
}

export const push_unconnected = (sourceThought: RenderedThought, targetThought: RenderedThought) => {
    const dx = targetThought.position.x - sourceThought.position.x;
    const dy = targetThought.position.y - sourceThought.position.y;
    const centerDistance = get_center_distance(sourceThought, targetThought);
    const borderDistance = get_border_distance(sourceThought, targetThought);

    // const force = borderDistance < 0 && useGraphStore.getState().frame > FRAMES_WITH_OVERLAP
    //     ? -borderDistance
    //     : pushForce(centerDistance);
    // const force = pushForce(centerDistance);

    const force = useGraphStore.getState().frame > FRAMES_WITH_OVERLAP
        ? pushForce(borderDistance)
        : 0;

    const nodeMassMultiplier = NODE_MASS_ON
        ? Math.min(Math.max(targetThought.radius / sourceThought.radius, MIN_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER), MAX_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER)
        : 1;
    // if (sourceThought.id === 3){
    //     console.log("source 3: ", nodeMassMultiplier);
    // }
    // if (targetThought.id === 3){
    //     console.log("target 3: ", nodeMassMultiplier);
    // }

    const sourceThoughtTimeOnScreenMultiplier = Math.min(targetThought.timeOnScreen, FRAMES_WITH_LESS_INFLUENCE) / FRAMES_WITH_LESS_INFLUENCE;
    const targetThoughtTimeOnScreenMultiplier = Math.min(sourceThought.timeOnScreen, FRAMES_WITH_LESS_INFLUENCE) / FRAMES_WITH_LESS_INFLUENCE;

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
export const gravity_pull: (thought: RenderedThought) => void = (thought: RenderedThought) => {
    const dx = SIM_WIDTH / 2 - thought.position.x;
    const dy = SIM_HEIGHT / 2 - thought.position.y;
    const centerDistance = Math.sqrt(dx * dx + dy * dy);
    if (centerDistance < GRAVITY_FREE_RADIUS) {
        return;
    }

    const force = gravityForce(centerDistance);

    const forceX = force * (dx / centerDistance);
    const forceY = force * (dy / centerDistance);

    thought.forces.x += forceX;
    thought.forces.y += forceY;
}

const handleOutOfBounds = (thought: RenderedThought) => {
    if (thought.position.x < thought.radius * 2.5) {
        thought.position.x = thought.radius * 2.5;
    }
    if (thought.position.x > SIM_WIDTH - thought.radius * 2.5) {
        thought.position.x = SIM_WIDTH - thought.radius * 2.5;
    }
    if (thought.position.y < thought.radius * 2.5) {
        thought.position.y = thought.radius * 2.5;
    }
    if (thought.position.y > SIM_HEIGHT - thought.radius * 2.5) {
        thought.position.y = SIM_HEIGHT - thought.radius * 2.5;
    }
    if (!thought.position.x || !thought.position.y) {
        console.log("thought out of bounds: ", thought.id);
        thought.position.x = SIM_WIDTH / 2;
        thought.position.y = SIM_HEIGHT / 2;
    }
}