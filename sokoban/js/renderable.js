
class GridRenderable {
    getImage() {
        return this._image;
    }

    constructor(image, x, y) {
        this._image = image;
        this.x = x;
        this.y = y;
    }
}

class CanvasGridRenderer {
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

    clear() {
        const context = this._canvas.getContext("2d");
        context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    render(renderable) {
        const context = this._canvas.getContext("2d");
        const coords = this.calculateCoordinateTransformation(renderable.x, renderable.y);

        context.drawImage(renderable.getImage(), coords.x, coords.y, coords.width, coords.height);
    }

    constructor(canvas, gridWidth, gridHeight) {
        this._canvas = canvas;
        this._gridWidth = gridWidth;
        this._gridHeight = gridHeight;
    }
}
