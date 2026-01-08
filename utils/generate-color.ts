export const generateColor = () =>
    `rgb(
        ${[0, 0, 0].map(() => Math.round(Math.random() * 255)).toString()}
    )`;
