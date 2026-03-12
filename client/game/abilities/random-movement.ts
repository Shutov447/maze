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
import { IAbility, MovementAbility } from '@client/game';

export class RandomMovementAbility
    extends MovementAbility
    implements IAbility, IObserver
{
    protected override readonly handlerObject: InputHandlerObject = [
        'keydown',
        (ev) => {
            if (!this.changeTrigger) return;
            if (!(ev instanceof KeyboardEvent)) return;
            if (!(ev.key === ' ')) return;

            this.changeMovement();
        },
    ];

    constructor(
        protected override readonly maze: MazeController,
        protected override readonly player: ControlledPlayerController,
        protected readonly mainMovementHandlerObject: InputHandlerObject,
        protected readonly changeTimeMs: number,
    ) {
        super(maze, player);
        player.attach(this);
    }

    update(subject: ISubject, event: INotifyEvent) {
        if (
            subject instanceof ControlledPlayerController &&
            event instanceof PlayerEvent
        ) {
            switch (event.type) {
                case PlayerEventType.Win:
                    this.onWin();
                    break;
                case PlayerEventType.Delete:
                    this.onDelete();
                    break;
            }
        }
    }
    onWin() {
        this.onDelete();
    }
    onDelete() {
        clearTimeout(this.changeMovementTimerId);
        this.player.detach(this);
    }

    private readonly movementHandlerObject: InputHandlerObject = [
        'keydown',
        (ev: Event): void => {
            if (!(ev instanceof KeyboardEvent)) return;

            const key = ev.key;
            if (!key.includes('Arrow')) return;

            const currentCell = this.player.getState().currentCell;
            const direction = this.directionsMap.get(
                key.replace('Arrow', '') as MovementDirection,
            );
            if (direction && this.maze.isPassage(direction, currentCell))
                this.player.move(direction);
        },
    ];

    private changeMovementTimerId = NaN;
    private changeTrigger = true;
    private directionsMap = this.getRandomMovementDirections();
    changeMovement() {
        if (!this.changeTrigger) return;

        this.directionsMap = this.getRandomMovementDirections();

        // TODO: пока оставлю логи, но позже все равно убрать надо
        console.log('before removeInputHandler');
        this.player.consoleHandlers();
        this.player.removeInputHandler(this.mainMovementHandlerObject);
        console.log('after removeInputHandler');
        this.player.consoleHandlers();

        this.player.addInputHandler(this.movementHandlerObject);
        console.log('random');

        this.changeTrigger = false;
        this.changeMovementTimerId = setTimeout(() => {
            this.player.removeInputHandler(this.movementHandlerObject);
            this.player.addInputHandler(this.mainMovementHandlerObject);
            console.log('main');

            this.changeTrigger = true;
            clearTimeout(this.changeMovementTimerId);
        }, this.changeTimeMs);
    }
    private getRandomMovementDirections() {
        const directionsMap = new Map<MovementDirection, MovementDirection>();
        let directions: MovementDirection[] = ['Left', 'Down', 'Right', 'Up'];
        let directionsForRandomize: MovementDirection[] = new Array(
            ...directions,
        );
        directions.forEach((direction) => {
            const newDirection = this.getNewDirections(directionsForRandomize);
            directionsMap.set(direction, newDirection);
            directions = directions.filter(
                (localDir) => localDir !== direction,
            );
            directionsForRandomize = directionsForRandomize.filter(
                (localDir) => localDir !== newDirection,
            );
        });

        return directionsMap;
    }
    private getNewDirections(directions: MovementDirection[]) {
        const index = Math.floor(Math.random() * directions.length);
        return directions[index];
    }
}
