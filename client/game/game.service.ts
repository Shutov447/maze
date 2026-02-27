import {
    ChangedMazeMapCells,
    INotifyEvent,
    IObserver,
    IPlayerState,
    ISubject,
    IWsPlayerRequest,
    IWsPlayerResponse,
    MazeEvent,
    MazeEventType,
    PlayerEvent,
    PlayerEventType,
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
            const { player, type, changedMazeMapCells }: IWsPlayerResponse =
                JSON.parse(event.data);
            this.currentMoverPlayerState = player;

            // INFO: на самом деле плохое решение завязываться на changedMazeMapCells, если че просто под каждый ивент оповестить через switch case
            changedMazeMapCells?.length
                ? this.notify(new MazeEvent(type as MazeEventType), {
                      changedMazeMapCells,
                  })
                : this.notify(new PlayerEvent(type as PlayerEventType));
        };
    }

    send(data: IWsPlayerRequest) {
        const payload = JSON.stringify(data);
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(payload);
        } else if (this.socket.readyState === WebSocket.CONNECTING) {
            this.socket.onopen = () => {
                this.socket.send(payload);
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

    notify(
        event: INotifyEvent,
        data?: { changedMazeMapCells?: ChangedMazeMapCells },
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
}
