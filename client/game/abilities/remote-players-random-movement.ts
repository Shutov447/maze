import { InputHandlerObject } from '@shared/types';
import { MazeController } from '@client/maze';
import { ControlledPlayerController } from '@client/controlled-player';
import {
    GameService,
    RandomMovementAbility,
    RendererAbilityInfo,
} from '@client/game';

export class RemotePlayersRandomMovementAbility extends RandomMovementAbility {
    constructor(
        protected override readonly maze: MazeController,
        protected override readonly player: ControlledPlayerController,
        protected override readonly elemIdToRenderInfo: string,
        protected override readonly mainMovementHandlerObject: InputHandlerObject,
        protected override readonly changeTimeMs: number,
        protected readonly gameService: GameService,
        protected readonly cooldownTimeMs: number,
    ) {
        super(
            maze,
            player,
            elemIdToRenderInfo,
            mainMovementHandlerObject,
            changeTimeMs,
        );
    }

    override onDelete() {
        super.onDelete();
        clearTimeout(this.cooldownTimerId);
    }
    override showInfo() {
        RendererAbilityInfo.render(
            this.elemIdToRenderInfo,
            `Вы можете случайным образом изменить направления движений всех игроков на карте на ${this.changeTimeMs / 1000} сек.
            Повторное использование будет доступно через ${this.cooldownTimeMs / 1000} сек.`,
        );
    }

    private cooldownTimerId = NaN;
    private cooldownTrigger = true;
    protected override readonly handlerObject: InputHandlerObject = [
        'keydown',
        (ev: Event): void => {
            if (!this.cooldownTrigger) return;
            if (!(ev instanceof KeyboardEvent)) return;
            if (!(ev.key === ' ')) return;

            this.gameService.send({
                playerState: this.player.getState(),
                mazeKey: this.maze.getState().key,
                additionalData: {
                    activatedRemoteRandomMovementDirection: true,
                },
            });

            this.cooldownTrigger = false;
            this.cooldownTimerId = setTimeout(() => {
                this.cooldownTrigger = true;

                clearTimeout(this.cooldownTimerId);
            }, this.cooldownTimeMs);
        },
    ];
}
