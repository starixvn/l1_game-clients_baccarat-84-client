
import { GAME_DURATIONS, GAME_ID, GAME_NAME, LOBBY_ID } from "../../scripts/game-configs";

export const settings = {
    id: GAME_ID,
    lobbyId: LOBBY_ID,
    name: GAME_NAME,
    observerNamespace: GAME_NAME,
    namespaces: [GAME_NAME, "BaccaratX"],
    durations: GAME_DURATIONS,
    numberOfRoundHistory: 100,
};

