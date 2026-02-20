import css from '../styles/components/modeMenu.module.css'
import { SymbolButton } from './SymbolButton'
import homeIcon from '../assets/icons/home.svg';
import epochIcon from '../assets/icons/big_graph.png'; 
import bellIcon from '../assets/icons/bell.png';
import bookmarksIcon from '../assets/icons/bookmarks.png';
import conceptsIcon from '../assets/icons/concepts.png';
import settingsIcon from '../assets/icons/settings.png';
import chatIcon from '../assets/icons/chat.png';
import createIcon from '../assets/icons/create_thought.png';
import dieIcon from '../assets/icons/die.png';

export const ModeMenu = () => {
    return <div class={css.mode_menu_container}>
        <div class={css.buttons_container}>
            <div class={css.button_container}>
                <SymbolButton img={<img src={homeIcon}></img>} action={() => { }}></SymbolButton>
                Home</div>
            <div class={css.button_container}>
                <SymbolButton img={<img src={epochIcon}></img>} action={() => { }}></SymbolButton>
                Epochs</div>
            <div class={css.button_container}>
                <SymbolButton img={<img src={bellIcon}></img>} action={() => { }}></SymbolButton>
                Replies</div>
            <div class={css.button_container}>
                <SymbolButton img={<img src={bookmarksIcon}></img>} action={() => { }}></SymbolButton>
                Bookmarks</div>
            <div class={css.button_container}>
                <SymbolButton img={<img src={createIcon}></img>} action={() => { }}></SymbolButton>
                Write</div>
            <div class={css.button_container}>
                <SymbolButton img={<img src={conceptsIcon}></img>} action={() => { }}></SymbolButton>
                Concepts</div>
            <div class={css.button_container}>
                <SymbolButton img={<img src={settingsIcon}></img>} action={() => { }}></SymbolButton>
                Settings</div>
            <div class={css.button_container}>
                <SymbolButton img={<img src={chatIcon}></img>} action={() => { }}></SymbolButton>
                Chat</div>
            <div class={css.button_container}>
                <SymbolButton img={<img src={dieIcon}></img>} action={() => { }}></SymbolButton>
                Random</div>
        </div>
    </div>
}