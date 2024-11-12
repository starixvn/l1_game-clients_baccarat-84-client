import { _decorator, Component } from "cc";
import { MULTIPLIER_FEATURE } from "../scripts/game-configs";
const { ccclass, property } = _decorator;

@ccclass("SupportEnableMultiplier")
export class SupportEnableMultiplier extends Component {
    @property
    destroyNode = false;

    onLoad() {
        if (this.destroyNode) {
            !MULTIPLIER_FEATURE && this.node.destroy();
        } else {
            this.node.active = MULTIPLIER_FEATURE;
        }
    }
}
