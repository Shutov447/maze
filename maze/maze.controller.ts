import { IMazeState, MazeModel, MazeView } from 'Maze';
import { PlayerController } from 'Player';
import { cellsEqual } from 'Utils';
import { PlayerElem, Cell } from 'Types';

export class MazeController {
    constructor(
        private readonly model: MazeModel,
        private readonly view: MazeView,
        private readonly player: PlayerController
    ) {}

    create(): void {
        this.model.generate();
        const state = this.model.getState();

        this.view.render(state, this.createPlayer(state));
    }

    private createPlayer(mazeState: IMazeState): PlayerElem {
        return this.player.create(
            mazeState.map,
            this.getRandomSpawnCell(),
            mazeState.cellSizePx
        );
    }

    private getRandomSpawnCell(): Cell {
        let spawnCell = this.model.findRandomPassageCell();

        while (cellsEqual(spawnCell, this.model.getState().finishCell))
            spawnCell = this.model.findRandomPassageCell();

        return spawnCell;
    }
}
