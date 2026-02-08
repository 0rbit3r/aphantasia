
export interface ExplorationStateDescriptor {
    mode: ModeType;
    focus?: string;
}

export type ModeType =
'home' |
'explore' |
'concepts' 

export function parsePath(path: string): ExplorationStateDescriptor {
    const splitPath = path.split('/');
    if (splitPath.length === 1){
        if (splitPath[0] === ':home') return {
            mode: 'home'
        }
    }

    return null!;
}


export function expStateAsPath(state: ExplorationStateDescriptor){
    const firstPart = state.mode === 'home' || state.mode === 'explore'
        ? ':' + state.mode
        : state.mode;
    
    const secondPart = state.focus
        ? '/' + state.focus
        : '';

    return firstPart + secondPart;
}