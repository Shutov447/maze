import { PlayerController, PlayerView } from '@client/player';
import { OtherPlayerModel } from '@client/other-player';
import { MazeController } from '@client/maze';
import { IPlayerState, MovementDirection } from '@shared/types';

// TODO: сделать синглтоном
class OtherPlayersManager {
    private readonly players: Map<number, PlayerController> = new Map();

    create(state: IPlayerState, maze: MazeController) {
        if (this.players.has(state.id)) return;

        const player = new PlayerController(
            new OtherPlayerModel(state.id, state.color),
            new PlayerView(),
        );
        player.create(state.currentCell, maze.getCellSizePx());
        maze.addRenderable(player);
        this.players.set(state.id, player);
    }

    move(id: number, direction: MovementDirection) {
        const player = this.players.get(id);

        if (!player) return;

        player.move(direction);
    }

    delete(playerId: number, maze: MazeController) {
        const playerToDelete = this.players.get(playerId);
        if (!playerToDelete) return;

        maze.removeRenderable(playerToDelete);
        this.players.delete(playerId);
    }

    deleteAll() {
        this.players.clear();
    }
}

export const otherPlayerMgr = new OtherPlayersManager();
