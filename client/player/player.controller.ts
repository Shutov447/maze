import { MediatorComponent, IRenderable } from 'Types';
import {
    InputHandlerObject,
    IPlayerState,
    MovementDirection,
    PlayerEventType,
    PlayerModel,
    PlayerView,
} from 'Player';
import { Cell } from 'Maze';

export class PlayerController
    extends MediatorComponent<PlayerController, PlayerEventType>
    implements IRenderable
{
    constructor(
        private readonly model: PlayerModel,
        private readonly view: PlayerView
    ) {
        super();
    }

    create(
        spawnCell: Cell,
        sizePx: number,
        ...inputHandlers: InputHandlerObject[]
    ) {
        this.model.attach(this.view);
        this.model.setCurrentCell(spawnCell);

        this.view.addStyle(sizePx);
        this.view.setPosition(spawnCell);
        inputHandlers.forEach((handler) => this.view.addInputHandler(handler));

        this.mediator?.send(this, PlayerEventType.Generate);
    }

    addTo(container: HTMLElement): void {
        this.view.renderTo(container);
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
        window.addEventListener(...this.view.playerFocusHandlerObject);
    }
    removeFocusByWindowClick() {
        window.removeEventListener(...this.view.playerFocusHandlerObject);
    }

    getState(): IPlayerState {
        return this.model.getState();
    }
}
