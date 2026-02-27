import {
    Cell,
    IMediator,
    InputHandlerObject,
    MazeEventType,
    MovementDirection,
    Passage,
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
            if (!key.includes('Arrow')) return;

            const currentCell = this.player.getState().currentCell;
            const direction = key.replace('Arrow', '') as MovementDirection;
            if (this.maze.isPassage(direction, currentCell))
                this.player.move(direction);
        },
    ];
    private wallDestructionTrigger = true;
    private readonly playerWallDestructionHandlerObject: InputHandlerObject = [
        'keydown',
        (ev: Event): void => {
            if (!this.wallDestructionTrigger) return;
            if (!(ev instanceof KeyboardEvent)) return;
            if (!(ev.key === ' ')) return;

            const currentCell = this.player.getState().currentCell;
            const mazeCellsToDestroy =
                this.getBreakingMazeCellsAroundPlayer(currentCell);
            const passage: Passage = 1;
            mazeCellsToDestroy.forEach((cell) =>
                this.maze.setCellStateInMap(cell, passage),
            );

            if (!mazeCellsToDestroy.length) return;

            // TODO: возможно сделать сокет у maze контроллера и через него передавать эти изменения карты
            this.service.send({
                playerState: this.player.getState(),
                mazeKey: this.maze.getState().key,
                changedMazeMapCells: mazeCellsToDestroy.map((cell) => ({
                    cell,
                    cellState: passage,
                })),
            });

            this.wallDestructionTrigger = false;
            const timerId = setTimeout(() => {
                this.wallDestructionTrigger = true;
                clearTimeout(timerId);
            }, 30000);
        },
    ];
    private getBreakingMazeCellsAroundPlayer = (playerCell: Cell): Cell[] => {
        const siblingTouchingCells: Cell[] = [
            [playerCell[0], playerCell[1] - 1],
            [playerCell[0] + 1, playerCell[1]],
            [playerCell[0], playerCell[1] + 1],
            [playerCell[0] - 1, playerCell[1]],
        ];
        const siblingCellsDiagonally: Cell[] = [
            [playerCell[0] - 1, playerCell[1] - 1],
            [playerCell[0] - 1, playerCell[1] + 1],
            [playerCell[0] + 1, playerCell[1] + 1],
            [playerCell[0] + 1, playerCell[1] - 1],
        ];
        const cellAroundPlayerWithoutBorders = [
            ...siblingTouchingCells,
            ...siblingCellsDiagonally,
        ].filter((cell) => {
            return !this.maze
                .getMapBorders()
                .map(
                    (borderCell) =>
                        borderCell[0] === cell[0] && borderCell[1] === cell[1],
                )
                .includes(true);
        });

        return cellAroundPlayerWithoutBorders.filter((cell) =>
            this.maze.isWall(cell),
        );
    };

    private handleMazeEvent(event: MazeEventType) {
        switch (event) {
            case MazeEventType.Generate:
                this.player.create(
                    this.maze.getRandomPassageCell(),
                    this.maze.getState().cellSizePx,
                    [
                        this.playerMovementHandlerObject,
                        this.playerWallDestructionHandlerObject,
                    ],
                );
                break;
        }
    }

    private async handlePlayerEvent(event: PlayerEventType) {
        const playerState = this.player.getState();
        const mazeKey = this.maze.getState().key;

        switch (event) {
            case PlayerEventType.Move:
                this.isPlayerOnFinishCell()
                    ? this.player.win()
                    : this.service.send({ playerState, mazeKey });
                break;
            case PlayerEventType.Generate:
                this.remotePlayersMgr.setControlledPlayerState(
                    this.player.getState(),
                );
                this.maze.addRenderable(this.player);
                this.service.send({ playerState, mazeKey });
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
