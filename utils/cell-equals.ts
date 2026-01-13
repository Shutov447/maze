import { Cell } from 'Maze';

export const cellsEqual = (a: Cell, b: Cell) =>
    JSON.stringify(a) === JSON.stringify(b);
