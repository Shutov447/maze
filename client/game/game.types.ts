import { MazeController } from '@client/maze';
import { MazeEventType, PlayerEventType } from '@shared/types';
import { PlayerController } from '@client/player';

export type GameSender = MazeController | PlayerController;
export type GameEvent = MazeEventType | PlayerEventType;
