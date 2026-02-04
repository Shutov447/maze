import { Cell, INotifyEvent } from '@shared/types';

export class PlayerEvent implements INotifyEvent {
    constructor(readonly type: PlayerEventType) {}
}
export enum PlayerEventType {
    Generate,
    CurrentCellIsSet,
    Move,
}

export interface IPlayerState {
    currentCell: Cell;
    lastMove: MovementDirection | null;
    id: number;
}

export type MovementDirection = 'Left' | 'Down' | 'Right' | 'Up';
export type InputHandlerObject = [
    type: keyof HTMLElementEventMap,
    listener: EventListener,
];
export type PlayerElem = HTMLElement;
