import { DevTools, Tolgee } from "@tolgee/web";
import fs from "fs";
import { GameNameSpace } from "./config";

function writeFile(fileName: string, content: string, extension = "ts") {
    fs.writeFileSync(`${fileName}.${extension}`, content, {
        encoding: "utf8",
        flag: "w+",
    });
}

const languageFolder = "./src/assets/resources/i18n/";
const languageCodes = ["en", "id", "th", "vi", "zh_cn", "zh_tw", "ja", "es"];
const jsonFolder = "./tolgee-generator/common"; // Thư mục chứa các file JSON
const createCommonNamespace = false;
const commonNameSpaces = [
    "Common",
    "BaccaratX",
    "Bac81",
    "Bac82",
    "Bac83",
    "Bac84",
    "Bac85",
    "Bac86",
    "Bac87",
    "Bac88",
    "Bac89",
    "Bac90",
    "Bac91",
    "Bac92",
    "Bac97",
    "Bac98",
    "Bac100",
    "Bac101",
];
const namespaces = createCommonNamespace ? commonNameSpaces : [GameNameSpace];
const tg = Tolgee().use(DevTools()).init({
    defaultLanguage: "en",
    availableLanguages: languageCodes,
    apiKey: "tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc",
    apiUrl: "https://tolgee.sabagame.com/",
    projectId: "5",
    defaultNs: "messages",
    ns: namespaces,
});

tg.run();

tg.on("initialLoad", async () => {
    const languages: {
        [languageId: string]: {
            [ns: string]: {
                [key: string]: string;
            };
        };
    } = {};

    let remoteNames: {
        [propertyName: string]: {
            [languageId: string]: string;
        };
    } = {
        lobbyNames: {},
        gameNames: {},
    };

    for (let index = 0; index < languageCodes.length; index++) {
        const languageId = languageCodes[index];

        await tg.changeLanguage(languageId);
        languages[languageId] = {};
        namespaces.forEach((ns) => {
            tg.getAllRecords().forEach((record) => {
                if (record.namespace == ns) {
                    languages[languageId][ns] = {};
                    record.data.forEach((value, key) => {
                        languages[languageId][ns][key] = value as string;

                        if (key == "game_name") {
                            remoteNames.gameNames[languageId] = value as string;
                        }

                        if (key == "game_icon_name") {
                            remoteNames.lobbyNames[languageId] = value as string;
                        }
                    });
                }
            });
        });

        createCommonNamespace ? writeFileCommonJson(languageId, languages) : writeFileSourceTs(languageId, languages);
    }

    if (!createCommonNamespace) {
        writeFile(
            languageFolder + "index",
            `export * as en from "./en";
export * as id from "./id";
export * as th from "./th";
export * as vi from "./vi";
export * as zh_cn from "./zh_cn";
export * as zh_tw from "./zh_tw";
export * as ja from "./ja";
export * as es from "./es";
`
        );

        writeFile("./src/remote/localization", JSON.stringify(remoteNames, null, 4), "json");
    }

    console.log("Generated done!");
});

function writeFileCommonJson(languageId: string, languages: { [languageId: string]: { [ns: string]: { [key: string]: string } } }) {
    writeFile(`${jsonFolder}/${languageId}`, JSON.stringify(languages[languageId], null, 2), "json");
}
function writeFileSourceTs(languageId: string, languages: { [languageId: string]: { [ns: string]: { [key: string]: string } } }) {
    const jsonFilePath = `${jsonFolder}/${languageId}.json`;
    let jsonData = {};

    // Đọc dữ liệu từ file JSON nếu nó tồn tại
    if (fs.existsSync(jsonFilePath)) {
        const jsonContent = fs.readFileSync(jsonFilePath, "utf8");
        jsonData = JSON.parse(jsonContent);
    }

    // Kết hợp dữ liệu từ file JSON và tham số languages
    const combinedData = {
        ...jsonData,
        ...languages[languageId],
    };

    const languageScript = `const win = window as any;
export const languages = {0};

if (!win.languages) {
    win.languages = {};
}

win.languages.${languageId} = languages;`;

    writeFile(languageFolder + languageId, languageScript.replace("{0}", JSON.stringify(combinedData, null, 4)));
}
