import {Component, Renderer} from '@angular/core';
import {Keyboard} from '@ionic-native/keyboard';
import {Loading, LoadingController, ModalController, NavController, Platform, ToastController} from 'ionic-angular';
import {AuthenticationService} from '../../../authentication-service';
import {ClubInfo, ClubList, createClubList} from '../../../data/club-course';
import {NewGameInfo} from '../../../data/game-round';
import {adjustViewZIndex, getDistanceInKM} from '../../../globals';
import {JsonService} from '../../../json-util';
import {MessageDisplayUtil} from '../../../message-display-utils';
import {ClubService} from '../../../providers/club-service/club-service';
import {GeolocationService} from '../../../providers/geolocation-service/geolocation-service';
import {PlayerHomeDataService} from '../../../redux/player-home/player-home-data-service';
import {ClubListPage} from '../club-list/club-list';
import {SetupPlayingCoursesPage} from '../select-course/setup-playing-courses';
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
    templateUrl: 'course-list.html',
    selector: 'select-club'
})
export class CourseListPage {

    recentClubs: Array<ClubInfo>;
    nearByClubs: Array<ClubInfo>;

    gameInfo: NewGameInfo;
    clubList: ClubList;
    searchQuery: string ="";
    searchMode: boolean = false;
    searchDistance: number = 100;

    constructor(private nav: NavController,
        private renderer: Renderer,
        private platform: Platform,
        private toastCtl: ToastController,
        private loadingCtl: LoadingController,
        private playerHomeService: PlayerHomeDataService,
        private auth: AuthenticationService,
        private geo: GeolocationService,
        private clubService: ClubService,
        private keyboard: Keyboard,
        private modalCtl: ModalController) {
        this.recentClubs = new Array<ClubInfo>();
        this.nearByClubs = new Array<ClubInfo>();
        this.gameInfo = {
            courses: [],
            players: [],
            availablePlayers: []
        }
        // let curPlayer = this.storage.getCurrentPlayer();
        // this.gameInfo.players.push(JsonService.clone(curPlayer));
        this.clubList = createClubList();
    }

    ionViewDidLoad() {
       this.playerHomeService.playerHomeInfo().take(1)
           .map(data=>data.player)
           .subscribe((player)=>{
               this.gameInfo.players.push(JsonService.clone(player));
               this._refreshValues();
           });

    }

    ionViewDidEnter() {
        this.playerHomeService.playerHomeInfo().take(1)
           .map(data=>data.player)
           .subscribe((player)=>{
               this.gameInfo.players[0].teeOffFrom = player.teeOffFrom
           });
        adjustViewZIndex(this.nav, this.renderer);
    }

    /**
     * Gets the distance between a current location and club in KMs
     * @param club The club information
     * @returns {number} Returns the distance in KM if GPS locations of current and club are available
     * else returns 0;
     */
    clubDistance(club: ClubInfo): string {
        let lat1 = this.geo.getLatitude();
        let lon1 = this.geo.getLongitude();
        if (lat1 != null && lon1 != null && club.latitude != null && club.longitude != null)
            return getDistanceInKM(lat1, lon1, club.latitude, club.longitude) + " KM";
        return "";
    }

    /**
     * Executed when refresh button on toolbar is clicked
     */
    onRefreshClick(refresher) {
        console.log("distance in km :",this.searchDistance)
        this._refreshValues();
    }

    clubSelected(event, item: ClubInfo) {
        // this.events.publish("clubSelected", item);
        if (!this.gameInfo.club || (this.gameInfo.club && this.gameInfo.club.clubId !== item.clubId)) {
            this.gameInfo.club = item;
            this.gameInfo.courses = [];
        }
        // this.nav.push(SelectCoursePage, {
        //     gameInfo: this.gameInfo
        // });
        this.nav.push(SetupPlayingCoursesPage, {
            gameInfo: this.gameInfo
        });
    }

