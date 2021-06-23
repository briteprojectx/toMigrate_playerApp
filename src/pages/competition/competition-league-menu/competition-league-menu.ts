import {NavController, NavParams} from 'ionic-angular';
import {Component, Renderer} from '@angular/core';
import {isPresent} from 'ionic-angular/util/util';
import {
    CompetitionCategory,
    CompetitionInfo,
    CompetitionPrizeInfo,
    GameroundPrize
} from '../../../data/competition-data';
import {CompetitionService} from '../../../providers/competition-service/competition-service';
import {adjustViewZIndex} from '../../../globals';
import { ClubFlightService } from '../../../providers/club-flight-service/club-flight-service';
import { LeagueScorecardPage } from '../competition-league-scorecard/competition-league-scorecard';
import { LeagueLeaderboardPage } from '../competition-league-leaderboard/competition-league-leaderboard';
import { LeagueLowestPage } from '../competition-league-lowest/competition-league-lowest';
import { LeagueRound } from '../../../data/mygolf.data';
//import {ArrayFilterPipe} from "../../../pipes/ArrayFilter.pipe";

/*
 Generated class for the Competition prizes page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'competition-league-menu.html',
    selector: 'competition-league-menu'
    //pipes: [ArrayFilterPage]
})
export class CompetitionLeagueMenuPage
{

    public competition: CompetitionInfo;
    public prizes: Array<CompetitionPrizeInfo>;
    public roundNo: Array<number>                              = new Array<number>();
    public prizeMap: any                                       = {};
    public compPrizes: Array<CompetitionPrizeInfo>             = [];
    public roundwisePrizes: Array<Array<CompetitionPrizeInfo>> = [];
    public categories: Array<CompetitionCategory> = new Array<CompetitionCategory>();

    public gameRoundPrizes: Array<GameroundPrize> = [];

    public teamRoundwisePrizes: Array<Array<CompetitionPrizeInfo>> = [];
    public teamPrizes: Array<CompetitionPrizeInfo>;
    public compTeamPrizes: Array<CompetitionPrizeInfo>             = [];
    public gameRoundTeamPrizes: Array<GameroundPrize>              = [];

    isEclectic: boolean = false;
    compSeasonId: number;

    leagueRounds: Array<LeagueRound>;
    constructor(private nav: NavController,
        private navParams: NavParams,
        private renderer: Renderer,
        private competitionService: CompetitionService,
        private flightService: ClubFlightService) {
        this.nav         = nav;
        this.competition = navParams.get("competition");
        this.prizes      = navParams.get("prizes");
        this.teamPrizes  = navParams.get("teamPrizes");
        this.categories  = navParams.get("categories");
        //this.roundNo = this.prizes.roundNumber
        this.prizeMap    = {};
        //  this.roundNo = this.prizes.roundNumber.filter(onlyUnique);
    }

    ionViewDidEnter() {
        adjustViewZIndex(this.nav, this.renderer);
        // this.competition? this.competition.competitionId : this.compId
        this.flightService.checkLeagueCompetition(this.competition.competitionId)
          .subscribe((data)=>{
            console.log("check league competition - eclectic : ", data)
            this.isEclectic = data;
            this.getLeagueSeason();
          })

    }


    onHomeClick() {
        this.nav.popToRoot();//this.nav.setRoot(PlayerHomePage);
    }


    isCompetitionEclectic() { 
        return this.isEclectic;
    }

    goLeagueScorecard() {
        this.nav.push(LeagueScorecardPage, {
          competition: this.competition,
          compSeasonId: this.compSeasonId,
        });
      }
  
      goLeagueLeaderboard() {
        this.nav.push(LeagueLeaderboardPage, {
          competition: this.competition,
          compSeasonId: this.compSeasonId,
        });
        
      }
  
      goLeagueLowestLeaderboard() {
        this.nav.push(LeagueLowestPage, {
          competition: this.competition,
          compSeasonId: this.compSeasonId,
        });
        
      }

      getLeagueSeason() {
          this.flightService.getLeagueSeason(this.competition.competitionId)
          .subscribe((data)=>{
              this.compSeasonId = data;
              this.getLeagueRounds(data);
              // this.refreshLeagueScorecards(this.competition.competitionId);
            console.log("league season : ", data)
          })
      }

      // refreshLeagueScorecards(compId?: number) {
      //   let _compId;
      //   if(compId) _compId = compId;
      //   else _compId = this.competition.competitionId
      //   this.flightService.getLeagueScorecards(_compId)
      //   .subscribe((data: LeagueScorecards)=>{
      //     console.log("refresh league scorecards : ", data)
      //     if(data) {
      //       // this.leagueScorecards = data;
      //       this.getLeagueRounds(this.compSeasonId);
      //       // this.currentSeasonRound = data.leagueRound
      //     }
      //   })
      // }
    
    
      getLeagueRounds(seasonId: number) {
        this.flightService.getLeagueRounds(seasonId)
            .subscribe((data)=>{
              if(data) this.leagueRounds = data;
              console.log("league rounds : ", data)
            })
      }
}
