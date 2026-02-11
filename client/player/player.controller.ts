import { IRenderable } from '@client/types';
import { PlayerModel, PlayerView } from '@client/player';
import {
    Cell,
    INotifyEvent,
    InputHandlerObject,
    IObserver,
    IPlayerState,
    ISubject,
    MediatorComponent,
    MovementDirection,
    PlayerEvent,
    PlayerEventType,
} from '@shared/types';

export class PlayerController
    extends MediatorComponent<PlayerController, PlayerEventType>
    implements IRenderable, IObserver
{
    constructor(
        private readonly model: PlayerModel,
        private readonly view: PlayerView,
    ) {
        super();
    }

    update(subject: ISubject, event: INotifyEvent): void {
        if (
            subject instanceof PlayerModel &&
            event instanceof PlayerEvent &&
            event.type === PlayerEventType.Generate
        )
            this.mediator?.send(this, PlayerEventType.Generate);
    }

    create(
        spawnCell: Cell,
        sizePx: number,
        ...inputHandlers: InputHandlerObject[]
    ) {
        this.model.attach(this);
        this.model.attach(this.view);
        this.model.setCurrentCell(spawnCell);
        this.model.generateId();

        this.view.addStyle(sizePx);
        this.view.setPosition(spawnCell);
        inputHandlers.forEach((handler) => this.view.addInputHandler(handler));
    }

    addTo(container: HTMLElement): void {
        this.view.renderTo(container);
    }
    removeFrom(container: HTMLElement): void {
        this.view.removeFrom(container);
    }

    move(direction: MovementDirection): void {
        this.model.move(direction);
        this.mediator?.send(this, PlayerEventType.Move);
    }

    win() {
        console.log('WIN!');
    }

    addInputHandler(handler: InputHandlerObject) {
        this.view.addInputHandler(handler);
    }
    removeInputHandler(handler: InputHandlerObject): void {
        this.view.removeInputHandler(handler);
    }

    addFocusByWindowClick() {
        addEventListener(...this.view.playerFocusHandlerObject);
    }
    removeFocusByWindowClick() {
        removeEventListener(...this.view.playerFocusHandlerObject);
    }

    getState(): IPlayerState {
        return this.model.getState();
    }

    delete() {
        this.model.resetState();
    }
}
