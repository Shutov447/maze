import {
    Cell,
    INotifyEvent,
    InputHandlerObject,
    IObserver,
    ISubject,
    Passage,
    PlayerEvent,
    PlayerEventType,
} from '@shared/types';
import { MazeController } from '@client/maze';
import { ControlledPlayerController } from '@client/controlled-player';
import { GameService, IAbility, RendererAbilityInfo } from '@client/game';

export class WallDestructionAbility implements IAbility, IObserver {
    constructor(
        private readonly maze: MazeController,
        private readonly player: ControlledPlayerController,
        private readonly elemIdToRenderInfo: string,
        private readonly gameService: GameService,
        readonly cooldownTimeMs: number,
    ) {
        player.attach(this);
    }

    update(subject: ISubject, event: INotifyEvent) {
        if (
            subject instanceof ControlledPlayerController &&
            event instanceof PlayerEvent
        ) {
            switch (event.type) {
                case PlayerEventType.Generate:
                    this.onGenerate();
                    break;
                case PlayerEventType.Delete:
                    this.onDelete();
                    break;
            }
        }
    }
    onGenerate() {
        this.showInfo();
    }
    showInfo() {
        RendererAbilityInfo.render(
            this.elemIdToRenderInfo,
            `Вы можете сломать стены вокруг себя. Радиус разрушения стен: 1 клетка.
            Повторное использование будет доступно через ${this.cooldownTimeMs / 1000} сек.`,
        );
    }
    onDelete() {
        this.player.detach(this);
        RendererAbilityInfo.reset(this.elemIdToRenderInfo);
    }

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
