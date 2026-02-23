import {
    IMediator,
    InputHandlerObject,
    MazeEventType,
    MovementDirection,
    PlayerEventType,
} from '@shared/types';
import { cellsEqual } from '@shared/utils';
import { GenerateMazeBy, MazeController } from '@client/maze';
import { ControlledPlayerController } from '@client/controlled-player';
import { RemotePlayersManager } from '@client/remote-players';
import { GameEvent, GameSender, GameService } from '@client/game';

export class Game implements IMediator<GameSender, GameEvent> {
    private readonly service = new GameService();
    private readonly remotePlayersMgr = new RemotePlayersManager();

    constructor(
        private readonly maze: MazeController,
        private readonly player: ControlledPlayerController,
    ) {
        this.maze.setMediator(this);
        this.player.setMediator(this);
        this.remotePlayersMgr.setMaze(maze);
        this.service.attach(this.remotePlayersMgr);
    }

    async start(by: GenerateMazeBy, cellSizePx: number) {
        if (this.maze.getState().key === by) return;
        if (this.maze.getState().key) {
            this.remotePlayersMgr.deleteAll();
            await this.deletePlayer();
        }
        this.maze.delete();
        await this.maze.create(by, cellSizePx);
    }

    send(sender: GameSender, event: GameEvent) {
        if (sender instanceof MazeController)
            this.handleMazeEvent(event as MazeEventType);
        else if (sender instanceof ControlledPlayerController)
            this.handlePlayerEvent(event as PlayerEventType);
    }

    private readonly playerMovementHandlerObject: InputHandlerObject = [
        'keydown',
        (ev: Event): void => {
            if (!(ev instanceof KeyboardEvent)) return;

            const key = ev.key;
            const currentCell = this.player.getState().currentCell;

            if (key.includes('Arrow')) {
                const direction = key.replace('Arrow', '') as MovementDirection;
                if (this.maze.isPassage(direction, currentCell))
                    this.player.move(direction);
            }
        },
    ];
    private handleMazeEvent(event: MazeEventType) {
        if (event === MazeEventType.Generate) {
            this.player.create(
                this.maze.getRandomPassageCell(),
                this.maze.getState().cellSizePx,
                [this.playerMovementHandlerObject],
            );
        }
    }

    private async handlePlayerEvent(event: PlayerEventType) {
        const playerState = this.player.getState();
        const mazeKey = this.maze.getState().key;

        switch (event) {
            case PlayerEventType.Move:
                if (this.isPlayerOnFinishCell()) {
                    this.player.win();
                    break;
                }
                this.service.send(playerState, mazeKey);
                break;
            case PlayerEventType.Generate:
                this.remotePlayersMgr.setControlledPlayerState(
                    this.player.getState(),
                );
                this.maze.addRenderable(this.player);
                this.service.send(playerState, mazeKey);
                break;
            case PlayerEventType.Win:
                await this.finishGame();
                break;
        }
    }

    private isPlayerOnFinishCell() {
        return cellsEqual(
            this.maze.getState().finishCell,
            this.player.getState().currentCell,
        );
    }

    async finishGame() {
        this.maze.removeRenderable(this.player);
        await this.service.winGame(
            this.player.getState().id,
            this.maze.getState().key,
        );
        await this.deletePlayer();
        this.maze.delete();
    }

    async deletePlayer() {
        await this.service.deletePlayer(
            this.player.getState().id,
            this.maze.getState().key,
        );
        this.player.delete();
    }
}
