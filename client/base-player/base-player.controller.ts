import { IPlayerState, MovementDirection } from '@shared/types';
import { Renderable } from '@client/shared/types';
import { BasePlayerModel, BasePlayerView } from '@client/base-player';

export class BasePlayerController extends Renderable {
    constructor(
        protected readonly model: BasePlayerModel,
        protected readonly view: BasePlayerView,
    ) {
        super(view);
    }

    move(direction: MovementDirection): void {
        this.model.move(direction);
    }

    setState(state: IPlayerState) {
        this.model.attach(this.view);
        this.model.setState(state);
    }

    getState(): IPlayerState {
        return this.model.getState();
    }

    delete() {
        this.model.resetState();
        this.model.detach(this.view);
    }
}
