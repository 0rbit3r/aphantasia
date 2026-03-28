import { createEffect, createSignal, Show, useContext } from "solid-js"
import { StoreContext } from "../../contexts/storeContext"
import _ from '../../styles/common/controls.module.css';
import css from '../../styles/components/thoughtCreator.module.css';
import { ShapeSelector } from "./ShapeSelector";
import { ScreenOrientation } from "../../contexts/screenOrientationContext";
import { LinkAdder } from "./LinkAdder";
import { Content, LINK_REGEX } from "../thoughtViewer/Content";
import { type GraphEdge, type ProxyNode } from "grafika";
import { AuthContext } from "../../contexts/authContext";
import { type ThoughtTitle } from "../../model/dto/thought";
import type { AphantasiaStoreGetAndSet } from "../../stateManager/aphantasiaStore";
import { handleForwardExploration } from "../../stateManager/handleForwardExploration";
import { welcome_data } from "../../stateManager/modes/welcome/welcomeData";
import { getCurrentExpState } from "../../stateManager/getCurrentExpState";
import { api_postCreateThought } from "../../api/postCreateThought";


export const ThoughtCreator = () => {
    const store = useContext(StoreContext)!;
    const scrOrientation = useContext(ScreenOrientation);
    const authContext = useContext(AuthContext);

    const graphNode = store.get.grafika.getData().nodes.find(n => n.id === 'created_thought')!;
    if (graphNode === undefined) { console.error('created graph node not found.'); return; }


    const [previewMode, setPreviewMode] = createSignal(false);

    // fetch thoughts and modify links array based on content
    createEffect(() => {
        const foundIds: string[] = [];
        const parts = store.get.contextThoughtInMaking?.content.split(LINK_REGEX) ?? [];
        for (let i = 0; i < parts.length; i += 3) {
            if (parts[i + 1]) foundIds.push(parts[i + 1]);
        }

        const linkThoughts: ThoughtTitle[] = [];
        foundIds.forEach(thoughtId => {
            const nodeInGraph = store.get.grafika.getData().nodes.find(node => node.id === thoughtId)
            if (nodeInGraph) {
                linkThoughts.push({ id: nodeInGraph.id, color: nodeInGraph.color, shape: nodeInGraph.shape, title: nodeInGraph.text })
            }
            else {
                // in normal create, fetch from api
                store.set('notificationMessages', prev => [...prev, { color: 'yellow', text: 'Thought not found\n' + thoughtId }])
            }
        });

        const edgesToDelete = store.get.grafika.getData().edges.filter(e => e.targetId === 'created_thought' && !linkThoughts?.find(l => l.id === e.sourceId));
        const edgesToAdd = linkThoughts?.filter(link => store.get.grafika.getData().edges.filter(e => e.sourceId === link.id && e.targetId === 'created_thought')?.length === 0)
            .map<GraphEdge>(link => ({ sourceId: link.id, targetId: 'created_thought', color: link.color, length: 300 }));// length should not need to be specified - todo fix grafika

        store.get.grafika.addData({ edges: edgesToAdd });
        store.get.grafika.removeData({ edges: edgesToDelete });

        console.log(foundIds);
        console.log(linkThoughts)
        console.log(edgesToAdd)
        console.log(store.get.grafika.getData())

        store.set('contextThoughtInMaking', 'links', prev => edgesToAdd?.map<ThoughtTitle>(e => ({ color: e.color ?? '#aaaaaa', id: e.sourceId, title: '', shape: 0 })).concat(prev) ?? []);
    })

    const linkColors = () => new Map(store.get.contextThoughtInMaking?.links?.map(l => [l.id, l.color]));

    return <div classList={{
        [css.thought_creator_container]: true,
        [css.thought_creator_container_land]: scrOrientation.isLandscape()
    }}>
        <Show when={store.get.contextThoughtInMaking && store.get.contextThoughtInMaking.linkSelectionState === 'hidden' && !previewMode()}>
            <div class={css.title_and_shape_cont}>
                <textarea placeholder='Title'
                    class={css.title_input}
                    value={store.get.contextThoughtInMaking?.title ?? ''}
                    on:input={e => {
                        store.set('contextThoughtInMaking', 'title', e.target.value);
                        if (graphNode) graphNode.text = e.target.value;
                    }} />
                <ShapeSelector shapeSelected={shape => graphNode && (graphNode.shape = shape)}></ShapeSelector>
            </div>
            <textarea placeholder='Content'
                class={css.content_input}
                value={store.get.contextThoughtInMaking?.content ?? ''}
                on:input={e => store.set('contextThoughtInMaking', 'content', e.target.value)} />
            <div class={css.button_bar}>
                <button class={css.button_bar_button}
                    on:click={() => store.set('contextThoughtInMaking', { ...store.get.contextThoughtInMaking, linkSelectionState: 'link-menu' })}>
                    Link</button>
                <button class={css.button_bar_button}
                    on:click={() => setPreviewMode(true)}>
                    Preview</button>
            </div>
        </Show>
        <Show when={previewMode()}>
            <div class={css.preview_content_container}>
                <Content text={store.get.contextThoughtInMaking?.content ?? ''}
                    thoughtColors={linkColors()} color={store.get.contextThoughtInMaking?.color} />
            </div>
            <div class={css.button_bar}>
                <button class={css.button_bar_button}
                    style={{
                        color: authContext.getAuthorizedUser()?.color || "white"
                    }}
                    on:click={() => getCurrentExpState(store).mode === 'welcome_create'
                        ? handleThoughtCreation_Welcome(store, graphNode)
                        : handleThoughtCreation_forReal(store, graphNode)}>
                    Publish</button>
                <button class={css.button_bar_button}
                    on:click={() => setPreviewMode(false)}>
                    Edit</button>
            </div>
        </Show>
        <Show when={store.get.contextThoughtInMaking?.linkSelectionState !== 'hidden'}>
            <LinkAdder onLinkSelected={(thought, text) => {
                store.set('contextThoughtInMaking', 'content', (store.get.contextThoughtInMaking?.content ?? '') + `[${thought.id}][${text}]`);
            }}></LinkAdder>
        </Show>
    </div>
}

