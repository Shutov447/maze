import { Game } from '@client/game';
import { MazeController, MazeModel, MazeView } from '@client/maze';
import { PlayerController, PlayerModel, PlayerView } from '@client/player';

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
            game.deletePlayer()?.then(() => {
                if (this.mazeKay.value) game.startByMazeKey(this.mazeKay.value);
                else {
                    const rows = +this.rows.value < 5 ? 5 : +this.rows.value;
                    const cols = +this.cols.value < 5 ? 5 : +this.cols.value;
                    game.start(rows, cols);
                }

                [this.rows, this.cols, this.mazeKay].forEach(
                    (input) => (input.value = ''),
                );
            });
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
const mazeView = new MazeView(20);
const maze = new MazeController(mazeModel, mazeView);

const playerModel = new PlayerModel();
const playerView = new PlayerView();
const player = new PlayerController(playerModel, playerView);

const game = new Game(maze, player);

new App(game).main();
