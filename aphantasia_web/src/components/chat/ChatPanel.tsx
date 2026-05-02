import { createSignal, useContext } from 'solid-js';
import { StoreContext } from '../../contexts/storeContext';
import { getCurrentExpState } from '../../stateManager/getCurrentExpState';
import { sendChatMessage } from '../../api/chatConnection';
import '../../styles/common/htmlControls.css';
import css from '../../styles/components/chatPanel.module.css';
import css_buttons from '../../styles/common/buttons.module.css';

const MAX_CHAT_LENGTH = 300;

export function ChatPanel() {
    const store = useContext(StoreContext)!;
    const [content, setContent] = createSignal('');

    const handleSend = async () => {
        const viewport = store.get.grafika.getViewport();
        const text = content().trim();
        if (!text || text.length > MAX_CHAT_LENGTH) return;
        const parentId = getCurrentExpState(store).focus ?? null;
        await sendChatMessage(text, parentId, viewport.position.x, viewport.position.y - 20);
        setContent('');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div class={css.chat_panel_container}>
            <textarea
                class={css.message_input}
                placeholder="Write a message... (Ctrl+Enter to send)"
                value={content()}
                onInput={e => setContent(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
            />
            <div class={css.char_counter}>{content().length} / {MAX_CHAT_LENGTH}</div>
            <div class={css.button_bar}>
                <button
                    class={`${css.button_bar_button} ${css_buttons.common_button}`}
                    disabled={content().length > MAX_CHAT_LENGTH}
                    onClick={handleSend}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