let userCreatedId = 0;

const handleThoughtCreation_Welcome = (store: AphantasiaStoreGetAndSet, graphNode: ProxyNode) => {

    const newData = {
        nodes: [{
            id: userCreatedId.toString(), color: graphNode.color, x: graphNode.x, y: graphNode.y,
            shape: graphNode.shape, text: graphNode.text
        }], edges: (Array.from(graphNode.inEdges).map(e => ({ sourceId: e.sourceId, targetId: userCreatedId.toString() })))
    };

    console.log(newData)

    store.get.grafika.addData(newData);

    store.get.grafika.removeData({ nodes: [{ id: graphNode.id }] })

    welcome_data.nodes.push({ ...newData.nodes.map(n => ({ ...n, content: store.get.contextThoughtInMaking?.content ?? '', authorName: 'Explorling', date: 'now' }))[0] })

    store.set('contextThoughtInMaking', undefined);

    handleForwardExploration(store, { mode: "welcome", focus: userCreatedId.toString() });

    userCreatedId++;
}

const handleThoughtCreation_forReal = (store: AphantasiaStoreGetAndSet, graphNode: ProxyNode) => {
    const newThought = store.get.contextThoughtInMaking;
    // console.log("foo")
    // console.log(newThought);
    // console.log(graphNode.inEdges);

    // todo - it seems that some edges might be dplicated throughout the thought creation process

    if (!newThought) { console.error("No thoughtInMaking object found in store - cannot create thought") }


    api_postCreateThought(newThought?.title ?? "", newThought?.content ?? "", newThought?.shape ?? 0)
        .then(newId => {
            const newData = {
                nodes: [{
                    id: newId, color: graphNode.color, x: graphNode.x, y: graphNode.y,
                    shape: graphNode.shape, text: graphNode.text
                }],
                edges: (Array.from(graphNode.inEdges).map(e => ({ sourceId: e.sourceId, targetId: newId })))
            };


            store.get.grafika.removeData({ nodes: [{ id: graphNode.id }] })
            store.get.grafika.addData(newData);

            handleForwardExploration(store, { mode: "explore", focus: newId });

            store.set('contextThoughtInMaking', undefined);
        }).catch(e => {
            store.set('notificationMessages', [...store.get.notificationMessages, { color: 'red', text: e }])
        })
}