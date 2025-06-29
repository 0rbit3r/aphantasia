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
// Limits how many thought positions are saved in the browser
export const THOUGHTS_CACHE_SIZE = 1000;

// size and positions of nodes
export const BASE_RADIUS = 60;
// Size = BASE_RADIUS * RADIUS_MULTIPLIER ^ backlinks 
export const REFERENCE_RADIUS_MULTIPLIER = 1.2;

export const DEFAULT_MAX_RADIUS = 1500;

// Radius of the initial positions circle
export const INITIAL_POSITIONS_RADIUS = 3000;

// forces simulation
export const IDEAL_LINKED_DISTANCE = 350;
// N > 1 make the connected nodes' push force weaker than the pull force and vice versa
export const EDGE_COMPRESSIBILITY_FACTOR = 0.7;

export const MAX_PULL_FORCE = 100;

export const VIRTUAL_EDGE_PULL_FORCE_MULTIPLIER = 0.05;
export const VIRTUAL_EDGE_LINKED_DIST_MULTIPLIER = 2;
// can only increase the thought (ie. first few sizes will default to 1 if set under 1)
export const IDEAL_DIST_SIZE_MULTIPLIER = 0.1;//0.01;

export const PUSH_THRESH = 7000;
export const BORDERLESS_MODE_PUSH_THRESH_MULTIPLICATOR = 5;
export const MAX_PUSH_FORCE = 100;

export const GRAVITY_FREE_RADIUS = 40000;

// When thoughts "appear" on screen they should not immediatelly start influencing other thoughts.
// This parameter is the length of the "ease-in" period for influencing other thoughts
export const INFLUENCE_FADE_IN = 250;
export const FRAMES_WITH_NO_INFLUENCE = 40;

// Slows the simulation but makes it more stable
export const MAX_MOMENTUM_DAMPENING = 2; //1.55

// These parameters are the ease-in starting value for the momentum dampening rate
export const MOMENTUM_DAMPENING_START_AT = 1.5;
export const MOMENTUM_DAMPENING_EASE_IN_FRAMES = 400;

// A movement cap of nodes to prevent them from moving too fast
export const MAX_MOVEMENT_SPEED = 200;

// Mass allows asymmetric forces based on radius
export const NODE_MASS_ON = true;
export const MAX_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER = 2;
export const MIN_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER = 0.5;
export const MAX_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER = 2;
export const MIN_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER = 0.5;

export const BASE_EDGE_WIDTH = 9;
export const BASE_EDGE_ALPHA = 0.8;

export const HIGHLIGHTED_EDGE_WIDTH = 14;
export const HIGHLIGHTED_EDGE_ALPHA = 1;

export const UNHIGHLIGHTED_EDGE_WIDTH = 8;
export const UNHIGHLIGHTED_EDGE_ALPHA = 0.7;

// nodes appearing appearance
export const NEW_NODE_INVISIBLE_FOR = 1;
export const NEW_NODE_FADE_IN_FRAMES = 5;
// Backdrop
export const BACKDROP_ZOOM_THRESHOLD_FULLY_VISIBLE = 0.05;
export const BACKDROP_ZOOM_THRESHOLD_HIDDEN = 0.1;


// zoom
export const MAX_ZOOM = 5;
export const MIN_ZOOM = 0.01;
export const INITIAL_ZOOM = 0.0129;
// Titles are visible when the zoom is bigger than this value
export const ZOOM_TEXT_VISIBLE_THRESHOLD = 0.2;
// Constants for controlling the zoop step on mouse wheel
export const ZOOM_STEP_MULTIPLICATOR_WHEEL = 1.04;
export const ZOOM_STEP_MULTIPLICATOR_BUTTONS = 1.02;

// Graph exploration - BFS depth
export const NEIGHBORHOOD_DEPTH = 2;

// FDL force functions
export const pushForce = (borderDist: number) => {

    if (borderDist === 0) {
        return 0;
    }
    if (borderDist < 0) {
        return -borderDist;
    }
    const computed = 10 / Math.sqrt(borderDist);
    return Math.min(MAX_PUSH_FORCE, computed);
};

export const pullForce = (borderDist: number, idealDistance: number) => {

    if (borderDist < 0) {
        // console.log('negative borderDist ', borderDist);
        return -MAX_PULL_FORCE;
    }

    

    const computed = 0.02 * (borderDist - idealDistance);
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
    const GRAVITY_FORCE = 0.15;

    if (centerDistance > GRAVITY_FREE_RADIUS) {
        return GRAVITY_FORCE * Math.log(centerDistance - GRAVITY_FREE_RADIUS + 1);
    }
    else {
        return 0;
    }
}

// Makes bigger thoughts less active and thus reduces jitter after loading them
export const backlinksNumberForceDivisor = (bl: number) => {
    if (bl < 3) {
        return 1;
    }
    return 1 + bl / 5;
}

// export const linksNumberForceDivisor = (source: RenderedThought, target: RenderedThought) => {
//     const maxReferences = Math.max(source.links.length, target.links.length);
//     const maxBacklinks = Math.max(source.backlinks.length, target.backlinks.length);

//     return maxBacklinks / 3 + Math.pow(maxReferences, 1.1);
// }



// MORE SET IN STONE OBSCURE PARAMETERS
export const THOUGHT_BORDER_THICKNESS = 0.5;   