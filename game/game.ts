import { IMediator } from 'Types';
import { GameEvent, GameSender } from 'Game';
import { MazeController, MazeEventType } from 'Maze';
import {
    InputHandlerObject,
    PlayerEventType,
    MovementDirection,
    PlayerController,
} from 'Player';
import { cellsEqual } from 'Utils';

export class Game implements IMediator<GameSender, GameEvent> {
    constructor(
        private readonly maze: MazeController,
        private readonly player: PlayerController
    ) {
        this.maze.setMediator(this);
        this.player.setMediator(this);
    }

    start() {
        this.maze.create();
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
                break;
        }
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
                this.playerMovementHandlerObject
            );
            this.maze.addRenderable(this.player);
        }
    }

    private isGameEnd(): boolean {
        return cellsEqual(
            this.maze.getState().finishCell,
            this.player.getState().currentCell
        );
    }

    private onGameEnd(): void {
        this.player.removeInputHandler(this.playerMovementHandlerObject);
        this.player.removeFocusByWindowClick();
        this.player.win();
    }
}
