import { Game } from 'Game';
import { MazeController, MazeModel, MazeView } from 'Maze';
import { PlayerController, PlayerModel, PlayerView } from 'Player';

class App {
    constructor(private readonly game: Game) {}

    main() {
        this.game.start();
    }
}

const mazeModel = new MazeModel(20, 20);
const mazeView = new MazeView(20);
const maze = new MazeController(mazeModel, mazeView);

const playerModel = new PlayerModel();
const playerView = new PlayerView();
const player = new PlayerController(playerModel, playerView);

const game = new Game(maze, player);

new App(game).main();
