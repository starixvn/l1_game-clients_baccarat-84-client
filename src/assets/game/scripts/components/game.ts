import gc from "@sg/game-client-base";
import { _decorator, Node } from "cc";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";

import { CardModel } from "../../../../extensions/shared-components/assets/game/poker-cards/scripts/poker-card";
import GameComponent from "../../../../extensions/shared-components/assets/game/scripts/components/game-component";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import "./../../../resources/i18n";
import { BaccaratXCardsUI } from "./baccarat-x-cards-ui";

startGame(settings.name, containerOptions, siteConfigs);
const { Rounds, Connection, HideGame, Settlements, FormatUtils, RoundHistories, GameBaccaratX } = gc;

const { ccclass, property } = _decorator;
const { observer, render } = Observer;

export interface TeamInfo {
    score: number;
    cards: CardModel[];
}

@ccclass
@observer(settings.name)
export default class Game extends GameComponent {
    override namespace = settings.name;
    override containerOptions = containerOptions;

    @property(Node)
    nodeBaccaratCardsUi: Node = null;

    @property(Node)
    nodeMultiplierCards: Node = null;

    baccaratXCardsUi: BaccaratXCardsUI = null;

    onLoad() {
        this.baccaratXCardsUi = this.nodeBaccaratCardsUi.getComponent(BaccaratXCardsUI);
        super.onLoad();
    }

    async showResult(
        result: gc.GameServiceMessage.TResult,
        hasAnimation: boolean,
        settlementResult: gc.GameServiceMessage.TSettlementResult
    ) {
        if (result) {
            this.baccaratXCardsUi.openCards(result as any);
        }
    }
}
