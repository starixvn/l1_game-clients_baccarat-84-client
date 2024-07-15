import { _decorator, Component, sp } from "cc";
import { AnimationUtils } from "../../../extensions/shared-components/assets/shared/utils";
const { ccclass, property } = _decorator;

@ccclass("TestCard")
export class TestCard extends Component {
    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null;

    current = false;

    start() {}

    onClickPause() {
        const newState = !this.current;
        this.skeleton.paused = newState;
        this.current = newState;
    }

    async onClickLucky() {
        await AnimationUtils.playSpine(this.skeleton, "lucky-card", false);
    }

    async onClickOpenCard() {
        const { spine } = sp;
        const { BoneData } = spine;
        const sockets = this.skeleton.sockets;

        await AnimationUtils.playSpine(this.skeleton, "open-card", false);

        console.log("socketNodes", this.skeleton.socketNodes);
        console.log("sockets", this.skeleton.sockets);
    }

    onTestRotate() {
        // const socketLargeSuit = sockets[1];
        // socketLargeSuit.target.setRotationFromEuler(new Vec3(0, 90, 0));
    }
}

// Node.prototype.shear = () => {
//     console.log("test shear------------");
// };

// Node.prototype.scale = () => {
//     console.log("test scale------------");
// };
