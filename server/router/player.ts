import { IWsPlayerRequest } from '@shared/types';
import { game } from '@server/services';
import { Controller, Get } from '@server/router/decorators';

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

    private onWsOpen(socket: WebSocket) {
        socket.onopen = () => {
            console.log('a client connected!');
        };
    }

    private onWsMessage(socket: WebSocket) {
        socket.onmessage = (ev) => {
            const current: IWsPlayerRequest = JSON.parse(ev.data);

            if (current.changedMazeMapCells) {
                game.changeMazeMap(
                    current.playerState.id,
                    current.mazeKey,
                    current.changedMazeMapCells,
                );
                return;
            }

            const playerExistOnMaze = !!game.findPlayerOnMaze(
                current.playerState.id,
                current.mazeKey,
            );
            playerExistOnMaze
                ? game.updatePlayerState(current.playerState, current.mazeKey)
                : game.addPlayerOnMaze(
                      current.playerState,
                      socket,
                      current.mazeKey,
                  );
        };
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
            return new Response(
                `Невозможно удалить игрока ${id} из лабиринта по ключу ${mazeKey}.`,
                {
                    status: 404,
                },
            );

        game.deletePlayer(+id, mazeKey);
        game.deleteEmptyMazes();

        return new Response(
            `Игрок ${id} удален на лабиринте по ключу ${mazeKey}.`,
            {
                status: 200,
            },
        );
    }

    @Get('/win') win(req: Request): Response {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        const mazeKey = url.searchParams.get('mazeKey');

        if (!(id && mazeKey))
            return new Response('not found', {
                status: 404,
            });

        game.win(+id, mazeKey);
        return new Response(
            `Игрок ${id} победил на лабиринте по ключу ${mazeKey}.`,
            {
                status: 200,
            },
        );
    }
}
