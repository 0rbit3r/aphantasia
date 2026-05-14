import { Show, useContext } from "solid-js";
import { StoreContext } from "../contexts/storeContext";

import css from '../styles/components/profileViewer.module.css';
import { Content } from "./thoughtViewer/Content";
import { ThoughtCard } from "./ThoughtCard";

export const ProfileViewer = () => {
    const store = useContext(StoreContext)!;


    return <div class={css.profile_viewer_container}>
        <Show when={!store.get.contextDataLoading
            && store.get.contextThought}>
            <div class={css.user_info_container}>
                <div class={css.thoughts_num}>{store.get.contextProfile?.thoughts
                    .filter(t => t.author.id === store.get.contextProfile?.user.id).length} thoughts</div>
                <div class={css.date_joined}>{store.get.contextProfile?.user.dateJoined}</div>
            </div>
            <div class={css.user_bio}>
                <Content text={store.get.contextProfile?.user.bio ?? ''}
                    color={store.get.contextProfile?.user.color} />
            </div>

            <div class={css.scroll_container}>
                {store.get.contextProfile?.thoughts
                    .filter(t => t.author.id === store.get.contextProfile?.user.id)
                    .map(t => <ThoughtCard thought={t} />)}
            </div>
            <div class={css.action_buttons_bar}>

            </div>
        </Show>
    </div>
}