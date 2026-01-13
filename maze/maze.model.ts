import { ISubject, IObserver, INotifyEvent } from 'Types';
import {
    Cell,
    MazeStructure,
    MazeEvent,
    MazeEventType,
    MazeRow,
    CellState,
    Wall,
} from 'Maze';
import { MovementDirection } from 'Player';
import { cellsEqual } from 'Utils';

export interface IMazeState {
    rows: number;
    cols: number;
    finishCell: Cell;
    map: MazeStructure;
    wallSpawnChance: number;
}

export class MazeModel implements ISubject {
    private readonly observers = new Set<IObserver>();
    private readonly state: IMazeState = {
        cols: 0,
        rows: 0,
        finishCell: [0, 0],
        map: [],
        wallSpawnChance: 0,
    };

    constructor(
        private readonly rows: number,
        private readonly cols: number,
        private readonly wallSpawnChance: number
    ) {
        this.state.rows = rows;
        this.state.cols = cols;
        this.state.wallSpawnChance = wallSpawnChance;
    }

    generate() {
        this.fillMap();
        this.addBorders();
        this.generateFinish();

        this.notify(new MazeEvent(MazeEventType.Generate));
    }

    private fillMap(): void {
        for (let i = 0; i < this.state.rows; i++) {
            this.state.map.push(this.getFilledMazeRow());
        }
    }

    private getFilledMazeRow(): MazeRow {
        const currentRow: MazeRow = [];

        for (let i = 0; i < this.state.cols; i++) {
            const cellState = +(
                +Math.random().toFixed(1) < this.state.wallSpawnChance
            ) as CellState;

            currentRow.push(cellState);
        }

        return currentRow;
    }

    private addBorders(): void {
        const map = this.state.map;

        map[0] = map[0].fill(1);
        map[map.length - 1] = map.at(0)!.fill(1);
        map.forEach((row) => (row[0] = 1));
        map.forEach((row) => (row[row.length - 1] = 1));
    }

    private generateFinish() {
        this.state.finishCell = this.findRandomPassageCell();
    }

    findRandomPassageCell(...exceptions: Cell[]): Cell {
        let row = 0;
        let col = 0;

        const isExCell = (cell: Cell) =>
            exceptions.find((exCell) => cellsEqual(exCell, cell));

        const wall: Wall = 1;

        let cell: Cell = [row, col];
        let cellState: CellState = this.state.map[row][col];

        while (cellState === wall || isExCell(cell)) {
            row = Math.round(Math.random() * (this.state.rows - 1));
            col = Math.round(Math.random() * (this.state.cols - 1));

            cell = [row, col];
            cellState = this.state.map[row][col];
        }

        return cell;
    }

    notify(eventType: INotifyEvent): void {
        this.observers.forEach((observer) => observer.update(this, eventType));
    }
    attach(observer: IObserver): void {
        this.observers.add(observer);
    }
    detach(observer: IObserver): void {
        this.observers.delete(observer);
    }

    isPassage(direction: MovementDirection, cell: Cell): boolean {
        const map = this.state.map;
        const row = cell[0];
        const col = cell[1];
        const wall: Wall = 1;

        const passageFinder = {
            Left: () => map[row][col - 1] !== wall,
            Down: () => map[row + 1][col] !== wall,
            Right: () => map[row][col + 1] !== wall,
            Up: () => map[row - 1][col] !== wall,
        };

        return passageFinder[direction]();
    }

    getState(): IMazeState {
        return structuredClone(this.state);
    }
}
