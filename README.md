# Sokoban
Clone of the Sokoban game made in modern JavaScript.
 
The game is intended to be used with a simple backend that provides maps and scoreboards, though it can be used without it as well - you will just have to load the maps from a local file and you won't have any of the scoreboard functionality. 

## Setup
Just edit the server address in ```sokoban/js/util.js``` on line 22 and you're good to go. 

## Map format
Maps are stored in JSON format. It's easiest to explain the way it works by an example:
```
{
    "width": 4,
    "height": 4,
    "walls": [4, 8],
    "crates": [10, 11],
    "targets": [14, 15],
    "player": 5
}
```

Represents the following 4x4 map:
```
|-------|-------|-------|-------|
|       |       |       |       |
|  (0)  |  (1)  |  (2)  |  (3)  |
|       |       |       |       |
|-------|-------|-------|-------|
|       |       |       |       |
|  (4)  |  (5)  |  (6)  |  (7)  |
|   W   |   P   |       |       |
|-------|-------|-------|-------|
|       |       |       |       |
|  (8)  |  (9)  |  (10) |  (11) |
|   W   |       |    C  |    C  |
|-------|-------|-------|-------|
|       |       |       |       |
|  (12) |  (13) |  (14) |  (15) |
|       |       |    T  |    T  |
|-------|-------|-------|-------|

W = Wall
P = Player starting position
C = Crate
T = Target
```

Some examples of maps are in the ```maps``` folder. 

## Used JS libraries
 * **[jQuery](http://jquery.com/)**
 * **[jQuery UI](http://jqueryui.com/)**
 * **[jQuery UI Touch Punch](https://github.com/furf/jquery-ui-touch-punch)**
 * **[LZMA JS](https://github.com/LZMA-JS/LZMA-JS)**

## Game art
Art for this game (content of the ```sokoban/media/graphics``` folder) was taken from [here](https://opengameart.org/content/sokoban-pack). All the credit for creating it goes to 1001.com.

## Audio effects
Sources:
 * [Click](https://freesound.org/people/florian_reinke/sounds/63531/)
 * [Chime](https://freesound.org/people/Raclure/sounds/405546/)

## Game maps
Mos of the example maps were taken from [here](https://maps.speccy.cz/map.php?id=Sokoban_2&sort=5&part=9&ath=). 

## Related projects
 * **[Sokoban server](https://github.com/Silaedru/kaj-sokoban-client)**
 * **[Sokoban mapeditor](https://github.com/Silaedru/kaj-sokoban-mapeditor)**