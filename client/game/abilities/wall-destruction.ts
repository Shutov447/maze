import { Cell, InputHandlerObject, Passage } from '@shared/types';
import { MazeController } from '@client/maze';
import { ControlledPlayerController } from '@client/controlled-player';
import { GameService, IAbility } from '@client/game';

export class WallDestructionAbility implements IAbility {
    constructor(
        private readonly maze: MazeController,
        private readonly player: ControlledPlayerController,
        private readonly gameService: GameService,
        readonly cooldownTimeMs: number,
    ) {}

    getInputHandlerObject() {
        return this.handlerObject;
    }

    private cooldownTrigger = true;
    private readonly handlerObject: InputHandlerObject = [
        'keydown',
        (ev: Event): void => {
            if (!this.cooldownTrigger) return;
            if (!(ev instanceof KeyboardEvent)) return;
            if (!(ev.key === ' ')) return;

            const currentCell = this.player.getState().currentCell;
            const mazeCellsToDestroy =
                this.getBreakingMazeCellsAroundPlayer(currentCell);
            const passage: Passage = 1;
            mazeCellsToDestroy.forEach((cell) =>
                this.maze.setCellStateInMap(cell, passage),
            );

            if (!mazeCellsToDestroy.length) return;

            // TODO: возможно сделать сокет у maze контроллера и через него передавать эти изменения карты
            this.gameService.send({
                playerState: this.player.getState(),
                mazeKey: this.maze.getState().key,
                additionalData: {
                    changedMazeMapCells: mazeCellsToDestroy.map((cell) => ({
                        cell,
                        cellState: passage,
                    })),
                },
            });

            this.cooldownTrigger = false;
            const timerId = setTimeout(() => {
                this.cooldownTrigger = true;
                clearTimeout(timerId);
            }, this.cooldownTimeMs);
        },
    ];

    private getBreakingMazeCellsAroundPlayer = (playerCell: Cell): Cell[] => {
        const siblingTouchingCells: Cell[] = [
            [playerCell[0], playerCell[1] - 1],
            [playerCell[0] + 1, playerCell[1]],
            [playerCell[0], playerCell[1] + 1],
            [playerCell[0] - 1, playerCell[1]],
        ];
        const siblingCellsDiagonally: Cell[] = [
            [playerCell[0] - 1, playerCell[1] - 1],
            [playerCell[0] - 1, playerCell[1] + 1],
            [playerCell[0] + 1, playerCell[1] + 1],
            [playerCell[0] + 1, playerCell[1] - 1],
        ];
        const cellAroundPlayerWithoutBorders = [
            ...siblingTouchingCells,
            ...siblingCellsDiagonally,
        ].filter(
            (cell) =>
                !this.maze
                    .getMapBorders()
                    .map(
                        (borderCell) =>
                            borderCell[0] === cell[0] &&
                            borderCell[1] === cell[1],
                    )
                    .includes(true),
        );

        return cellAroundPlayerWithoutBorders.filter((cell) =>
            this.maze.isWall(cell),
        );
    };
}
