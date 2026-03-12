import {
    Cell,
    CellState,
    IClientMazeState,
    IMazeState,
    INotifyEvent,
    IObserver,
    ISubject,
    MazeEvent,
    MazeEventType,
    MovementDirection,
    Wall,
} from '@shared/types';
import { env } from '@client/env';

export type GenerateMazeBy =
    | IMazeState['key']
    | [IMazeState['rows'], IMazeState['cols']];

export class MazeModel implements ISubject {
    private readonly WALL: Wall = 0;

    private state: IClientMazeState = {
        cols: 0,
        rows: 0,
        finishCell: [0, 0],
        map: [],
        key: '',
        cellSizePx: NaN,
    };

    async generate(by: GenerateMazeBy, cellSizePx: number) {
        let response: Response;

        if (typeof by === 'string') {
            response = await fetch(`${env.DOMAIN}/maze/${by}`, {
                method: 'GET',
            });
        } else {
            let [rows, cols] = by;
            rows = rows < 6 ? 6 : rows;
            cols = cols < 6 ? 6 : cols;
            response = await fetch(
                `${env.DOMAIN}/maze/generate?rows=${rows}&cols=${cols}`,
                {
                    method: 'GET',
                },
            );
        }

        if (response.ok) {
            this.state = await response.json();
            this.state.cellSizePx = cellSizePx;
        }

        if (!this.state.map.length) return;

        this.notify(new MazeEvent(MazeEventType.Generate));
    }

    setCellStateInMap(cell: Cell, state: CellState) {
        this.state.map[cell[0]][cell[1]] = state;

        this.notify(new MazeEvent(MazeEventType.ChangeCellState), {
            cell,
            state,
        });
    }

    reset() {
        this.state = {
            cols: 0,
            rows: 0,
            finishCell: [0, 0],
            map: [],
            key: '',
            cellSizePx: 20,
        };

        this.notify(new MazeEvent(MazeEventType.Delete));
    }

    private readonly observers = new Set<IObserver>();
    notify(eventType: INotifyEvent, data?: any): void {
        this.observers.forEach((observer) =>
            observer.update(this, eventType, data),
        );
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

    isWall(cell: Cell): boolean {
        return this.state.map[cell[0]][cell[1]] === this.WALL;
    }

    getMapBorders(): Cell[] {
        const up: Cell[] = [];
        for (let i = 0; i < this.state.cols; i++) up.push([0, i]);

        const down: Cell[] = [];
        const maxRowIndex = this.state.rows - 1;
        for (let i = 0; i < this.state.cols; i++) down.push([maxRowIndex, i]);

        const left: Cell[] = [];
        for (let i = 0; i < this.state.rows; i++) left.push([i, 0]);

        const right: Cell[] = [];
        const maxColIndex = this.state.rows - 1;
        for (let i = 0; i < this.state.rows; i++) right.push([i, maxColIndex]);

        return [...up, ...down, ...left, ...right];
    }

    getState(): IClientMazeState {
        return structuredClone(this.state);
    }
}
