import { IPlayerState } from '@shared/types';

export class GameService {
    private readonly socket = new WebSocket('ws://localhost:8000/player/ws');

    constructor() {
        this.socket.onopen = () => {
            console.log('a server connected');
        };
        this.socket.onmessage = (event) => {
            console.log(JSON.parse(event.data));
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
            `http://localhost:8000/player/delete?id=${id}&mazeKey=${mazeKey}`,
            {
                method: 'GET',
            },
        );
    }
}
