import { INotifyEvent, MovementDirection } from '@shared/types';

export class MazeEvent implements INotifyEvent {
    constructor(readonly type: MazeEventType) {}
}

export interface IMazeState {
    rows: number;
    cols: number;
    finishCell: Cell;
    map: MazeStructure;
    key: string;
}
export interface IClientMazeState extends IMazeState {
    cellSizePx: number;
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
    Delete,
}

export type MazeStructure = MazeRow[];
export type MazeRow = CellState[];
export type CellState = Passage | Wall;
export type Cell = [row: number, col: number];
export type MazeElem = HTMLElement;
export type Wall = 0;
export type Visited = 0.5;
export type Passage = 1;
