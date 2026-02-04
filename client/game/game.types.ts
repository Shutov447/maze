import { MazeController } from '@client/maze';
import { PlayerController, PlayerEventType } from '@client/player';
import { MazeEventType } from '@shared/types';

export type GameSender = MazeController | PlayerController;
export type GameEvent = MazeEventType | PlayerEventType;
