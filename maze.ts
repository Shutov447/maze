import { Player } from './player.js';
import { CellPos, Map, MapRow, RowCell } from './types.js';
import { cellsEqual, findRandomPassageCell, generateId } from './utils.js';

export class Maze {
    private finishCell: CellPos = [0, 0];

    constructor(
        private readonly rows: number,
        private readonly cols: number,
        private readonly cellSizePx: number,
        private readonly players: Player[]
    ) {}

    start() {
        this.printMap();
    }

    private printMap() {
        const map = this.generateMap(this.rows, this.cols);
        const container = this.createMapContainer();

        map.forEach((row, rowNumber) =>
            this.printRowCell(row, rowNumber++, container)
        );

        this.createFinishCell(this.finishCell);
        this.createPlayers(this.players, map, container);
    }

    private generateMap(rows: number, cols: number): Map {
        const filledMap = this.getFilledMap(rows, cols);
        const borderedMap = this.generateMapBorders(filledMap);
        this.finishCell = findRandomPassageCell(borderedMap, rows, cols);

        return borderedMap;
    }

    private getFilledMap(row: number, cols: number): Map {
        let map: Map = [];

        for (let i = 0; i < row; i++) {
            map.push(this.getFilledMapRow(cols));
        }

        return map;
    }

    private getFilledMapRow(cells: number): MapRow {
        const currentRow: MapRow = [];
        const wallSpawnChance = 0.4;

        for (let j = 0; j < cells; j++) {
            let cell = +(
                +Math.random().toFixed(1) < wallSpawnChance
            ) as RowCell;

            currentRow.push(cell);
        }

        return currentRow;
    }

    private generateMapBorders(map: Map): Map {
        map[0] = map[0].fill(1);
        map[map.length - 1] = map.at(0)!.fill(1);
        map.forEach((row) => (row[0] = 1));
        map.forEach((row) => (row[row.length - 1] = 1));

        return map;
    }

    private createFinishCell(cell: CellPos) {
        const finishElem = document.getElementById(generateId(cell));
        finishElem && (finishElem.style.backgroundColor = 'green');
    }

    private createPlayers(players: Player[], map: Map, container: HTMLElement) {
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

    private createMapContainer(): HTMLElement {
        const container = document.createElement('div');
        container.style.position = 'relative';
        document.body.append(container);

        return container;
    }

    private printRowCell(
        row: MapRow,
        rowNumber: number,
        container: HTMLElement
    ) {
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
