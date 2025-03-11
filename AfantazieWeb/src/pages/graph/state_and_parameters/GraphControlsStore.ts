import { create } from 'zustand';

interface GraphControlsStore {
    

    animatedEdgesEnabled: boolean;
    setAnimatedEdgesEnabled: (enabled: boolean) => void;

    gravityEnabled: boolean;
    setGravityEnabled: (enabled: boolean) => void;

    neighborhoodEnabled: boolean;
    setNeighborhoodEnabled: (enabled: boolean) => void;
}
export const useGraphControlsStore = create<GraphControlsStore>((set, get) => ({
    animatedEdgesEnabled: false,
    setAnimatedEdgesEnabled: (enabled: boolean) => set({ animatedEdgesEnabled: enabled }),

    gravityEnabled: false,
    setGravityEnabled: (enabled: boolean) => set({ gravityEnabled: enabled }),

    neighborhoodEnabled: false,
    setNeighborhoodEnabled: (enabled: boolean) => set({ neighborhoodEnabled: enabled})
}));