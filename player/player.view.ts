import { PlayerModel, IPlayerState, MovementDirection } from 'Player';
import { generateColor } from 'Utils';
import { IObserver, PlayerElem, ISubject, Cell } from 'Types';

export class PlayerView implements IObserver {
    private readonly _elem: PlayerElem = document.createElement('button');
    get elem() {
        return this._elem;
    }

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

    update(subject: ISubject): void {
        if (subject instanceof PlayerModel)
            this.move(subject.getState().lastMove);
    }

    private move(lastMove: IPlayerState['lastMove']) {
        const left = parseInt(this.elem.style.left, 10);
        const top = parseInt(this.elem.style.top, 10);

        switch (lastMove) {
            case MovementDirection.Left:
                this.elem.style.left = left - this.sizePx + 'px';
                break;
            case MovementDirection.Down:
                this.elem.style.top = top + this.sizePx + 'px';
                break;
            case MovementDirection.Right:
                this.elem.style.left = left + this.sizePx + 'px';
                break;
            case MovementDirection.Up:
                this.elem.style.top = top - this.sizePx + 'px';
                break;
        }
    }

    addInputHandler<T extends keyof HTMLElementEventMap>(
        type: T,
        handler: EventListener
    ) {
        this.elem.addEventListener(type, handler);
        window.addEventListener('mouseup', () => this.elem.focus());
    }

    setPosition(cell: Cell) {
        const [row, col] = cell;

        this._elem.style.top = row * this.sizePx + 'px';
        this._elem.style.left = col * this.sizePx + 'px';
    }
}
