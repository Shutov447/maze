import { Cell, IObserver, ISubject } from 'Types';

export interface IPlayerState {
    currentCell: Cell;
    lastMove: MovementDirection | null;
}

export enum MovementDirection {
    Left,
    Down,
    Right,
    Up,
}

export class PlayerModel implements ISubject {
    private readonly observers = new Set<IObserver>();
    private readonly state: IPlayerState = {
        currentCell: [0, 0],
        lastMove: null,
    };
    private readonly moves: Record<MovementDirection, () => void> = {
        [MovementDirection.Left]: () => this.moveLeft(),
        [MovementDirection.Down]: () => this.moveDown(),
        [MovementDirection.Right]: () => this.moveRight(),
        [MovementDirection.Up]: () => this.moveUp(),
    };

    move(direction: MovementDirection): void {
        this.moves[direction]();
        this.state.lastMove = direction;

        this.notify();
    }

    private moveLeft(): void {
        this.state.currentCell[1]--;
    }

    private moveDown(): void {
        this.state.currentCell[0]++;
    }

    private moveRight(): void {
        this.state.currentCell[1]++;
    }

    private moveUp(): void {
        this.state.currentCell[0]--;
    }

    setCurrentCell(cell: Cell) {
        this.state.currentCell = cell;
        this.notify();
    }

    getState(): IPlayerState {
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
