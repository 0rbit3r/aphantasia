import { useApp } from '@pixi/react';
import { useEffect } from 'react';
import runGraph from './simulation/graphRunner';
import { ExplorationMode, MM_InitializeGraphMode, MM_SwitchToExplorationMode } from './simulation/modesManager';
import { initializeTemporalThoughts } from './simulation/thoughtsProvider';
import { useGraphStore } from './state_and_parameters/GraphStore';

interface GraphRendererProps {
  pageUrlQueryParameter?: string | null;
}

const GraphContainer = (props: GraphRendererProps) => {
  let pixiApp = useApp();

  const setTimeShift = useGraphStore(state => state.setTimeShift);

  useEffect(() => {
    // console.log("initializing Container with id", props.initialHighlightedThoughtId);
    // assigning variable an id from url is delayed for some reason -> waitfor either null or number
    if (props.pageUrlQueryParameter === undefined) {
      return;
    }

    if (props.pageUrlQueryParameter) {
      if (props.pageUrlQueryParameter === 'now') {
        MM_InitializeGraphMode(ExplorationMode.TEMPORAL);
        initializeTemporalThoughts(null);
        setTimeShift(-1);
      }
      else if (props.pageUrlQueryParameter.startsWith('~')) {
        MM_SwitchToExplorationMode(ExplorationMode.PROFILE, props.pageUrlQueryParameter.substring(1).replace('_', ' '));
      }
      else if (props.pageUrlQueryParameter.startsWith('_')) {
        MM_SwitchToExplorationMode(ExplorationMode.CONCEPT, props.pageUrlQueryParameter);

      } else if (parseInt(props.pageUrlQueryParameter)) {
        MM_InitializeGraphMode(ExplorationMode.TEMPORAL);
        initializeTemporalThoughts(parseInt(props.pageUrlQueryParameter));
      }
    } else {
      MM_InitializeGraphMode(ExplorationMode.TEMPORAL);
      initializeTemporalThoughts(null);
    }

    pixiApp.stage.removeChildren();
    runGraph(pixiApp);
  }, [props.pageUrlQueryParameter]);

  return (
    <></>
  );
}


export default GraphContainer;