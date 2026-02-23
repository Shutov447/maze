import { MazeEventType, PlayerEventType } from '@shared/types';
import { MazeController } from '@client/maze';
import { ControlledPlayerController } from '@client/controlled-player';

export type GameSender = MazeController | ControlledPlayerController;
export type GameEvent = MazeEventType | PlayerEventType;
