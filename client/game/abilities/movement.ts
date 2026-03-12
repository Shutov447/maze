import { InputHandlerObject, MovementDirection } from '@shared/types';
import { MazeController } from '@client/maze';
import { ControlledPlayerController } from '@client/controlled-player';
import { IAbility } from '@client/game';

export class MovementAbility implements IAbility {
    constructor(
        protected readonly maze: MazeController,
        protected readonly player: ControlledPlayerController,
    ) {}

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
