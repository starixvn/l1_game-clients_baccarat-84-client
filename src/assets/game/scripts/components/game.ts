import gc from "@sg/game-client-base";
import { _decorator, Node } from "cc";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";
import { BaccaratXCardsUI } from "../../../../extensions/shared-components/assets/game-baccarat/cards/baccarat-x-cards-ui";
import { ChipFlying } from "../../../../extensions/shared-components/assets/game/chip-flying/scripts/components/chip-flying";
import { CardModel } from "../../../../extensions/shared-components/assets/game/poker-cards/scripts/poker-card";
import GameComponent from "../../../../extensions/shared-components/assets/game/scripts/components/game-component";
import { WinningResult } from "../../../../extensions/shared-components/assets/shared/common-components/winning-result/scripts/winning-result";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import "./../../../resources/i18n";

startGame(settings.name, containerOptions, siteConfigs, settings.namespaces);
const { Rounds, Connection, HideGame, Settlements, FormatUtils, RoundHistories, GameBaccaratX } = gc;

const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

export interface TeamInfo {
    score: number;
    cards: CardModel[];
}

@ccclass
@observer(settings.name)
export default class Game extends GameComponent {
    @property(ChipFlying)
    chipFlying: ChipFlying = null;
    override namespace = settings.name;
    override containerOptions = containerOptions;

    @property(Node)
    nodeBaccaratCardsUi: Node = null;

    @property(Node)
    nodeWinNotice: Node = null;

    baccaratXCardsUi: BaccaratXCardsUI = null;

    protected enableFixHandleFinish = true;
    private currentCardIndexInGame = -1;
    private cutCardIndexInGame = 0;

    private soundWinChoice = ["player", "banker", "tie"];

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
            await this.baccaratXCardsUi.openCards(result as any, settlementResult, hasAnimation);
            const winning = this.nodeWinNotice.getComponent(WinningResult);
            winning.setSettlementResult(settlementResult);
            const winChoice = this.soundWinChoice.find((choice) => settlementResult[choice]);
            this.playSound(`${winChoice}-${gc.Translator.getLanguageId()}`);
            winning.show();
        }
    }

    renderCurrentFinish(currentFinish: gc.GameServiceMessage.Finish) {
        if (!currentFinish || !this.enableFixHandleFinish) {
            return;
        }
        const { result, settlementResult, usedCardIndexes } = currentFinish as any;

        if (!this.isValidResult(result, settlementResult)) {
            return;
        }

        this.baccaratXCardsUi.currentCardIndex = usedCardIndexes[0];
        this.showResult(result, true, settlementResult).then(() => {
            this.finishShowResult(result, settlementResult);
            this.chipFlying.callActionPayChips();
        });
        this.playSound(gc.Audios.AudioIds.RECEIVE_FINISH);
    }

    @render(GameBaccaratX.Shoe.ShoeStore, (store) => store.shoeInfo)
    renderShoeInfo(shoeInfo: gc.GameServiceMessage.ShoeInfo) {
        if (shoeInfo) {
            console.log("shoeInFo rendering");
            const currentCardIndex = shoeInfo.currentIndex ?? shoeInfo.burnedCards;
            console.log(`currentCardIndex from shoe ======================== `, currentCardIndex);
            if (this.currentCardIndexInGame === -1) {
                this.currentCardIndexInGame = currentCardIndex;
                this.updateCutCardIndex(shoeInfo?.cutCardIndex);
            }
        }
    }

    updateCutCardIndex(cutCardIndex: number) {
        this.cutCardIndexInGame = cutCardIndex;
        this.baccaratXCardsUi && (this.baccaratXCardsUi.cutCardIndex = cutCardIndex);
    }

    @render(RoundHistories.RoundHistoryStore, (store) => store.firstJoinGameHistory)
    async renderStaticResult(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory) {
        if (!firstJoinGameHistory) {
            return;
        }
        console.log("firstJoinGameHistory rendering");
        await this.baccaratXCardsUi.initCards();
        this.baccaratXCardsUi?.updateStacksCardBox(this?.currentCardIndexInGame, this?.cutCardIndexInGame);
        const lastRound = firstJoinGameHistory.roundHistory as any;
        if (lastRound) {
            const { result, settlementResult, usedCardIndexes } = lastRound;
            const animated = firstJoinGameHistory.animationHighlight;
            if (animated) {
                this.parseOddsMultipliers(lastRound);
                this.baccaratXCardsUi.currentCardIndex = usedCardIndexes[0];
                await this.showResult(result, false, settlementResult);
                return;
            }

            const currentCardIndex = usedCardIndexes[usedCardIndexes.length - 1] + 1;
            console.log(`current card index compare ::::::   `, currentCardIndex === this.currentCardIndexInGame);
            console.log("resume game when first round of shoe, current card index", this.currentCardIndexInGame);
            this.baccaratXCardsUi.currentCardIndex = this.currentCardIndexInGame;
            await this.baccaratXCardsUi.draw6Cards(false);
        } else {
            if (firstJoinGameHistory.roundTime < settings.durations.placingBet + settings.durations.startRound) {
                this.baccaratXCardsUi.currentCardIndex = this.currentCardIndexInGame;
                await this.baccaratXCardsUi.draw6Cards(false);
            }
        }
    }

    @handle(GameBaccaratX.Multiplier.BaccaratMultipliersHandler, (handler, lastRound) => handler.parseOddsMultiplers(lastRound))
    parseOddsMultipliers(lastRound) {
        return lastRound;
    }

    @render(Rounds.RoundTimeStore, (store) => store.isStartingRound)
    disableWinNotice(isStartingRound: boolean) {
        isStartingRound && this.nodeWinNotice.getComponent(WinningResult).hideQuickly();
    }

    @render(GameBaccaratX.Shoe.ShoeStore, (store) => store.newShoePhase)
    disableWinNotice1(newShoePhase: boolean) {
        newShoePhase && this.nodeWinNotice.getComponent(WinningResult).hideQuickly();
    }
}
