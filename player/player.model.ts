import { IObserver, ISubject, INotifyEvent } from 'Types';
import { Cell } from 'Maze';
import { MovementDirection, PlayerEvent, PlayerEventType } from 'Player';

export interface IPlayerState {
    currentCell: Cell;
    lastMove: MovementDirection | null;
}

export class PlayerModel implements ISubject {
    private readonly observers = new Set<IObserver>();
    private readonly state: IPlayerState = {
        currentCell: [0, 0],
        lastMove: null,
    };

    move(direction: MovementDirection): void {
        this[`move${direction}`]();
        this.state.lastMove = direction;

        this.notify(new PlayerEvent(PlayerEventType.Move));
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

        this.notify(new PlayerEvent(PlayerEventType.CurrentCellIsSet));
    }

    notify(event: INotifyEvent): void {
        this.observers.forEach((observer) => observer.update(this, event));
    }
    attach(observer: IObserver): void {
        this.observers.add(observer);
    }
    detach(observer: IObserver): void {
        this.observers.delete(observer);
    }

    getState(): IPlayerState {
        return structuredClone(this.state);
    }
}
