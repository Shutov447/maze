import { INotifyEvent } from 'Types';

export class PlayerEvent implements INotifyEvent {
    constructor(readonly type: PlayerEventType) {}
}
export enum PlayerEventType {
    Generate,
    CurrentCellIsSet,
    Move,
}

export type MovementDirection = 'Left' | 'Down' | 'Right' | 'Up';
export type InputHandlerObject = [
    type: keyof HTMLElementEventMap,
    listener: EventListener
];
export type PlayerElem = HTMLElement;
