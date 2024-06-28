import gc from "@sg/game-client-base";
import { _decorator, Node } from "cc";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";

import { BaccaratXCardsUI } from "../../../../extensions/shared-components/assets/game-baccarat/cards/baccarat-x-cards-ui";
import { CardModel } from "../../../../extensions/shared-components/assets/game/poker-cards/scripts/poker-card";
import GameComponent from "../../../../extensions/shared-components/assets/game/scripts/components/game-component";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import "./../../../resources/i18n";

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

    protected enableFixHandleFinish = true;

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
            await this.baccaratXCardsUi.openCards(result as any, hasAnimation);
        }
    }

    @render(RoundHistories.RoundHistoryStore, (store) => store.firstJoinGameHistory)
    async renderStaticResult(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory) {
        if (!firstJoinGameHistory) {
            return;
        }
        console.log(`receive first join game `, firstJoinGameHistory.roundTime);
        console.log(`firstjoin draw 6 cards`);
        await this.baccaratXCardsUi.initCards();
        await this.baccaratXCardsUi.draw6Cards(false);
        const lastRound = firstJoinGameHistory.roundHistory;
        if (lastRound) {
            const { result, settlementResult } = lastRound;
            const animated = firstJoinGameHistory.animationHighlight;
            if (animated) {
                console.log(`firstjoin show result`);
                await this.showResult(result, false, settlementResult);
                return;
            }
        }
    }
}
