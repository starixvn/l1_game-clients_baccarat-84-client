import { _decorator, Component } from "cc";
import { MULTIPLIER_FEATURE } from "../scripts/game-configs";
const { ccclass, property } = _decorator;

@ccclass("SupportEnableMultiplier")
export class SupportEnableMultiplier extends Component {
    @property
    multipleNode = false;

    @property({
        visible: function () {
            return this.multipleNode;
        },
    })
    enableMultiplier = true;

    onLoad() {
        if (this.multipleNode) {
            if (MULTIPLIER_FEATURE !== this.enableMultiplier) {
                this.node.destroy();
            }
        } else {
            const isNodeForMultiplier = MULTIPLIER_FEATURE && this.enableMultiplier;
            this.node.active = isNodeForMultiplier;
        }
    }
}
