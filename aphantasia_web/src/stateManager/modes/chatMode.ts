import { NodeShape, type GraphNode } from 'grafika';
import type { ModeContract } from './modeContract';
import type { ChatMessage } from '../../model/dto/chatMessage';
import { ChatPanel } from '../../components/chat/ChatPanel';
import chatIcon from '../../assets/icons/chat.svg';
import {
    buildChatConnection,
    onInitialMessages,
    onReceiveMessage,
    onMessageDeleted,
    stopChatConnection
} from '../../api/chatConnection';
import { handleForwardExploration } from '../handleForwardExploration';
import { getCurrentExpState } from '../getCurrentExpState';
import type { AphantasiaStoreGetAndSet } from '../aphantasiaStore';

function messageToNode(msg: ChatMessage) {
    return {
        id: msg.id,
        text: `${msg.content}\n\n   ~${msg.authorUsername}`,
        color: msg.authorColor,
        shape: NodeShape.TextOnly,
        x: msg.x || 0,
        y: msg.y || 0
    };
}

function edgesFromMessages(messages: ChatMessage[]) {
    return messages
        .filter(m => m.parentId !== null)
        .map(m => ({ sourceId: m.parentId!, targetId: m.id }));
}

function loadMessages(store: AphantasiaStoreGetAndSet, messages: ChatMessage[]) {
    store.set('contextChatMessages', messages);
    store.get.grafika.addData({
        nodes: messages.map(messageToNode),
        edges: edgesFromMessages(messages),
    });
}

export const ChatMode: ModeContract = {
    grafikaInitType: 'chat',
    iconModeBar: chatIcon,
    iconMenu: chatIcon,
    contextBanner: {
        text: (_store) => 'Chat',
        color: (_store) => '#cccccc',
        onClick: (store) => store.get.grafika.focusOn('all'),
    },

    content: () => ChatPanel,

    initialize: (store) => {
        store.get.grafika.removeData();
        const conn = buildChatConnection();

        onInitialMessages((messages) => {
            loadMessages(store, messages);
            store.get.grafika.focusOn('all', 0.2);
        });

        onReceiveMessage((message) => {
            store.set('contextChatMessages', prev => [...(prev ?? []), message]);
            store.get.grafika.addData({
                nodes: [messageToNode(message)],
                edges: message.parentId ? [{ sourceId: message.parentId, targetId: message.id }] : [],
            });
        });

        conn.start().catch(e => console.error('Chat connection failed:', e));

        onMessageDeleted((messageId) => {
            store.set('contextChatMessages', prev => prev?.filter(m => m.id !== messageId) ?? []);
            store.get.grafika.removeData({ nodes: [{ id: messageId }] });
            if (getCurrentExpState(store).focus === messageId)
                handleForwardExploration(store, { mode: 'chat', focus: undefined });
        });

        store.get.grafika.interactionEvents.on('nodeClicked', (node: any) => {
            handleForwardExploration(store, { mode: 'chat', focus: node.id });
        });

        store.get.grafika.interactionEvents.on('viewportMoved', () => {
            store.get.grafika.focusOn(null);
        });
        store.get.grafika.interactionEvents.on('backgroundClicked', () => {
            if (getCurrentExpState(store).focus !== undefined)
                handleForwardExploration(store, { mode: 'chat', focus: undefined });
            else if (store.get.splitUiLayout !== 'half')
                store.set('splitUiLayout', 'half');
            else
                store.set('splitUiLayout', 'graph');
        });

        store.set('splitUiLayout', 'graph');
    },

    hangleFocusChange: (store, focusId) => {
        const data = store.get.grafika.getData();

        const prevFocus = getCurrentExpState(store).focus;
        if (prevFocus) {
            const prevNode = data.nodes.find((n: GraphNode) => n.id === prevFocus);
            if (prevNode) prevNode.shape = NodeShape.TextOnly;
        }

        if (!focusId) return;

        const focused = data.nodes.find((n: GraphNode) => n.id === focusId);
        if (focused) {
            focused.shape = NodeShape.TextOnlyHighlighted;
            store.get.grafika.focusOn(focused, 0.7);
        }

        store.set('splitUiLayout', 'half');
    },

    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();
        store.get.grafika.removeData();
        store.set('contextChatMessages', undefined);
        stopChatConnection().catch(() => { });
    }
};
