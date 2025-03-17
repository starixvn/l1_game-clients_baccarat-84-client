import { _decorator } from "cc";
import { OpenSidePanelEvent } from "db://shared-components/game-baccarat/gateway-panel/scripts/models/definitions";
import { InGameMenuHandlers } from "db://shared-components/game/in-game-menu/scripts/handlers/in-game-menu-handlers";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";

const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass
export default class SwitchTableButton extends ObserverComponent {
    @handle(InGameMenuHandlers)
    protected onOpenSidePanel() {
        return OpenSidePanelEvent;
    }
}
