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
//import {ArrayFilterPipe} from "../../../pipes/ArrayFilter.pipe";

/*
 Generated class for the Competition prizes page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'competition-prizes.html',
    selector: 'competition-prizes'
    //pipes: [ArrayFilterPage]
})
export class PrizesPage
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

    constructor(private nav: NavController,
        private navParams: NavParams,
        private renderer: Renderer,
        private competitionService: CompetitionService) {
        this.nav         = nav;
        this.competition = navParams.get("competition");
        this.prizes      = navParams.get("prizes");
        this.teamPrizes  = navParams.get("teamPrizes");
        this.categories  = navParams.get("categories");
        //this.roundNo = this.prizes.roundNumber
        this.prizeMap    = {};
        //  this.roundNo = this.prizes.roundNumber.filter(onlyUnique);
        this.prizes.forEach((pr: CompetitionPrizeInfo) => {
            if (pr.roundNumber >= 99)
                this.compPrizes.push(pr);
            else {
                if (!isPresent(this.roundwisePrizes[pr.roundNumber]))
                    this.roundwisePrizes[pr.roundNumber] = [];
                this.roundwisePrizes[pr.roundNumber].push(pr);
            }
        });
        this.gameRoundPrizes = this.competitionService.groupedPrizes(this.prizes);

        this.teamPrizes.forEach((pr: CompetitionPrizeInfo) => {
            if (pr.roundNumber >= 99)
                this.compTeamPrizes.push(pr);
            else {
                if (!isPresent(this.teamRoundwisePrizes[pr.roundNumber]))
                    this.teamRoundwisePrizes[pr.roundNumber] = [];
                this.teamRoundwisePrizes[pr.roundNumber].push(pr);
            }
        });
        this.gameRoundTeamPrizes = this.competitionService.groupedPrizes(this.teamPrizes);

        console.log("Grouped Round Prizes : ",this.gameRoundPrizes)
        console.log("this.Prizes : ",this.prizes)
        console.log("categories : ", this.categories)
    }

    ionViewDidEnter() {
        adjustViewZIndex(this.nav, this.renderer);
    }

    prizesExist(roundNumber: number) {
        if (isPresent(this.roundwisePrizes[roundNumber])
            && this.roundwisePrizes[roundNumber].length > 0)
            return true;
        else return false;
    }

    teamPrizesExist(roundNumber: number) {
        if (isPresent(this.teamRoundwisePrizes[roundNumber])
            && this.teamRoundwisePrizes[roundNumber].length > 0)
            return true;
        else return false;
    }

    onHomeClick() {
        this.nav.popToRoot();//this.nav.setRoot(PlayerHomePage);
    }

    public getHandicapRange(category: string) {
        // console.log("getHandicapRange() ",category)
        let handicapRange: string = ''
        this.categories.forEach((c: CompetitionCategory) => {
            // console.log("getHandicapRange() ",category,c.categoryName,c.fromHandicap,c.toHandicap)
            if( category === c.categoryName) {
                // console.log("getHandicapRange() inside",category,c.categoryName,c.fromHandicap,c.toHandicap)
                handicapRange = " ("+c.fromHandicap+" - "+c.toHandicap+")";
            }
        })
        return handicapRange;
    }
}
