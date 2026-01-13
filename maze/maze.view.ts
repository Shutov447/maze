import { IObserver, ISubject, INotifyEvent } from 'Types';
import {
    IMazeState,
    MazeModel,
    MazeEvent,
    MazeEventType,
    Cell,
    MazeElem,
    MazeRow,
    MazeStructure,
} from 'Maze';
import { generateId } from 'Utils';

export class MazeView implements IObserver {
    readonly container: MazeElem = document.createElement('div');

    constructor(readonly cellSizePx: number) {}

    update(subject: ISubject, event: INotifyEvent) {
        if (
            subject instanceof MazeModel &&
            event instanceof MazeEvent &&
            event.type === MazeEventType.Generate
        ) {
            this.render(subject.getState());
        }
    }

    private render(state: IMazeState) {
        this.clear();
        this.addContainer();
        this.addMaze(state.map, this.cellSizePx);
        this.addFinish(state.finishCell);
    }

    private clear() {
        this.container.innerHTML = '';
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

    addCellElem(elem: HTMLElement) {
        this.container.appendChild(elem);
    }
}
