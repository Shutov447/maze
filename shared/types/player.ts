import { Cell, CellState, INotifyEvent, MazeEventType } from '@shared/types';

export class PlayerEvent implements INotifyEvent {
    constructor(readonly type: PlayerEventType) {}
}
export enum PlayerEventType {
    Generate,
    Move,
    Delete,
    Win,
}

export interface IPlayerState {
    currentCell: Cell;
    lastMove: MovementDirection | null;
    id: number;
    color: string;
    sizePx: number;
}

export interface IWsPlayerRequest {
    playerState: IPlayerState;
    mazeKey: string;
    changedMazeMapCells?: ChangedMazeMapCells;
}
export interface IWsPlayerResponse {
    player: IPlayerState;
    type: PlayerEventType | MazeEventType;
    changedMazeMapCells?: ChangedMazeMapCells;
}

export type MovementDirection = 'Left' | 'Down' | 'Right' | 'Up';
export type InputHandlerObject = [
    type: keyof HTMLElementEventMap,
    listener: EventListener,
];
export type PlayerElem = HTMLElement;
export type ChangedMazeMapCells = { cell: Cell; cellState: CellState }[];
