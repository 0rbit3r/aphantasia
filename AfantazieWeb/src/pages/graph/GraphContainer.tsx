import { useApp } from '@pixi/react';
import { useEffect } from 'react';
import runGraph from './simulation/graphRunner';
import { initializeTemporalThoughts as initializeTemporalRenderedThoughts } from './simulation/thoughtsProvider';


interface GraphRendererProps {
  initialHighlightedThoughtId?: number | null;
}

const GraphContainer = (props: GraphRendererProps) => {
  let pixiApp = useApp();

  useEffect(() => {
    // console.log("initializing Container with id", props.initialHighlightedThoughtId);
    // assigning variable an id from url is delayed for some reason -> waitfor either null or number
    if (props.initialHighlightedThoughtId === undefined) {
      return;
    }

    
    initializeTemporalRenderedThoughts(props.initialHighlightedThoughtId);

    pixiApp.stage.removeChildren();
    runGraph(pixiApp);
  }, [props.initialHighlightedThoughtId]);

  return (
    <></>
  );
}


export default GraphContainer;