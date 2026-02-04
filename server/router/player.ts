import { Controller, Get } from '@server/router/decorators';
import { game } from '@server/service';
import { IPlayerState } from '@shared/types';

@Controller('/player')
export class PlayerController {
    private id = 0;

    @Get('/ws')
    ws(req: Request): Response {
        if (req.headers.get('upgrade') !== 'websocket')
            return new Response('not found', {
                status: 404,
            });

        const { socket, response } = Deno.upgradeWebSocket(req);

        this.onWsOpen(socket);
        this.onWsMessage(socket);

        return response;
    }

    @Get('/generate-id')
    generateId(): Response {
        return new Response(JSON.stringify(this.id++), {
            status: 200,
        });
    }

    @Get('/delete')
    delete(req: Request): Response {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        const mazeKey = url.searchParams.get('mazeKey');

        if (!(id && mazeKey))
            return new Response('not found', {
                status: 404,
            });

        game.deletePlayer(+id, mazeKey);
        game.deleteEmptyMazes();

        return new Response(
            `Игрок ${id} удален на лабиринте по ключу ${mazeKey}.`,
            {
                status: 200,
            },
        );
    }

    private onWsOpen(socket: WebSocket) {
        socket.onopen = () => {
            console.log('a client connected!');
        };
    }

    private onWsMessage(socket: WebSocket) {
        socket.onmessage = (ev) => {
            const data: { player: IPlayerState; mazeKey: string } = JSON.parse(
                ev.data,
            );

            if (data.player.id === null) return;

            game.addPlayerOnMaze(data.player, socket, data.mazeKey);
            const playersOnMaze = game.findGameState(
                data.mazeKey,
            )?.playersState;

            playersOnMaze
                ?.filter(
                    (playerState) => playerState.player.id !== data.player.id,
                )
                .forEach((playerState) =>
                    playerState.client.send(JSON.stringify(data.player)),
                );
        };
    }
}
