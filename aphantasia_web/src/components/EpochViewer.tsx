import { For, Show, useContext } from 'solid-js';
import buttonCss from '../styles/common/buttons.module.css'
import css from '../styles/components/epochViewer.module.css';
import { StoreContext } from '../contexts/storeContext';
import { ThoughtCard } from './ThoughtCard';
import { handleForwardExploration } from '../stateManager/handleForwardExploration';
import { EpochPseudoId } from '../model/dto/epoch';

export const EpochViewer = () => {
    const store = useContext(StoreContext)!;

    return <Show when={!store.get.contextDataLoading
        && store.get.contextEpoch}>
        <div class={css.epoch_viewer_container}>
            <div class={css.info_and_pager_container}>
                <button class={buttonCss.common_button}
                    on:click={() => handleForwardExploration(store, { mode: 'epoch', focus: store.get.contextEpoch?.previousEpochId?.toString() })}
                    disabled={!store.get.contextEpoch?.previousEpochId}>
                    {"<"}</button>
                <div class={css.epoch_info_container}>
                    <div class={css.dates}>
                        {store.get.contextEpoch?.startDate} <span class={css.date_dash}>-</span> {store.get.contextEpoch?.endDate}
                    </div>
                    <div class={css.thought_count}>
                        {store.get.contextEpoch?.nextEpochId === EpochPseudoId.EPOCHLESS ? 'Latest ' : ''} {store.get.contextEpoch?.thoughts.length} thoughts
                    </div>
                </div>
                <button class={buttonCss.common_button}
                    on:click={() => handleForwardExploration(store, { mode: 'epoch', focus: store.get.contextEpoch?.nextEpochId?.toString() })}
                    disabled={!store.get.contextEpoch?.nextEpochId}>
                    {">"}</button>
            </div>
            <div class={css.scroll_container}>
                <For each={store.get.contextEpoch?.thoughts}>
                    {(t) => <ThoughtCard thought={t} />}
                </For>
            </div>
        </div>
    </Show >
}