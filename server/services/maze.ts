import {
    Cell,
    MazeStructure,
    Wall,
    Passage,
    Visited,
    IMazeSibling,
    IMazeState,
} from '@shared/types';
import { findRandomPassageCell } from '@shared/utils';

let key = 0;

export class Maze {
    private readonly state: IMazeState = {
        cols: 0,
        rows: 0,
        finishCell: [0, 0],
        map: [],
        key: '',
    };
    private readonly WALL: Wall = 0;
    private readonly PASSAGE: Passage = 1;
    private readonly VISITED: Visited = 0.5;

    private localMaze: number[][] = [];

    make(rows: number, cols: number): IMazeState {
        this.state.rows = rows % 2 === 1 ? rows + 1 : rows;
        this.state.cols = cols % 2 === 1 ? cols + 1 : cols;

        this.fillMazeByPassage();
        this.mazeToGrid();
        this.generate(...this.generateRandomCellOnMazeGrid());
        this.toPassageOrWall();
        this.state.map = this.getBorderedMazeStructure();
        this.generateFinish();
        this.generateKey();
        this.localMaze = [];

        return this.state;
    }

    private fillMazeByPassage() {
        for (let row = 0; row < this.state.rows; row++) {
            const mazeRow = [];

            for (let col = 0; col < this.state.cols; col++) {
                mazeRow.push(this.PASSAGE);
            }

            this.localMaze.push(mazeRow);
        }
    }

    private mazeToGrid() {
        for (let row = 0; row < this.state.rows; row++) {
            for (let col = 0; col < this.state.cols; col++) {
                if (row % 2 === 1 || col % 2 === 1) {
                    this.localMaze[row][col] = this.WALL;
                }

                const isBorder =
                    row === 0 ||
                    col === 0 ||
                    row === this.state.rows - 1 ||
                    col === this.state.cols - 1;
                if (isBorder) {
                    this.localMaze[row][col] = this.VISITED;
                }
            }
        }
    }

    private generateRandomCellOnMazeGrid(): Cell {
        let row = Math.floor(Math.random() * this.state.rows);
        let col = Math.floor(Math.random() * this.state.cols);

        row = Math.min(
            Math.max(row % 2 === 1 ? row + 1 : row + 2, 2),
            this.state.rows - 2,
        );
        col = Math.min(
            Math.max(col % 2 === 1 ? col + 1 : col + 2, 2),
            this.state.cols - 2,
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
            notVisitedSibling.col,
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
            (direction) => direction.state === this.PASSAGE,
        ) as IMazeSibling[];
    }

    private toPassageOrWall() {
        this.localMaze = this.localMaze.map((row) =>
            row.map((col) => (col === this.VISITED ? this.PASSAGE : col)),
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

        this.state.rows = this.localMaze.length;
        this.state.cols = this.localMaze[0].length;
        return this.localMaze as MazeStructure;
    }

    private generateFinish() {
        this.state.finishCell = findRandomPassageCell(this.state.map);
    }

    private generateKey() {
        this.state.key = (key++).toString();
    }

    getState(): IMazeState {
        return structuredClone(this.state);
    }
}
