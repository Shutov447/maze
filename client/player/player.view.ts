import {
    InputHandlerObject,
    MovementDirection,
    PlayerElem,
    PlayerEvent,
    PlayerEventType,
} from '@shared/types';
import { PlayerModel } from '@client/player';
import { Cell, IObserver, ISubject, INotifyEvent } from '@shared/types';

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
        this.elem.style.borderRadius = '50%';
    }

    update(subject: ISubject, event: INotifyEvent, data?: any): void {
        if (subject instanceof PlayerModel && event instanceof PlayerEvent) {
            if (event.type === PlayerEventType.Move) {
                const lastMove = subject.getState().lastMove;
                lastMove && this.move(lastMove);
                return;
            }

            if (!(data?.state || data)) return;

            if (event.type === PlayerEventType.Generate) {
                if (data.id === 0 || data.id) {
                    this.setColor(data.color);
                    return;
                }
                if ((data.state.id === 0 || data.state.id) && data.isMain) {
                    this.makeHole(data.state.color);
                    this.setZIndex(100);
                    return;
                }
            }
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

    renderTo(container: HTMLElement): void {
        container.appendChild(this.elem);
    }

    removeFrom(container: HTMLElement) {
        container.removeChild(this.elem);
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

    setColor(color: string) {
        this.elem.style.backgroundColor = color;
    }

    makeHole(color: string) {
        this.elem.style.background = `radial-gradient(circle, transparent 0%, transparent 29%, ${color} 31%) rgba(0, 0, 0, 0)`;
    }

    setZIndex(zIndex: number) {
        this.elem.style.zIndex = zIndex.toString();
    }
}
