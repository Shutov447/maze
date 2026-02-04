import {
    Cell,
    IMazeState,
    INotifyEvent,
    IObserver,
    ISubject,
    MazeEvent,
    MazeEventType,
    MovementDirection,
    Wall,
} from '@shared/types';

export class MazeModel implements ISubject {
    private readonly observers = new Set<IObserver>();
    private readonly WALL: Wall = 0;

    private state: IMazeState = {
        cols: 0,
        rows: 0,
        finishCell: [0, 0],
        map: [],
        key: '',
    };

    constructor() {}

    async generate(rows: number, cols: number) {
        rows = rows % 2 === 1 ? rows + 1 : rows;
        cols = cols % 2 === 1 ? cols + 1 : cols;

        const response = await fetch(
            `http://localhost:8000/maze/generate?rows=${rows}&cols=${cols}`,
            {
                method: 'GET',
            },
        );
        this.state = await response.json();

        this.notify(new MazeEvent(MazeEventType.Generate));
    }

    async getByKey(key: string) {
        const response = await fetch(`http://localhost:8000/maze/${key}`, {
            method: 'GET',
        });
        this.state = await response.json();

        this.notify(new MazeEvent(MazeEventType.Generate));
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
