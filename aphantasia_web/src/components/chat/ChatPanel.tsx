import { createSignal, useContext, createEffect, Show } from 'solid-js';
import { StoreContext } from '../../contexts/storeContext';
import { getCurrentExpState } from '../../stateManager/getCurrentExpState';
import { sendChatMessage, deleteChatMessage } from '../../api/chatConnection';
import { SymbolButton } from '../SymbolButton';
import trashIcon from '../../assets/icons/trash.png';
import '../../styles/common/htmlControls.css';
import css from '../../styles/components/chatPanel.module.css';
import css_buttons from '../../styles/common/buttons.module.css';

const MAX_CHAT_LENGTH = 300;

export function ChatPanel() {
    const store = useContext(StoreContext)!;
    const [content, setContent] = createSignal('');
    const [deleteTap, setDeleteTap] = createSignal(0);

    const focusedMessage = () => {
        const focusId = getCurrentExpState(store).focus;
        return focusId ? store.get.contextChatMessages?.find(m => m.id === focusId) : undefined;
    };

    const isOwnMessage = () => focusedMessage()?.authorId === store.get.user?.id;

    createEffect(() => {
        getCurrentExpState(store).focus;
        setDeleteTap(0);
    });

    const handleSend = async () => {
        const viewport = store.get.grafika.getViewport();
        const text = content().trim();
        if (!text || text.length > MAX_CHAT_LENGTH) return;
        const parentId = getCurrentExpState(store).focus ?? null;
        await sendChatMessage(text, parentId, viewport.position.x, viewport.position.y - 20);
        setContent('');
    };

    const handleDelete = async () => {
        const msg = focusedMessage();
        if (!msg) return;
        if (deleteTap() === 0) {
            store.set('screenMessages', prev => [...prev, { color: 'yellow', text: 'Tap again to delete this message.' }]);
            setDeleteTap(1);
        } else {
            await deleteChatMessage(msg.id);
            setDeleteTap(0);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSend();
        }
    };

    const contextLabel = () => {
        const msg = focusedMessage();
        if (!msg) return 'New message';
        const preview = msg.content.length > 40 ? msg.content.slice(0, 40) + '...' : msg.content;
        return `Replying to "${preview}"`;
    };

    return (
        <div class={css.chat_panel_container}>
            <div class={css.context_bar}>
                <span class={css.context_label}>{contextLabel()}</span>
                <Show when={isOwnMessage()}>
                    <div class={css.context_action_button}>
                        <SymbolButton action={handleDelete} img={trashIcon} />
                    </div>
                </Show>
            </div>
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
