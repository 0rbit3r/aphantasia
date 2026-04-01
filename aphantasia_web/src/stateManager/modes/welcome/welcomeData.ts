import type { Data } from 'grafika';
import tutorialJson from '../../../assets/tutorial.json';
import positions from '../../../assets/positions.json';

const tutorialData = tutorialJson satisfies Data;

export const welcome_data = {
    ...tutorialData,
    nodes: tutorialData.nodes.map(n => {
        const positionRow = positions.find(p => p.id === n.id);
        return {
            ...n, x: positionRow?.x ?? undefined, y: positionRow?.y ?? undefined
        }
    })
};


welcome_data.edges.push({ sourceId: '0', targetId: 'good_job!' }); // a link to the first user-created thought