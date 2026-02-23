import type { AugmentedRequest } from '@server/shared/types';
import { game, Maze } from '@server/services';
import { Controller, Get } from '@server/router/decorators';

@Controller('/maze')
export class MazeController {
    @Get('/generate')
    generate(req: Request): Response {
        const url = new URL(req.url);
        const rows = url.searchParams.get('rows');
        const cols = url.searchParams.get('cols');

        if (!(rows && cols))
            return new Response(JSON.stringify('Не указан размер.'), {
                status: 404,
            });

        const maze = new Maze();
        const payload = JSON.stringify(maze.make(+rows, +cols));
        game.addMaze(maze.getState());

        return new Response(payload, {
            headers: {
                'content-type': 'application/json',
            },
            status: 200,
        });
    }

    @Get('/:key')
    getByKey(req: AugmentedRequest): Response {
        const mazeKey = req.params.key;
        const state = game.findGameState(mazeKey);

        if (!state)
            return new Response(
                JSON.stringify(`Игра не найдена. Ключ игры: ${mazeKey}.`),
                {
                    status: 404,
                },
            );

        return new Response(JSON.stringify(state.mazeState), {
            headers: {
                'content-type': 'application/json',
            },
            status: 200,
        });
    }
}
