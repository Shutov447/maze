import {
    INotifyEvent,
    IObserver,
    ISubject,
    MazeEvent,
    MazeEventType,
    PlayerEvent,
    PlayerEventType,
} from '@shared/types';
import { cellsEqual } from '@shared/utils';
import { GenerateMazeBy, MazeController } from '@client/maze';
import { ControlledPlayerController } from '@client/controlled-player';
import { RemotePlayersManager } from '@client/remote-players';
import {
    GameService,
    MovementAbility,
    WallDestructionAbility,
    RemotePlayersRandomMovementAbility,
    getRandomAbility,
    HelperRemotePlayersRandomMovement,
} from '@client/game';

export class Game implements IObserver {
    private readonly remotePlayersMgr = new RemotePlayersManager();
    private readonly service = new GameService();

    constructor(
        private readonly maze: MazeController,
        private readonly player: ControlledPlayerController,
    ) {
        this.maze.attach(this);
        this.player.attach(this);
        this.remotePlayersMgr.setControlledPlayer(player);
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

    update(subject: ISubject, event: INotifyEvent) {
        if (subject instanceof MazeController && event instanceof MazeEvent)
            this.handleMazeEvent(event.type);
        else if (
            subject instanceof ControlledPlayerController &&
            event instanceof PlayerEvent
        )
            this.handlePlayerEvent(event.type);
    }

    async handleMazeEvent(event: MazeEventType) {
        switch (event) {
            case MazeEventType.Generate: {
                await this.onMazeGenerate();
                break;
            }
        }
    }
    async onMazeGenerate() {
        const movement = new MovementAbility(
            this.maze,
            this.player,
        ).getInputHandlerObject();

        const specialAbility = getRandomAbility(
            [RemotePlayersRandomMovementAbility, WallDestructionAbility],
            this.maze,
            this.player,
            this.service,
            movement,
            7000,
            10000,
        );
        if (!specialAbility) return;

        await this.player.create(
            this.maze.getRandomPassageCell(),
            this.maze.getState().cellSizePx,
            [movement, specialAbility.getInputHandlerObject()],
        );

        new HelperRemotePlayersRandomMovement(
            this.maze,
            this.player,
            movement,
            7000,
            this.service,
        );
    }

    async handlePlayerEvent(event: PlayerEventType) {
        switch (event) {
            case PlayerEventType.Generate:
                this.onPlayerGenerate();
                break;
            case PlayerEventType.Move:
                this.onPlayerMove();
                break;
            case PlayerEventType.Win:
                await this.onPlayerWin();
                break;
        }
    }
    onPlayerGenerate() {
        const playerState = this.player.getState();
        const mazeKey = this.maze.getState().key;
        this.maze.addRenderable(this.player);
        this.service.send({ playerState, mazeKey });
    }
    onPlayerMove() {
        const playerState = this.player.getState();
        const mazeKey = this.maze.getState().key;
        this.isPlayerOnFinishCell()
            ? this.player.win()
            : this.service.send({ playerState, mazeKey });
    }
    async onPlayerWin() {
        await this.finishGame();
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
