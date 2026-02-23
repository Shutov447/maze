import { IRenderable } from '@client/shared/types';
import {
    Cell,
    INotifyEvent,
    IObserver,
    IPlayerState,
    ISubject,
    MovementDirection,
    PlayerElem,
    PlayerEvent,
    PlayerEventType,
} from '@shared/types';
import { BasePlayerModel } from '@client/base-player';

export class BasePlayerView implements IObserver, IRenderable {
    protected readonly elem: PlayerElem = document.createElement('button');

    update(subject: ISubject, event: INotifyEvent): void {
        if (
            subject instanceof BasePlayerModel &&
            event instanceof PlayerEvent
        ) {
            const playerState = subject.getState();

            switch (event.type) {
                case PlayerEventType.Generate:
                    this.onGenerate(playerState);
                    break;
                case PlayerEventType.Move:
                    this.onMove(playerState);
                    break;
            }
        }
    }

    onGenerate({ sizePx, currentCell, color }: IPlayerState) {
        this.addStyle(sizePx);
        this.setPosition(currentCell, sizePx);
        this.setColor(color);
    }
    private addStyle(sizePx: number) {
        this.elem.className = 'btn-reset';
        this.elem.style.position = 'absolute';
        this.elem.style.width = sizePx + 'px';
        this.elem.style.height = sizePx + 'px';
        this.elem.style.borderRadius = '50%';
    }
    private setPosition(cell: Cell, sizePx: number) {
        const [row, col] = cell;

        this.elem.style.top = `${row * sizePx}px`;
        this.elem.style.left = `${col * sizePx}px`;
    }
    private setColor(color: string) {
        this.elem.style.backgroundColor = color;
    }

    onMove({ lastMove, sizePx }: IPlayerState) {
        lastMove && this.move(lastMove, sizePx);
    }
    private move(lastMove: MovementDirection, sizePx: number) {
        const left = parseInt(this.elem.style.left, 10);
        const top = parseInt(this.elem.style.top, 10);

        const elemMover = {
            Left: () => (this.elem.style.left = left - sizePx + 'px'),
            Down: () => (this.elem.style.top = top + sizePx + 'px'),
            Right: () => (this.elem.style.left = left + sizePx + 'px'),
            Up: () => (this.elem.style.top = top - sizePx + 'px'),
        };

        elemMover[lastMove]();
    }

    renderTo(container: HTMLElement): void {
        container.appendChild(this.elem);
    }
    removeFrom(container: HTMLElement) {
        container.removeChild(this.elem);
    }
}
