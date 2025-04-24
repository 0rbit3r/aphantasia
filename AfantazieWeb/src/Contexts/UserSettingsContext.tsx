import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useGraphStore } from "../pages/graph/state_and_parameters/GraphStore";
import { fetchUserSettings } from "../api/UserSettingsApiClient";

export const UserSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const authentication = useAuth();
    const setUserSettings = useGraphStore(state => state.setUserSettings);

    const fetchAndSetUserSettings = async () => {
        const response = await fetchUserSettings();
        if (response.ok) {
            setUserSettings(response.data!);
        }
    }

    useEffect(() => {
        fetchAndSetUserSettings();
    }, [authentication]);

    useEffect(() => {
        fetchAndSetUserSettings();
    }, []);
        

    return <>{children}</>;
};