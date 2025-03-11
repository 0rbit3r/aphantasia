import { useEffect } from "react";
import { useUserSettingsStore } from "../pages/graph/state_and_parameters/UserSettingsStore";
import { useAuth } from "./AuthContext";

export const UserSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const fetchAndSetUserSettings = useUserSettingsStore((state) => state.fetchAndSetUserSettings);
    const authentication = useAuth();

    useEffect(() => {
        fetchAndSetUserSettings();
    }, [authentication]);

    useEffect(() => {
        fetchAndSetUserSettings();
    }, []);
        

    return <>{children}</>;
};