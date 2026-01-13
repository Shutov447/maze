import { MazeController, MazeEventType } from 'Maze';
import { PlayerController, PlayerEventType } from 'Player';

export type GameSender = MazeController | PlayerController;
export type GameEvent = MazeEventType | PlayerEventType;
