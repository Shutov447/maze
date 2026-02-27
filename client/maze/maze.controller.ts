import {
    Cell,
    CellState,
    IClientMazeState,
    MazeEventType,
    MediatorComponentMixin,
    MovementDirection,
} from '@shared/types';
import { findRandomPassageCell } from '@shared/utils';
import { Renderer } from '@client/shared/types';
import { GenerateMazeBy, MazeModel, MazeView } from '@client/maze';

export class MazeController extends MediatorComponentMixin<
    MazeController,
    MazeEventType
>()(Renderer) {
    constructor(
        private readonly model: MazeModel,
        private readonly view: MazeView,
    ) {
        super(view.wrapper);
    }

    async create(by: GenerateMazeBy, cellSizePx: number) {
        this.model.attach(this.view);
        await this.model.generate(by, cellSizePx);

        this.mediator?.send(this, MazeEventType.Generate);
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
        this.mediator?.send(this, MazeEventType.Delete);
    }
}
