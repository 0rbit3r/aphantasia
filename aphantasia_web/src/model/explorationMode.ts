
export interface ExplorationStateDescriptor {
    mode: ModeType;
    focus?: string;
}

export type ModeType =
    'epochs' |
    'welcome' |
    'explore' |
    'concepts'

// TODO: think about the difference between the internal exp state and the external one (ie. url path)
// Question - do we even need an internal path representation?
//              Feels like internally we cen get away with ExplorationStateDescriptor
//              and we only need to parse it on startup or when a something is shared through a link


export function parsePathToExplorationState(path: string, loggedIn: boolean): ExplorationStateDescriptor {
    const splitPath = path.slice(1).split('/');
    if (splitPath.length === 1) {
        if (splitPath[0] === "")
            return {
                mode: loggedIn ? 'epochs' : 'welcome'
            }
    }

    return null!;
}


export function expStateAsPath(state: ExplorationStateDescriptor) {
    const firstPart = state.mode === 'welcome' || state.mode === 'explore'
        ? ':' + state.mode
        : state.mode;

    const secondPart = state.focus
        ? '/' + state.focus
        : '';

    return firstPart + secondPart;
}

