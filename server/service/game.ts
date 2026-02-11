import { IMazeState, IPlayerState } from '@shared/types';
import { IGameState } from '@server/shared/types';

class Game {
    private states: IGameState[] = [];

    addMaze(maze: IMazeState) {
        this.states.push({ mazeState: maze, playersState: [] });
    }

    deleteEmptyMazes() {
        this.states = this.states.filter((state) => state.playersState.length);
    }

    addPlayerOnMaze(player: IPlayerState, client: WebSocket, mazeKey: string) {
        const state = this.findGameState(mazeKey);

        if (!state) return;

        const playerState = { player, client };

        const playerIndex = state.playersState.findIndex(
            (playerState) => playerState.player.id === player.id,
        );
        playerIndex !== -1
            ? (state.playersState[playerIndex] = playerState)
            : state.playersState.push(playerState);
    }

    deletePlayer(id: number, mazeKey: string) {
        const state = this.findGameState(mazeKey);
        if (!state) return;

        const deletedPlayer = this.findPlayerOnMaze(id, mazeKey);
        if (!deletedPlayer) return;

        state.playersState = state.playersState.filter(
            (playerState) => playerState.player.id !== deletedPlayer.id,
        );

        state.playersState.forEach(({ client }) =>
            client.send(
                JSON.stringify({
                    player: deletedPlayer,
                    isDeletedPlayer: true,
                }),
            ),
        );
    }

    findPlayerOnMaze(id: number, mazeKey: string) {
        return this.findGameState(mazeKey)?.playersState.find(
            (playerState) => playerState.player.id === id,
        )?.player;
    }

    findGameState(mazeKey: string): IGameState | undefined {
        return this.states.find(({ mazeState }) => mazeState.key === mazeKey);
    }

    deleteMaze(mazeKey: string) {
        this.states = this.states.filter(
            ({ mazeState }) => mazeState.key !== mazeKey,
        );
    }
}

export const game = new Game();
