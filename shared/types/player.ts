import { Cell, CellState, INotifyEvent, MazeEventType } from '@shared/types';

export class PlayerEvent implements INotifyEvent {
    constructor(readonly type: PlayerEventType) {}
}
export enum PlayerEventType {
    Generate,
    Move,
    Delete,
    Win,
    RandomMovementAbility,
}

export interface IPlayerState {
    currentCell: Cell;
    lastMove: MovementDirection | null;
    id: number;
    color: string;
    sizePx: number;
}

export interface RequestAdditionalData {
    changedMazeMapCells?: ChangedMazeMapCells;
    activatedRemoteRandomMovementDirection?: boolean;
}
export interface IWsPlayerRequest {
    playerState: IPlayerState;
    mazeKey: string;
    additionalData?: RequestAdditionalData;
}

export type ResponseAdditionalData = Omit<
    RequestAdditionalData,
    'activatedRemoteRandomMovementDirection'
>;
export interface IWsPlayerResponse {
    player: IPlayerState;
    type: PlayerEventType | MazeEventType;
    additionalData?: ResponseAdditionalData;
}

export type MovementDirection = 'Left' | 'Down' | 'Right' | 'Up';

export type InputHandlerObject = [
    type: keyof HTMLElementEventMap,
    listener: EventListener,
];
export type PlayerElem = HTMLElement;
export type ChangedMazeMapCells = { cell: Cell; cellState: CellState }[];
