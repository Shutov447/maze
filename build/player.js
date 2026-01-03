import { cellsEqual, generateColor } from './utils.js';
export class Player {
    size = 0;
    map = null;
    cell = [0, 0];
    mapFinish = [0, 0];
    keydownHandler;
    playerElem = null;
    constructor() {
        this.keydownHandler = this.handleKeydown.bind(this);
    }
    create(sizeElem, pos, map, mapFinish) {
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
    isWin(movementOwner) {
        if (cellsEqual(this.cell, this.mapFinish)) {
            movementOwner.removeEventListener('keydown', this.keydownHandler);
            console.log('WIN!');
        }
    }
    handleKeydown(ev) {
        const elem = this.playerElem;
        const isPassageOnRight = this.map?.[this.cell[0]][this.cell[1] + 1] !== 1;
        if (ev.key === 'ArrowRight' && isPassageOnRight) {
            this.cell[1] = this.cell[1] + 1;
            this.isWin(ev.currentTarget);
            const currentPos = parseInt(elem.style.left, 10);
            elem.style.left = currentPos + this.size + 'px';
            return;
        }
        const isPassageOnDown = this.map?.[this.cell[0] + 1][this.cell[1]] !== 1;
        if (ev.key === 'ArrowDown' && isPassageOnDown) {
            this.cell[0] = this.cell[0] + 1;
            this.isWin(ev.currentTarget);
            const currentPos = parseInt(elem.style.top, 10);
            elem.style.top = currentPos + this.size + 'px';
            return;
        }
        const isPassageOnLeft = this.map?.[this.cell[0]][this.cell[1] - 1] !== 1;
        if (ev.key === 'ArrowLeft' && isPassageOnLeft) {
            this.cell[1] = this.cell[1] - 1;
            this.isWin(ev.currentTarget);
            const currentPos = parseInt(elem.style.left, 10);
            elem.style.left = currentPos - this.size + 'px';
            return;
        }
        const isPassageOnUp = this.map?.[this.cell[0] - 1][this.cell[1]] !== 1;
        if (ev.key === 'ArrowUp' && isPassageOnUp) {
            this.cell[0] = this.cell[0] - 1;
            this.isWin(ev.currentTarget);
            const currentPos = parseInt(elem.style.top, 10);
            elem.style.top = currentPos - this.size + 'px';
            return;
        }
    }
    addMovement(elem) {
        elem.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('mouseup', () => elem.focus()); // сделать также как с this.keydownHandler
    }
    setSize(size) {
        this.size = size;
    }
    setPosition([row, col]) {
        this.cell = [row, col];
        if (this.playerElem) {
            this.playerElem.style.left = col * this.size + 'px';
            this.playerElem.style.top = row * this.size + 'px';
        }
    }
}
