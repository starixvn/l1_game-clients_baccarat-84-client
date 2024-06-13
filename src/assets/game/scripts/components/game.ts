import gc from "@sg/game-client-base";
import { _decorator, Node } from "cc";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";

import { CardModel, convertRank } from "../../../../extensions/shared-components/assets/game/poker-cards/scripts/poker-card";
import GameComponent from "../../../../extensions/shared-components/assets/game/scripts/components/game-component";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import "./../../../resources/i18n";
import { BaccaratXCards } from "./baccarat-x-cards";
import { MultiplierCards } from "./multiplier-cards";

startGame(settings.name, containerOptions, siteConfigs);
const { Rounds, Connection, HideGame, Settlements, FormatUtils, RoundHistories } = gc;

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
    cardSection: Node[] = [];

    @property(Node)
    nodeMultiplierCards: Node = null;

    async showResult(
        result: gc.GameServiceMessage.TResult,
        hasAnimation: boolean,
        settlementResult: gc.GameServiceMessage.TSettlementResult
    ) {
        if (result) {
            const infoTeams = [];
            Object.keys(result).forEach((team) => {
                if (team === "player" || team === "banker") {
                    infoTeams.push(this.setResultTeam(result[team]));
                }
            });
            infoTeams.forEach((team, index) => {
                console.log("cardSection", this.cardSection[index]);
                const comp = this.cardSection[index].getComponent(BaccaratXCards);
                if (comp.cards[0].children.length === 0) {
                    comp.renderCards();
                }
                comp.faceUpCard(team.cards);
                comp.setScore(team.score);
            });
        }
    }

    setResultTeam(team: any) {
        let teamInfo: TeamInfo = { score: 0, cards: [] };
        if (team) {
            const cards = [];
            cards.push({ rank: convertRank(team.card1.rank), suit: team.card1.suit });
            cards.push({ rank: convertRank(team.card2.rank), suit: team.card2.suit });
            if (team.card3) {
                cards.push({ rank: convertRank(team.card3.rank), suit: team.card3.suit });
            }
            teamInfo.cards = cards;
        }
        teamInfo.score = team.score;
        return teamInfo;
    }

    @render(Rounds.RoundTimeStore, (store) => store.isStartingRound)
    closeCards() {
        this.cardSection.forEach((card) => {
            const comp = card.getComponent(BaccaratXCards);
            if (comp.cards[0].children.length === 0) {
                comp.renderCards();
            }
            comp.showScore(false);
            comp.showCard3(false);
            comp.faceDownCard();
        });
        this.nodeMultiplierCards.getComponent(MultiplierCards).showMultiplierCards(false);
    }
}
