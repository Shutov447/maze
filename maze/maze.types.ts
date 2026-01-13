import { INotifyEvent } from 'Types';

export class MazeEvent implements INotifyEvent {
    constructor(readonly type: MazeEventType) {}
}

export enum MazeEventType {
    Generate,
}

export type MazeStructure = MazeRow[];
export type MazeRow = CellState[];
export type CellState = Passage | Wall;
export type Passage = 0;
export type Wall = 1;
export type Cell = [row: number, col: number];
export type MazeElem = HTMLElement;
