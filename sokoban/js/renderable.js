/**
 * An object that can be rendered by CanvasGridRenderer
 */
class GridRenderable {
    /**
     * Returns image to be rendered
     * @returns {Image} image to be rendered
     */
    getImage() {
        return this._image;
    }

    /**
     * Constructs a GridRenderable
     * @param image {Image} image to be rendered by the renderer
     * @param x {number} x position (column) on the grid
     * @param y {number} y position (row) on the grid
     */
    constructor(image, x, y) {
        this._image = image;
        this.x = x;
        this.y = y;
    }
}

/**
 * Object for rendering images in a grid on a canvas
 */
class CanvasGridRenderer {
    /**
     * Transforms grid coordinates to canvas coordinates
     * @param x {number} grid x position
     * @param y {number} grid y position
     * @returns {{width: number, height: number, x: number, y: number}} object containing canvas coordinates and dimensions
     */
    calculateCoordinateTransformation(x, y) {
        const cellWidth = Math.floor(this._canvas.width / this._gridWidth);
        const cellHeight = Math.floor(this._canvas.height / this._gridHeight);

        return {
            width: cellWidth,
            height: cellHeight,
            x: x*cellWidth,
            y: y*cellHeight
        }
    }

    /**
     * Clears the canvas
     */
    clear() {
        const context = this._canvas.getContext("2d");
        context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    /**
     * Renders a {GridRenderable} on the canvas
     * @param renderable {GridRenderable} renderable to render
     */
    render(renderable) {
        const context = this._canvas.getContext("2d");
        const coords = this.calculateCoordinateTransformation(renderable.x, renderable.y);

        context.drawImage(renderable.getImage(), coords.x, coords.y, coords.width, coords.height);
    }

    /**
     * Resizes the canvas to maximum possible size based on the parent's size
     */
    resizeCanvas() {
        const maxCellDimension = 40; // maximum size of a grid cell
        const canvasContainer = this._canvas.parentElement; // parent element of the canvas

        const cellDimension = Math.min(Math.floor(canvasContainer.offsetWidth / this._gridWidth), maxCellDimension);

        // do the resizing
        this._canvas.width = cellDimension * this._gridWidth;
        this._canvas.height = cellDimension * this._gridHeight;
    }

    /**
     * Constructs a {CanvasGridRenderer}
     * @param canvas {HTMLCanvasElement} canvas element which will be used for rendering
     * @param gridWidth {number} grid width
     * @param gridHeight {number} grid height
     */
    constructor(canvas, gridWidth, gridHeight) {
        this._canvas = canvas;
        this._gridWidth = gridWidth;
        this._gridHeight = gridHeight;

        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas(), false);
    }
}
