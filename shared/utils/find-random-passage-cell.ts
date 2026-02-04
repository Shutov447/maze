import { Cell, CellState, MazeStructure, Wall } from '@shared/types';
import { cellsEqual } from '@shared/utils';

export const findRandomPassageCell = (
    mazeMap: MazeStructure,
    ...exceptions: Cell[]
): Cell => {
    let row = 0;
    let col = 0;

    const isExCell = (cell: Cell) =>
        exceptions.find((exCell) => cellsEqual(exCell, cell));

    let cell: Cell = [row, col];
    let cellState: CellState = mazeMap[row][col];

    while (cellState === WALL || isExCell(cell)) {
        row = Math.round(Math.random() * (mazeMap.length - 2));
        col = Math.round(Math.random() * (mazeMap[0].length - 2));

        cell = [row, col];
        cellState = mazeMap[row]?.[col];
    }

    return cell;
};
const WALL: Wall = 0;
