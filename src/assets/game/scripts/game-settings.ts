import gc from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";

import { GAME_DURATIONS, GAME_ID, GAME_NAME, LOBBY_ID } from "../../scripts/game-configs";
import { sharedContainer } from "../../scripts/shared-container";

export const settings = {
    id: GAME_ID,
    lobbyId: LOBBY_ID,
    name: GAME_NAME,
    namespaces: [GAME_NAME, "BaccaratX"],
    durations: GAME_DURATIONS,
    numberOfRoundHistory: 100,
};

export const containerOptions: gc.IContainerOptions = {
    globalContainer: sharedContainer,
    onContainerCreated: (container) => {
        container.bind(gc.GameConfigs.GameSetting).toConstantValue(settings);
        container.bind(LogStore).to(LogStore);
    },
    features: [...gc.defaultFeatures, gc.BetDetailsNew, gc.GameBaccaratX],
};
