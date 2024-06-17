import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import Observer from "observer";
import { ServiceCard } from "../../../../extensions/shared-components/assets/game/poker-cards/scripts/poker-card";
import { ObserverComponent } from "../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";
import { BaccaratXCards } from "./baccarat-x-cards";
const { ccclass, property } = _decorator;
const { render, handle } = Observer;
const { Rounds, GameBaccaratX } = gc;

type ServiceCardHand = {
    card1: ServiceCard;
    card2: ServiceCard;
    card3?: ServiceCard;
    score: number;
};

type BaccaratResult = {
    [choice: string]: ServiceCardHand;
};

@ccclass
export class BaccaratXCardsUI extends ObserverComponent {
    private _cardHands: BaccaratXCards[] = [];

    currentCardIndex = -1;

    get cardHands() {
        if (this._cardHands.length === 0) {
            this._cardHands = this.getComponentsInChildren(BaccaratXCards);
        }
        return this._cardHands;
    }

    @render(Rounds.RoundTimeStore, (store) => store.isStartingRound)
    closeCards() {
        this.cardHands.forEach((comp) => {
            comp.initCards();
            comp.showScore(false);
            comp.showCard3(false);
            comp.faceDownCard();
        });
    }

    @render(GameBaccaratX.Shoe.ShoeStore, (store) => store.shoeInfo)
    renderShoeInfo(shoeInfo: gc.GameServiceMessage.ShoeInfo) {
        if (shoeInfo) {
            this.currentCardIndex = shoeInfo.currentIndex;
        }
    }

    openCards(result: BaccaratResult) {
        [gc.GameBaccaratX.BetChoice.Player, gc.GameBaccaratX.BetChoice.Banker].forEach((team, index) => {
            const handData = result[team];
            const comp = this.cardHands[index];
            comp.initCards();
            const cards = Object.values(handData)
                .filter((value) => typeof value !== `number`)
                .map((value) => value as ServiceCard);
            comp.faceUpCard(cards);
            comp.setScore(handData.score);
        });
    }
}
