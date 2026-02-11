import { IMazeState, IPlayerState } from '@shared/types';

export interface IGameState {
    mazeState: IMazeState;
    // TODO: возможно лучше переписать на Map
    // playersState: Map<number, {
    //     client: WebSocket;
    //     player: IPlayerState;
    // }>;
    playersState: {
        client: WebSocket;
        player: IPlayerState;
    }[];
}
