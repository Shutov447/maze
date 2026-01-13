import { IObserver, ISubject, INotifyEvent } from 'Types';
import { Cell } from 'Maze';
import {
    PlayerModel,
    PlayerEvent,
    PlayerEventType,
    MovementDirection,
    InputHandlerObject,
    PlayerElem,
} from 'Player';
import { generateColor } from 'Utils';

export class PlayerView implements IObserver {
    readonly elem: PlayerElem = document.createElement('button');
    readonly playerFocusHandlerObject: InputHandlerObject = [
        'mouseup',
        () => this.elem.focus(),
    ];

    sizePx = 0;

    create(sizePx: number) {
        this.addStyle(sizePx);
    }

    addStyle(sizePx: number) {
        this.sizePx = sizePx;

        this.elem.className = 'btn-reset';
        this.elem.style.position = 'absolute';
        this.elem.style.width = sizePx + 'px';
        this.elem.style.height = sizePx + 'px';
        this.elem.style.borderRadius = 50 + '%';
        this.elem.style.backgroundColor = generateColor();
    }

    update(subject: ISubject, event: INotifyEvent): void {
        if (
            subject instanceof PlayerModel &&
            event instanceof PlayerEvent &&
            event.type === PlayerEventType.Move
        ) {
            const lastMove = subject.getState().lastMove;
            lastMove && this.move(lastMove);
        }
    }

    private move(lastMove: MovementDirection) {
        const left = parseInt(this.elem.style.left, 10);
        const top = parseInt(this.elem.style.top, 10);

        const elemMover = {
            Left: () => (this.elem.style.left = left - this.sizePx + 'px'),
            Down: () => (this.elem.style.top = top + this.sizePx + 'px'),
            Right: () => (this.elem.style.left = left + this.sizePx + 'px'),
            Up: () => (this.elem.style.top = top - this.sizePx + 'px'),
        };

        elemMover[lastMove]();
    }

    render(container: HTMLElement): void {
        container.appendChild(this.elem);
    }

    setPosition(cell: Cell) {
        const [row, col] = cell;

        this.elem.style.top = row * this.sizePx + 'px';
        this.elem.style.left = col * this.sizePx + 'px';
    }

    addInputHandler(handlerObj: InputHandlerObject) {
        this.elem.addEventListener(...handlerObj);
    }
    removeInputHandler(handlerObj: InputHandlerObject): void {
        this.elem.removeEventListener(...handlerObj);
    }
}
