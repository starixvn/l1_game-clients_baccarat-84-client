import gc from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";

import { sharedContainer } from "../../scripts/shared-container";

export const settings = {
    id: 81,
    name: "Bac81",
    namespaces: ["Bac81", "BaccaratX"],
    durations: {
        wholeRound: 48,
        wholeShoe: 68,
        lockingBet: 3,
        placingBet: 30,
        generatingResult: 7,
        showingResult: 5,
        startRound: 5,
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
