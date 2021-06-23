import {NavController, NavParams} from "ionic-angular";
import {Preference} from "../../../storage/preference";
import * as global from "../../../globals";
import {adjustViewZIndex} from "../../../globals";
import {CompetitionInfo} from "../../../data/competition-data";
import {PlayerHomeInfo} from "../../../data/player-data";
import {CompetitionService} from "../../../providers/competition-service/competition-service";
import {Component, Renderer} from "@angular/core";
import {Observable} from 'rxjs/Observable';
import {PlayerHomeActions} from '../../../redux/player-home/player-home-actions';
import { GameRoundScoringPage } from "../../gameround-scoring/gameround-scoring";
import { CurrentScorecardActions } from "../../../redux/scorecard";
import { PlayerInfo, PlainScoreCard } from "../../../data/mygolf.data";
import { ScorecardService } from "../../../providers/scorecard-service/scorecard-service";
// import { PlainScorecard } from "../../../data/scorecard";
import { LoadingController } from "ionic-angular";
/**
 * Created by ashok on 21/10/16.
 */

@Component({
    templateUrl: 'competition-scoring.html',
})
export class CompetitionScoring
{

    homeInfo: Observable<PlayerHomeInfo>;
    activeCompetitions: Observable<Array<CompetitionInfo>>;
    fromMultiple: boolean = false;

    constructor(private nav: NavController,
        private playerHomeActions: PlayerHomeActions,
        private navParams: NavParams,
        private competitionService: CompetitionService,
        private currentScorecardActions: CurrentScorecardActions,
        private scorecardService: ScorecardService,
        private loadingCtl: LoadingController) {
        this.homeInfo = navParams.get("homeInfo");
        this.activeCompetitions = this.homeInfo.map(homeInfo=>homeInfo.compsActiveToday)
            .filter(Boolean);
        // this.homeInfo.take(1).subscribe((a)=>{
        //     this.activeCompetitions = a.compsActiveToday;
        // })
        this.fromMultiple = navParams.get("fromMultiple");
        // this.activeCompetitions.push(...this.homeInfo.compsActiveToday);
    }

    ionViewDidEnter() {

    }

    onSelect(comp: CompetitionInfo) {

        if(this.fromMultiple) {
            let loader = this.loadingCtl.create({
                content            : "Getting scorecard. Please wait...",
                dismissOnPageChange: true,
                duration           : 10000,
            });
            this.playerHomeActions.selectCompetionForScoring(comp.competitionId);
            let _player: PlayerInfo;
            this.homeInfo.take(1).subscribe((a: any)=>{
                _player = a;
            })
            // this.competitionService.getCompetitionInfo(comp.competitionId)
            //                     .subscribe((comp: CompetitionInfo) => {
            //                         // loader.dismiss().then(() => {
            //                             this.currentScorecardActions.setScoringPlayer(_player.playerId);
            //                             this.nav.push(GameRoundScoringPage, {
            //                                 scorecard    : scorecard,
            //                                 competition  : comp,
            //                                 currentPlayer: player
            //                             })
            //                         // });
            //                     }, (error) => {
            //                         // loader.dismiss();
            //                     });
            loader.present().then(()=>{
                this.playerHomeActions.getCompetitionScoring(comp.competitionId, _player.playerId, null);
                let getScorecard = setInterval(()=>{
                    // console.log("competition scorecard", _competitionScorecard)
                    this.scorecardService.getCurrentScorecard()
                    .subscribe((scorecard: PlainScoreCard) => {
                        console.log("get current scorecard : ", scorecard)
                        if(scorecard.competitionId === comp.competitionId) {
                            clearInterval(getScorecard);
                            this.competitionService.getCompetitionInfo(comp.competitionId)
                            .subscribe((comp: CompetitionInfo) => {
                                // loader.dismiss().then(() => {
                                    this.currentScorecardActions.setScoringPlayer(_player.playerId);
                                    this.nav.push(GameRoundScoringPage, {
                                        scorecard    : scorecard,
                                        competition  : comp,
                                        currentPlayer: _player
                                    })
                                // });
                            }, (error) => {
                                if(loader) loader.dismiss();
                                clearInterval(getScorecard);
                            }, ()=>{
                                // if(loader) loader.dismiss();
                            });
                            }
                        
                    });
                },1000)
            })
            
        } else {
            
            this.playerHomeActions.selectCompetionForScoring(comp.competitionId);
            this.nav.popToRoot();
        }

    }
}
