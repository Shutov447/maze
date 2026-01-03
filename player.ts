import { CellPos, Map } from './types.js';
import { cellsEqual, generateColor } from './utils.js';

export class Player {
    private size: number = 0;
    private map: Map | null = null;
    private cell: CellPos = [0, 0];
    private mapFinish: CellPos = [0, 0];

    private keydownHandler: (ev: KeyboardEvent) => void;

    playerElem: HTMLElement | null = null;

    constructor() {
        this.keydownHandler = this.handleKeydown.bind(this);
    }

    create(sizeElem: number, pos: CellPos, map: Map, mapFinish: CellPos) {
        this.size = sizeElem;
        this.map = map;
        this.mapFinish = mapFinish;
        this.playerElem = document.createElement('button');
        this.playerElem.className = 'btn-reset';

        this.setPosition(pos);
        this.addMovement(this.playerElem);

        this.playerElem.style.position = 'absolute';
        this.playerElem.style.width = sizeElem + 'px';
        this.playerElem.style.height = sizeElem + 'px';
        this.playerElem.style.borderRadius = 50 + '%';
        this.playerElem.style.backgroundColor = generateColor();
    }

    private isWin(movementOwner: EventTarget) {
        if (cellsEqual(this.cell, this.mapFinish)) {
            movementOwner.removeEventListener(
                'keydown',
                this.keydownHandler as EventListener
            );

            console.log('WIN!');
        }
    }

    private handleKeydown(ev: KeyboardEvent) {
        const elem = this.playerElem!;

        const isPassageOnRight =
            this.map?.[this.cell[0]][this.cell[1] + 1] !== 1;

        if (ev.key === 'ArrowRight' && isPassageOnRight) {
            this.cell[1] = this.cell[1] + 1;
            this.isWin(ev.currentTarget!);

            const currentPos = parseInt(elem.style.left, 10);
            elem.style.left = currentPos + this.size + 'px';

            return;
        }

        const isPassageOnDown =
            this.map?.[this.cell[0] + 1][this.cell[1]] !== 1;

        if (ev.key === 'ArrowDown' && isPassageOnDown) {
            this.cell[0] = this.cell[0] + 1;
            this.isWin(ev.currentTarget!);

            const currentPos = parseInt(elem.style.top, 10);
            elem.style.top = currentPos + this.size + 'px';

            return;
        }

        const isPassageOnLeft =
            this.map?.[this.cell[0]][this.cell[1] - 1] !== 1;

        if (ev.key === 'ArrowLeft' && isPassageOnLeft) {
            this.cell[1] = this.cell[1] - 1;
            this.isWin(ev.currentTarget!);

            const currentPos = parseInt(elem.style.left, 10);
            elem.style.left = currentPos - this.size + 'px';

            return;
        }

        const isPassageOnUp = this.map?.[this.cell[0] - 1][this.cell[1]] !== 1;

        if (ev.key === 'ArrowUp' && isPassageOnUp) {
            this.cell[0] = this.cell[0] - 1;
            this.isWin(ev.currentTarget!);

            const currentPos = parseInt(elem.style.top, 10);
            elem.style.top = currentPos - this.size + 'px';

            return;
        }
    }

    private addMovement(elem: HTMLElement) {
        elem.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('mouseup', () => elem.focus()); // сделать также как с this.keydownHandler
    }

    setSize(size: number) {
        this.size = size;
    }

    setPosition([row, col]: CellPos) {
        this.cell = [row, col];

        if (this.playerElem) {
            this.playerElem.style.left = col * this.size + 'px';
            this.playerElem.style.top = row * this.size + 'px';
        }
    }
}
