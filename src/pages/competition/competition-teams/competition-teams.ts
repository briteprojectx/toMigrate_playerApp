import {
    ActionSheetController,
    LoadingController,
    ModalController,
    NavController,
    NavParams,
    Platform,
    ToastController
} from 'ionic-angular';
import {Keyboard} from '@ionic-native/keyboard';
import {Component, Renderer} from '@angular/core';
import {CompetitionDetails, CompetitionInfo, CompetitionTeams, FlightInfo, Teams} from '../../../data/competition-data';
import {GameRoundInfo} from '../../../data/game-round';
import {CompetitionService} from '../../../providers/competition-service/competition-service';
import {adjustViewZIndex} from '../../../globals';
import {MessageDisplayUtil} from '../../../message-display-utils';
import {CompetitionTeamDetails} from './competition-team-details';
import * as moment from 'moment';
/*
 Generated class for the Competition Sponsors page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'competition-teams.html',
    selector: 'competition-teams'
})
export class TeamsPage
{
    public competition: CompetitionInfo;
    public details: CompetitionDetails;
    public gameRound: GameRoundInfo;
    public visible: boolean;
    public flights: Array<FlightInfo>        = new Array<FlightInfo>();
    //  private flightMembers: Array<FlightMember> = new Array<FlightMember>();
    public filteredFlight: Array<FlightInfo> = new Array<FlightInfo>();
    public searchQuery: string               = '';
    public teamList: Array<string>           = new Array<string>();
    public compTeams: CompetitionTeams; //Array<CompetitionTeams> = new Array<CompetitionTeams>();
    public filteredCompTeams: Teams[];
    public shownItem: Teams;

    constructor(private nav: NavController,
        private renderer: Renderer,
        private keyboard: Keyboard,
        private navParams: NavParams,
        private loadingCtl: LoadingController,
        private compService: CompetitionService,
        private actionSheetCtl: ActionSheetController,
        private toastCtl: ToastController,
        private platform: Platform,
        private modalCtl: ModalController) {
        this.competition    = navParams.get("competition");
        this.flights        = navParams.get("flights");
        this.gameRound      = navParams.get("gameRound");
        this.compTeams      = navParams.get("compTeams");
        this.filteredFlight = this.flights;

        this.visible           = false;
        this.searchQuery       = '';
        this.filteredCompTeams = this.compTeams.competitionTeams;
        console.log("teams:", this.filteredCompTeams)
        for (let i = 1; i <= 30; i++) {
            let teamName = 'Team ' + i;
            this.teamList.push(teamName);
        }

    }

    ionViewDidEnter() {
        adjustViewZIndex(this.nav, this.renderer);
    }

    ionViewWillLeave() {
        if (this.platform.is('ios') && this.platform.is('cordova'))
            this.keyboard.close();
    }

    public onTeamDetails(team: Teams) {
        this.nav.push(CompetitionTeamDetails, {
            team       : team,
            openAsModal: false
        });
    }

    onRefreshClick(refresher) {
        this._refreshCompetitionTeams(refresher);
    }

    toggle(searchBar) {
        this.visible = searchBar;//!this.visible;
    }

    onSearchCancel() {
        this.toggle(false);
    }

    onSearchInput(searchbar) {
        if (this.searchQuery && this.searchQuery.length > 0)
            this.filteredCompTeams = this.compTeams.competitionTeams.filter((team: Teams) => {
                return team.teamName.toLowerCase().indexOf(this.searchQuery.toLowerCase()) >= 0;

            });
        else this.filteredCompTeams = this.compTeams.competitionTeams;
        if (this.platform.is('ios') && this.platform.is('cordova'))
            this.keyboard.close();

    }

    public onHomeClick() {
        this.nav.popToRoot();//this.nav.setRoot(PlayerHomePage);
    }

    private _refreshCompetitionTeams(refresher) {
        let loader = this.loadingCtl.create({
            content: 'Loading teams list, Please wait...'
        });

        loader.present().then(() => {
            this.compService.getCompetitionTeams(this.competition.competitionId)
                .subscribe((compTeams: CompetitionTeams) => {
                    loader.dismiss().then(() => {
                        this.compTeams         = compTeams;
                        this.filteredCompTeams = this.compTeams.competitionTeams;
                        this.searchQuery       = "";
                    })

                }, (error) => {
                    loader.dismiss().then(() => {
                        let msg = MessageDisplayUtil.getErrorMessage(error, "Error refreshing competition teams");
                        MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 5000, "bottom");
                    });
                }, () => {
                    if (refresher) refresher.complete();

                    if (this.platform.is('ios') && this.platform.is('cordova'))
                        this.keyboard.close();
                })

        });

    }

    convStartTime(flightTime) {
        return moment(flightTime).format("HH:mm")
    }
}




