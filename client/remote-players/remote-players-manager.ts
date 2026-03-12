import {
    ChangedMazeMapCells,
    INotifyEvent,
    IObserver,
    IPlayerState,
    ISubject,
    MazeEvent,
    MazeEventType,
    MovementDirection,
    PlayerEvent,
    PlayerEventType,
    ResponseAdditionalData,
} from '@shared/types';
import { MazeController } from '@client/maze';
import {
    BasePlayerController,
    BasePlayerModel,
    BasePlayerView,
} from '@client/base-player';
import { ControlledPlayerController } from '@client/controlled-player';
import { GameService } from '@client/game';

export class RemotePlayersManager implements IObserver {
    private readonly players: Map<number, BasePlayerController> = new Map();

    private maze?: MazeController;
    setMaze(maze: MazeController) {
        this.maze = maze;
    }

    private controlledPlayer?: ControlledPlayerController;
    setControlledPlayer(player: ControlledPlayerController) {
        this.controlledPlayer = player;
    }

    async update(
        subject: ISubject,
        event: INotifyEvent,
        data?: ResponseAdditionalData,
    ) {
        if (event instanceof PlayerEvent)
            await this.handlePlayerEvent(subject, event.type);
        else if (event instanceof MazeEvent && data?.changedMazeMapCells)
            this.handleMazeEvent(
                subject,
                event.type,
                data?.changedMazeMapCells,
            );
    }

    private async handlePlayerEvent(subject: ISubject, type: PlayerEventType) {
        if (!(subject instanceof GameService)) return;

        const controlledPlayerState = this.controlledPlayer?.getState();

        if (type === PlayerEventType.Win) {
            this.deleteAll();
            await subject.deletePlayer(
                controlledPlayerState!.id,
                this.maze!.getState().key,
            );
            this.finishGame();
            return;
        }

        const currentMoverPlayer = subject.getCurrentMoverPlayerState();
        if (!currentMoverPlayer) return;
        const isThisMe = currentMoverPlayer.id === controlledPlayerState?.id;
        if (isThisMe) return;

        switch (type) {
            case PlayerEventType.Generate:
                this.create(currentMoverPlayer);
                break;
            case PlayerEventType.Move:
                this.move(currentMoverPlayer.id, currentMoverPlayer.lastMove!);
                break;
            case PlayerEventType.Delete:
                this.delete(currentMoverPlayer.id);
                break;
        }
    }
    private create(state: IPlayerState) {
        if (this.players.has(state.id)) return;

        const player = new BasePlayerController(
            new BasePlayerModel(),
            new BasePlayerView(),
        );
        player.setState(state);
        this.maze?.addRenderable(player);
        this.players.set(state.id, player);
    }
    private move(id: number, direction: MovementDirection) {
        this.players.get(id)?.move(direction);
    }
    private delete(id: number) {
        const player = this.players.get(id);
        if (player) {
            this.maze?.removeRenderable(player);
            this.players.delete(id);
            player.delete();
        }
    }

    private handleMazeEvent(
        subject: ISubject,
        type: MazeEventType,
        changedMazeMapCells: ChangedMazeMapCells,
    ) {
        if (!(subject instanceof GameService)) return;

        switch (type) {
            case MazeEventType.ChangeCellState:
                this.onMazeChangedMazeMapCells(changedMazeMapCells);
                break;
        }
    }
    onMazeChangedMazeMapCells(changedMazeMapCells: ChangedMazeMapCells) {
        changedMazeMapCells.forEach((change) =>
            this.maze?.setCellStateInMap(change.cell, change.cellState),
        );
    }

    deleteAll() {
        this.players.forEach((player) => this.delete(player.getState().id));
        this.players.clear();
    }

    private finishGame() {
        this.controlledPlayer?.delete();
        this.maze?.delete();
    }
}
