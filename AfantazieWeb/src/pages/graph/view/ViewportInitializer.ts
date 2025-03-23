import { Application, Container, Rectangle } from "pixi.js";
import { Viewport } from "../model/Viewport";
import { useGraphStore } from "../state_and_parameters/GraphStore";

export const addDraggableViewport = (app: Application, zSortedContainer: Container) => {
    const viewport = new Viewport(app.screen.width, app.screen.height);

    const dragContainer = new Container();
    // dragContainer.width = app.screen.width;
    // dragContainer.height = app.screen.height; Doesn't affect anything... 
    dragContainer.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height);
    dragContainer.sortableChildren = true;

    dragContainer.eventMode = 'static';
    // dragContainer.zIndex = DRAG_Z;
    dragContainer.cursor = 'grab';
    dragContainer.on('pointerdown', () => {
        viewport.dragged = true;
        useGraphStore.getState().setLockedOnHighlighted(false);
    });

    dragContainer.on('pointerup', () => {
        viewport.dragged = false;
    });

    dragContainer.on('pointerupoutside', () => {
        viewport.dragged = false;
    });

    dragContainer.on('pointermove', (event) => {
        if (viewport.dragged) {
            viewport.moveByZoomed({ x: event.movementX, y: event.movementY });

        }
        // else  if (event.type === 'touch'){
        //     const touchEvent = event.originalEvent.nativeEvent as PixiTouch;
        //     touchEvent.type
        // }
    });

    dragContainer.on('wheel', event => {
        viewport.zoomByWheelDelta(-event.deltaY);
    });

    zSortedContainer.addChild(dragContainer);

    return viewport;
}