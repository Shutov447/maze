import {
    INotifyEvent,
    IObserver,
    IPlayerState,
    ISubject,
    MovementDirection,
    PlayerEvent,
    PlayerEventType,
} from '@shared/types';

export class BasePlayerModel implements ISubject {
    protected state: IPlayerState = {
        currentCell: [0, 0],
        lastMove: null,
        id: NaN,
        color: '',
        sizePx: 0,
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

    private readonly observers = new Set<IObserver>();
    notify(event: INotifyEvent): void {
        this.observers.forEach((observer) => observer.update(this, event));
    }
    attach(observer: IObserver): void {
        this.observers.add(observer);
    }
    detach(observer: IObserver): void {
        this.observers.delete(observer);
    }

    setState(state: IPlayerState) {
        this.state = state;

        this.notify(new PlayerEvent(PlayerEventType.Generate));
    }

    getState(): IPlayerState {
        return structuredClone(this.state);
    }

    resetState() {
        this.state = {
            currentCell: [0, 0],
            lastMove: null,
            id: NaN,
            color: '',
            sizePx: 0,
        };

        this.notify(new PlayerEvent(PlayerEventType.Delete));
    }
}
