export type MazeStructure = MazeRow[];
export type MazeRow = CellState[];
export type CellState = Passage | Wall;
export type Passage = 0;
export type Wall = 1;
export type Cell = [row: number, col: number];
export type MazeElem = HTMLElement;
export type PlayerElem = HTMLElement;

export interface IObserver {
    update: (subject: ISubject) => void;
}

export interface ISubject {
    attach: (observer: IObserver) => void;
    detach: (observer: IObserver) => void;
    notify: () => void;
}
