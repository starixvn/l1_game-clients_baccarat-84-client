import { _decorator, Component, Node, Prefab } from "cc";
const { ccclass, property } = _decorator;

@ccclass
export class MultiplierCards extends Component {
    @property(Prefab)
    prfMultiplierCard: Prefab = null;

    @property(Node)
    content: Node = null;
}
