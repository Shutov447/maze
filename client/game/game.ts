import { GameEvent, GameSender, GameService } from '@client/game';
import { MazeController } from '@client/maze';
import { PlayerController } from '@client/player';
import { MazeEventType, IMediator, InputHandlerObject } from '@shared/types';
import { cellsEqual } from '@shared/utils';
import { MovementDirection, PlayerEventType } from '@shared/types';

export class Game implements IMediator<GameSender, GameEvent> {
    private readonly service = new GameService();

    constructor(
        private readonly maze: MazeController,
        private readonly player: PlayerController,
    ) {
        this.maze.setMediator(this);
        this.player.setMediator(this);
    }

    start(rows: number, cols: number) {
        this.maze.create(rows, cols);
    }

    startByMazeKey(key: string) {
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
                console.log('Move', this.player.getState().id);
                break;
            case PlayerEventType.Generate:
                this.player.addFocusByWindowClick();
                console.log('Generate', this.player.getState().id);
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
        if (event === MazeEventType.Generate) {
            this.player.create(
                this.maze.getRandomPassageCell(),
                this.maze.getCellSizePx(),
                this.playerMovementHandlerObject,
            );
            this.maze.addRenderable(this.player);
        }
    }

    private isGameEnd(): boolean {
        return cellsEqual(
            this.maze.getState().finishCell,
            this.player.getState().currentCell,
        );
    }

    private onGameEnd(): void {
        this.player.removeInputHandler(this.playerMovementHandlerObject);
        this.player.removeFocusByWindowClick();
        this.player.win();
        this.deletePlayer();
    }

    deletePlayer() {
        if (isNaN(this.player.getState().id))
            return new Promise((res) => res(null));

        return this.service.deletePlayer(
            this.player.getState().id,
            this.maze.getState().key,
        );
    }
}
