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
} from '@shared/types';
import { MazeController } from '@client/maze';
import {
    BasePlayerController,
    BasePlayerModel,
    BasePlayerView,
} from '@client/base-player';
import { GameService } from '@client/game';

export class RemotePlayersManager implements IObserver {
    private readonly players: Map<number, BasePlayerController> = new Map();

    private maze?: MazeController;
    private controlledPlayerState?: IPlayerState;

    setControlledPlayerState(state: IPlayerState) {
        this.controlledPlayerState = state;
    }
    setMaze(maze: MazeController) {
        this.maze = maze;
    }

    async update(
        subject: ISubject,
        event: INotifyEvent,
        data?: { changedMazeMapCells?: ChangedMazeMapCells },
    ) {
        if (subject instanceof GameService) {
            if (event instanceof PlayerEvent) {
                if (event.type === PlayerEventType.Win) {
                    this.deleteAll();
                    await subject.deletePlayer(
                        this.controlledPlayerState!.id,
                        this.maze!.getState().key,
                    );
                    this.finishGame();
                    return;
                }

                const currentMoverPlayer = subject.getCurrentMoverPlayerState();
                if (!currentMoverPlayer) return;
                const isThisMe =
                    currentMoverPlayer.id === this.controlledPlayerState?.id;
                if (isThisMe) return;

                switch (event.type) {
                    case PlayerEventType.Move:
                        this.move(
                            currentMoverPlayer.id,
                            currentMoverPlayer.lastMove!,
                        );
                        break;
                    case PlayerEventType.Generate:
                        this.create(currentMoverPlayer);
                        break;
                    case PlayerEventType.Delete:
                        this.delete(currentMoverPlayer.id);
                        break;
                }
                return;
            }

            if (event instanceof MazeEvent) {
                switch (event.type) {
                    case MazeEventType.ChangeCellState:
                        data?.changedMazeMapCells?.forEach((change) =>
                            this.maze?.setCellStateInMap(
                                change.cell,
                                change.cellState,
                            ),
                        );
                        break;
                }
                return;
            }
        }
    }

    private finishGame() {
        this.maze?.delete();
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
        }
    }

    deleteAll() {
        this.players.forEach((player) => this.maze?.removeRenderable(player));
        this.players.clear();
    }
}
