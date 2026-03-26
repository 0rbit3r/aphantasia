import { Show, useContext } from 'solid-js';
import css from '../styles/components/epochViewer.module.css';
import { ScreenOrientation } from '../contexts/screenOrientationContext';
import { StoreContext } from '../contexts/storeContext';

export const EpochViewer = () => {
    const scrOrientation = useContext(ScreenOrientation)!;
    const store = useContext(StoreContext)!;

    const getEpochName = (id: number | undefined) =>
        id === -1 ? 'Latest epoch' : `Epoch ${id}`

    console.log(typeof store.get.contextEpoch?.id, JSON.stringify(store.get.contextEpoch?.id))

    return <Show when={!store.get.contextDataLoading
        && store.get.contextEpoch}>
        <div classList={{
            [css.epoch_viewer_container]: true,
            [css.epoch_viewer_container_land]: scrOrientation.isLandscape()
        }}>
            <h1>{getEpochName(store.get.contextEpoch?.id)}</h1>
            <br />
            {store.get.contextEpoch?.startDate} - {store.get.contextEpoch?.endDate}
            <br />
            {store.get.contextEpoch?.thoughts.length} thoughts
        </div >
    </Show>
}