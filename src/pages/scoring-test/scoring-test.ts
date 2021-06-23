import {NavController, ModalController, NavParams, LoadingController, ToastController} from "ionic-angular";
import {Component, Renderer} from "@angular/core";
import "rxjs/add/operator/zip";
import {CompetitionInfo, CompetitionDetails, CompetitionPlayerInfo} from "../../data/competition-data";
import {CompetitionService} from "../../providers/competition-service/competition-service";
import {ScorecardService} from "../../providers/scorecard-service/scorecard-service";
import {ModalCompetition} from "./modal-competition";

/**
 *  This class extends Subscriber which is passed as parameter for Remote Http method so that
 *  results are processed
 */
@Component({
    templateUrl: 'scoring-test.html'
})
export class ScoringTestPage
{
    delayInSeconds: number                         = 5;
    playerId: number;
    competition: CompetitionInfo;
    roundNumber: number;
    holesArray: Array<number>                      = [];
    holesToScore: Array<number>                    = [];
    holeNames: string                              = "Scoring all holes";
    participants: Array<CompetitionPlayerInfo>     = [];
    playersToExclude: Array<CompetitionPlayerInfo> = [];
    playersToScore: Array<CompetitionPlayerInfo>   = [];

    constructor(private nav: NavController,
        private renderer: Renderer,
        private navParams: NavParams,
        private modalCtl: ModalController,
        private loadingCtl: LoadingController,
        private compService: CompetitionService,
        private toastCtl: ToastController,
        private scorecardService: ScorecardService) {
        this.playerId = navParams.get("playerId");
    }

    ionViewDidEnter() {
        // adjustViewZIndex(this.nav, this.renderer);
        // let pageController = this.nav.getByIndex(0);
        // let page = pageController.instance;
        // console.log("Page Name: " + pageController.name);
    }

    openCompetition() {
        let modal = this.modalCtl.create(ModalCompetition, {
            playerId: this.playerId
        });
        modal.onDidDismiss((comp: CompetitionInfo) => {
            if (comp) {
                this.competition = comp;
                this._getCompDetails();
            }
        });
        modal.present();
    }

    holesScored(): string {
        if (this.competition) {
            return this.holeNames;
        }
        else return "Select Holes";
    }

    private _getCompDetails() {
        let loadDetails = this.loadingCtl.create({
            content     : "Loading competition details",
            showBackdrop: false

        });
        loadDetails.present().then(() => {
            this.compService.getDetails(this.competition.competitionId)
                .subscribe((details: CompetitionDetails) => {
                    this.roundNumber = details.roundInProgress;
                    this.holeNames   = "All holes. Click here to change.";
                    let roundInfo    = details.gameRounds.filter((gr) => {
                        return gr.roundNo === this.roundNumber
                    }).pop();
                    let totalHoles   = roundInfo.courseNames.length * 9;
                    this.holesArray  = [];
                    for (let i = 1; i <= totalHoles; i++)
                        this.holesArray.push(i);
                    this.compService.getScorers(this.competition.competitionId, this.roundNumber)
                        .subscribe((scorers: Array<CompetitionPlayerInfo>) => {
                            loadDetails.dismiss().then(() => {
                                this.participants = scorers.filter(cp => {
                                    return cp.playerStatus === 'Registered';
                                });
                            });
                        }, (error) => {
                            loadDetails.dismiss();
                        })

                }, (error) => {
                    loadDetails.dismiss();
                });
        });

    }

    startScoring() {

        let playersExcluded: Array<number> = this.playersToExclude.map(cp => {
            return cp.playerId;
        });
        this.compService.autoScoreCompetition(this.competition.competitionId,
            this.roundNumber, playersExcluded, this.delayInSeconds).subscribe((success: boolean) => {
            if (success) {
                let toast = this.toastCtl.create({
                    message        : "Started the auto scoring for the selected competition round",
                    showCloseButton: true,
                    closeButtonText: "OK"
                });
                toast.onDidDismiss(() => {
                    this.nav.popToRoot();
                });
                toast.present();
            }
        });
    }

    deriveHoles() {
        if (!this.holesToScore.length) {
            this.holesToScore.push(...this.holesArray);
        }
    }

    derivePlayers() {
        this.playersToScore = this.participants.filter(cp => {
            if (this.playersToExclude.indexOf(cp) >= 0)
                return false;
            else
                return true;
        })
    }
}
