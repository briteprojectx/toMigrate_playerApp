import {
    Events, LoadingController, ModalController, NavController, NavParams, Platform,
    ToastController
} from 'ionic-angular';
import {Component, Renderer} from '@angular/core';
import {Keyboard} from '@ionic-native/keyboard';
import * as MyGolfEvents from '../../mygolf-events';
// import {PlainScorecard, ScorecardList} from '../../data/scorecard';
import {ScorecardService} from '../../providers/scorecard-service/scorecard-service';
import {ScorecardFilterPage} from '../scorecard-filter/scorecard-filter';
import {ScorecardDisplayPage} from '../scorecard-display/scorecard-display';
import {adjustViewZIndex} from '../../globals';
import {MessageDisplayUtil} from '../../message-display-utils';
import {PlayerInfo} from '../../data/player-data';
import { SearchCriteria } from '../../data/search-criteria';
import { CompetitionService } from '../../providers/competition-service/competition-service';
import { PlayerService } from '../../providers/player-service/player-service';
import { Country } from '../../data/country-location';
import {PlainScoreCard, ScorecardList} from '../../data/mygolf.data';
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
    templateUrl: 'scorecard-list.html',
    selector   : 'scorecard-list-page'
})
export class ScorecardListPage
{
    scorecardList: ScorecardList;
    searchQuery: string = "";
    refreshAttempted: boolean = false;
    currentPlayer: PlayerInfo;
    searchCriteria: SearchCriteria;
    selectedCountry: Country;
    constructor(private nav: NavController,
        private navParams: NavParams,
        private keyboard: Keyboard,
        private loadingCtl: LoadingController,
        private modalCtl: ModalController,
        private toastCtl: ToastController,
        private scorecardService: ScorecardService,
        private events: Events,
        private platform: Platform,
        private playerService: PlayerService) {
        this.currentPlayer = navParams.get("currentPlayer");
        this._initItems();
        
        this.searchCriteria = this.scorecardService.getSearchCriteria();
        console.log("Scorecard searchCriteria : ", this.searchCriteria)

    }

    ionViewDidLoad() {
    }

    ionViewDidEnter() {
        this._clearAndRefresh(null);
        this.events.subscribe(MyGolfEvents.ScorecardDeleted, (data: PlainScoreCard) => {
            if (data ) {
                let filtered                  = this.scorecardList.scorecards
                                                    .filter(sc => sc.gameRoundId !== data.gameRoundId);
                this.scorecardList.scorecards = filtered;
            }
        });
    }

    /**
     * Executed when refresh button on toolbar is clicked
     */
    onRefreshClick(refresher) {
        this._clearAndRefresh(refresher);
    }

    onSearchInput() {
        this._clearAndRefresh(null);
    }

    onHomeClick() {
        this.nav.popToRoot();//this.nav.setRoot(PlayerHomePage);
    }

    onScorecardClick(event, item: PlainScoreCard) {
        //Need to get the full scorecard or not
        let loader = this.loadingCtl.create({
            content     : "Getting scorecard...",
            showBackdrop: false
        });
        loader.present().then(() => {
            this.scorecardService.getScorecard(item.gameRoundId)
                .subscribe((scorecard: PlainScoreCard) => {
                    loader.dismiss().then(() => {
                        if (scorecard) {
                            this.scorecardList.scorecards.forEach((sc, idx) => {
                                if (sc.gameRoundId === scorecard.gameRoundId) {
                                    this.scorecardList.scorecards[idx] = scorecard;
                                }
                            });
                            console.log("[Scorecard] Get : ", scorecard);
                            this.nav.push(ScorecardDisplayPage, {
                                scorecard: scorecard,
                                currentPlayer: this.currentPlayer,
                                editing  : true
                            });
                        }

                    });
                }, (error) => {
                    loader.dismiss().then(() => {
                        let msg = MessageDisplayUtil.getErrorMessage(error, "Error getting scorecard list");
                        MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 5000, "bottom");
                    });
                }, () => {

                });

        });

    }

    doInfinite(infinite) {

        if (this.isMore()) {
            this._refresh(null, infinite);
        }
        else {
            infinite.complete();
            // infinite.enable(false);
        }

    }

    /**
     * Called when you change the segment button
     * @param event
     */
    onListTypeChange(event) {
        this._clearAndRefresh(null);
    }

    public isMore() {
        return this.scorecardList.totalPages > 0
            && this.scorecardList.currentPage < this.scorecardList.totalPages;
    }

    /**
     * This will clear the current competition list and
     * reloads from the server
     * @private
     */
    private _clearAndRefresh(refreher) {
        this._initItems();
        this._getCountryList();
        this._refresh(refreher, null);
    }

    private _refresh(refresher, infinite) {
      this.refreshAttempted = false;

        let loader = this.loadingCtl.create({
            showBackdrop: false,
            content     : "Loading scorecards..."
        });
        loader.present().then(() => {
            this.scorecardService.searchScorecard(this.searchQuery, this.scorecardList.currentPage + 1)
                .subscribe((data: ScorecardList) => {
                    loader.dismiss().then(() => {
                      this.refreshAttempted = true;

                        if (data.totalPages > 0)
                            this.scorecardList.currentPage++;

                        this.scorecardList.totalItems  = data.totalItems;
                        this.scorecardList.totalPages  = data.totalPages;
                        this.scorecardList.totalInPage = data.totalInPage;
                        this.scorecardList.scorecards.push(...data.scorecards);
                    });
                }, (error) => {
                    loader.dismiss().then(() => {
                        let msg = MessageDisplayUtil.getErrorMessage(error, "Error listing scorecards");
                        MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 5000, "bottom");
                    });
                }, () => {
                    if (refresher) refresher.complete();
                    if (infinite) {
                        infinite.complete();
                    }
                    if (this.platform.is('ios') && this.platform.is('cordova'))
                        this.keyboard.close();

                });
        });

    }

    private _initItems() {
        this.scorecardList = {
            success    : true,
            totalPages : 0,
            currentPage: 0,
            totalItems : 0,
            totalInPage: 0,
            scorecards : []
        };
    }

    onMenuFilterClick() {
        let filter = this.modalCtl.create(ScorecardFilterPage);
        // filter.onDidDismiss((apply: boolean) => {
        filter.onDidDismiss((data: any) => {
            if (data.apply) {
                this._clearAndRefresh(null);
                this.searchCriteria = data.searchCriteria;
            }
            if(this.searchCriteria.countryId === null || this.searchCriteria.countryId === '') {
                this.selectedCountry = null
                // console.log("[searchCriteria] clearing selected country")
            }
            // console.log("Filter dismiss : ", data.searchCriteria)
        })
        // this.nav.push(ScorecardFilterPage);
        if (this.platform.is('ios') && this.platform.is('cordova'))
            this.keyboard.close();
        filter.present();
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
