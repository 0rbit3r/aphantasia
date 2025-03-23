import { create } from 'zustand';

interface GraphControlsStore {

    animatedEdgesEnabled: boolean;
    setAnimatedEdgesEnabled: (enabled: boolean) => void;

    gravityEnabled: boolean;
    setGravityEnabled: (enabled: boolean) => void;

    neighborhoodEnabled: boolean;
    setNeighborhoodEnabled: (enabled: boolean) => void;

    titleOnHoverEnabled: boolean;
    setTitleOnHoverEnabled: (enabled: boolean) => void;

    enhancedArrowheadsEnabled: boolean;
    setEnhancedArrowheadsEnabled: (enabled: boolean) => void;
}
export const useGraphControlsStore = create<GraphControlsStore>((set, _) => ({
    animatedEdgesEnabled: false,
    setAnimatedEdgesEnabled: (enabled: boolean) => set({ animatedEdgesEnabled: enabled }),

    gravityEnabled: false,
    setGravityEnabled: (enabled: boolean) => set({ gravityEnabled: enabled }),

    neighborhoodEnabled: false,
    setNeighborhoodEnabled: (enabled: boolean) => set({ neighborhoodEnabled: enabled}),

    titleOnHoverEnabled: false,
    setTitleOnHoverEnabled: (enabled: boolean) => set({ titleOnHoverEnabled: enabled}),

    enhancedArrowheadsEnabled: false,
    setEnhancedArrowheadsEnabled: (enabled: boolean) => set({ enhancedArrowheadsEnabled: enabled}),
}));