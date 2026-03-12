import {
    Cell,
    InputHandlerObject,
    PlayerEventType,
    MovementDirection,
    IObserver,
    ISubject,
    INotifyEvent,
    PlayerEvent,
} from '@shared/types';
import { BasePlayerController } from '@client/base-player';
import {
    ControlledPlayerModel,
    ControlledPlayerView,
} from '@client/controlled-player';

export class ControlledPlayerController
    extends BasePlayerController
    implements ISubject
{
    private inputHandlers: Set<InputHandlerObject> = new Set();

    constructor(
        protected override readonly model: ControlledPlayerModel,
        protected override readonly view: ControlledPlayerView,
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

        this.notify(new PlayerEvent(PlayerEventType.Generate));
    }

    override delete() {
        super.delete();
        this.removeAllInputHandlers();

        this.notify(new PlayerEvent(PlayerEventType.Delete));
    }

    addInputHandlers(handlers: InputHandlerObject[]) {
        handlers.forEach((handler) => this.addInputHandler(handler));
    }
    addInputHandler(handler: InputHandlerObject) {
        this.inputHandlers.add(handler);
        this.view.addInputHandler(handler);
    }

    removeAllInputHandlers() {
        this.inputHandlers.forEach((handler) =>
            this.removeInputHandler(handler),
        );
        this.inputHandlers.clear();
    }
    removeInputHandler(handler: InputHandlerObject) {
        this.inputHandlers.delete(handler);
        this.view.removeInputHandler(handler);
    }

    override move(direction: MovementDirection): void {
        super.move(direction);

        this.notify(new PlayerEvent(PlayerEventType.Move));
    }

    win() {
        console.log('WIN!');

        this.notify(new PlayerEvent(PlayerEventType.Win));
    }

    private readonly observers = new Set<IObserver>();
    notify(event: INotifyEvent): void {
        this.observers.forEach((observer) => observer.update(this, event));
    }
    attach(observer: IObserver): void {
        this.observers.add(observer);
    }
    detach(observer: IObserver): void {
        this.observers.delete(observer);
    }
}
