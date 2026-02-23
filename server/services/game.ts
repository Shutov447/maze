import {
    IMazeState,
    IPlayerState,
    IWsPlayerResponse,
    PlayerEventType,
} from '@shared/types';
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
        const playersState = this.findGameState(mazeKey)?.playersState;
        if (!playersState) return;

        playersState.push({ player, client });
        this.stateExchangeBetweenPlayers(mazeKey, {
            type: PlayerEventType.Generate,
        });
    }

    updatePlayerState(player: IPlayerState, mazeKey: string) {
        const state = this.findGameState(mazeKey);
        if (!state) return;

        const playerIndex = state.playersState.findIndex(
            (playerState) => playerState.player.id === player.id,
        );
        state.playersState[playerIndex].player = player;

        this.sendToAllPlayersOnMaze(
            mazeKey,
            {
                player,
                type: PlayerEventType.Move,
            },
            player.id,
        );
    }

    deletePlayer(id: number, mazeKey: string) {
        const state = this.findGameState(mazeKey);
        const player = this.findPlayerOnMaze(id, mazeKey);
        if (!(state && player)) return;

        state.playersState = state.playersState.filter(
            (state) => state.player.id !== id,
        );

        this.sendToAllPlayersOnMaze(mazeKey, {
            player,
            type: PlayerEventType.Delete,
        });
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

    stateExchangeBetweenPlayers(
        mazeKey: string,
        response: Omit<IWsPlayerResponse, 'player'>,
        ...exIds: number[]
    ) {
        this.findGameState(mazeKey)?.playersState.forEach((state) =>
            this.sendToAllPlayersOnMaze(
                mazeKey,
                {
                    player: state.player,
                    ...response,
                },
                ...exIds,
            ),
        );
    }

    sendToAllPlayersOnMaze(
        mazeKey: string,
        response: IWsPlayerResponse,
        ...exIds: number[]
    ) {
        const playersOnMaze = game.findGameState(mazeKey)?.playersState;
        if (playersOnMaze)
            playersOnMaze.forEach((state) => {
                if (!exIds.includes(state.player.id))
                    state.client.send(JSON.stringify(response));
            });
    }

    win(playerId: number, mazeKey: string) {
        const player = this.findPlayerOnMaze(playerId, mazeKey);
        if (player) {
            this.sendToAllPlayersOnMaze(mazeKey, {
                player,
                type: PlayerEventType.Win,
            });
            game.deleteMaze(mazeKey);
        }
    }
}

export const game = new Game();
