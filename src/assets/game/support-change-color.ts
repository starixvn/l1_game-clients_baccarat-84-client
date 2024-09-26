import { _decorator, Color, Component, JsonAsset, Node, UIRenderer } from "cc";
import { ConfigJson } from "./config-json-interface";
const { ccclass, property } = _decorator;
@ccclass("GroupNode")
export class NodeGroup {
    @property
    name = "";

    @property({ type: Node })
    nodes: Node[] = [];
}

@ccclass("support_change_color")
export class SupportChangeColor extends Component {
    @property(JsonAsset)
    config: JsonAsset = null;

    @property({ type: NodeGroup })
    groups: NodeGroup[] = [];

    onLoad() {
        const info = this.config.json as ConfigJson;
        const table = info.table;
        const colorConfig = info.colors[table];

        this.changeColorNodes(colorConfig);
    }

    changeColorNodes(colorConfig: any) {
        this.groups.forEach((group) => {
            group.nodes.forEach((node) => {
                const colorHex = colorConfig[group.name];
                if (colorHex) {
                    const renderer = node.getComponent(UIRenderer);
                    renderer.color = new Color(colorHex);
                }
            });
        });
    }
}
