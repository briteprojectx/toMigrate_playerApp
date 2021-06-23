import {
    LoadingController,
    ModalController,
    NavController,
    NavParams,
    Platform
} from 'ionic-angular';
import {
    Keyboard
} from '@ionic-native/keyboard';
import {
    Component,
    Renderer2
} from '@angular/core';
import {
    TranslationService
} from '../../../i18n/translation-service';
import {
    CompetitionInfo,
    CompetitionList,
    emptyCompetitionList
} from '../../../data/competition-data';
import {
    Country, createCountryInfo
} from '../../../data/country-location';
import {
    SearchCriteria
} from '../../../data/search-criteria';
import {
    CompetitionService
} from '../../../providers/competition-service/competition-service';
import {
    AuthenticationService
} from '../../../authentication-service';
import {
    CompetitionDetailsPage
} from '../competition-details/competition-details';
import {
    CompetitionFilterPage
} from '../competition-filter/competition-filter';
import {
    adjustViewZIndex
} from '../../../globals';
import * as moment from 'moment';
import {
    PlayerService
} from '../../../providers/player-service/player-service';
/**
 * The competition list page class. This class lists the competitions. There are
 * three types of listing
 * <ul>
 *    <li>Upcoming</li>
 *    <li>All Competitions</li>
 *    <li>Search competitions</li>
 *  </ul>
 *  This class extends Subscriber which is passed as parameter for Remote Http method so that
 *  results are processed
 */
@Component({
    templateUrl: 'competition-list.html',
    selector: 'competition-list-page'
})
export class CompetitionListPage {
    public searchQuery: string = '';
    public statistics: string = "";
    public refreshAttempted: boolean = false;
    public compList: CompetitionList;
    public competition: CompetitionInfo;
    public selectedItem: NavParams;
    public tabs: string = "all";
    public isAndroid: boolean = false;
    public countDays: number;
    public countDaysText: string;
    public countDaysRound: number;
    public searchCriteria: SearchCriteria;
    public needsRefresh: boolean = true;
    public selectedCountry: Country;
    // private refresher: any;
    // private infinite: any;
    constructor(private nav: NavController,
        private loading: LoadingController,
        private keyboard: Keyboard,
        private modal: ModalController,
        private platform: Platform,
        private renderer: Renderer2,
        private auth: AuthenticationService,
        private translateService: TranslationService,
        private competitionService: CompetitionService,
        private playerService: PlayerService) {

        this.searchQuery = '';
        this.compList = emptyCompetitionList();
        this.tabs = 'all';
        this.searchCriteria = this.competitionService.getSearch();

        this.searchCriteria.searchType = this.tabs;
        //  = {
        //     searchType: this.tabs
        // };
        this.competitionService.setSearch(this.searchCriteria);

    }

    ionViewDidLoad() {
        if (this.needsRefresh) {
            this.needsRefresh = false;
            this._clearAndRefresh(null, null);
        }
    }

    ionViewDidEnter() {

        adjustViewZIndex(this.nav, this.renderer);

    }

    ionViewWillLeave() {
        if (this.platform.is('ios') && this.platform.is('cordova'))
            this.keyboard.close();

    }

    public startDaysText(competition) {
        let b = moment();
        let a = moment();
        this.countDaysText = '';
        let dateNow = moment();
        a = moment(competition.startDate);

        // console.log("a:"+a);

        this.countDays = a.diff(b, 'days', true) + 1;
        this.countDays = Math.round(this.countDays * 100) / 100
        this.countDaysRound = a.diff(b, 'days') + 1; // =1
        //console.log(this.countDays);

        if (this.countDays >= 0.00 && this.countDays <= 0.99) {
            this.countDaysText = 'Today';
        }
        if (this.countDays < 0) {
            this.countDaysText = 'Not started yet';
        }
        if (this.countDays >= 1.00 && this.countDays <= 1.99) {
            this.countDaysText = 'Tomorrow ';
        }
        if (this.countDays >= 2) {
            this.countDaysText = 'In ' + this.countDaysRound + ' days';
        }
        let startDate = moment(competition.startDate)
        let endDate = moment(competition.endDate)
        if (moment(dateNow).isBetween(startDate, endDate)) {
            this.countDaysText = '';
        }
        // this.countDaysText = moment(a).fromNow();

        return this.countDaysText
    }

