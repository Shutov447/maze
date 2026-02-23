import { Cell, PlayerEvent, PlayerEventType } from '@shared/types';
import { generateColor } from '@shared/utils';
import { env } from '@client/env';
import { BasePlayerModel } from '@client/base-player';

export class ControlledPlayerModel extends BasePlayerModel {
    async generate(sizePx: number, cell: Cell) {
        this.setCurrentCell(cell);
        this.setSize(sizePx);
        this.setColor();
        await this.generateId();

        this.notify(new PlayerEvent(PlayerEventType.Generate));
    }

    private async generateId() {
        const response = await fetch(`${env.DOMAIN}/player/generate-id`, {
            method: 'GET',
        });
        this.state.id = await response.json();
    }

    private setCurrentCell(cell: Cell) {
        this.state.currentCell = cell;
    }

    private setSize(px: number) {
        this.state.sizePx = px;
    }

    private setColor() {
        this.state.color = generateColor();
    }
}
