import {
    INotifyEvent,
    IObserver,
    IPlayerState,
    ISubject,
    PlayerEvent,
    PlayerEventType,
} from '@shared/types';
import { env } from '@client/env';

export class GameService implements ISubject {
    private readonly socket = new WebSocket(`${env.WS}/player/ws`);
    private readonly observers = new Set<IObserver>();

    constructor() {
        this.socket.onopen = () => {
            console.log('a server connected');
        };
        this.socket.onmessage = (event) => {
            const {
                player,
                isGenerated,
                isDeletedPlayer,
                winnerId,
            }: {
                player: IPlayerState;
                isGenerated: boolean;
                isDeletedPlayer: boolean;
                winnerId: number;
            } = JSON.parse(event.data);

            if (isDeletedPlayer) {
                this.notify(new PlayerEvent(PlayerEventType.Delete), player);
                return;
            }
            if (!isGenerated) {
                this.notify(new PlayerEvent(PlayerEventType.Generate), player);
                return;
            }
            if (winnerId) {
                this.notify(new PlayerEvent(PlayerEventType.Win), player);
                return;
            }

            this.notify(new PlayerEvent(PlayerEventType.Move), player);
        };
    }

    send(player: IPlayerState, mazeKey: string) {
        const data = JSON.stringify({ player, mazeKey });
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        } else if (this.socket.readyState === WebSocket.CONNECTING) {
            this.socket.onopen = () => {
                this.socket.send(data);
            };
        }
    }

    async deletePlayer(id: number, mazeKey: string) {
        return await fetch(
            `${env.DOMAIN}/player/delete?id=${id}&mazeKey=${mazeKey}`,
            {
                method: 'GET',
            },
        );
    }

    async finishGame(id: number, mazeKey: string) {
        return await fetch(
            `${env.DOMAIN}/player/win?id=${id}&mazeKey=${mazeKey}`,
            {
                method: 'GET',
            },
        );
    }

    notify(event: INotifyEvent, data?: IPlayerState): void {
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
}
