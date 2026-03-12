import { IMazeState, IPlayerState } from '@shared/types';

export interface IGameState {
    mazeState: IMazeState;
    playersState: Map<
        number,
        {
            client: WebSocket;
            player: IPlayerState;
        }
    >;
}
