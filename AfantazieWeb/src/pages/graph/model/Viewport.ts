import { INITIAL_ZOOM, MAX_ZOOM, MIN_ZOOM, SIM_HEIGHT, SIM_WIDTH, ZOOM_STEP_MULTIPLICATOR_BUTTONS, ZOOM_STEP_MULTIPLICATOR_WHEEL } from "../state_and_parameters/graphParameters";
import { XAndY } from "./xAndY";


export class Viewport {
    height: number;
    width: number;
    position: XAndY;
    zoom: number;
    // indicates whether the viewport is being dragged/moved by the user
    dragged: boolean;
    // indicates whether the viewport follows a highlighted node
    lockedOnNode: boolean;
    // onScreenSizeChange: () => void;

    constructor(width: number, height: number) {
        this.height = height;
        this.width = width;
        this.zoom = INITIAL_ZOOM;
        this.position = { x: SIM_WIDTH / 2 - width / 2 / this.zoom, y: SIM_HEIGHT / 2 - height / 2 / this.zoom };
        this.dragged = false;
        this.lockedOnNode = false;
        // console.log(simSize);
        // console.log(this.position);
        // this.onScreenSizeChange = () => {};
    }

    // Moves the viewport by zoom-corrected amount
    public moveByZoomed = (delta: XAndY) => {
        this.moveBy({ x: delta.x / this.zoom, y: delta.y / this.zoom });
    }

    // Moves the viewport by global coordinates
    public moveBy = (delta: XAndY) => {
        this.position.x -= delta.x;
        this.position.y -= delta.y;
        if (this.position.x + this.width / 2 / this.zoom > SIM_WIDTH)
            this.position.x = SIM_WIDTH - this.width / 2 / this.zoom;
        if (this.position.y + this.height / 2 / this.zoom > SIM_HEIGHT)
            this.position.y = SIM_HEIGHT - this.height / 2 / this.zoom;
        if (this.position.x + this.width / 2 / this.zoom < 0)
            this.position.x = - this.width / 2 / this.zoom;
        if (this.position.y + this.height / 2 / this.zoom < 0)
            this.position.y = -+ this.height / 2 / this.zoom;
    }

    //Used for zooming by buttons
    public zoomByButtonDelta(dir: number) {
        const oldBottomRight: XAndY = { x: this.position.x + this.zoomedViewportSize().x, y: this.position.y + this.zoomedViewportSize().y };

        if (dir < 0 && this.zoom > MIN_ZOOM)
            this.zoom /= ZOOM_STEP_MULTIPLICATOR_BUTTONS;
        if (dir > 0 && this.zoom < MAX_ZOOM)
            this.zoom *= ZOOM_STEP_MULTIPLICATOR_BUTTONS;

        const newBottomRight: XAndY = { x: this.position.x + this.zoomedViewportSize().x, y: this.position.y + this.zoomedViewportSize().y };

        this.moveBy({ x: -(oldBottomRight.x - newBottomRight.x) / 2, y: -(oldBottomRight.y - newBottomRight.y) * 2 / 3});
    }

    //used for zoom by mouse wheel
    public zoomByWheelDelta(dir: number) {
        const oldBottomRight: XAndY = { x: this.position.x + this.zoomedViewportSize().x, y: this.position.y + this.zoomedViewportSize().y };
        if (dir < 0 && this.zoom > MIN_ZOOM)
            this.zoom /= ZOOM_STEP_MULTIPLICATOR_WHEEL;
        if (dir > 0 && this.zoom < MAX_ZOOM)
            this.zoom *= ZOOM_STEP_MULTIPLICATOR_WHEEL;

        const newBottomRight: XAndY = { x: this.position.x + this.zoomedViewportSize().x, y: this.position.y + this.zoomedViewportSize().y };

        this.moveBy({ x: -(oldBottomRight.x - newBottomRight.x) / 2, y: -(oldBottomRight.y - newBottomRight.y) * 2 / 3 });
    }

    toViewportCoordinates = (position: XAndY): XAndY => {
        return {
            x: (position.x - this.position.x) * this.zoom,
            y: (position.y - this.position.y) * this.zoom
        };
    }

    zoomedViewportSize = (): XAndY => {
        return {
            x: this.width / this.zoom,
            y: this.height / this.zoom
        }
    }

}