import { MediatorComponent, IRenderer, IRenderable } from 'Types';
import { Cell, IMazeState, MazeEventType, MazeModel, MazeView } from 'Maze';
import { MovementDirection } from 'Player';

export class MazeController
    extends MediatorComponent<MazeController, MazeEventType>
    implements IRenderer
{
    constructor(
        private readonly model: MazeModel,
        private readonly view: MazeView
    ) {
        super();
    }

    create(): void {
        this.model.attach(this.view);
        this.model.generate();

        this.mediator?.send(this, MazeEventType.Generate);
    }

    getContainer(): HTMLElement {
        return this.view.container;
    }

    addRenderable(renderable: IRenderable) {
        renderable.addTo(this.getContainer());
    }

    isPassage(direction: MovementDirection, cell: Cell): boolean {
        return this.model.isPassage(direction, cell);
    }

    getCellSizePx() {
        return this.view.cellSizePx;
    }

    getRandomPassageCell(...exceptions: Cell[]): Cell {
        return this.model.findRandomPassageCell(
            this.model.getState().finishCell,
            ...exceptions
        );
    }

    getState(): IMazeState {
        return this.model.getState();
    }
}