    searchClubs() {
        let clubModal = this.modalCtl.create(ClubListPage, {
            openedModal: true
        });
        clubModal.onDidDismiss((data: ClubInfo) => {
            //Check whether the club info is passed
            if (data) {
                this.clubSelected(null, data);
            }
        });
        clubModal.present();
    }

    private _refreshValues(refresher?) {
        let loader = this.loadingCtl.create({
            content: "Please wait...",
            duration    : 5000,
        });
        loader.present().then(() => {
            this.clubService.getNearbyClubs(this.searchDistance)
                .subscribe((clubs: Array<ClubInfo>) => {
                    this.nearByClubs = clubs;
                    this._refreshRecentClubs(loader);
                }, (error) => {
                    let msg
                        = MessageDisplayUtil.getErrorMessage(error, "Error getting nearby clubs");
                    MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 6000, "bottom");
                    this._refreshRecentClubs(loader);

                }, () => {
                    if (refresher) {
                        refresher.complete();
                    }
                });
        });

    }

    private _filterVirtualClubs() {
        if(this.recentClubs.length > 0) {
            this.recentClubs = this.recentClubs.filter((x: ClubInfo) => {
                return !x.virtualClub
            })
            // console.log("[Club] Club List filtered : ",this.clubList)
        }
        if(this.nearByClubs.length > 0) {
            this.nearByClubs = this.nearByClubs.filter((x: ClubInfo) => {
                return !x.virtualClub
            })
            // console.log("[Club] Club List filtered : ",this.clubList)
        }
        if(this.clubList.clubs.length > 0) {
            this.clubList.clubs = this.clubList.clubs.filter((x: ClubInfo) => {
                return !x.virtualClub
            })
            // console.log("[Club] Club List filtered : ",this.clubList)
        }
    }

    private _refreshRecentClubs(loader: Loading) {
        this.clubService.getRecentClubs(5)
            .subscribe((clubs: Array<ClubInfo>) => {
                this.recentClubs = clubs;
                this._filterVirtualClubs();
                loader.dismiss();
            }, (error) => {
                loader.dismiss().then(() => {
                    let msg
                        = MessageDisplayUtil.getErrorMessage(error, "Error getting recent clubs");
                    MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 3000, "bottom");
                })
            }, () => {

            });
    }
    onSearchInput(event) {
        this._clearItems();
        this._refreshClubs(null, null);
    }

    private _clearItems() {
        this.clubList = createClubList();
        if (this.searchQuery == "") {
            this.searchMode = false;
            return false;
        } else this.searchMode = true;
    }

    private _refreshClubs(refresher, infinite) {
        // let busy = this.loadCtl.create({
        //     content: "Please wait..."
        // });
        // busy.present().then(()=>{
        this.clubService.searchClubs(this.searchQuery, true, this.clubList.currentPage + 1)
            .subscribe((clubList: ClubList) => {
                // busy.dismiss().then(()=>{
                this.clubList.currentPage = clubList.currentPage;
                this.clubList.totalPages = clubList.totalInPage;
                this.clubList.totalItems = clubList.totalItems;
                this.clubList.clubs.push(...clubList.clubs);
                this._filterVirtualClubs();
                // });

            }, (error) => {
                // busy.dismiss().then(()=>{
                let msg = MessageDisplayUtil.getErrorMessage(error, "Error getting club list");
                MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 5000, "bottom");
                // })
            }, () => {
                //Handle the refresher or infinite
                if (refresher && refresher.complete) refresher.complete();
                if (infinite) {
                    if (infinite.complete) infinite.complete();
                    if (this.isMore()) {
                        infinite.enable(true);
                    }
                    else infinite.enable(false);
                }
                if (this.platform.is('ios') || this.platform.is('cordova'))
                    this.keyboard.close();
            });
        // });

    }
    isMore(): boolean {
        return this.clubList && this.clubList.totalPages > 0
            && this.clubList.currentPage < this.clubList.totalPages;
    }
    filterClubSelected(event, data: ClubInfo) {
        this.clubSelected(null, data);

    }

}
