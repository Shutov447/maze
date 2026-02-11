import { PlayerEvent, PlayerEventType } from '@shared/types';
import { PlayerModel } from '@client/player';

export class OtherPlayerModel extends PlayerModel {
    constructor(
        private id: number,
        private readonly color: string,
    ) {
        super();
        this.setColor(color);
        this.setId(id);
    }

    override async generateId() {
        this.state.id = await new Promise((res) => res(this.id));
        this.notify(new PlayerEvent(PlayerEventType.Generate), this.state);
    }

    private setId(id: number) {
        this.id = id;
    }

    private setColor(color: string) {
        this.state.color = color;
    }
}
