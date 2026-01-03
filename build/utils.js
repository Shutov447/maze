export const cellsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const generateColor = () => `rgb(
        ${[0, 0, 0].map(() => Math.round(Math.random() * 255)).toString()}
    )`;
export const generateId = (...values) => values.toString();
export const findRandomPassageCell = (map, rows, cols) => {
    let row = 0;
    let col = 0;
    while (map[row][col] === 1) {
        row = Math.round(Math.random() * (rows - 1));
        col = Math.round(Math.random() * (cols - 1));
    }
    return [row, col];
};
