import { MazeController, MazeModel, MazeView } from '@client/maze';
import {
    ControlledPlayerController,
    ControlledPlayerModel,
    ControlledPlayerView,
} from '@client/controlled-player';
import { Game } from '@client/game';

class App {
    private readonly playButton = document.getElementById('play');
    private readonly rows = document.getElementById('rows') as HTMLInputElement;
    private readonly cols = document.getElementById('cols') as HTMLInputElement;
    private readonly mazeKay = document.getElementById(
        'mazeKey',
    ) as HTMLInputElement;

    constructor(private readonly game: Game) {}

    main() {
        this.playButton?.addEventListener('click', () => {
            game.start(
                this.mazeKay.value || [+this.rows.value, +this.cols.value],
                20,
            );

            [this.rows, this.cols, this.mazeKay].forEach(
                (input) => (input.value = ''),
            );
        });

        [this.rows, this.cols, this.mazeKay].forEach((input) => {
            input.addEventListener('click', (ev) => {
                ev.stopPropagation();
                input.focus();
            });
        });

        onbeforeunload = () => {
            game.deletePlayer();
        };
    }
}

const mazeModel = new MazeModel();
const mazeView = new MazeView();
const maze = new MazeController(mazeModel, mazeView);

const playerModel = new ControlledPlayerModel();
const playerView = new ControlledPlayerView();
const player = new ControlledPlayerController(playerModel, playerView);

const game = new Game(maze, player);

new App(game).main();
