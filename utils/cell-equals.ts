import { Cell } from 'Types';

export const cellsEqual = (a: Cell, b: Cell) =>
    JSON.stringify(a) === JSON.stringify(b);
