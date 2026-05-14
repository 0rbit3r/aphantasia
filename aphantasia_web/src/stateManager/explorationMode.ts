
export interface ExplorationStateDescriptor {
    mode: ModeType;
    focus?: string;
}

export type ModeType =
    'epoch' |
    'welcome' |
    'welcome_create' |
    'explore' |
    'create' |
    'concept' |
    'inbox' |
    'settings' |
    'chat' |
    'profile'

// TODO: think about the difference between the internal exp state and the external one (ie. url path)
// Question - do we even need an internal path representation?
//              Feels like internally we cen get away with ExplorationStateDescriptor
//              and we only need to parse it on startup or when a something is shared through a link


export function parsePathToExplorationState(path: string): ExplorationStateDescriptor {
    const splitPath = path.slice(1).split('/');
    if (splitPath.length === 1) {
        switch (splitPath[0]) {
            case '':
                return { mode: 'welcome' }
            case 'welcome':
                return { mode: 'welcome' }
            case 'epoch':
                return { mode: 'epoch' }


        }
        if (splitPath[0] === "")
            return {
                mode: 'welcome'
            }
    }

    return { mode: 'welcome' }
}


export function expStateAsPath(state: ExplorationStateDescriptor) {
    if (state.mode === 'welcome') return "/";
    return "/" + state.focus;
}

