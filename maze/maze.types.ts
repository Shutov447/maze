import { MovementDirection } from 'Player';
import { INotifyEvent } from 'Types';

export class MazeEvent implements INotifyEvent {
    constructor(readonly type: MazeEventType) {}
}

export interface IMazeSibling {
    type: MovementDirection;
    state: Passage | Wall | Visited;
    row: number;
    col: number;
    carvePassage: (row: number, col: number) => void;
}

export enum MazeEventType {
    Generate,
}

export type MazeStructure = MazeRow[];
export type MazeRow = CellState[];
export type CellState = Passage | Wall;
export type Cell = [row: number, col: number];
export type MazeElem = HTMLElement;
export type Wall = 0;
export type Visited = 0.5;
export type Passage = 1;
