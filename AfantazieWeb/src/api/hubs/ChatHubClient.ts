import * as signalR from "@microsoft/signalr";
import { MessageResponseDto } from "../dto/chat/MessageResponseDto";


export function connectToChatHub(handleMessage: (message: MessageResponseDto) => void) {
    
    const hubUrl = import.meta.env.VITE_URL + import.meta.env.VITE_HUB_PATH + "/chat";

    const token = localStorage.getItem('token');

    // console.log("connecting to hubUrl: ", hubUrl);
    let connection = new signalR.HubConnectionBuilder()
        .configureLogging(signalR.LogLevel.None)
        // .configureLogging(signalR.LogLevel.Debug)
        .withUrl(hubUrl, {
            accessTokenFactory: () => token || "",
            withCredentials: false,
            // transport: signalR.HttpTransportType.LongPolling ,// todo: removing this might expand compatibility
        })
        .build();

    connection.on("ReceiveMessage", data => {
        handleMessage(data as MessageResponseDto);
    });

    connection.start();

    function sendMessage(message: string) {
        connection.send("SendMessage", message);
    }

    function closeConnection() {
        connection.stop();
    }

    return {
        sendMessage,
        closeConnection,
    };
}