import { InputHandlerObject } from '@shared/types';
import { MazeController } from '@client/maze';
import { ControlledPlayerController } from '@client/controlled-player';
import {
    GameService,
    RemotePlayersRandomMovementAbility,
    WallDestructionAbility,
} from '@client/game';

export const getRandomAbility = (
    abilities: (
        | typeof RemotePlayersRandomMovementAbility
        | typeof WallDestructionAbility
    )[],
    maze: MazeController,
    player: ControlledPlayerController,
    gameService: GameService,
    mainMovementHandlerObject: InputHandlerObject,
    changeTimeMs: number,
    cooldownTimeMs: number,
) => {
    const specialAbilityIndex = Math.floor(Math.random() * abilities.length);
    const SpecialAbility = abilities[specialAbilityIndex];
    switch (SpecialAbility) {
        case RemotePlayersRandomMovementAbility:
            return new SpecialAbility(
                maze,
                player,
                mainMovementHandlerObject,
                changeTimeMs,
                gameService,
                cooldownTimeMs,
            );
        case WallDestructionAbility:
            return new SpecialAbility(
                maze,
                player,
                gameService,
                cooldownTimeMs,
            );
    }
};
