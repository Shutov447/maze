import { Cell } from '@shared/types';

export const cellsEqual = (a: Cell, b: Cell) =>
    JSON.stringify(a) === JSON.stringify(b);
