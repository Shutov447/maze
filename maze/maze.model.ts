import {
    MazeStructure,
    Cell,
    MazeRow,
    CellState,
    ISubject,
    IObserver,
} from 'Types';

export interface IMazeState {
    rows: number;
    cols: number;
    finishCell: Cell;
    map: MazeStructure;
    wallSpawnChance: number;
    cellSizePx: number;
}

export class MazeModel implements ISubject {
    private readonly observers = new Set<IObserver>();
    private readonly state: IMazeState = {
        cols: 0,
        rows: 0,
        finishCell: [0, 0],
        map: [],
        wallSpawnChance: 0,
        cellSizePx: 0,
    };

    constructor(
        private readonly rows: number,
        private readonly cols: number,
        private readonly wallSpawnChance: number,
        private readonly cellSizePx: number
    ) {
        this.state.rows = rows;
        this.state.cols = cols;
        this.state.wallSpawnChance = wallSpawnChance;
        this.state.cellSizePx = cellSizePx;
    }

    generate() {
        this.fillMap();
        this.addBorders();
        this.generateFinish();

        this.notify();
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

    findRandomPassageCell(): Cell {
        let row = 0;
        let col = 0;

        while (this.state.map[row][col] === 1) {
            row = Math.round(Math.random() * (this.state.rows - 1));
            col = Math.round(Math.random() * (this.state.cols - 1));
        }

        return [row, col];
    }

    getState(): IMazeState {
        return Object.assign({}, this.state);
    }

    attach(observer: IObserver): void {
        this.observers.add(observer);
    }

    detach(observer: IObserver): void {
        this.observers.delete(observer);
    }

    notify(): void {
        this.observers.forEach((observer) => observer.update(this));
    }
}
