import gc from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";

import { GAME_ID, GAME_NAME } from "../../scripts/game-configs";
import { sharedContainer } from "../../scripts/shared-container";

export const settings = {
    id: GAME_ID,
    name: GAME_NAME,
    namespaces: ["Bac81", "BaccaratX"],
    durations: {
        wholeRound: 47,
        wholeShoe: 65,
        lockingBet: 3,
        placingBet: 30,
        generatingResult: 7,
        showingResult: 5,
        startRound: 4,
    },
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
