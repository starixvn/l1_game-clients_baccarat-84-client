const fs = require("fs-extra");
async function generate() {
    const definitions = {
        81: {
            background: 4,
            type: "lucky",
            dealer: 1,
            table: "red",
            win_notice: "red",
        },
        82: {
            background: 5,
            type: "lucky",
            dealer: 7,
            table: "blue",
            win_notice: "orange",
        },
        83: {
            background: 2,
            type: "lucky",
            dealer: 4,
            table: "green",
            win_notice: "orange",
        },
        84: {
            background: 3,
            type: "classic",
            dealer: 12,
            table: "blue",
            win_notice: "orange",
        },
        85: {
            background: 2,
            type: "classic",
            dealer: 3,
            table: "orange",
            win_notice: "red",
        },
        86: {
            background: 6,
            type: "classic",
            dealer: 2,
            table: "red",
            win_notice: "red",
        },
        87: {
            background: 3,
            type: "classic",
            dealer: 17,
            table: "purple",
            win_notice: "orange",
        },
        88: {
            background: 5,
            type: "lucky",
            dealer: 13,
            table: "red",
            win_notice: "red",
        },
        89: {
            background: 8,
            type: "lucky",
            dealer: 14,
            table: "orange",
            win_notice: "red",
        },
        90: {
            background: 9,
            type: "classic",
            dealer: 11,
            table: "red",
            win_notice: "red",
        },
        91: {
            background: 11,
            type: "classic",
            dealer: 16,
            table: "green",
            win_notice: "orange",
        },
        92: {
            background: 10,
            type: "classic",
            dealer: 19,
            table: "purple",
            win_notice: "orange",
        },
        97: {
            background: 12,
            type: "classic",
            dealer: 10,
            table: "blue",
            win_notice: "orange",
        },
        98: {
            background: 5,
            type: "speed",
            dealer: 18,
            table: "orange",
            win_notice: "red",
        },
        100: {
            background: 11,
            type: "speed",
            dealer: 15,
            table: "purple",
            win_notice: "orange",
        },
        101: {
            background: 7,
            type: "speed",
            dealer: 20,
            table: "green",
            win_notice: "orange",
        },
    };

    const gameId = process.argv[2];

    const gameName = `Bac${gameId}`;
    const definition = definitions[gameId];
    const { background, dealer, table, win_notice, type } = definition;

    copyImages(background, dealer, table, win_notice);

    updateConfigJson(type, table);
    updateCrossConfig(gameName);
    updateGameSettings(gameId, gameName, type);
    updateTolgeeConfig(gameName);

    updateCSS(type);
}

generate();
function updateCSS(type) {
    const cssFile = "./src/splash-resources/splash-style.css";
    const cssData = fs.readFileSync(cssFile, "utf8");
    const data = cssData.replace(/classic|lucky|speed/gi, type);
    fs.writeFileSync(cssFile, data, "utf8");
}

function updateConfigJson(type, table) {
    const configFilePath = "./src/assets/game/config.json";
    const configData = fs.readFileSync(configFilePath, "utf8");
    const config = JSON.parse(configData);
    config.type = type;
    config.table = table;
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf8");
}

function updateCrossConfig(gameName) {
    const configFilePath = "./src/splash-resources/cross-config.js";
    const config = `window.crossConfig = {
    backgroundLocalized: true,
    storagePrefixKey: "${gameName}",
};
`;
    fs.writeFileSync(configFilePath, config, "utf8");
}

function updateGameSettings(gameId, gameName, type) {
    const configFilePath = "./src/assets/scripts/game-configs.ts";

    const normalDurations = {
        wholeRound: 47,
        wholeShoe: 65,
        lockingBet: 3,
        placingBet: 30,
        generatingResult: 7,
        showingResult: 5,
        startRound: 4,
    };

    const speedDurations = {
        wholeRound: 33,
        wholeShoe: 51,
        lockingBet: 3,
        placingBet: 20,
        generatingResult: 4,
        showingResult: 5,
        startRound: 3,
    };

    const durations = type === "speed" ? speedDurations : normalDurations;

    const config = `export const GAME_ID = ${gameId};
export const LOBBY_ID = 102;
export const GAME_NAME = "${gameName}";
export const GAME_SERVICE_ROUTE = "baccaratx";
export const GAME_DURATIONS = {
    wholeRound: ${durations.wholeRound},
    wholeShoe: ${durations.wholeShoe},
    lockingBet: ${durations.lockingBet},
    placingBet: ${durations.placingBet},
    generatingResult: ${durations.generatingResult},
    showingResult: ${durations.showingResult},
    startRound: ${durations.startRound},
};
export const MULTIPLIER_FEATURE = ${type === "lucky" ? "true" : "false"};`;
    fs.writeFileSync(configFilePath, config, "utf8");
}

function updateTolgeeConfig(gameName) {
    const configFilePath = "./tolgee-generator/config.ts";
    const config = `export const GameNameSpace = "${gameName}";`;
    fs.writeFileSync(configFilePath, config, "utf8");
}

function copyImages(background, dealer, table, win_notice) {
    const sourcesPath = "./src/assets/clone-resources";
    const destPath = "./src/assets/";
    const dealerPath = `${sourcesPath}/dealer/${dealer}/dealer`;

    ["png", "atlas", "json"].forEach((ext) => {
        fs.copySync(`${dealerPath}.${ext}`, `${destPath}/game/dealer/dealer.${ext}`);
    });

    fs.copySync(`${sourcesPath}/background/${background}.jpg`, `${destPath}/game/images/big-images/bg.jpg`);
    fs.copySync(`${sourcesPath}/table/${table}.png`, `${destPath}/game/images/big-images/table-game.png`);
    fs.copySync(`${sourcesPath}/win-notice/${win_notice}.png`, `${destPath}/game/images/big-images/bg-text-win.png`);
}
