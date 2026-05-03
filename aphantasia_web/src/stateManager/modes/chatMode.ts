import { NodeShape, type GraphNode } from 'grafika';
import type { ModeContract } from './modeContract';
import type { ChatMessage } from '../../model/dto/chatMessage';
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
        text: `[${msg.authorUsername}]\n\n${msg.content}`,
        color: msg.authorColor,
        shape: NodeShape.TextBox,
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
                handleForwardExploration(store, { mode: 'chat', focus: undefined })
        });

        store.set('splitUiLayout', 'graph');
    },

    hangleFocusChange: (store, focusId) => {
        const data = store.get.grafika.getData();

        const prevFocus = getCurrentExpState(store).focus;
        if (prevFocus) {
            const prevNode = data.nodes.find((n: GraphNode) => n.id === prevFocus);
            if (prevNode) prevNode.color = store.get.contextChatMessages?.find(c => c.id === prevNode.id)?.authorColor ?? '#eeeeee';
        }

        if (!focusId) return;

        const focused = data.nodes.find((n: GraphNode) => n.id === focusId);
        if (focused) {
            focused.color = '#eeeeee';
            store.get.grafika.focusOn(focused, 0.4);
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
