import { _decorator, Component } from "cc";
import { BaccaratXCards } from "./baccarat-x-cards";
const { ccclass, property } = _decorator;

export enum CardsOrder {
    card1 = 0,
    card2,
    card3,
}

type OrderCardValue = {
    node: BaccaratXCards;
    key: number;
};

export enum CountCardFlied {
    FourCards = 4,
    FiveCards,
    SixCards,
}

@ccclass
export class BaccaratXCardsUI extends Component {}
