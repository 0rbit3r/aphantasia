import { create } from 'zustand';

interface GraphControlsStore {
    animatedEdgesEnabled: boolean;
    setAnimatedEdgesEnabled: (enabled: boolean) => void;
}
export const useGraphControlsStore = create<GraphControlsStore>((set, get) => ({
    animatedEdgesEnabled: false,
    setAnimatedEdgesEnabled: (enabled: boolean) => set({ animatedEdgesEnabled: enabled })
}));