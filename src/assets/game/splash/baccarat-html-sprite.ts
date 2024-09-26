import { _decorator, JsonAsset } from "cc";
import { HtmlSiteSprite } from "../../../extensions/shared-components/assets/splash/scripts/components/html-site-sprite";
import { ConfigJson } from "../config-json-interface";
const { ccclass, property } = _decorator;

@ccclass("custom_html_sprite")
export class BaccaratHtmlSprite extends HtmlSiteSprite {
    @property(JsonAsset)
    config: JsonAsset = null;

    getFileName() {
        const info = this.config.json as ConfigJson;
        const subFolder = info.type;
        const fileName = super.getFileName();
        return `${subFolder}/${fileName}`;
    }
}
