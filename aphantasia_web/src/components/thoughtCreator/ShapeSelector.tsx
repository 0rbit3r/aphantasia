import { NodeShape } from "grafika";
import { createSignal, For } from "solid-js";
import css from '../../styles/components/shapeSelector.module.css';
import { SymbolButton } from "../SymbolButton";
import circleIcon from '../../assets/icons/circle.svg';
import squareIcon from '../../assets/icons/square.svg';
import diamondIcon from '../../assets/icons/diamond.svg';
import triangleIcon from '../../assets/icons/triangle.svg';
import downTriangleIcon from '../../assets/icons/down-triangle.svg';
import heartIcon from '../../assets/icons/heart.svg';
import crossIcon from '../../assets/icons/cross.svg';


export interface ShapeSelectorProps {
    shapeSelected: (shape: NodeShape) => void
}

export const ShapeSelector = (props: ShapeSelectorProps) => {
    const [shape, setShape] = createSignal(NodeShape.Circle);

    const handleShapeClick = (shape: NodeShape) => {
        setShape(shape);
        props.shapeSelected(shape);
    }

    const shapes = [
        { shape: NodeShape.Circle, image: circleIcon },
        { shape: NodeShape.Square, image: squareIcon },
        { shape: NodeShape.Diamond, image: diamondIcon },
        { shape: NodeShape.UpTriangle, image: triangleIcon },
        { shape: NodeShape.DownTriangle, image: downTriangleIcon },
        { shape: NodeShape.Heart, image: heartIcon },
        { shape: NodeShape.Cross, image: crossIcon },
    ]

    return <div class={css.shape_selector_container}>
        <For each={shapes}>
            {(item) => <div classList={{ [css.shape_selector_button]: true, [css.shape_selector_button_selected]: shape() === item.shape }}>
                <SymbolButton img={item.image} action={() => handleShapeClick(item.shape)} dim={shape() === item.shape} /></div>}
        </For>
    </div>
}