    public setSearchType(searchType: string) {
        console.log("[searchCriteria] this : ", this.searchCriteria)
        this.searchCriteria = this.competitionService.getSearch();
        console.log("[searchCriteria] getSearch : ", this.competitionService.getSearch())
        // this.searchCriteria = {
        //     searchType: searchType
        // };

        this.searchCriteria.searchType = searchType;
        console.log("[searchCriteria] setting searchType : ", this.searchCriteria)
        if(searchType=='private')
          this.competitionService.setPrivate(true);
          else
          this.competitionService.setPrivate(false);

        this.competitionService.setSearch(this.searchCriteria);
        // if its private, we need to pass different parameter to options, so it will ignore/hide upcoming/all radio filters

        this.onRefreshClick();
    }

    public regDaysText(competition) {
        let b = moment();
        let a = moment();
        this.countDaysText = '';
        let dateNow = moment();

        if (competition.status == "Upcoming" && !competition.closedForRegistration) {
            a = moment(competition.openDate);
        } else {
            a = moment(competition.startDate);
        }
        // console.log("a:"+a);

        this.countDays = a.diff(b, 'days', true) + 1;
        this.countDays = Math.round(this.countDays * 100) / 100
        this.countDaysRound = a.diff(b, 'days') + 1; // =1
        //console.log(this.countDays);
        if (competition.status == "Upcoming" && !competition.closedForRegistration) {
            if (this.countDays >= 0.00 && this.countDays <= 0.99) {
                this.countDaysText = 'Opens today';
            }
            if (this.countDays < 0) {
                this.countDaysText = ''; //Not opened yet
            }
            if (this.countDays >= 1.00 && this.countDays <= 1.99) {
                this.countDaysText = 'Opens tomorrow ';
            }
            if (this.countDays >= 2) {
                this.countDaysText = 'Opens in ' + this.countDaysRound + ' days';
            }
            let openDate = moment(competition.openDate)
            let closeDate = moment(competition.closeDate)
            if (moment(dateNow).isBetween(openDate, closeDate)) {
                this.countDaysText = "Register now"
            }
        }
        // this.countDaysText = moment(a).fromNow();

        return this.countDaysText
    }

    getStatusIcon(competition: CompetitionInfo) {
        let result = "";
        if (competition.status)
            switch (competition.status.toLowerCase()) {
                case "upcoming":
                    result = "mdi mdi-calendar-clock";
                    break;
                case "in progress":
                    result = "mdi mdi-calendar-today";
                    break;
                case "cancelled":
                    result = "mdi mdi-calendar-remove";
                    break;
                case "completed":
                    result = "mdi mdi-calendar-check";
                    break;
                case "not started":
                    result = "mdi mdi-calendar-clock";
                    break;
            }
        return result;
    }

    getStatusClass(competition: CompetitionInfo) {
        let result = "";
        if (competition.status)
            switch (competition.status.toLowerCase()) {
                case "upcoming":
                    result = "status-upcoming";
                    break;
                case "in progress":
                    result = "status-inprogress";
                    break;
                case "cancelled":
                    result = "status-cancelled";
                    break;
                case "completed":
                    result = "status-completed";
                    break;
            }
        return result;
    }

    /**
     * This method gets called when filter icon is clicked
     */
    onMenuFilterClick() {
        let filter = this.modal.create(CompetitionFilterPage);
        filter.onDidDismiss((applyFilter: boolean) => {
            this.searchCriteria = this.competitionService.getSearch();
            this.tabs = this.searchCriteria.searchType;
            this.competitionService.setSearch(this.searchCriteria);
            if (applyFilter)
                this._clearAndRefresh(null, null);
            console.log("[searchCriteria] competition : ", this.searchCriteria)
            if(this.searchCriteria.countryId === null || this.searchCriteria.countryId === '') {
                this.selectedCountry = null
                console.log("[searchCriteria] clearing selected country")
            }

        });
        if (this.platform.is('ios') && this.platform.is('cordova'))
            this.keyboard.close();

        // filter.present(filter);
        filter.present();

        // this.nav.push(CompetitionFilterPage);
    }

