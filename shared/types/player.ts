import { Cell, INotifyEvent } from '@shared/types';

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

export interface IWsPlayerResponse {
    player: IPlayerState;
    type: PlayerEventType;
}

export type MovementDirection = 'Left' | 'Down' | 'Right' | 'Up';
export type InputHandlerObject = [
    type: keyof HTMLElementEventMap,
    listener: EventListener,
];
export type PlayerElem = HTMLElement;
