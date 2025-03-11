import { create } from "zustand";
import { userSettingsDto } from "../../../api/dto/UserSettingsDto";
import { fetchUserSettings } from "../../../api/UserSettingsApiClient";

interface UserSettingsStore {
    userSettings: userSettingsDto | null;
    setUserSettings: (settings: userSettingsDto) => void;
    fetchAndSetUserSettings: () => Promise<void>;
}

export const useUserSettingsStore = create<UserSettingsStore>((set) => ({
    userSettings: null,
    setUserSettings: (settings: userSettingsDto) => set({ userSettings: settings }),
    
    fetchAndSetUserSettings: async () => {
        const response = await fetchUserSettings();
        if (response.ok) {
            set({ userSettings: response.data! });
        }
    }
}));