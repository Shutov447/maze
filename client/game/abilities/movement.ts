import {
    INotifyEvent,
    InputHandlerObject,
    IObserver,
    ISubject,
    MovementDirection,
    PlayerEvent,
    PlayerEventType,
} from '@shared/types';
import { MazeController } from '@client/maze';
import { ControlledPlayerController } from '@client/controlled-player';
import { IAbility, RendererAbilityInfo } from '@client/game';

export class MovementAbility implements IAbility, IObserver {
    constructor(
        protected readonly maze: MazeController,
        protected readonly player: ControlledPlayerController,
        protected readonly elemIdToRenderInfo: string,
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
            'Вы можете передвигаться на расстояние одной клетки за одно нажатие кнопки стрелки.',
        );
    }
    onDelete() {
        this.player.detach(this);
        RendererAbilityInfo.reset(this.elemIdToRenderInfo);
    }

    protected readonly handlerObject: InputHandlerObject = [
        'keydown',
        (ev: Event): void => {
            if (!(ev instanceof KeyboardEvent)) return;

            const key = ev.key;
            if (!key.includes('Arrow')) return;

            const currentCell = this.player.getState().currentCell;
            const direction = key.replace('Arrow', '') as MovementDirection;
            if (this.maze.isPassage(direction, currentCell)) {
                this.player.move(direction);
            }
        },
    ];
    getInputHandlerObject() {
        return this.handlerObject;
    }
}
