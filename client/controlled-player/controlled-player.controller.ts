import {
    Cell,
    InputHandlerObject,
    MediatorComponentMixin,
    PlayerEventType,
    MovementDirection,
} from '@shared/types';
import { BasePlayerController } from '@client/base-player';
import {
    ControlledPlayerModel,
    ControlledPlayerView,
} from '@client/controlled-player';

export class ControlledPlayerController extends MediatorComponentMixin<
    ControlledPlayerController,
    PlayerEventType
>()(BasePlayerController) {
    private inputHandlers: Set<InputHandlerObject> = new Set();

    constructor(
        override readonly model: ControlledPlayerModel,
        override readonly view: ControlledPlayerView,
    ) {
        super(model, view);
    }

    async create(
        spawnCell: Cell,
        sizePx: number,
        inputHandlers: InputHandlerObject[],
    ) {
        this.model.attach(this.view);
        await this.model.generate(sizePx, spawnCell);

        this.addInputHandlers(inputHandlers);

        this.mediator?.send(this, PlayerEventType.Generate);
    }

    override move(direction: MovementDirection): void {
        super.move(direction);

        this.mediator?.send(this, PlayerEventType.Move);
    }

    win() {
        console.log('WIN!');

        this.mediator?.send(this, PlayerEventType.Win);
    }

    override delete() {
        super.delete();
        this.removeAllInputHandlers();

        this.mediator?.send(this, PlayerEventType.Delete);
    }

    private addInputHandlers(handlers: InputHandlerObject[]) {
        this.inputHandlers = new Set(handlers);
        this.inputHandlers.forEach((handler) =>
            this.view.addInputHandler(handler),
        );
    }

    private removeAllInputHandlers() {
        this.inputHandlers.forEach((handler) =>
            this.view.removeInputHandler(handler),
        );
        this.inputHandlers.clear();
    }
}
