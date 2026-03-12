import {
    INotifyEvent,
    InputHandlerObject,
    ISubject,
    PlayerEvent,
    PlayerEventType,
} from '@shared/types';
import { MazeController } from '@client/maze';
import { ControlledPlayerController } from '@client/controlled-player';
import { GameService, RandomMovementAbility } from '@client/game';

export class HelperRemotePlayersRandomMovement extends RandomMovementAbility {
    protected override handlerObject: InputHandlerObject = ['click', () => {}];

    constructor(
        protected override readonly maze: MazeController,
        protected override readonly player: ControlledPlayerController,
        protected override readonly elemIdToRenderInfo: string,
        protected override readonly mainMovementHandlerObject: InputHandlerObject,
        protected override readonly changeTimeMs: number,
        protected readonly gameService: GameService,
    ) {
        super(
            maze,
            player,
            elemIdToRenderInfo,
            mainMovementHandlerObject,
            changeTimeMs,
        );
        player.attach(this);
        gameService.attach(this);
    }

    override update(subject: ISubject, event: INotifyEvent) {
        super.update(subject, event);

        if (event instanceof PlayerEvent) {
            if (subject instanceof GameService) {
                switch (event.type) {
                    case PlayerEventType.RandomMovementAbility: {
                        const isThisMe =
                            subject.getCurrentMoverPlayerState()?.id ===
                            this.player.getState().id;
                        if (isThisMe) return;

                        this.onRandomMovementAbility();
                        break;
                    }
                }
                return;
            }
        }
    }
    onRandomMovementAbility() {
        this.changeMovement();
    }
    override onDelete() {
        super.onDelete();
        this.player.detach(this);
        this.gameService.detach(this);
    }
    override showInfo() {}
}
