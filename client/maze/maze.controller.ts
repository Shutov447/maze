import {
    Cell,
    CellState,
    IClientMazeState,
    INotifyEvent,
    IObserver,
    ISubject,
    MazeEvent,
    MazeEventType,
    MovementDirection,
} from '@shared/types';
import { findRandomPassageCell } from '@shared/utils';
import { Renderer } from '@client/shared/types';
import { GenerateMazeBy, MazeModel, MazeView } from '@client/maze';

export class MazeController extends Renderer implements ISubject {
    constructor(
        private readonly model: MazeModel,
        private readonly view: MazeView,
    ) {
        super(view.wrapper);
    }

    async create(by: GenerateMazeBy, cellSizePx: number) {
        this.model.attach(this.view);
        await this.model.generate(by, cellSizePx);

        this.notify(new MazeEvent(MazeEventType.Generate));
    }

    setCellStateInMap(cell: Cell, state: CellState) {
        this.model.setCellStateInMap(cell, state);
    }

    isPassage(direction: MovementDirection, cell: Cell): boolean {
        return this.model.isPassage(direction, cell);
    }
    isWall(cell: Cell): boolean {
        return this.model.isWall(cell);
    }

    getRandomPassageCell(...exceptions: Cell[]): Cell {
        return findRandomPassageCell(
            this.model.getState().map,
            this.model.getState().finishCell,
            ...exceptions,
        );
    }

    getMapBorders() {
        return this.model.getMapBorders();
    }

    getState(): IClientMazeState {
        return this.model.getState();
    }

    delete() {
        this.model.reset();
        this.model.detach(this.view);
        this.notify(new MazeEvent(MazeEventType.Delete));
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
