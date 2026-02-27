import {
    Cell,
    CellState,
    IClientMazeState,
    INotifyEvent,
    IObserver,
    ISubject,
    MazeElem,
    MazeEvent,
    MazeEventType,
    MazeRow,
    MazeStructure,
} from '@shared/types';
import { generateId } from '@shared/utils';
import { MazeModel } from '@client/maze';

export class MazeView implements IObserver {
    readonly wrapper: MazeElem = document.createElement('div');

    update(subject: ISubject, event: INotifyEvent, data?: any) {
        if (subject instanceof MazeModel && event instanceof MazeEvent) {
            switch (event.type) {
                case MazeEventType.Generate:
                    this.onGenerate(subject.getState());
                    break;
                case MazeEventType.Delete:
                    this.onDelete();
                    break;
                case MazeEventType.ChangeCellState:
                    if ('cell' in data && 'state' in data) {
                        this.onChangeCellState(data.cell, data.state);
                    }
                    break;
            }
        }
    }

    onGenerate(state: IClientMazeState) {
        this.clear();
        this.render(state);
    }
    onDelete() {
        this.clear();
    }
    onChangeCellState(cell: Cell, state: CellState) {
        const cellElem = document.getElementById(generateId(cell));
        if (!cellElem) return;

        state ? this.styleToPassage(cellElem) : this.styleToWall(cellElem);
    }

    private render(state: IClientMazeState) {
        this.addContainer();
        this.addMaze(state.map, state.cellSizePx);
        this.addFinish(state.finishCell);
        this.addKey(state.key);
    }

    private clear() {
        this.wrapper.innerHTML = '';
        this.keyElem.innerHTML = '';
    }

    private addContainer() {
        this.wrapper.style.position = 'relative';
        this.wrapper.style.marginTop = '40px';
        document.body.append(this.wrapper);
    }

    private addMaze(map: MazeStructure, cellSize: number) {
        map.forEach((row, rowNumber) => this.addRow(row, rowNumber, cellSize));
    }

    private addRow(row: MazeRow, rowNumber: number, cellSize: number) {
        row.forEach((cellState, cellNumber) => {
            const cellElem = document.createElement('div');

            cellElem.id = generateId(rowNumber, cellNumber);

            cellElem.style.position = 'absolute';
            cellElem.style.top = rowNumber * cellSize + 'px';
            cellElem.style.left = cellNumber * cellSize + 'px';

            cellElem.style.width = cellSize + 'px';
            cellElem.style.height = cellSize + 'px';
            cellState
                ? this.styleToPassage(cellElem)
                : this.styleToWall(cellElem);

            this.wrapper.appendChild(cellElem);
        });
    }

    private styleToPassage(elem: HTMLElement) {
        elem.style.backgroundColor = 'white';
    }
    private styleToWall(elem: HTMLElement) {
        elem.style.backgroundColor = 'black';
    }

    private addFinish(cell: Cell) {
        const finishElem = document.getElementById(generateId(cell));
        finishElem?.style.setProperty('background-color', 'green', 'important');
    }

    private readonly keyElem = document.createElement('div');
    private addKey(key: string) {
        this.keyElem.style.position = 'absolute';
        this.keyElem.style.bottom = '5px';
        this.keyElem.innerText = 'ключ игры: ' + key;
        this.wrapper.appendChild(this.keyElem);
    }

    addCellElem(elem: HTMLElement) {
        this.wrapper.appendChild(elem);
    }
}
