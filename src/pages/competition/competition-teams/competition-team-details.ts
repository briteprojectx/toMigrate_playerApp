import {Component, Renderer} from "@angular/core";
import {DescriptionBoxPage} from "../../modal-screens/description-box/description-box";
import {NavParams, ViewController, NavController, ModalController} from "ionic-angular";
import {Teams, createTeamDetails} from "../../../data/competition-data";
import {adjustViewZIndex} from "../../../globals";
import {CompetitionTeamExpandLogo} from "./competition-team-expand-logo";
import {AuthenticationService} from "../../../authentication-service";
import {SessionInfo} from '../../../data/authentication-info';
import {SessionDataService} from '../../../redux/session/session-data-service';

/**
 * Created by ashok on 08/12/16.
 */
@Component({
    templateUrl: 'competition-team-details.html',
    selector: 'competition-teams'
})
export class CompetitionTeamDetails
{
    team: Teams;
    openedAsModal: boolean = false;
    loggedInUser: number;
    session: SessionInfo;
    constructor(private viewCtrl: ViewController,
        private navParams: NavParams,
        private renderer: Renderer,
        private nav: NavController,
        private modalCtl: ModalController,
        private sessionService: SessionDataService) {

        this.team = navParams.get("team");
        if (!this.team) {
            this.team = createTeamDetails();
        }
        this.openedAsModal = navParams.get("openAsModal");
        // this.competition = navParams.get("competition")
        console.log("Modal Team Details:", this.team)
    }

    ionViewDidLoad() {
        this.deriveSession();
        let _session = setInterval(()=>{
            if(this.session) {
                clearInterval(_session);
                this.loggedInUser = this.session.playerId;
            }
        },500)
    }

    ionViewDidEnter() {
        if (!this.openedAsModal)
            adjustViewZIndex(this.nav, this.renderer);
    }
    async deriveSession () {
        this.session = await this.sessionService.getSession().toPromise();
    }
    public checkTeamPlayers() {
        if (this.team.teamPlayers.length == 0) {
            return false;
        } else return true;
    }

    onImageClick() {
        let modal = this.modalCtl.create(CompetitionTeamExpandLogo, {team: this.team});
        modal.onDidDismiss(() => {
            if (!this.openedAsModal) {
                adjustViewZIndex(this.nav, this.renderer);
            }
        });
        modal.present();
    }

    close() {
        this.viewCtrl.dismiss();
    }

    public openDescription() {

        let modal = this.modalCtl.create(DescriptionBoxPage, {
            title      : this.team.teamName,
            description: this.team.description,
            headerName : "Team Description"
        });
        modal.onDidDismiss(() => {
            if (!this.openedAsModal) {
                adjustViewZIndex(this.nav, this.renderer);
            }
        });
        modal.present();
    }
}

