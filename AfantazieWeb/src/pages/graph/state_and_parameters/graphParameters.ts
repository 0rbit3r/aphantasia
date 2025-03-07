import { RenderedThought } from "../model/renderedThought";

export const MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT = 100;

// simulation container
export const SIM_WIDTH = 30000;
export const SIM_HEIGHT = 30000;

// Frames are reset every use interaction

// How long to run the simulation after the interaction
export const SIMULATION_FRAMES = 10000;
// Halves the simulation speed every vvv this many steps
export const SLOW_SIM_EVERY_N_FRAMES = 3000;
// How many frames to allow the nodes to overlap
export const FRAMES_WITH_OVERLAP = 0;

// Cache thought positions every N frames
export const THOUGHTS_CACHE_FRAME = 1000;

// size and positions of nodes
export const BASE_RADIUS = 50;
// Size = BASE_RADIUS * RADIUS_MULTIPLIER ^ backlinks 
export const REFERENCE_RADIUS_MULTIPLIER = 1.2;

export const MAX_RADIUS = 700;

// Radius of the initial positions circle
export const INITIAL_POSITIONS_RADIUS = 3000;

// forces simulation
export const IDEAL_LINKED_DISTANCE = 300;
// N > 1 make the connected nodes' push force weaker than the pull force and vice versa
export const EDGE_COMPRESSIBILITY_FACTOR = 1.05;

export const MAX_PULL_FORCE = 100;

export const PUSH_THRESH = 1250;
export const MAX_PUSH_FORCE = 100;

export const GRAVITY_ON = false;
export const GRAVITY_FREE_RADIUS = 1600;

// When thoughts "appear" on screen they should not immediatelly start influenxcing other thoughts.
// This parameter is the length of the "ease-in" period for influencing other thoughts
export const FRAMES_WITH_LESS_INFLUENCE = 100;

// Slows the simulation but makes it more stable
export const MAX_MOMENTUM_DAMPENING = 1.8; //1.55

// These parameters are the ease-in starting value for the momentum dampening rate
export const MOMENTUM_DAMPENING_START_AT = 1.4;
export const MOMENTUM_DAMPENING_EASE_IN_FRAMES = 400;

// A movement cap of nodes to prevent them from moving too fast
export const MAX_MOVEMENT_SPEED = 50;

// Mass allows asymmetric forces based on radius
export const NODE_MASS_ON = true;
export const MAX_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER = 1.1;
export const MIN_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER = 0.9;
export const MAX_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER = 10;
export const MIN_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER = 0.9;

//edges appearance
export const ANIMATED_EDGES = true;

export const BASE_EDGE_WIDTH = 9;
export const BASE_EDGE_ALPHA = 0.8;

export const HIGHLIGHTED_EDGE_WIDTH = 14;
export const HIGHLIGHTED_EDGE_ALPHA = 1;

export const UNHIGHLIGHTED_EDGE_WIDTH = 8;
export const UNHIGHLIGHTED_EDGE_ALPHA = 0.7;

// zoom
export const MAX_ZOOM = 5;
export const MIN_ZOOM = 0.01;
export const INITIAL_ZOOM = 0.1;
// Titles are visible when the zoom is bigger than this value
export const ZOOM_TEXT_VISIBLE_THRESHOLD = 0.2;
// Constants for controlling the zoop step on mouse wheel
export const ZOOM_STEP_MULTIPLICATOR_WHEEL = 1.04;
export const ZOOM_STEP_MULTIPLICATOR_BUTTONS = 1.02;

// Graph exploration - BFS depth
export const NEIGHBORHOOD_DEPTH = 3;

// FDL force functions
export const pushForce = (borderDist: number) => {

    if (borderDist === 0) {
        return 0;
    }
    if (borderDist < 0) {
        return -borderDist;
    }
    const computed = 5 / Math.sqrt(borderDist);
    return Math.min(MAX_PUSH_FORCE, computed);
};

export const pullForce = (borderDist: number) => {

    if (borderDist <= 0) {
        return borderDist; // todo when borderDist is negative the nodes tend to "oscilate"
    }

    const computed = 0.01 * (borderDist - IDEAL_LINKED_DISTANCE);
    const limited = computed > MAX_PULL_FORCE
        ? MAX_PULL_FORCE
        : computed < -MAX_PULL_FORCE
            ? -MAX_PULL_FORCE
            : computed;

    const final = Math.sign(limited) === -1
        ? limited / EDGE_COMPRESSIBILITY_FACTOR
        : limited;

    return final;
};


export const gravityForce = (centerDistance: number) => {
    const GRAVITY_FORCE = 0.00005;

    if (centerDistance > GRAVITY_FREE_RADIUS) {
        return GRAVITY_FORCE * (centerDistance - GRAVITY_FREE_RADIUS);
    }
    else {
        return 0;
    }
}

// Makes bigger thoughts less active and thus reduces jitter after loading them
export const backlinksNumberForceDivisor = (bl: number) => bl < 2 ? 1 : bl / 3;

export const linksNumberForceDivisor = (source: RenderedThought, target: RenderedThought) => {
    const maxReferences = Math.max(source.links.length, target.links.length);
    const maxBacklinks = Math.max(source.backlinks.length, target.backlinks.length);

    return maxBacklinks / 3 + Math.pow(maxReferences, 1.1);
}

