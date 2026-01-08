import { IMazeState } from 'Maze';
import { generateId } from 'Utils';
import { Cell, MazeElem, MazeRow, MazeStructure, PlayerElem } from 'Types';

export class MazeView {
    private readonly container: MazeElem = document.createElement('div');

    render(state: IMazeState, playerElem: PlayerElem) {
        this.clear();
        this.addContainer();
        this.addMaze(state.map, state.cellSizePx);
        this.addFinish(state.finishCell);
        this.addCellElem(playerElem);
    }

    addCellElem(elem: HTMLElement) {
        this.container.appendChild(elem);
    }

    private addContainer() {
        this.container.style.position = 'relative';
        document.body.append(this.container);
    }

    private addMaze(map: MazeStructure, cellSize: number) {
        map.forEach((row, rowNumber) => this.addRow(row, rowNumber, cellSize));
    }

    private addRow(row: MazeRow, rowNumber: number, cellSize: number) {
        row.forEach((cell, cellNumber) => {
            const cellElem = document.createElement('div');

            cellElem.id = generateId(rowNumber, cellNumber);

            cellElem.style.position = 'absolute';
            cellElem.style.top = rowNumber * cellSize + 'px';
            cellElem.style.left = cellNumber * cellSize + 'px';

            cellElem.style.width = cellSize + 'px';
            cellElem.style.height = cellSize + 'px';
            cellElem.style.backgroundColor = cell ? 'black' : 'white';

            this.container.appendChild(cellElem);
        });
    }

    private addFinish(cell: Cell) {
        const finishElem = document.getElementById(generateId(cell));
        finishElem && (finishElem.style.backgroundColor = 'green');
    }

    private clear() {
        this.container.innerHTML = '';
    }
}
