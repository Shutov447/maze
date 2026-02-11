import { GameEvent, GameSender, GameService } from '@client/game';
import { MazeController } from '@client/maze';
import { PlayerController } from '@client/player';
import {
    MazeEventType,
    IMediator,
    InputHandlerObject,
    ISubject,
    INotifyEvent,
    PlayerEvent,
    IObserver,
    IPlayerState,
} from '@shared/types';
import { cellsEqual } from '@shared/utils';
import { MovementDirection, PlayerEventType } from '@shared/types';
import { otherPlayerMgr } from '@client/other-player';

export class Game implements IMediator<GameSender, GameEvent>, IObserver {
    private readonly service = new GameService();

    constructor(
        private readonly maze: MazeController,
        private readonly player: PlayerController,
    ) {
        this.maze.setMediator(this);
        this.player.setMediator(this);
    }

    update(
        subject: ISubject,
        event: INotifyEvent,
        currentMoverPlayer?: IPlayerState,
    ) {
        // TODO: можно еще сделать базовые классы Player,
        // и от них наследовать MoverPlayer и OtherPlayer,
        // чтобы можно было применять стили именно к игроку которым управляешь
        if (subject instanceof GameService && event instanceof PlayerEvent) {
            if (event.type === PlayerEventType.Win) {
                otherPlayerMgr.deleteAll();
                this.maze.delete();
                return;
            }

            const isPlayerState =
                currentMoverPlayer?.id || currentMoverPlayer?.id === 0;
            if (!isPlayerState) return;

            const isThisMe =
                currentMoverPlayer.id === this.player.getState().id;
            if (isThisMe) return;

            if (event.type === PlayerEventType.Delete) {
                otherPlayerMgr.delete(currentMoverPlayer.id, this.maze);
                return;
            }

            if (event.type === PlayerEventType.Generate) {
                otherPlayerMgr.create(currentMoverPlayer, this.maze);
                return;
            }

            if (event.type === PlayerEventType.Move) {
                otherPlayerMgr.move(
                    currentMoverPlayer.id,
                    currentMoverPlayer.lastMove!,
                );
                return;
            }
        }
    }

    start(rows: number, cols: number) {
        otherPlayerMgr.deleteAll();
        this.service.attach(this);
        this.maze.create(rows, cols);
    }

    startByMazeKey(key: string) {
        otherPlayerMgr.deleteAll();
        this.service.attach(this);
        this.maze.createByKey(key);
    }

    send(sender: GameSender, event: GameEvent): void {
        if (sender instanceof PlayerController)
            this.handlePlayerEvent(event as PlayerEventType);
        else if (sender instanceof MazeController)
            this.handleMazeEvent(event as MazeEventType);
    }

    private handlePlayerEvent(event: PlayerEventType): void {
        switch (event) {
            case PlayerEventType.Move:
                this.isGameEnd() && this.onGameEnd();
                break;
            case PlayerEventType.Generate:
                this.player.addFocusByWindowClick();
                this.maze.addRenderable(this.player);
                break;
        }

        this.service.send(this.player.getState(), this.maze.getState().key);
    }

    private readonly playerMovementHandlerObject: InputHandlerObject = [
        'keydown',
        (ev: Event): void => {
            if (!(ev instanceof KeyboardEvent)) return;

            const key = ev.key;
            const currentCell = this.player.getState().currentCell;

            if (key.includes('Arrow')) {
                const direction = key.replace('Arrow', '') as MovementDirection;
                this.maze.isPassage(direction, currentCell) &&
                    this.player.move(direction);
            }
        },
    ];
    private handleMazeEvent(event: MazeEventType) {
        if (event === MazeEventType.Generate)
            this.player.create(
                this.maze.getRandomPassageCell(),
                this.maze.getCellSizePx(),
                this.playerMovementHandlerObject,
            );
    }

    private isGameEnd(): boolean {
        return cellsEqual(
            this.maze.getState().finishCell,
            this.player.getState().currentCell,
        );
    }

    private async onGameEnd() {
        this.player.removeInputHandler(this.playerMovementHandlerObject);
        this.player.removeFocusByWindowClick();
        this.player.win();
        const playerId = this.player.getState().id;
        const mazeKey = this.maze.getState().key;
        await this.service.finishGame(playerId, mazeKey);
        await this.deletePlayer(playerId, mazeKey);
        this.maze.delete();
    }

    deletePlayer(
        id: number = this.player.getState().id,
        mazeKey: string = this.maze.getState().key,
    ) {
        if (isNaN(id)) return new Promise((res) => res(null));

        this.player.delete();
        return this.service.deletePlayer(id, mazeKey);
    }
}
