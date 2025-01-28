import { useEffect, useRef, useState } from "react";
import { MessageResponseDto } from "../../api/dto/chat/MessageResponseDto";
import { connectToChatHub } from "../../api/hubs/ChatHubClient";
import { Localization } from "../../locales/localization";

function Chat() {
  const [messages, setMessages] = useState<MessageResponseDto[]>([]);
  const [textBox, setTextBox] = useState<string>('');
  const chatConnectionRef = useRef<{ sendMessage: (msg: string) => void } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextBox(e.target.value);
  };

  const handleSendMessage = () => {
    if (chatConnectionRef.current) {
      chatConnectionRef.current.sendMessage(textBox);
      setTextBox(''); // Clear the text box after sending
    }
  };

  useEffect(() => {
    const chatConnection = connectToChatHub((message: MessageResponseDto) => {
      setMessages((prev) => {
        const updatedMessages = [...prev, message];
        return updatedMessages;
      });
    });

    chatConnectionRef.current = chatConnection;

    return () => chatConnection.closeConnection();
  }, []);

  return (
    <div className="chat-container">
      <h1>{Localization.Chat}</h1>

      <div className="messages-container" style={{ marginBottom: '1rem' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ color: message.color }}>
            {/* Adjust field names based on the message structure */}
            <strong>{message.sender}:</strong> {message.message}
          </div>
        ))}
      </div>

      {/* Input for writing and sending messages */}
      <div className="chat-input-container">
        <textarea value={textBox} onChange={handleChange} spellCheck='false'
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevents adding a new line
            if (textBox.trim()) { // Only send if there's text
              handleSendMessage();
            }
          }
        }}></textarea>
        <button
          className="send-button button-primary"
          disabled={!textBox.trim()}
          onClick={handleSendMessage}>
          {Localization.Send}
        </button>
      </div>
    </div>
  );
}

export default Chat;