    /**
     * Executed when refresh button on toolbar is clicked
     */
    onRefreshClick() {
        this._clearAndRefresh(null, null);
    }

    onCompetitionClick(item: CompetitionInfo) {

        this.nav.push(CompetitionDetailsPage, {
            competition: item
        }, {
            animate: false
        });
    }

    onHomeClick() {
        // this.nav.popToRoot();//this.nav.setRoot(PlayerHomePage);
        this.nav.popToRoot();
    }

    onSearchInput(searchbar) {
        this._clearAndRefresh(null, null);
    }

    /**
     * When loadMore button is clicked
     */
    onLoadMoreClick() {
        this._refresh(null, null);
    }

    doRefresh(refresher) {
        this._clearAndRefresh(null, refresher);
    }

    doInfinite(infinite) {
        // this.infinite = infinite;
        if (this.isMore()) {
            this._refresh(infinite, null);
        } else {
            infinite.complete();

        }

    }

    public isMore() {
        return this.compList.totalPages > 0 &&
            this.compList.currentPage < this.compList.totalPages;
    }

    /**
     * This will clear the current competition list and
     * reloads from the server
     * @private
     */
    private _clearAndRefresh(infinite, refresher) {
        this._initItems();
        this._getCountryList();
        this._refresh(infinite, refresher);
    }

    private _refresh(infinite, refresher) {
        // alert("Refreshing competitions");
        let loader = this.loading.create({
            showBackdrop: false,
            content: `
                    <b>Loading competitions...</b>
                `,
        });
        this.refreshAttempted = false;

        loader.present().then(() => {
            this.competitionService.search(this.compList.currentPage + 1, this.searchQuery)
                .subscribe((compList: CompetitionList) => {
                        loader.dismiss().then(() => {
                            this.refreshAttempted = true;
                            if (compList.totalPages > 0)
                                compList.currentPage++;
                            this.compList.currentPage = compList.currentPage;
                            this.compList.totalPages = compList.totalPages;
                            this.compList.totalItems = compList.totalItems;
                            this.compList.competitions.push(...compList.competitions);
                            if (this.compList.totalPages > 0)
                                this.statistics = this.translateService.translate("CompetitionListPage.displaying") + " " +
                                this.compList.competitions.length + " / " +
                                this.compList.totalItems + " " +
                                this.translateService.translate("CompetitionListPage.competitions");
                            else this.statistics = "";
                            this.compList.competitions = this.compList.competitions.sort((a,b)=>{
                                if(a.status === 'In Progress' && b.status === 'In Progress') {
                                    if(a.startDate < b.startDate) return 1
                                    else if(a.startDate > b.startDate) return -1
                                    else return 0
                                } else if(a.status === 'Upcoming' && b.status === 'Upcoming') {
                                    if(a.startDate < b.startDate) return -1
                                    else if(a.startDate > b.startDate) return 1
                                    else return 0
                                } else return 0
                            })
                        });
                    },
                    (error) => {
                        loader.dismiss();
                    }, () => {
                        if (refresher) {
                            refresher.complete();
                        }
                        if (infinite) {
                            infinite.complete();
                        }
                    });
        });

    }

    private _initItems() {
        this.compList = emptyCompetitionList();
    }

    private _getCountryList() {
        this.playerService.getCountryList()
            .subscribe((data: Array < Country > ) => {
                let countryList = data;
                if (this.searchCriteria.countryId) {
                    this.selectedCountry = countryList.filter((c: Country, idx: number) => {
                        return c.id == this.searchCriteria.countryId
                    }).pop();
                }
            });

    }

}