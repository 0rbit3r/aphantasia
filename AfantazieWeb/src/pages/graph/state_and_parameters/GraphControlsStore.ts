import { create } from 'zustand';
import { ExplorationMode } from '../simulation/modesManager';
import { DEFAULT_MAX_RADIUS as DEFAULT_MAX_RADIUS, MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT } from './graphParameters';

interface GraphControlsStore {

    edgeType: EdgeType;
    setEdgeType: (type: EdgeType) => void;

    gravityEnabled: boolean;
    setGravityEnabled: (enabled: boolean) => void;

    titleOnHoverEnabled: boolean;
    setTitleOnHoverEnabled: (enabled: boolean) => void;

    upFlowEnabled: boolean;
    setUpFlowEnabled: (enabled: boolean) => void;

    explorationMode: ExplorationMode;
    setExplorationMode: (mode: ExplorationMode) => void;

    showFpsEnabled: boolean;
    setShowFpsEnabled: (enabled: boolean) => void;

    noBorders: boolean;
    setNoBorders: (enabled: boolean) => void;

    disableSimulation: boolean;
    setDisableSimulation: (enabled: boolean) => void;

    thoughtsOnScreenLimit : number;
    setThoughtsOnScreenLimit: (limit: number) => void;

    titleVisibilityThresholdMultiplier: number;
    setTitleVisibilityThresholdMultiplier: (threshold: number) => void;

    edgeLengthMultiplier: number;
    setEdgeLengthMultiplier: (multiplier: number) => void;

    maxRadius: number;
    setMaxRadius: (multiplier: number) => void;

    disableFollowHighlightedThought: boolean;
    setDisableFollowHighlightedThought: (enabled: boolean) => void;
}
export const useGraphControlsStore = create<GraphControlsStore>((set, _) => ({

    edgeType: EdgeType.ARRROW,
    setEdgeType: (type: EdgeType) => set({ edgeType: type }),

    gravityEnabled: false,
    setGravityEnabled: (enabled: boolean) => set({ gravityEnabled: enabled }),

    titleOnHoverEnabled: false,
    setTitleOnHoverEnabled: (enabled: boolean) => set({ titleOnHoverEnabled: enabled }),

    upFlowEnabled: false,
    setUpFlowEnabled: (enabled: boolean) => set({ upFlowEnabled: enabled }),

    explorationMode: ExplorationMode.TEMPORAL,
    setExplorationMode: (mode) => set({ explorationMode: mode }),

    showFpsEnabled: false,
    setShowFpsEnabled: (enabled: boolean) => set({ showFpsEnabled: enabled}),

    noBorders: false,
    setNoBorders: (enabled: boolean) => set({ noBorders: enabled }),

    disableSimulation: false,
    setDisableSimulation: (enabled: boolean) => set({ disableSimulation: enabled}),
    
    thoughtsOnScreenLimit: MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT,
    setThoughtsOnScreenLimit: (limit: number) => set({ thoughtsOnScreenLimit: limit}),

    titleVisibilityThresholdMultiplier: 1,
    setTitleVisibilityThresholdMultiplier: (threshold: number) => set({ titleVisibilityThresholdMultiplier: threshold}),

    edgeLengthMultiplier: 1,
    setEdgeLengthMultiplier: (multiplier: number) => set({ edgeLengthMultiplier: multiplier }),

    maxRadius: DEFAULT_MAX_RADIUS,
    setMaxRadius: (multiplier: number) => set({ maxRadius: multiplier }),

    disableFollowHighlightedThought: false,
    setDisableFollowHighlightedThought: (enabled: boolean) => set({ disableFollowHighlightedThought: enabled}),
}));

export enum EdgeType {
    NONE = 0,
    SIMPLE = 1,
    ARRROW = 2,
    ANIMATED = 3,
    GRADIENT = 4,
}