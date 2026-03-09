import type { StateContract } from "./stateContract";
import type { Thought } from "../../model/dto/thought";
import type { ThoughtInMaking } from "../../model/ThoughtInMaking";
import { isThought, isThoughtInMaking } from "../../utility/isTypeOf";


export const WELCOME_CREATE_STATE = {
    grafikaSettings: null!,

    initialize: (store) => {

        const thought: Thought = {
            _type: 'Thought', id: 'created_thought', title: '', author: { id: '', username: 'you', color: '#ffffff' }, date: 'now',
            size: 0, shape: 0, content: '', links: [], replies: [], concepts: []
        };
        // todo - implement viewport get and set in grafika and use it here, to spawn the new thougtht in the middle of the viewport.
        // todo - think of how to make accessible logged in user color here.
        store.get.grafika.addData({
            nodes: [{ id: thought.id, glowEffect: true, radius: 50, text: '' }]
        })

        store.get.grafika.focusOn({ id: 'created_thought' });

        store.set('splitUiLayout', 'half');

        store.set('contextData', () => ({
            _type: 'ThoughtInMaking',
            title: '',
            concepts: [],
            content: '',
            links: [],
            shape: 5,
            validations: []
        }));

        console.log('foo')
        console.log(store.get.contextData)
        console.log(isThought(store.get.contextData))
        console.log(isThoughtInMaking(store.get.contextData))
        console.log((store.get.contextData as ThoughtInMaking).shape!)


        // todo - context isThought doesnt work and context banner sees the old contextData value?

    },


    hangleFocusChange: (store, newFocus) => {
        store.get.grafika.focusOn(newFocus ? { id: newFocus } : 'all');
    },

    dispose: (store) => {
        store.get.grafika.removeData({
            nodes: [{ id: 'created_thought' }]
        })
    }

} satisfies StateContract