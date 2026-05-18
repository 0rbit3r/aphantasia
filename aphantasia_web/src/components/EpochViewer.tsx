import { Show, useContext } from 'solid-js';
import css from '../styles/components/epochViewer.module.css';
import { StoreContext } from '../contexts/storeContext';
import { ThoughtCard } from './ThoughtCard';

export const EpochViewer = () => {
    const store = useContext(StoreContext)!;

    return <Show when={!store.get.contextDataLoading
        && store.get.contextEpoch}>
        <div class={css.epoch_viewer_container}>
            <div class={css.epoch_info_container}>
                <div class={css.thought_count}>
                    {store.get.contextEpoch?.thoughts.length} thoughts
                </div>
                <div class={css.dates}>
                    {store.get.contextEpoch?.startDate} <span class={css.date_dash}>-</span> {store.get.contextEpoch?.endDate}
                </div>
            </div>
            <div class={css.scroll_container}>
                {store.get.contextEpoch?.thoughts.map(t => <ThoughtCard thought={t} />)}
            </div>
        </div>
    </Show >
}