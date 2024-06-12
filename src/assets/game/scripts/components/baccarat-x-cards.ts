import { Component, Label, Node, Prefab, _decorator, instantiate } from "cc";
import Observer from "observer";
import { FairnessCard } from "../../../../extensions/shared-components/assets/game/poker-cards/scripts/fairness-card";
import { CardModel } from "../../../../extensions/shared-components/assets/game/poker-cards/scripts/poker-card";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass
export class BaccaratXCards extends Component {
    @property(Prefab)
    prfCard: Prefab = null;

    @property(Node)
    cards: Node[] = [];

    @property(Label)
    lblScore: Label = null;

    @property(Node)
    nodeScore: Node = null;

    onLoad() {
        this.renderCards();
    }

    renderCards() {
        this.cards.forEach((card) => {
            const node = instantiate(this.prfCard);
            card.addChild(node);
        });
    }

    faceUpCard(cards: CardModel[]) {
        this.cards.forEach((card, index) => {
            const cardComponent = card?.children[0]?.getComponent(FairnessCard);
            cardComponent.card.setCard(cards[index]);
            cardComponent.card.openCard();
        });
    }

    faceDownCard() {
        this.cards.forEach((card, index) => {
            const cardComponent = card?.children[0]?.getComponent(FairnessCard);
            cardComponent.card.faceDown();
        });
    }

    setScore(score: number) {
        this.showScore(true);
        this.lblScore.string = score.toString();
    }

    showScore(isShow: boolean) {
        this.nodeScore.active = isShow;
    }
}
