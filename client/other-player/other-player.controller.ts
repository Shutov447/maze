import { PlayerController, PlayerView } from '@client/player';
import { Cell, InputHandlerObject } from '@shared/types';
import { OtherPlayerModel } from '@client/other-player';

export class OtherPlayerController extends PlayerController {
    // constructor(
    //     protected override model: OtherPlayerModel,
    //     protected override readonly view: PlayerView,
    //     // view: PlayerView,
    //     // private readonly id: number,
    //     // private readonly color: string,
    // ) {
    //     super(model, view);
    //     // this.setState(id, color);
    // }
    // override create(
    //     spawnCell: Cell,
    //     sizePx: number,
    //     ..._inputHandlers: InputHandlerObject[]
    // ) {
    //     this.model.attach(this.view);
    //     this.model.attach(this);
    //     this.model.setCurrentCell(spawnCell);
    //     this.model.generateId();
    //     this.view.addStyle(sizePx);
    //     this.view.setPosition(spawnCell);
    // }
    // private setState(id: number, color: string) {
    //     this.model.setId(id);
    //     this.model.setColor(color);
    // }
}
