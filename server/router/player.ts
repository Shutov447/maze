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

    private onWsOpen(socket: WebSocket) {
        socket.onopen = () => {
            console.log('a client connected!');
        };
    }

    private onWsMessage(socket: WebSocket) {
        socket.onmessage = (ev) => {
            const current: { player: IPlayerState; mazeKey: string } =
                JSON.parse(ev.data);

            const playerExistOnMaze = !!game.findPlayerOnMaze(
                current.player.id,
                current.mazeKey,
            );

            game.addPlayerOnMaze(current.player, socket, current.mazeKey);

            const playersOnMaze = game.findGameState(
                current.mazeKey,
            )?.playersState;
            playersOnMaze?.forEach((playerState) => {
                if (!playerExistOnMaze) {
                    playersOnMaze.forEach((anotherPlayerState) =>
                        anotherPlayerState.client.send(
                            JSON.stringify({
                                player: playerState.player,
                                isGenerated: playerExistOnMaze,
                            }),
                        ),
                    );

                    return;
                }

                const isOtherPlayer =
                    playerState.player.id !== current.player.id;
                if (isOtherPlayer) {
                    playerState.client.send(
                        JSON.stringify({
                            player: current.player,
                            isGenerated: playerExistOnMaze,
                        }),
                    );

                    return;
                }
            });
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

    @Get('/win') win(req: Request): Response {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        const mazeKey = url.searchParams.get('mazeKey');

        if (!(id && mazeKey))
            return new Response('not found', {
                status: 404,
            });

        this.onWin(+id, mazeKey);
        return new Response(
            `Игрок ${id} победил на лабиринте по ключу ${mazeKey}.`,
            {
                status: 200,
            },
        );
    }

    onWin(id: number, mazeKey: string) {
        const gameState = game.findGameState(mazeKey);
        gameState?.playersState.forEach(({ client }) =>
            client.send(JSON.stringify({ winnerId: id, isGenerated: true })),
        );
        game.deleteMaze(mazeKey);
    }
}
