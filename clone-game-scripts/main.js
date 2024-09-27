const fs = require("fs-extra");
async function generate() {
    const definitions = {
        81: {
            type: "lucky",
            dealer: 1,
            table: "red",
            win_notice: "red",
        },
        84: {
            type: "classic",
            dealer: 12,
            table: "blue",
            win_notice: "red",
        },
        98: {
            type: "speed",
            dealer: 18,
            table: "purple",
            win_notice: "orange",
        },
    };

    const gameId = 98;
    const definition = definitions[gameId];
    const { dealer, table, win_notice, type } = definition;

    copyImages(dealer, table, win_notice);

    updateConfigJson(type, table);

    updateCSS(type);
}

generate();
function updateCSS(type) {
    const cssFile = "../src/splash-resources/splash-style.css";
    const cssData = fs.readFileSync(cssFile, "utf8");
    const data = cssData.replace(/classic|lucky|speed/gi, type);
    fs.writeFileSync(cssFile, data, "utf8");
}

function updateConfigJson(type, table) {
    const configFilePath = "../src/assets/game/config.json";
    const configData = fs.readFileSync(configFilePath, "utf8");
    const config = JSON.parse(configData);
    config.type = type;
    config.table = table;
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf8");
}

function copyImages(dealer, table, win_notice) {
    const sourcesPath = "../src/assets/clone-resources";
    const destPath = "../src/assets/";
    const dealerPath = `${sourcesPath}/dealer/${dealer}/dealer`;

    ["png", "atlas", "json"].forEach((ext) => {
        fs.copySync(`${dealerPath}.${ext}`, `${destPath}/game/dealer/dealer.${ext}`);
    });

    fs.copySync(`${sourcesPath}/table/${table}.png`, `${destPath}/game/images/big-images/table-game.png`);
    fs.copySync(`${sourcesPath}/win-notice/${win_notice}.png`, `${destPath}/game/images/big-images/bg-text-win.png`);
}
