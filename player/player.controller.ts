import { Cell, MazeStructure, PlayerElem } from 'Types';
import { MovementDirection, PlayerModel, PlayerView } from 'Player';

export class PlayerController {
    private map: MazeStructure | null = null;

    private keydownHandler: EventListener = this.handleKeydown.bind(
        this
    ) as EventListener;

    constructor(
        private readonly model: PlayerModel,
        private readonly view: PlayerView
    ) {}

    create(
        mazeMap: MazeStructure,
        spawnCell: Cell,
        sizePx: number
    ): PlayerElem {
        this.map = mazeMap;

        this.model.attach(this.view);
        this.model.setCurrentCell(spawnCell);

        this.view.addStyle(sizePx);
        this.view.setPosition(spawnCell);
        this.view.addInputHandler('keydown', this.keydownHandler);

        return this.view.elem;
    }

    private handleKeydown(ev: KeyboardEvent) {
        const currentCell = this.model.getState().currentCell;

        if (!this.map) return;

        const isPassageOnLeft =
            this.map[currentCell[0]][currentCell[1] - 1] !== 1;

        if (ev.key === 'ArrowLeft' && isPassageOnLeft) {
            this.model.move(MovementDirection.Left);

            return;
        }

        const isPassageOnDown =
            this.map[currentCell[0] + 1][currentCell[1]] !== 1;

        if (ev.key === 'ArrowDown' && isPassageOnDown) {
            this.model.move(MovementDirection.Down);

            return;
        }

        const isPassageOnRight =
            this.map[currentCell[0]][currentCell[1] + 1] !== 1;

        if (ev.key === 'ArrowRight' && isPassageOnRight) {
            this.model.move(MovementDirection.Right);

            return;
        }

        const isPassageOnUp =
            this.map[currentCell[0] - 1][currentCell[1]] !== 1;

        if (ev.key === 'ArrowUp' && isPassageOnUp) {
            this.model.move(MovementDirection.Up);

            return;
        }
    }

    win() {
        this.view.elem.removeEventListener('keydown', this.keydownHandler);

        console.log('WIN!');
    }
}
