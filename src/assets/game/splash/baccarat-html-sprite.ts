import { _decorator, JsonAsset } from "cc";
import { HtmlSiteSprite } from "../../../extensions/shared-components/assets/splash/scripts/components/html-site-sprite";
const { ccclass, property } = _decorator;

@ccclass("custom_html_sprite")
export class BaccaratHtmlSprite extends HtmlSiteSprite {
    @property(JsonAsset)
    config: JsonAsset = null;

    getFileName() {
        const subFolder = this.config.json.value;
        const fileName = super.getFileName();
        return `${subFolder}/${fileName}`;
    }
}
