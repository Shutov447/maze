import { MazeController, MazeModel } from 'Maze';
import { PlayerController, PlayerModel } from 'Player';
import { cellsEqual } from 'Utils';
import { Cell, IObserver, ISubject } from 'Types';

export class Game implements IObserver {
    private finishCell: Cell = [0, 0];
    private playerCurrentCell: Cell = [0, 0];

    constructor(
        private readonly maze: MazeController,
        private readonly player: PlayerController
    ) {}

    start() {
        this.maze.create();
    }

    update(subject: ISubject): void {
        if (subject instanceof PlayerModel)
            this.playerCurrentCell = subject.getState().currentCell;

        if (subject instanceof MazeModel)
            this.finishCell = subject.getState().finishCell;

        this.isWin();
    }

    private isWin() {
        if (cellsEqual(this.playerCurrentCell, this.finishCell))
            this.player.win();
    }
}
