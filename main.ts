import { Game } from './game.js';
import { MazeController, MazeModel, MazeView } from 'Maze';
import { PlayerController, PlayerModel, PlayerView } from 'Player';

const main = () => {
    const playerModel = new PlayerModel();
    const playerView = new PlayerView();
    const player = new PlayerController(playerModel, playerView);

    const mazeModel = new MazeModel(6, 6, 0.4, 20);
    const mazeView = new MazeView();
    const maze = new MazeController(mazeModel, mazeView, player);

    const game = new Game(maze, player);
    playerModel.attach(game);
    mazeModel.attach(game);
    game.start();
};

main();
