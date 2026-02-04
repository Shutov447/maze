import { IRenderer, IRenderable } from '@client/types';
import { MazeModel, MazeView } from '@client/maze';
import { MovementDirection } from '@shared/types';
import {
    Cell,
    IMazeState,
    INotifyEvent,
    IObserver,
    ISubject,
    MazeEvent,
    MazeEventType,
    MediatorComponent,
} from '@shared/types';
import { findRandomPassageCell } from '@shared/utils';

export class MazeController
    extends MediatorComponent<MazeController, MazeEventType>
    implements IRenderer, IObserver
{
    constructor(
        private readonly model: MazeModel,
        private readonly view: MazeView,
    ) {
        super();
    }

    update(subject: ISubject, event: INotifyEvent) {
        if (
            subject instanceof MazeModel &&
            event instanceof MazeEvent &&
            event.type === MazeEventType.Generate
        ) {
            this.mediator?.send(this, MazeEventType.Generate);
        }
    }

    create(rows: number, cols: number): void {
        this.model.attach(this.view);
        this.model.attach(this);
        this.model.generate(rows, cols);
    }

    createByKey(key: string): void {
        this.model.attach(this.view);
        this.model.attach(this);
        this.model.getByKey(key);
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
        return findRandomPassageCell(
            this.model.getState().map,
            this.model.getState().finishCell,
            ...exceptions,
        );
    }

    getState(): IMazeState {
        return this.model.getState();
    }
}
