import { cellsEqual, findRandomPassageCell, generateId } from './utils.js';
export class Maze {
    rows;
    cols;
    cellSizePx;
    players;
    finishCell = [0, 0];
    constructor(rows, cols, cellSizePx, players) {
        this.rows = rows;
        this.cols = cols;
        this.cellSizePx = cellSizePx;
        this.players = players;
    }
    start() {
        this.printMap();
    }
    printMap() {
        const map = this.generateMap(this.rows, this.cols);
        const container = this.createMapContainer();
        map.forEach((row, rowNumber) => this.printRowCell(row, rowNumber++, container));
        this.createFinishCell(this.finishCell);
        this.createPlayers(this.players, map, container);
    }
    generateMap(rows, cols) {
        const filledMap = this.getFilledMap(rows, cols);
        const borderedMap = this.generateMapBorders(filledMap);
        this.finishCell = findRandomPassageCell(borderedMap, rows, cols);
        return borderedMap;
    }
    getFilledMap(row, cols) {
        let map = [];
        for (let i = 0; i < row; i++) {
            map.push(this.getFilledMapRow(cols));
        }
        return map;
    }
    getFilledMapRow(cells) {
        const currentRow = [];
        const wallSpawnChance = 0.4;
        for (let j = 0; j < cells; j++) {
            let cell = +(+Math.random().toFixed(1) < wallSpawnChance);
            currentRow.push(cell);
        }
        return currentRow;
    }
    generateMapBorders(map) {
        map[0] = map[0].fill(1);
        map[map.length - 1] = map.at(0).fill(1);
        map.forEach((row) => (row[0] = 1));
        map.forEach((row) => (row[row.length - 1] = 1));
        return map;
    }
    createFinishCell(cell) {
        const finishElem = document.getElementById(generateId(cell));
        finishElem && (finishElem.style.backgroundColor = 'green');
    }
    createPlayers(players, map, container) {
        players.forEach((player) => {
            let spawnCell = findRandomPassageCell(map, this.rows, this.cols);
            while (cellsEqual(spawnCell, this.finishCell)) {
                spawnCell = findRandomPassageCell(map, this.rows, this.cols);
            }
            player.create(this.cellSizePx, spawnCell, map, this.finishCell);
            player.playerElem &&
                container.appendChild(player.playerElem).focus();
        });
    }
    createMapContainer() {
        const container = document.createElement('div');
        container.style.position = 'relative';
        document.body.append(container);
        return container;
    }
    printRowCell(row, rowNumber, container) {
        row.forEach((cell, cellNumber) => {
            const cellElem = document.createElement('div');
            cellElem.id = generateId(rowNumber, cellNumber);
            cellElem.style.position = 'absolute';
            cellElem.style.top = rowNumber * this.cellSizePx + 'px';
            cellElem.style.left = cellNumber * this.cellSizePx + 'px';
            cellElem.style.width = this.cellSizePx.toString() + 'px';
            cellElem.style.height = this.cellSizePx.toString() + 'px';
            cellElem.style.backgroundColor = cell ? 'black' : 'white';
            container.appendChild(cellElem);
        });
    }
}
