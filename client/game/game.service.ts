import {
    INotifyEvent,
    IObserver,
    IPlayerState,
    ISubject,
    IWsPlayerResponse,
    PlayerEvent,
} from '@shared/types';
import { env } from '@client/env';

export class GameService implements ISubject {
    private readonly socket = new WebSocket(`${env.WS}/player/ws`);
    private readonly observers = new Set<IObserver>();

    private currentMoverPlayerState?: IPlayerState;

    constructor() {
        this.socket.onopen = () => {
            console.log('a server connected');
        };
        this.socket.onmessage = (event) => {
            const { player, type }: IWsPlayerResponse = JSON.parse(event.data);
            this.currentMoverPlayerState = player;

            this.notify(new PlayerEvent(type));
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

    getCurrentMoverPlayerState() {
        return structuredClone(this.currentMoverPlayerState);
    }

    async deletePlayer(id: number, mazeKey: string) {
        return await fetch(
            `${env.DOMAIN}/player/delete?id=${id}&mazeKey=${mazeKey}`,
            {
                method: 'GET',
            },
        );
    }

    async winGame(id: number, mazeKey: string) {
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
