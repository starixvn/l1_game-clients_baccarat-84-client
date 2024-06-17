import { Label, Node, Prefab, _decorator, instantiate } from "cc";
import Observer from "observer";
import { FairnessCard } from "../../../../extensions/shared-components/assets/game/poker-cards/scripts/fairness-card";
import { ServiceCard } from "../../../../extensions/shared-components/assets/game/poker-cards/scripts/poker-card";
import { ObserverComponent } from "../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass
export class BaccaratXCards extends ObserverComponent {
    @property(Prefab)
    prfCard: Prefab = null;

    @property(Node)
    cardContainer: Node = null;

    @property(Label)
    lblScore: Label = null;

    private initialized = false;
    cards: FairnessCard[] = [];

    initCards() {
        if (this.initialized) {
            return;
        }

        this.initialized = true;
        this.cardContainer.children.forEach((card) => {
            const node = instantiate(this.prfCard);
            card.addChild(node);

            this.cards.push(node.getComponent(FairnessCard));
        });
    }

    faceUpCard(serviceCards: ServiceCard[]) {
        this.cards.forEach((cardComponent, index) => {
            cardComponent.card.setServiceCard(serviceCards[index]);
            cardComponent.card.openCard();
            if (serviceCards.length > 2) {
                this.showCard3(true);
            }
        });
    }

    faceDownCard() {
        this.cards.forEach((cardComponent, index) => {
            cardComponent.card.faceDown();
        });
    }

    setScore(score: number) {
        this.showScore(true);
        this.lblScore.string = score.toString();
    }

    showScore(isShow: boolean) {
        this.lblScore.node.parent.active = isShow;
    }

    showCard3(isShow: boolean) {
        this.cards[2].node.active = isShow;
    }
}
