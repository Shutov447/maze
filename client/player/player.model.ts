import {
    IPlayerState,
    MovementDirection,
    PlayerEvent,
    PlayerEventType,
} from '@shared/types';
import { Cell, ISubject, IObserver, INotifyEvent } from '@shared/types';
import { generateColor } from '@shared/utils';
import { env } from '@client/env';

export class PlayerModel implements ISubject {
    private readonly observers = new Set<IObserver>();

    protected state: IPlayerState = {
        currentCell: [0, 0],
        lastMove: null,
        id: NaN,
        color: generateColor(),
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

    async generateId() {
        const response = await fetch(`${env.DOMAIN}/player/generate-id`, {
            method: 'GET',
        });
        this.state.id = await response.json();
        this.notify(new PlayerEvent(PlayerEventType.Generate), {
            state: this.state,
            isMain: true,
        });
    }

    setCurrentCell(cell: Cell) {
        this.state.currentCell = cell;

        this.notify(new PlayerEvent(PlayerEventType.CurrentCellIsSet));
    }

    notify(
        event: INotifyEvent,
        data?: IPlayerState | { state: IPlayerState; isMain: true },
    ): void {
        this.observers.forEach((observer) =>
            observer.update(this, event, data),
        );
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

    resetState() {
        this.state = {
            ...this.state,
            currentCell: [0, 0],
            lastMove: null,
            id: NaN,
        };
    }
}
