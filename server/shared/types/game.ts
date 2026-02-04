import { IMazeState, IPlayerState } from '@shared/types';

export interface IGameState {
    mazeState: IMazeState;
    playersState: {
        client: WebSocket;
        player: IPlayerState;
    }[];
}
