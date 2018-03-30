
function createSvgRect(x, y, width, height, fill) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    rect.setAttributeNS(null, "x", x);
    rect.setAttributeNS(null, "y", y );
    rect.setAttributeNS(null, "height", width);
    rect.setAttributeNS(null, "width", height);
    rect.setAttributeNS(null, "fill", fill);

    return rect;
}

const MapUtils = {
    server: {
        address: "http://dixneuf.nevesnican.cz:10500",
        mapsPath: "/map"
    },

    loadedMaps: [],

    loadMaps: function() {
        return;
        if (MapUtils.loadedMaps.length > 0)
            return;

        ajaxRequest("GET", MapUtils.server.address + MapUtils.server.mapsPath).then(response => {
            MapUtils.loadedMaps = JSON.parse(response);

            const previewContainer = document.querySelector("#play .map-preview-container");

            MapUtils.loadedMaps.forEach(map => {
                const previewElement = document.createElement("div");
                previewElement.classList.add("map-preview");
                previewElement.appendChild(MapUtils.generateMapPreviewSvg(map.data));
                previewElement.addEventListener("click", () => startGame(map));
                previewContainer.appendChild(previewElement);
            });
        }).catch(error => {
           console.log(error);
        });
    },

    mapDataToMapObject: function(mapData) {
        const mapObjects = Array.apply(null, Array(mapData.width * mapData.height)).map(() => MapObject.FLOOR);
        mapData.walls.forEach(position => mapObjects[position] = MapObject.WALL);
        mapData.crates.forEach(position => mapObjects[position] = MapObject.CRATE);
        return mapObjects;
    },

    generateMapPreviewSvg: function(mapData) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        svg.setAttributeNS(null, "viewBox", `0 0 ${10 * mapData.width} ${10 * mapData.height}`);

        for (let i=0; i<mapData.width * mapData.height; i++) {
            let fill = null;

            if (i === mapData.player) {
                fill = "#aa0000";
            }
            else if (mapData.targets.includes(i)) {
                fill = "#00aa11";
            }
            else if (mapData.crates.includes(i)) {
                fill = "#4400ff";
            }
            else if (mapData.walls.includes(i)) {
                fill = "#000";
            }

            if (fill !== null) {
                svg.appendChild(createSvgRect(i % mapData.width * 10, Math.floor(i/mapData.width) * 10, 10, 10, fill));
            }
        }

        return svg;
    }
};
