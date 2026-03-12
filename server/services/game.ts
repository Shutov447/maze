import {
    ChangedMazeMapCells,
    IMazeState,
    IPlayerState,
    IWsPlayerResponse,
    MazeEventType,
    PlayerEventType,
} from '@shared/types';
import { IGameState } from '@server/shared/types';

class Game {
    private states: IGameState[] = [];

    addPlayerOnMaze(player: IPlayerState, client: WebSocket, mazeKey: string) {
        const playersState = this.findGameState(mazeKey)?.playersState;
        if (!playersState) return;

        playersState.set(player.id, { player, client });
        this.stateExchangeBetweenPlayers(mazeKey, {
            type: PlayerEventType.Generate,
        });
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

    updatePlayerState(player: IPlayerState, mazeKey: string) {
        const state = this.findGameState(mazeKey);
        if (!state) return;

        const playerState = state.playersState.get(player.id);
        if (!playerState) return;
        state.playersState.set(player.id, { ...playerState, player });

        this.sendToAllPlayersOnMaze(
            mazeKey,
            {
                player,
                type: PlayerEventType.Move,
            },
            player.id,
        );
    }

    win(playerId: number, mazeKey: string) {
        const player = this.findPlayerOnMaze(playerId, mazeKey);
        if (player) {
            this.sendToAllPlayersOnMaze(mazeKey, {
                player,
                type: PlayerEventType.Win,
            });
            this.findGameState(mazeKey)?.playersState.forEach(({ player }) =>
                this.deletePlayer(player.id, mazeKey),
            );
            this.deleteMaze(mazeKey);
        }
    }

    deleteMaze(mazeKey: string) {
        this.states = this.states.filter(
            ({ mazeState }) => mazeState.key !== mazeKey,
        );
    }

    deletePlayer(id: number, mazeKey: string) {
        const state = this.findGameState(mazeKey);
        const player = this.findPlayerOnMaze(id, mazeKey);
        if (!(state && player)) return;

        this.sendToAllPlayersOnMaze(mazeKey, {
            player,
            type: PlayerEventType.Delete,
        });

        state.playersState.delete(id);
    }

    changeMazeMap(
        playerId: IPlayerState['id'],
        mazeKey: string,
        changes: ChangedMazeMapCells,
    ) {
        const mazeMap = this.findGameState(mazeKey)?.mazeState.map;
        if (!mazeMap) return;
        const player = this.findPlayerOnMaze(playerId, mazeKey);
        if (!player) return;

        changes.forEach(
            (change) =>
                (mazeMap[change.cell[0]][change.cell[1]] = change.cellState),
        );
        this.sendToAllPlayersOnMaze(
            mazeKey,
            {
                player,
                type: MazeEventType.ChangeCellState,
                additionalData: { changedMazeMapCells: changes },
            },
            playerId,
        );
    }

    sendToAllPlayersOnMaze(
        mazeKey: string,
        response: IWsPlayerResponse,
        ...exIds: number[]
    ) {
        const playersOnMaze = this.findGameState(mazeKey)?.playersState;
        if (playersOnMaze)
            playersOnMaze.forEach((state) => {
                if (!exIds.includes(state.player.id))
                    state.client.send(JSON.stringify(response));
            });
    }

    findPlayerOnMaze(id: number, mazeKey: string) {
        return this.findGameState(mazeKey)?.playersState.get(id)?.player;
    }

    findGameState(mazeKey: string): IGameState | undefined {
        return this.states.find(({ mazeState }) => mazeState.key === mazeKey);
    }

    addMaze(maze: IMazeState) {
        this.states.push({ mazeState: maze, playersState: new Map() });
    }

    deleteEmptyMazes() {
        this.states = this.states.filter((state) => state.playersState.size);
    }

    activateRandomMovementAbility(playerId: number, mazeKey: string) {
        const player = this.findPlayerOnMaze(playerId, mazeKey);
        if (!player) return;

        this.sendToAllPlayersOnMaze(mazeKey, {
            player,
            type: PlayerEventType.RandomMovementAbility,
        });
    }
}

export const game = new Game();
