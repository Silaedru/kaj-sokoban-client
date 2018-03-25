/*
{
 "width":20,
 "height":20,

 "walls":[1,2,3],
 "crates":[4],
 "targets":[5],
 "player":6
}
 */

const MapObject = {
    FLOOR: 0,
    WALL: 1,
    CRATE: 2,
    TARGET: 3
};

class SokobanMap {
    transformPositionToCoords(position) {
        return {
            x: position % this._width,
            y: Math.floor(position / this._width)
        }
    }

    transformCoordsToPosition(x, y) {
        return y * this._width + x;
    }

    getRenderableObjects() {
        let pos = 0;

        const floorAppends = [];

        const targetAppends = this._targets.map(target => {
            const coords = this.transformPositionToCoords(target);
            return new GridRenderable(Resources.Map.target.resource, coords.x, coords.y);
        });

        const rtn = this._mapObjects.map(object => {
            const coords = this.transformPositionToCoords(pos++);
            let floorTile = new GridRenderable(Resources.Map.floor.resource, coords.x, coords.y);
            let rtn = null;

            switch (object) {
                case MapObject.WALL: rtn = new GridRenderable(Resources.Map.wall.resource, coords.x, coords.y); break;
                case MapObject.CRATE: rtn =  new GridRenderable(Resources.Map.crate.resource, coords.x, coords.y); break;
            }

            if (rtn == null)
                return floorTile;

            floorAppends.push(floorTile);
            return rtn;
        });

        return floorAppends.concat(rtn).concat(targetAppends);
    }

    //return true if collision occurred
    handlePlayerMove(x, y, direction, crateMovable = true) {
        const currentPosition = this.transformCoordsToPosition(x, y);
        let checkedPosition = -1;

        switch (direction) {
            case Direction.LEFT:
                checkedPosition = currentPosition - 1;

                // out of horizontal bounds
                if (this.transformPositionToCoords(checkedPosition).y !== this.transformPositionToCoords(currentPosition).y)
                    return true;
                break;

            case Direction.RIGHT:
                checkedPosition = currentPosition + 1;

                // out of horizontal bounds
                if (this.transformPositionToCoords(checkedPosition).y !== this.transformPositionToCoords(currentPosition).y)
                    return true;
                break;

            case Direction.UP: checkedPosition = currentPosition - this._width; break;
            case Direction.DOWN: checkedPosition = currentPosition + this._width; break;
        }


        // out of bounds
        if (checkedPosition < 0 || checkedPosition >= this._mapObjects.length)
            return true;

        // wall
        if (this._mapObjects[checkedPosition] === MapObject.WALL)
            return true;

        // crate
        if (this._mapObjects[checkedPosition] === MapObject.CRATE) {
            if (!crateMovable)
                return true;

            const coords = this.transformPositionToCoords(checkedPosition);
            const crateBlocked = this.handlePlayerMove(coords.x, coords.y, direction, false);

            if (!crateBlocked) {
                let newCratePosition = checkedPosition;

                switch (direction) {
                    case Direction.LEFT: newCratePosition -= 1; break;
                    case Direction.RIGHT: newCratePosition += 1; break;
                    case Direction.UP: newCratePosition -= this._width; break;
                    case Direction.DOWN: newCratePosition += this._width; break;
                }

                this._mapObjects[checkedPosition] = MapObject.FLOOR;
                this._mapObjects[newCratePosition] = MapObject.CRATE;
            }

            return crateBlocked;
        }

        return false;
    }

    checkGameWon() {
        let won = true;

        this._targets.forEach(target => {
           if (this._mapObjects[target] !== MapObject.CRATE)
               won = false;
        });

        return won;
    }

    getPlayerStartCoords() {
        return this.transformPositionToCoords(this._playerStartPosition);
    }

    constructor(mapData) {
        mapData = JSON.parse(mapData);

        this._playerStartPosition = mapData.player;

        this._width = mapData.width;
        this._height = mapData.height;
        this._mapObjects = Array.apply(null, Array(this._width * this._height)).map(() => MapObject.FLOOR);
        this._targets = mapData.targets;

        mapData.walls.forEach(position => this._mapObjects[position] = MapObject.WALL);
        mapData.crates.forEach(position => this._mapObjects[position] = MapObject.CRATE);
    }
}