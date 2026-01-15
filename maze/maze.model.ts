import { ISubject, IObserver, INotifyEvent } from 'Types';
import {
    Cell,
    MazeStructure,
    MazeEvent,
    MazeEventType,
    CellState,
    Wall,
    Passage,
    Visited,
    IMazeSibling,
} from 'Maze';
import { MovementDirection } from 'Player';
import { cellsEqual } from 'Utils';

export interface IMazeState {
    rows: number;
    cols: number;
    finishCell: Cell;
    map: MazeStructure;
}

export class MazeModel implements ISubject {
    private readonly observers = new Set<IObserver>();
    private readonly state: IMazeState = {
        cols: 0,
        rows: 0,
        finishCell: [0, 0],
        map: [],
    };
    private readonly WALL: Wall = 0;
    private readonly PASSAGE: Passage = 1;
    private readonly VISITED: Visited = 0.5;

    private localMaze: number[][] = [];

    constructor(private readonly cols: number, private readonly rows: number) {
        this.rows = rows % 2 === 1 ? rows + 1 : rows;
        this.cols = cols % 2 === 1 ? cols + 1 : cols;
        this.state.cols = cols;
        this.state.rows = rows;
    }

    make() {
        this.fillMazeByPassage();
        this.mazeToGrid();
        this.generate(...this.generateRandomCellOnMazeGrid());
        this.toPassageOrWall();
        this.state.map = this.getBorderedMazeStructure();
        this.generateFinish();
        this.localMaze = [];

        this.notify(new MazeEvent(MazeEventType.Generate));
    }

    private fillMazeByPassage() {
        for (let row = 0; row < this.rows; row++) {
            const mazeRow = [];

            for (let col = 0; col < this.cols; col++) {
                mazeRow.push(this.PASSAGE);
            }

            this.localMaze.push(mazeRow);
        }
    }

    private mazeToGrid() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (row % 2 === 1 || col % 2 === 1) {
                    this.localMaze[row][col] = this.WALL;
                }

                const isBorder =
                    row === 0 ||
                    col === 0 ||
                    row === this.rows - 1 ||
                    col === this.cols - 1;
                if (isBorder) {
                    this.localMaze[row][col] = this.VISITED;
                }
            }
        }
    }

    private generateRandomCellOnMazeGrid(): Cell {
        let row = Math.floor(Math.random() * this.rows);
        let col = Math.floor(Math.random() * this.cols);

        row = Math.min(
            Math.max(row % 2 === 1 ? row + 1 : row + 2, 2),
            this.rows - 2
        );
        col = Math.min(
            Math.max(col % 2 === 1 ? col + 1 : col + 2, 2),
            this.cols - 2
        );

        return [row, col];
    }

    private readonly wayByCell: Cell[] = [];
    private generate(row: number, col: number) {
        this.localMaze[row][col] = this.VISITED;

        const notVisitedSiblings = this.getNotVisitedSiblings(row, col);

        if (!notVisitedSiblings.length) {
            if (!this.wayByCell.length) return;

            this.wayByCell.pop();
            const lastStep = this.wayByCell.at(-1);
            lastStep && this.generate(...lastStep);

            return;
        }

        const notVisitedSibling =
            notVisitedSiblings[
                Math.floor(Math.random() * notVisitedSiblings.length)
            ];
        notVisitedSibling.carvePassage.bind(this)(
            notVisitedSibling.row,
            notVisitedSibling.col
        );
        this.localMaze[notVisitedSibling.row][notVisitedSibling.col] =
            this.VISITED;
        this.wayByCell.push([row, col]);

        this.generate(notVisitedSibling.row, notVisitedSibling.col);
    }

    private getNotVisitedSiblings(row: number, col: number): IMazeSibling[] {
        return [
            {
                type: 'Left',
                state: this.localMaze[row]?.[col - 2] || this.VISITED,
                row,
                col: col - 2,
                carvePassage: (row: number, col: number) =>
                    (this.localMaze[row][col + 1] = this.PASSAGE),
            },
            {
                type: 'Down',
                state: this.localMaze[row + 2]?.[col] || this.VISITED,
                row: row + 2,
                col,
                carvePassage: (row: number, col: number) =>
                    (this.localMaze[row - 1][col] = this.PASSAGE),
            },
            {
                type: 'Right',
                state: this.localMaze[row]?.[col + 2] || this.VISITED,
                row,
                col: col + 2,
                carvePassage: (row: number, col: number) =>
                    (this.localMaze[row][col - 1] = this.PASSAGE),
            },
            {
                type: 'Up',
                state: this.localMaze[row - 2]?.[col] || this.VISITED,
                row: row - 2,
                col,
                carvePassage: (row: number, col: number) =>
                    (this.localMaze[row + 1][col] = this.PASSAGE),
            },
        ].filter(
            (direction) => direction.state === this.PASSAGE
        ) as IMazeSibling[];
    }

    private toPassageOrWall() {
        this.localMaze = this.localMaze.map((row) =>
            row.map((col) => (col === this.VISITED ? 1 : col))
        );
    }

    private getBorderedMazeStructure(): MazeStructure {
        this.localMaze.shift();
        this.localMaze = this.localMaze.map((row) => {
            row.shift();
            return row;
        });
        this.localMaze[0] = this.localMaze[0].fill(this.WALL);
        this.localMaze[this.localMaze.length - 1] = this.localMaze
            .at(0)!
            .fill(this.WALL);
        this.localMaze.forEach((row) => (row[0] = this.WALL));
        this.localMaze.forEach((row) => (row[row.length - 1] = this.WALL));

        return this.localMaze as MazeStructure;
    }

    private generateFinish() {
        this.state.finishCell = this.findRandomPassageCell();
    }

    findRandomPassageCell(...exceptions: Cell[]): Cell {
        let row = 0;
        let col = 0;

        const isExCell = (cell: Cell) =>
            exceptions.find((exCell) => cellsEqual(exCell, cell));

        let cell: Cell = [row, col];
        let cellState: CellState = this.state.map[row][col];

        while (cellState === this.WALL || isExCell(cell)) {
            row = Math.round(Math.random() * (this.rows - 2));
            col = Math.round(Math.random() * (this.cols - 2));

            cell = [row, col];
            cellState = this.state.map[row]?.[col];
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

        const passageFinder = {
            Left: () => map[row][col - 1] !== this.WALL,
            Down: () => map[row + 1][col] !== this.WALL,
            Right: () => map[row][col + 1] !== this.WALL,
            Up: () => map[row - 1][col] !== this.WALL,
        };

        return passageFinder[direction]();
    }

    getState(): IMazeState {
        return structuredClone(this.state);
    }
}
