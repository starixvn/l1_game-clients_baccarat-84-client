import gc from "@sg/game-client-base";
import { _decorator, JsonAsset, Node } from "cc";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";
import { BaccaratXCardsUI } from "../../../../extensions/shared-components/assets/game-baccarat/cards/baccarat-x-cards-ui";
import { AudioContainer } from "../../../../extensions/shared-components/assets/game/audios/scripts/component/audio-container";
import { ChipFlying } from "../../../../extensions/shared-components/assets/game/chip-flying/scripts/components/chip-flying";
import { CardModel } from "../../../../extensions/shared-components/assets/game/poker-cards/scripts/poker-card";
import GameComponent from "../../../../extensions/shared-components/assets/game/scripts/components/game-component";
import { WinningResult } from "../../../../extensions/shared-components/assets/shared/common-components/winning-result/scripts/winning-result";
import { FunctionUtils } from "../../../../extensions/shared-components/assets/shared/utils";
import { siteConfigs } from "../../../scripts/site-configs";
import { ConfigJson } from "../../config-json-interface";
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

    @property(Node)
    nodeAudioContainer: Node = null;

    @property(JsonAsset)
    config: JsonAsset = null;

    baccaratXCardsUi: BaccaratXCardsUI = null;

    protected enableFixHandleFinish = true;
    private currentCardIndexInGame = -1;
    private cutCardIndexInGame = 0;
    private audioContainer: AudioContainer = null;

    private soundWinChoice = ["player", "banker", "tie"];
    private isAnimatingResult = false;

    onLoad() {
        this.audioContainer = this.nodeAudioContainer.getComponent(AudioContainer);
        this.baccaratXCardsUi = this.nodeBaccaratCardsUi.getComponent(BaccaratXCardsUI);

        const info = this.config.json as ConfigJson;
        this.baccaratXCardsUi.modeSpeed = info.type === "speed";
        super.onLoad();
    }

    async showResult(
        result: gc.GameServiceMessage.TResult,
        hasAnimation: boolean,
        settlementResult: gc.GameServiceMessage.TSettlementResult
    ) {
        if (result) {
            if (this.isAnimatingResult) {
                return;
            }
            this.isAnimatingResult = true;
            const winning = this.getWinningResult();
            winning.hideQuickly();
            if (hasAnimation) {
                await this.baccaratXCardsUi.openCards(result as any, settlementResult, hasAnimation);
            } else {
                this.baccaratXCardsUi.openCards(result as any, settlementResult, hasAnimation);
            }
            const winChoice = this.soundWinChoice.find((choice) => settlementResult[choice]);
            this.playSound(`${winChoice}-${gc.Translator.getLanguageId()}`);
            winning?.setSettlementResult(settlementResult);
            winning?.show();
            this.isAnimatingResult = false;
        }
    }

    getWinningResult() {
        return this.nodeWinNotice.getComponent(WinningResult);
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
            const currentCardIndex = shoeInfo.currentIndex ?? shoeInfo.burnedCards;
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
        await FunctionUtils.waitUntil(
            () => {
                return this.currentCardIndexInGame !== -1;
            },
            50,
            1000
        );
        this.baccaratXCardsUi.initCards();
        this.baccaratXCardsUi?.updateStacksCardBox(this?.currentCardIndexInGame, this?.cutCardIndexInGame);
        const lastRound = firstJoinGameHistory.roundHistory as any;
        if (lastRound) {
            const { result, settlementResult, usedCardIndexes } = lastRound;
            const animated = firstJoinGameHistory.animationHighlight;
            if (animated) {
                this.parseOddsMultipliers(lastRound);
                this.baccaratXCardsUi.currentCardIndex = usedCardIndexes[0];
                this.showResult(result, false, settlementResult);
                return;
            }
            this.baccaratXCardsUi.currentCardIndex = this.currentCardIndexInGame;
            await this.baccaratXCardsUi.draw6Cards(false);
        } else {
            if (firstJoinGameHistory.roundTime <= settings.durations.placingBet + settings.durations.startRound) {
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
        isStartingRound && this.getWinningResult()?.hideQuickly();
    }

    @render(GameBaccaratX.Shoe.ShoeStore, (store) => store.newShoePhase)
    disableWinNotice1(newShoePhase: boolean) {
        newShoePhase && this.getWinningResult()?.hideQuickly();
    }

    @render(Rounds.RoundTimeStore, (store) => store.roundState)
    fadeVolumeBgMusic(roundState: string) {
        if (roundState === Rounds.ROUND_STATE.LOCKING_BET) {
            this.audioContainer.updateVolumeMusicSource(0.3, 3);
        } else if (roundState === Rounds.ROUND_STATE.SHOW_RESULT) {
            this.audioContainer.updateVolumeMusicSource(1, 3);
        }
    }
}
