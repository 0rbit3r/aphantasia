// OnlineUsersProvider.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { connectToStatsHub } from "../api/hubs/StatsHubClient";

// Create a context with a default value of null
const RealtimeStatsContext = createContext<number | null>(null);

// Create a provider component to wrap your app
export const RealtimeStatsProvider = ({ children }: { children: ReactNode }) => {
    const [number, setNumber] = useState<number | null>(null);

    useEffect(() => {
        const wsClient = connectToStatsHub((message) => setNumber(message.usersCount));

        return () => {
            wsClient.closeConnection();
        };
    }, []);

    return (
        <RealtimeStatsContext.Provider value={number}>
            {children}
        </RealtimeStatsContext.Provider>
    );
};

// Hook to allow components to access the online users count
export const useOnlineUsers = () => {
    return useContext(RealtimeStatsContext);
};
