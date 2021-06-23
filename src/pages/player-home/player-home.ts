import { CompetitionTeamDetails } from './../competition/competition-teams/competition-team-details';
import {Component, ViewChild, NgZone, OnInit, OnDestroy} from '@angular/core';
import {Dialogs} from '@ionic-native/dialogs';
import {
    ActionSheetController,
    AlertController,
    Loading,
    LoadingController,
    ModalController,
    NavController,
    Platform,
    Refresher,
    ToastController
} from 'ionic-angular';
import {Observable} from 'rxjs';
import {Subscription} from 'rxjs/Subscription';
import {SessionInfo, SessionState} from '../../data/authentication-info';
import {CompetitionInfo} from '../../data/competition-data';
// import {PlainScorecard} from '../../data/scorecard';
import {CompetitionService} from '../../providers/competition-service/competition-service';
import {
    AbstractNotificationHandlerPage,
    NotificationHandlerInfo
} from '../../providers/pushnotification-service/notification-handler-constructs';
import {PushNotificationService} from '../../providers/pushnotification-service/pushnotification-service';
import {ScorecardService} from '../../providers/scorecard-service/scorecard-service';
import {PlayerHomeActions} from '../../redux/player-home/player-home-actions';
import {PlayerHomeData, SelectedCompetition} from '../../redux/player-home/player-home-data';
import {PlayerHomeDataService} from '../../redux/player-home/player-home-data-service';
import {CurrentScorecardDataService} from '../../redux/scorecard/current-scorecard-data-service';
import {SessionActions} from '../../redux/session/session-actions';
import {SessionDataService} from '../../redux/session/session-data-service';
import {CompetitionListPage} from '../competition/competition-list/competition-list';
import {CompetitionScoring} from '../competition/competition-scoring/competition-scoring';
import {EventLogListPage} from '../event-log/eventlog-list';
import {FeedbackPage} from '../feedback/feedback';
import {FriendListPage} from '../friend-list/friend-list';
import {GameRoundScoringPage} from '../gameround-scoring/gameround-scoring';
import {HoleAnalysisPage} from '../hole-analysis/hole-analysis';
import {CourseListPage} from '../normalgame/course-list/course-list';
import {PlayerChartsPage} from '../performance/player-charts/player-charts';
import {ProfilePage} from '../profile/profile';
import {ProfileImageEdit} from '../profile/profile-image-edit';
import {ScorecardListPage} from '../scorecard-list/scorecard-list';
import {ScorecardLocalListPage} from '../scorecard-local-list/scorecard-local-list';
import {ScoringTestPage} from '../scoring-test/scoring-test';
import {SettingsPage} from '../settings/settings';
import {SignIn} from '../sign-in/sign-in';
import {PlayerHomeInfo, PlayerInfo, FriendRequestList, FriendRequest} from './../../data/player-data';
import {Country, createCountryInfo} from './../../data/country-location';
import {CurrentScorecardActions} from '../../redux/scorecard/current-scorecard-actions';
import {AdService} from '../../providers/ad-service/ad-service';
import {Advertisement} from '../../data/advertisement';
import {AdvertisementComponent} from '../../custom/advertisement-component';
import {AdhandlerComponent} from '../../custom/adhandler-component';
import * as moment from "moment";
import { PlayerService } from '../../providers/player-service/player-service';
import { CountryListPage } from '../modal-screens/country-list/country-list';
import { HandicapIndexSubscription } from '../../data/premium-subscription';
import {MessageDisplayUtil} from '../../message-display-utils';
import { HandicapService } from '../../providers/handicap-service/handicap-service';
// import { ClubHandicap } from '../../data/handicap-history';
import { isUndefined } from 'ionic-angular/util/util';
import { HandicapHistoryPage } from '../handicap-history/handicap-history';
import {FriendService} from '../../providers/friend-service/friend-service';
import { BookingHomePage } from '../booking/booking-home/booking-home';
import { TeeFlightListsPage } from '../booking/tee-flight-lists/tee-flight-lists';
import { StarterFlightListsPage } from '../booking/starter-flight-lists/starter-flight-lists';
import { CaddyListPage } from '../modal-screens/caddy-list/caddy-list';
import { BuggyListPage } from '../modal-screens/buggy-list/buggy-list';
import { BookingChartPage } from '../booking/booking-chart/booking-chart';
import { BookingCalendarPage } from '../booking/booking-calendar/booking-calendar';
import { ClubCalendarComponent } from '../booking/club-calendar/club-calendar';
import { FaqPage } from '../faq/faq';
import { NotificationsPage } from '../notifications/notifications';
import { ClubUserManagementPage } from '../club/club-home/club-user-management/club-user-management';
import { MemberMenuModal } from '../modal-screens/member-menu/member-menu';
import { PlayerVoucherModal } from '../modal-screens/player-voucher/player-voucher';
import { ManageVoucherModal } from '../modal-screens/manage-voucher/manage-voucher';
import { ClubFlightService } from '../../providers/club-flight-service/club-flight-service';
import { ManageDiscountCardModal } from '../modal-screens/manage-discount-card/manage-discount-card';
import { JsonService } from '../../json-util';
import { ClubCredit, HandicapSystem, HandicapCalculation, ClubHandicap, TeeTimeBooking, PlainScoreCard } from '../../data/mygolf.data';
import { MyGolfStorageService } from '../../storage/mygolf-storage.service';
import { OSNotificationPayload } from '@ionic-native/onesignal';
import { ServerInfoService } from '../../providers/serverinfo-service/serverinfo-service';
import { ServerInfo } from '../../data/server-info';
import { ClubBookingListPage } from '../booking/club-booking-list/club-booking-list';
import { CaddyScheduleDisplayPage } from '../modal-screens/caddy-schedule-display/caddy-schedule-display';
import { Howl, Howler } from 'howler';
import { PlayerFacilityHomePage } from '../booking/player-facility-home/player-facility-home';
import {TranslationService} from "../../i18n/translation-service";
import { ClubRefundRedeemHistoryPage } from '../booking/club-refund-redeem-history/club-refund-redeem-history';
// import { Http } from '@angular/http';
// import { OnExecuteData,ReCaptchaV3Service, OnExecuteErrorData } from 'ng-recaptcha'

@Component({
    templateUrl: 'player-home.html',
    selector   : 'player-home-page'
})
export class PlayerHomePage {
    public playerHomeInfo$: Observable<PlayerHomeInfo>;
    public player$: Observable<PlayerInfo>;
    public playerPhoto$: Observable<string>;
    public selectedCompetition$: Observable<any>;
    public multipleComps: Observable<boolean>;
    public activeCompsToday: Observable<number>;
    public singleActiveComp: Observable<CompetitionInfo>;
    public loading: Loading;
    public refresher: Refresher;
    public normalGameOn: Observable<boolean>;
    public currentGameClub: Observable<string>;
    public competitionOn: Observable<boolean>;
    private scoringSubscription: Subscription;
    private sessionSubscription: Subscription;
    private stateChangeSubscription: Subscription;
    session: SessionInfo;
    countryId: string;
    // countryId: Observable<string>;
    countryList: Array<Country>;
    country: Country;
    countrySel: Country;
    defaultCountry: string;
    public country$: Observable<string>;
    public countryId$: Observable<string>;
    public activeComp: number;
    public hcpIdxSubs: HandicapIndexSubscription;
    public handicapHistory: HandicapCalculation;

    public clubHandicap: Array<ClubHandicap>;
    public playerClubHcp: any;

    friendCount: number;
    _activeCompsToday: number;

    playerCredits: Array<any>;
    totalClubCredits: number;

    activeComps: any;

    isBookingRegistrationEnabled: boolean;



    @ViewChild('adhandler') adHandler: AdhandlerComponent;

    handicapSystem: Array<HandicapSystem> = new Array<HandicapSystem>();

    handicapIndex: number;

    totalActiveBookings: number = 0;

    /**
     * @param overrideBooking Set to True to always override server's flag - booking enabled
     */
    overrideBooking: boolean = false; 

    teetimeBookingSubscription: Subscription;

    constructor(private platform: Platform,
        private nav: NavController,
        private loadingCtl: LoadingController,
        private alertCtl: AlertController,
        private dialogs: Dialogs,
        private modalCtl: ModalController,
        private toastCtl: ToastController,
        private actionSheetCtl: ActionSheetController,
        private currentScorecardService: CurrentScorecardDataService,
        private currentScorecardActions: CurrentScorecardActions,
        private sessionService: SessionDataService,
        private playerHomeService: PlayerHomeDataService,
        private playerHomeActions: PlayerHomeActions,
        private sessionActions: SessionActions,
        private scorecardService: ScorecardService,
        private competitionService: CompetitionService,
        private pushService: PushNotificationService,
        private adService: AdService,
        private playerService: PlayerService,
        private compService: CompetitionService,
        private handicapService: HandicapService,
        private friendService: FriendService,
        private alertCtrl: AlertController,
        private flightService: ClubFlightService,
        private storage: MyGolfStorageService,
        private serverInfoService: ServerInfoService,
        private translator: TranslationService
        // private zone: NgZone,
        // private http: Http,
        // private recaptchaV3Service: ReCaptchaV3Service
        ) {
            
        this.serverInfoService.serverInfo()
        .subscribe((data: ServerInfo)=>{
            if(data && !this.overrideBooking) {
                this.isBookingRegistrationEnabled = data.enablePlayerAppBooking;
            }
        });
        if(this.overrideBooking) this.isBookingRegistrationEnabled = this.overrideBooking;


        this.playerHomeInfo$      = this.playerHomeService.playerHomeInfo();
        this.player$              = this.playerHomeInfo$
                                        .filter(Boolean)
                                        .map((playerHome: PlayerHomeInfo) => playerHome.player);
        this.playerPhoto$         = this.playerHomeService.playerPhoto();
        this.multipleComps        = this.playerHomeInfo$
                                        .filter(Boolean)
                                        .map((homeInfo: PlayerHomeInfo) => {
                                            return homeInfo.compsActiveToday && homeInfo.compsActiveToday.length > 1;
                                        });
        this.normalGameOn         = this.currentScorecardService.normalGameScoring();
        this.currentGameClub = this.currentScorecardService.clubName();
        this.competitionOn        = this.currentScorecardService.competitionScoring();
        this.activeCompsToday     = this.playerHomeInfo$
                                        .filter(Boolean)
                                        .map((homeInfo: PlayerHomeInfo) => {
                                            this._activeCompsToday = homeInfo.compsActiveToday?homeInfo.compsActiveToday.length:0;
                                            if (homeInfo.compsActiveToday) {
                                                return homeInfo.compsActiveToday.length;
                                            } else {
                                                return 0;
                                            }
                                        });
        this.singleActiveComp = this.playerHomeInfo$
            .filter(Boolean)
            .map((homeInfo: PlayerHomeInfo)=>{
                if(homeInfo.compsActiveToday && homeInfo.compsActiveToday.length === 1)
                    return homeInfo.compsActiveToday[0];
                else return null;
            });
        this.selectedCompetition$ = this.playerHomeService.competitionSelectedForScoring();
        // this.playerHomeInfo$.filter(Boolean).subscribe((c: PlayerHomeInfo)=>{
        //     this.activeComps = c.compsActiveToday[0];
        // })
    
        console.log("[active] ", this.activeCompsToday)


        // if(this.playerHomeInfo$) {
        //     this.playerHomeInfo$
        //     .map((playerHome: PlayerHomeInfo) => playerHome.player)
        //     .distinctUntilChanged()
        //     .subscribe((p: PlayerInfo) => {
        //         console.log("obs player$: ",p)
        //     })
        // }
        



        



    // this.countryId = countryId
    }

    ionViewDidLoad() {
        console.log("view did load")

        // this.teetimeBookingSubscription = this.currentScorecardService.getTeetimeBooking()
        //                                     .subscribe((teetimeBooking: any) => {
        //                                         console.log("tee time booking : ", teetimeBooking)
        // });

        // this.msgSubscription = this.currentScorecardService.getCurrentScorecard()
        //                            .map(curr=>curr.reloadReason)
        //                            .distinctUntilChanged()
        //                            .subscribe(reason=>{
        //                                if(reason){
        //                                    let toast = this.toastCtl.create({
        //                                        message: reason + " Scorecard is reloaded.",
        //                                        showCloseButton: true,
        //                                        closeButtonText: 'OK',
        //                                        duration: 5000
        //                                    });
        //                                    toast.present().then(()=>{
        //                                        this.currentScorecardActions.clearReloadFlag();
        //                                    });
        //                                }


        //                            });

        
        this.playerHomeActions.setNeedRefresh(true);
        this.getCountry(() => {
            if(this.player$){
                this.player$.filter(Boolean)
                                .subscribe((p: PlayerInfo) => {
                                    this.getActiveComps();
                                    console.log("player$ defaultCountry : ", this.defaultCountry)
                                    if(!this.defaultCountry) {
                                        if(p.countryId) this.countryId = p.countryId
                                        else if(p.addressInfo) this.countryId = p.addressInfo.countryId
                                        if(p.countryId) this.defaultCountry = p.countryId
                                        else if(p.addressInfo) this.defaultCountry = p.addressInfo.countryId
                                        this.countrySelected(this.countryId)

                                    }
                                    else {
                                        this.countryId = this.defaultCountry;
                                        this.countrySelected(this.countryId)
                                    }
                                    setTimeout(() => {
                                         // move this up!!!
                                        this.getPlayerCredits();
                                        this.refreshMygolfHandicap();
                                        this._refreshHcpIdxSubscriptions();
                                        this.getActiveBookings();
                                        // console.log("[Country] ", this.defaultCountry, this.countryId)
                                        if(!this.defaultCountry) {
                                        MessageDisplayUtil.showErrorToast("Please update your Residing In/Nationality in Profile for better experience", 
                                        this.platform, this.toastCtl, 3000, "bottom")
                                        }
                                        // if(!p.birthdate) {
                                        //     MessageDisplayUtil.showErrorToast("Please update your Date of Birth to get amazing booking deals", 
                                        //     this.platform, this.toastCtl, 3000, "bottom")
                                        // }
                                      
                                    },500)
                                        
                                    // console.log(p.countryId)
                                    let data: Array<any> = new Array<any>();
                                    let _payload: any; //OSNotificationPayload;

                                    // this.defaultCountry = null;
                                    // p.birthdate = null;
                                    if(!this.defaultCountry) {
                                        _payload = {
                                            title: 'Update Residing In/Nationality',
                                            body: 'Please update your Residing In/Nationality in Profile for better experience',
                                            additionalData: {
                                                type: 'updateProfile'
                                            }
                                        }
                                        data.push(_payload);
                                    }
                                    if(!p.birthdate) {
                                        _payload = {
                                            title: 'Update Date of Birth',
                                            body: 'Please update your Date of Birth to get amazing booking deals',
                                            additionalData: {
                                                type: 'updateProfile'
                                            }
                                        }
                                        data.push(_payload);
                                    }


                                        // {
                                        //     title: 'Competition Started',
                                        //     body: 'Competition Round has started Competition Round has started Competition Round has started Competition Round has started',
                                        //     additionalData: {
                                        //         type: 'bookingFailure'
                                        //     }
                                        // }
                                        
                                    this.storage.getPreference('notifications')
                                    .subscribe((a)=>{
                                        console.log("get pref : ", a)
                                        if(a) _payload = a; //_payload.push(a);
                                        if(data)
                                        data.forEach((payload)=>{
                                            let _data = false;
                                            if(a && a.length > 0) {
                                                a.filter((p)=>{
                                                    if(payload.title.toLowerCase().includes(p.title.toLowerCase())) {
                                                        _data = true
                                                        return true
                                                        // return false
                                                    }
                                                    // else {
                                                    //     _data = false
                                                    //     // return true
                                                    // } 
                                                })
                                                if(!_data) {
                                                    _payload.push(payload)
                                                }
                                                
                                            }
                                            
                                        });
                                        if(data && _payload && _payload.length > 0) 
                                            this.storage.setPreference('notifications', _payload);
                                        //  _payload.push(...data);
                                    }, (error)=>{

                                    }, () =>{
                                        // this.storeToLocal(data.payload,_payload)
                                    })

                                })
                                
                this.refreshHandicapSystem();
                            }
        });
        // let compRef = this.nav.getActive()._cmp.instance;
        this.sessionSubscription = this.sessionService.getSession().distinctUntilChanged()
                                       .subscribe((session: SessionInfo) => {
                                           if (session.status !== SessionState.LoggedIn) {
                                            //    this.nav.insert(0, SignIn, {
                                            //        signOut: true
                                            //    })
                                            //    this.nav.popToRoot();
                                               this.nav.setRoot(SignIn, {
                                                   signOut: true
                                               });
                                           }
                                           
                                       });
                                       

        
        this.getFriendRequestCount();
        this.getAppAttribute();

    }

    ionViewWillUnload() {
        if (this.sessionSubscription) this.sessionSubscription.unsubscribe();
        // if(this.teetimeBookingSubscription) this.teetimeBookingSubscription.unsubscribe();
    }

    ionViewWillEnter() {
        
        console.log("view will enter");
        this.refreshHome(null);
        

        // this.playerHomeActions.setNeedRefresh(true);
    }

    ionViewDidEnter() {
        console.log("view did enter")
        // this.playerHomeActions.refreshHomeInfo();
        // this.stateChangeSubscription = this.playerHomeService.playerHomeData()
        //                                    .map((playerHomeData: PlayerHomeData) => playerHomeData.state)
        //                                    .distinctUntilChanged()
        //                                    .subscribe((state: string) => {
        //                                        console.log("Player Home State: " + state);
        //                                        this.onStateChange(state);
        //                                    });
        if(this.adHandler){
            this.adHandler.refresh();
        }

    //     if(this.player$ !== null) {
    //         this.player$.take(1).subscribe((player: PlayerInfo) => {
    //             this.countryId = player.countryId      
    //     });
    // }
        // console.log(this.player$)


        this.getPlayerCredits();


        

    }

    ionViewWillLeave() {
        if(this.adHandler){
            this.adHandler.stop();
        }
        if (this.scoringSubscription){
            this.scoringSubscription.unsubscribe();
            this.scoringSubscription = null;
        }
        if (this.stateChangeSubscription){
            this.stateChangeSubscription.unsubscribe();
            this.stateChangeSubscription = null;
        }
    }

    public getNotifications() {
        let notifications = new Array<NotificationHandlerInfo>();
        notifications.push({
            type        : AbstractNotificationHandlerPage.TYPE_COMP_ROUND_STARTED,
            whenActive  : 'showToast',
            whenInactive: 'none',
            needRefresh : true
        })
        return notifications;
    }

    private onStateChange(state: string) {
        if (state) {
            if (!this.loading) {
                this.loading = this.loadingCtl.create({
                    content: state
                });
                console.log("[onstatechange] before loading.present() line 288")
                this.loading.present().then(()=>{});
            }
            else {
                this.loading.setContent(state);
            }

        }
        else {
            if (this.loading) this.loading.dismissAll();
            if (this.refresher) {
                this.refresher.complete();
                this.refresher = null;
            }
            this.loading = null;
        }




    }

    private _onWsMessage(msg: any) {
        let type = msg['type'];
        switch (type.toLowerCase()) {
            case 'devicelockbroken':
                this.deviceUnlocked(msg);
                break;
        }
    }

    /**
     * when alert popup is displayed with option to goto
     * @param notfData
     */
    /**
     * Any refresh on page should be handled by the implementing page component;
     */
    public refreshPage(pushData: any): Observable<boolean> {
        this.refreshHome(null);
        return Observable.of(true);
    }

    refreshOnViewEntered(refresh: boolean) {
        // this.homeInfo.needRefresh = refresh;
        this.playerHomeActions.setNeedRefresh(true);
    }

    refreshHome(refresher) {
        // this.getActiveComps();
        this.playerHomeActions.setNeedRefresh(true);
        this.refresh(refresher);
        this.getFriendRequestCount();
        this.getPlayerCredits();
        this.refreshHandicapSystem();
        this.getActiveBookings();
        this.serverInfoService.serverInfo()
        .subscribe((data: ServerInfo)=>{
            if(data && !this.overrideBooking) {
                this.isBookingRegistrationEnabled = data.enablePlayerAppBooking;
            }
        });
        // this.playerHomeInfo$.filter(Boolean).subscribe((c: PlayerHomeInfo)=>{
        //     this.activeComps = c.compsActiveToday[0];
        // })
    }

    getFriendRequestCount() {
        this.friendService.searchFriendRequests()
            .subscribe((data: FriendRequestList)=> {
                console.log("friend request",data)
                let frq;
                frq = data.friendRequests.filter((fr: FriendRequest)=>{
                    return !fr.requestByPlayer 
                })
                console.log("friend req count", frq.length)
                this.friendCount = frq.length;
            }, (error)=>{
                console.log("get friend request", error)
                if(error.status === 403) {
                    this.sessionService.getSession()
                        .take(1)
                        .subscribe((session: SessionInfo)=> {
                            if(session && session.password) {
                                this.sessionActions.login(session.userName, session.password);
                            } else if (session && !session.password) {
                                this.sessionActions.logout();
                            }
                        });
                }
            })
    }

    getActiveComps() {

        this.playerService.getHomeInfo(this.countryId).filter(Boolean).subscribe((p: PlayerHomeInfo) => {
            if(p.activeCompetitions) this.activeComp = p.activeCompetitions
            else if(!p.activeCompetitions) this.activeComp = 0
        console.log("[ActiveComp] : ",p.activeCompetitions, this.activeComp)
        // return this.activeComp
        })

        
    }
    refresh(refresher) {
        this.refresher = refresher;
        this.playerHomeActions.refreshHomeInfo();
        // console.log("[Player$] : ", this.player$)
        if(this.player$ !== null) {
            this.player$.filter(Boolean).subscribe((p: PlayerInfo) => {
                this.countryId = p.countryId;
                if(p.addressInfo.countryId) this.countryId = p.addressInfo.countryId
                console.log("[Country] player : ",p)
                this.countrySelected(this.countryId);
                console.log("[Country] player countryId :", this.countryId)
                console.log("[Country] player countrySel :", this.countrySel)
                setTimeout(() => {
                    this.getActiveComps();
                },500)
            }); 
        }
    }

    openMenu() {
        let actionSheet = this.actionSheetCtl.create({
            buttons: [
                {
                    text   : 'Sign Out',
                    role   : 'destructive',
                    icon   : !this.platform.is('ios') ? 'exit' : null,
                    handler: () => {
                        actionSheet.dismiss()
                                   .then(() => {
                                       this.signout();
                                   });
                        return false;
                    }
                }, {
                    text   : 'Settings',
                    icon   : !this.platform.is('ios') ? 'cog' : null,
                    handler: () => {
                        actionSheet.dismiss()
                                   .then(() => {
                                       this.nav.push(SettingsPage);
                                   });
                        return false;
                    }
                }, {
                    text   : 'Local Scorecards',
                    icon   : 'albums',
                    handler: () => {
                        actionSheet.dismiss().then(() => {
                            this.nav.push(ScorecardLocalListPage);
                        });
                        return false;
                    }
                }, {
                    text   : 'Event Logs',
                    icon   : 'buffer',
                    handler: () => {
                        actionSheet.dismiss().then(() => {
                            this.nav.push(EventLogListPage);
                        });
                        return false;
                    }
                }
            ]
        });
        actionSheet.addButton({
            text   : 'Cancel',
            role   : 'cancel', // will always sort to be on the bottom
            icon   : !this.platform.is('ios') ? 'close' : null,
            handler: () => {
                actionSheet.dismiss();
                return false;
            }
        });
        actionSheet.present();
    }

    confirmAndExit() {
        if (this.platform.is("cordova")) {
            console.log("Native confirm dialog");
            this.dialogs.confirm("Do you want to exit myGolf2u ?", "Exit App", ["No", "Exit"])
                .then((result: any) => {
                    console.log("Confirm exit: " + JSON.stringify(result));
                    if (result && result === 2) {
                        console.log("Exiting APP");
                        this.platform.exitApp();
                    }
                });
        }
        else {
            let confirm = this.alertCtl.create({
                title  : "Exit App",
                message: "Do you want to exit myGolf2u ?",
                buttons: [{
                    text   : "No",
                    role   : "cancel",
                    handler: () => {
                        confirm.dismiss(false);
                        return false;
                    }
                }, {
                    text   : "Exit",
                    handler: () => {
                        confirm.dismiss(true);
                        return false;
                    }
                }]
            });
            confirm.onDidDismiss((exit: boolean) => {
                if (exit) this.platform.exitApp();
            });
            confirm.present();
        }
    }

    goCompList() {
        this.nav.push(CompetitionListPage, {}, {});
    }

    goTeeFlightList() {
        this.nav.push(TeeFlightListsPage, {}, {});
    }

    goStarterFlightList() {
        this.nav.push(StarterFlightListsPage)
    }

    goScoringTest() {
        this.player$.take(1)
            .subscribe(player => {
                this.nav.push(ScoringTestPage, {
                    playerId: player.playerId
                });
            });
    }

    canCreateNewGame(): Observable<boolean> {
        return Observable.forkJoin(this.normalGameOn, this.competitionOn, this.multipleComps)
                         .map((values: boolean[]) => {
                             return !values[0] && !values[1] && !values[2]
                         });
        // return !this.normalGameOn && !this.competitionGameOn && !(this.homeInfo.compsActiveToday && this.homeInfo.compsActiveToday.length > 1);
        // return true;
    }

    goFeedbackPage() {
        this.nav.push(FeedbackPage);
    }

    onFriendMenuClick() {
        this.nav.push(FriendListPage);
    }

    onNormalGameScoringClick() {
        this.player$.take(1)
            .subscribe((player: PlayerInfo) => {
                this.currentScorecardActions.setScoringPlayer(player.playerId);
                this.currentScorecardService.scorecard().take(1)
                    .subscribe((scorecard) => {
                        this.nav.push(GameRoundScoringPage, {
                            scorecard    : scorecard,
                            currentPlayer: player
                        });
                    });
            });
    }

    onCompetitionScoringClick() {
        this.playerHomeInfo$.take(1).subscribe((home: PlayerHomeInfo)=>{

            if(home && home.compsActiveToday && home.compsActiveToday.length > 0) {
                let _compId = home.compsActiveToday[0].competitionId;
                this.competitionService.getScoringRoundNumber(_compId).subscribe((data)=>{
                    console.log("competition scoring round : ",data);
                    if(!data || data === 0)
                    return;
                })

            }
        })
        this.playerHomeService.playerHomeInfo().take(1)
            .map(homeInfo => homeInfo.player)
            .filter(Boolean)
            .subscribe((player: PlayerInfo) => {
                let loader = this.loadingCtl.create({
                    content            : "Getting scorecard. Please wait...",
                    dismissOnPageChange: false
                });
                loader.present().then(() => {
                    console.log("on comp scoring click : ", this.activeComps)
                                let _compId;
                                this.playerHomeInfo$.filter(Boolean).subscribe((a: PlayerHomeInfo)=>{
                                    if(a.compsActiveToday && a.compsActiveToday.length > 0)
                                    _compId = a.compsActiveToday[0].competitionId
                                });
                                this.playerHomeActions.getCompetitionScoring(_compId, player.playerId, loader);
                                let getScorecard = setInterval(()=>{
                                    this.scorecardService.getCurrentScorecard()
                                    .subscribe((scorecard: PlainScoreCard) => {
                                        console.log("get current scorecard : ", scorecard)
                                        if(scorecard) {
                                            clearInterval(getScorecard);
                                            this.competitionService.getCompetitionInfo(_compId)
                                            .subscribe((comp: CompetitionInfo) => {
                                                // loader.dismiss().then(() => {
                                                    this.currentScorecardActions.setScoringPlayer(player.playerId);
                                                    this.nav.push(GameRoundScoringPage, {
                                                        scorecard    : scorecard,
                                                        competition  : comp,
                                                        currentPlayer: player
                                                    })
                                                // });
                                            }, (error) => {
                                                if(loader) loader.dismiss();
                                                clearInterval(getScorecard);
                                            }, ()=>{
                                                if(loader) loader.dismiss();
                                            });
                                            }
                                        
                                    });
                                },1000)

                    // this.scorecardService.getCurrentScorecard()
                    //     .subscribe((scorecard: PlainScoreCard) => {
                    //         console.log("comp scoring click : ", scorecard)
                    //         // this.competitionService.getCompetitionInfo(scorecard.competitionId)
                    //         //     .subscribe((comp: CompetitionInfo) => {
                    //         //         loader.dismiss().then(() => {
                    //         //             this.currentScorecardActions.setScoringPlayer(player.playerId);
                    //         //             this.nav.push(GameRoundScoringPage, {
                    //         //                 scorecard    : scorecard,
                    //         //                 competition  : comp,
                    //         //                 currentPlayer: player
                    //         //             })
                    //         //         });
                    //         //     }, (error) => {
                    //         //         loader.dismiss();
                    //         //     });
                    //         if(scorecard && scorecard.competition) {
                    //             this.competitionService.getCompetitionInfo(scorecard.competitionId)
                    //             .subscribe((comp: CompetitionInfo) => {
                    //                 loader.dismiss().then(() => {
                    //                     this.currentScorecardActions.setScoringPlayer(player.playerId);
                    //                     this.nav.push(GameRoundScoringPage, {
                    //                         scorecard    : scorecard,
                    //                         competition  : comp,
                    //                         currentPlayer: player
                    //                     })
                    //                 });
                    //             }, (error) => {
                    //                 loader.dismiss();
                    //             });
                    //         } else {
                    //             console.log("on comp scoring click : ", this.activeComps)
                    //             let _compId;
                    //             this.playerHomeInfo$.filter(Boolean).subscribe((a: PlayerHomeInfo)=>{
                    //                 if(a.compsActiveToday && a.compsActiveToday.length > 0)
                    //                 _compId = a.compsActiveToday[0].competitionId
                    //             });
                    //             this.playerHomeActions.getCompetitionScoring(_compId, player.playerId, loader);
                    //             let getScorecard = setInterval(()=>{
                    //                 this.scorecardService.getCurrentScorecard()
                    //                 .subscribe((scorecard: PlainScoreCard) => {
                    //                     console.log("get current scorecard : ", scorecard)
                    //                     if(scorecard) {
                    //                         clearInterval(getScorecard);
                    //                         this.competitionService.getCompetitionInfo(_compId)
                    //                         .subscribe((comp: CompetitionInfo) => {
                    //                             // loader.dismiss().then(() => {
                    //                                 this.currentScorecardActions.setScoringPlayer(player.playerId);
                    //                                 this.nav.push(GameRoundScoringPage, {
                    //                                     scorecard    : scorecard,
                    //                                     competition  : comp,
                    //                                     currentPlayer: player
                    //                                 })
                    //                             // });
                    //                         }, (error) => {
                    //                             if(loader) loader.dismiss();
                    //                         }, ()=>{
                    //                             if(loader) loader.dismiss();
                    //                         });
                    //                         }
                                        
                    //                 });
                    //             },1000)
                    //         }
                    //     }, (error) => {
                    //         loader.dismiss();
                    //     });
                });
            })
    }

    onPerformanceMenuClick() {
        this.nav.push(PlayerChartsPage);
    }

    openProfile() {
        this.nav.push(ProfilePage, {
            type  : 'playerProfile',
            player: this.player$
        });
    }

    editPhoto() {
        let modal = this.modalCtl.create(ProfileImageEdit, {
            player: this.player$
        });
        modal.onDidDismiss((data: any) => {
            console.log("[photo] dismiss editPhoto", data)
            this.refreshHome(null);
            // if(data === true) {
            // }
            // setTimeout(()=> {
            //     console.log("[photo] dismiss editPhoto")
            //     // this.refreshHome(null);
            // }, 500)
            

        })
        modal.present();

        
    }

    onNewRoundMenuClick() {
        this.nav.push(CourseListPage);
    }

    onScorecardMenuClick() {
        this.playerHomeService.playerHomeInfo().take(1)
            .map(homeInfo => homeInfo.player)
            .subscribe(player => {
                this.nav.push(ScorecardListPage, {
                    currentPlayer: player
                });
            });
    }

    onBookingMenuClick() { 
        
        if(!this.isBookingRegistrationEnabled) {
            MessageDisplayUtil.showErrorToast("Booking & Registration feature will be coming soon.",
            this.platform, this.toastCtl, 3000,'bottom');
            return false;
        }

        this.nav.push(BookingHomePage, {
            userType: 'player'
        });
    }

    onAnalysisMenuClick() {
        this.nav.push(HoleAnalysisPage);
    }

    onHandicapMenuClick() {
        let subsActive : boolean = false;
        if(this.hcpIdxSubs && this.hcpIdxSubs.active) {
            console.log("subsactive ", subsActive)
            subsActive = true;
            console.log("subsactive ", subsActive)
        }

        this.playerHomeService.playerHomeInfo().take(1)
            .map(homeInfo => homeInfo.player)
            .subscribe(player => {
                this.nav.push(HandicapHistoryPage, {
                    currentPlayer: player,
                    fromMenu: 'menu',
                    subsActive: subsActive,
                    player: player,
                });
            });
    }

    signout() {
        // this.sessionService.getSession()
        // .take(1)
        // .subscribe((session: SessionInfo) => {
        //     console.log("[Signout] Get session 0: ",session)
        // })
        
        
        this.sessionActions.logout();
        // this.sessionService.getSession()
        // .take(1)
        // .subscribe((session: SessionInfo) => {
        //     console.log("[Signout] Get session 1: ",session)
        // })
    }

    onSelectCompetitionScoring() {
        this.nav.push(CompetitionScoring, {
            homeInfo: this.playerHomeInfo$,
            fromMultiple: true,
        });
    }

    private deviceUnlocked(msg: any) {
        let players: number[] = msg['flightMembers'];
        // if(players && this.homeInfo && this.homeInfo.playerId){
        //     let count  = players.filter(v=>v===this.homeInfo.playerId).length;
        //     if(count) this.refreshHome(null);
        // }
    }

    getPreference() {
        this.updatePreference();
    }

    updatePreference(country?: Country) {
        // let session = this.sessionService.getSession().toPromise();
        // this.session = session;
        this.sessionService.getSession()
        .take(1)
        .subscribe((session: SessionInfo) => {
          this.session = session;
        })


        console.log("Get Update Pref Before : ",this.session);

        setTimeout(()=> {
            console.log("update preference :",country)
            if(country && (country.id===null || country.id === '')) {
                this.session.countryId = null;
                this.session.countryName = 'ALL';
                this.session.flagUrl = 'img/flag/default_worldwide.png';
                this.sessionActions.updatePreference(this.session);
                setTimeout(()=> {
                    console.log("Get Update Pref After NULL: ",this.session);
                },500)

            }
            else if(country){
                this.session.countryId = country.id;
                this.session.countryName = country.name;
                this.session.flagUrl = country.flagUrl;
                // this.session = {
                //     countryId: 'MYS',
                //     countryName: 'Malaysia'
                // }
                this.sessionActions.updatePreference(this.session);
                setTimeout(()=> {
                    console.log("Get Update Pref After ELSE: ",this.session);
                },500)
            }

        },10)



    }

    
    getCountry(cb) {
        this.playerService.getCountryList()
                .subscribe((data: Array<Country>) => {
                            // console.log("Country Sign Up : ",data)

                            this.countryList = data;
                            // this.countryList.push({
                            //     id: 'ALL',
                            //     name: 'ALL',
                            //     flagUrl: 'img/flag/default-worldwide.png'
                            // })
                            // console.log("Country List Sign Up : ", this.countryList)
        });

        setTimeout(()=>{
            console.log("Get country calling back");
            cb();
            
        }, 250)
    }

    // textCountry(text?: string) {
    //     this.countryId = this.countryList.filter((c: Country, idx: number) => {
    //         return c.id == text
    //     }).pop();
    // }

    countrySelected(countryId?: string) {
        // this.country.id = this.countryId;
        // console.log("[Country] Country List : ",this.countryList)
        console.log("[Country] Country Sel Param : ", countryId)
        // if(this.countrySel && this.countrySel.name !== 'ALL') {

            // (countryId !== '' || countryId !== null)
        if(this.countryList && countryId ){
            this.countrySel = this.countryList.filter((c: Country, idx: number) => {
                // console.log("[Country] countrySelected In :", countryId)
                // console.log("[Country] List : ",this.countryList)
                // console.log("[Country] this.countrySel : ",this.countrySel)
                // console.log("[Country] c : ",c)
                return c.id === countryId
            }).pop();
            
        }
            console.log("[Country] selected country : ",this.countrySel)
            if(this.countrySel) this.updatePreference(this.countrySel);
        // }
        
// setTimeout(()=>{
    let searchCriteriaComp = this.compService.getSearch();
    searchCriteriaComp.countryId = this.countryId;
    this.compService.setSearch(searchCriteriaComp);

    /* temporarily disabled as of 2020-01-20 */
    // let searchCriteriaScorecard = this.scorecardService.getSearchCriteria();
    // searchCriteriaScorecard.countryId = this.countryId;
    // this.scorecardService.setSearchCriteria(searchCriteriaScorecard);
// }, 120)
    this.getPlayerCredits();


    }

    getFlagUrl(flagUrl: string) {
        // console.log("[flagurl]")
        if (flagUrl==null || flagUrl=='') return "img/flag/default_worldwide.png";
        else {
            let flagIcon = flagUrl.split("/");
            return "img/flag/"+flagIcon[2];
        }
    }

    onChangePreferredOrigin() {
        let modal = this.modalCtl.create(CountryListPage, {
            country: this.countryList
        });
        modal.onDidDismiss((country?: any) => {
            console.log("[country] DISMISS : ",country)
            if(country === null || country === -999 || country === isUndefined) {
                this.countryId = '';
                this.countrySel.id = '';
                this.countrySel.name = 'ALL'
                this.countrySel.flagUrl = 'img/flag/default_worldwide.png';
                console.log("[Country] DISMISS : countrySel", this.countrySel)
                this.countrySelected(this.countryId)
                console.log("[country] DISMISS : country undefined")
            }
            else {
                let _country: Country = country;
                this.countryId = _country.id;
                console.log("[country] DISMISS country selected : ",_country)
                this.countrySelected(_country.id)
                
                // adjustViewZIndex(this.nav, this.renderer);
            }

            setTimeout(() => {
                this.getActiveComps();
            },500)
            console.log("[Country] Param :", country)
            // console.log("[Country] selId : ", this.countrySel.id)
            // console.log("[Country] selName : ",this.countrySel.name)
            // console.log("[Country] selFlagUrl : ",this.countrySel.flagUrl)
            console.log("[Country] this.countryId : ", this.countryId)
            // console.log(_)


        });
        modal.present();
    }

    private _refreshHcpIdxSubscriptions(busy?: Loading) {
        if (!busy) {
            busy = this.loadingCtl.create({
                content            : "Please wait...",
                showBackdrop       : false,
                dismissOnPageChange: false,
                duration           : 5000,
            });
            console.log("busy?");
        }
        busy.present().then(() => {
            this.playerService.getHcpIdxSubs()
                .subscribe((data: HandicapIndexSubscription) => {
                    // if (data.length > 0) {
                        let hIS = data[0];
                        this.hcpIdxSubs = data;
                        // setTimeout(() => {
                            
                        //     // console.log("[Hcp Idx Subs] Get Hcp Subs 2 : ", hIS)
                        //     // console.log("[Hcp Idx Subs] Get Hcp Subs 2 : ", this.hcpIdxSubs)
                        // }, 250);
                        
                    // }
                    // busy.dismiss(memberships);
                    // setTimeout(() => {
                        busy.dismiss().then(() => {
                            // console.log("[Hcp Idx Subs] Get Hcp Subs 1 : ", data)
                            // if(this.hcpIdxSubs) 
                            // console.log("[Hcp Idx Subs] Get Hcp Subs 2b : ", this.hcpIdxSubs)
                            
                        })
                    // }, 250);
                    
                }, (error) => {
                    busy.dismiss()
                    .then(() => {
                        console.log("[Error] 1 : ", error)
                        console.log("[Error] 2 : ", MessageDisplayUtil.getErrorMessage(error))
                        if(error) {
                            let msg = MessageDisplayUtil.getErrorMessage(error);
                            MessageDisplayUtil.displayErrorAlert(this.alertCtl, "Subscription",
                                msg, "OK");
                        }
                    })

                });
        });
        // });
    }
    
    refreshMygolfHandicap() {
        let _player: PlayerInfo;
        
        this.player$.take(1) 
            .subscribe(player => {
                _player = player;
            });
        this.flightService.getPlayerHandicapIndex(_player.playerId, _player.defaultHandicapSystem)
        .subscribe((data: any)=>{
            console.log("refresh handicap idx : data", data)
            if(data) this.handicapIndex = data;
        });
        this.handicapService.getHandicapHistory()
        .subscribe((data: Array<HandicapCalculation>) => {
            // console.log("[Handicap] data length: ",data.length)
            if(data.length > 0) {
            // this.hasM2u = true;
            this.handicapHistory = data[0];
            this.handicapService.getClubHandicap(data[0].player.playerId)
            .subscribe((data: Array<ClubHandicap>) => {
                this.clubHandicap = data;
                console.log("[Handicap] Club Handicap : ",this.clubHandicap)

                // this.playerClubHcp = this.memberships;
                // this.playerClubHcp.hcpDetail = [];
                // this.memberships.forEach((m: ClubMembership) => {
                //     this.clubHandicap.forEach((ch: ClubHandicap) => {
                //         if(m.club.clubId === ch.clubInfo.clubId) {
                //             m.hcpDetail = ch
                //         }
                //         else {
                //             m.hcpDetail = new ClubHandicap();
                //         }
                //     })
                //     this.playerClubHcp.hcpDetail.push(m.hcpDetail);
                // })






                // if(busy) busy.dismiss().then(()=>{
                //         this._refreshHcpIdxSubscriptions(busy);
                //     })
                
            }, (error) => {
                // if(busy) busy.dismiss().then();
            }, () => {
                // if(busy) busy.dismiss().then();
            })
        } 
        }), (error) => {
            this.handicapHistory = null; //new HandicapCalculation();
            // this.hasM2u = false;
        }
    }

    getM2uhcp(handicapSystem?: string, attribute?: string) {
        let clubHcp: ClubHandicap;
        let _playerHandicapSystem = handicapSystem;
        if(!this.clubHandicap) return;
        this.clubHandicap.forEach((c: ClubHandicap)=> {
            if(c.homeClub && c.handicapSystem.id === _playerHandicapSystem) clubHcp = c
            // return c.handicap + ' (' + c.clubInfo.clubTag + ')'
        })
        // console.log('[getm2uhcp] clubHcp', clubHcp)
        if(clubHcp && attribute === 'hcpOnly') {
            return clubHcp.handicap
        }
        else if(clubHcp && attribute === 'hcpHome') {
            return ' (' + clubHcp.clubInfo.clubTag + ')'
        }
        // else if(clubHcp && attribute === 'hcpIdx') {
        //     return clubHcp.handicapIndex
        // }
        else if(clubHcp)
            return clubHcp.handicap + ' (' + clubHcp.clubInfo.clubTag + ')'
        else return false
    }

    getNhsHcp(attribute?: string) {
        let _player: PlayerInfo;
        
        this.player$.take(1)
            .subscribe(player => {
                _player = player;
            });
        let clubHcp: ClubHandicap;
        // let _playerHandicapSystem = handicapSystem;
        if(!this.clubHandicap) return;
        if(this.clubHandicap && this.clubHandicap.length === 0) return;
        this.clubHandicap.forEach((c: ClubHandicap)=> {
            if(c.homeClub && c.handicapSystem.id.toLowerCase().includes('nhs')) clubHcp = c
            // return c.handicap + ' (' + c.clubInfo.clubTag + ')'
        })
        // console.log('[getnhshcp] clubHcp', clubHcp)
        if(clubHcp && attribute === 'hcpOnly') {
            return clubHcp.handicap
        } else if(clubHcp && attribute === 'hcpIdx') {
            let _hcpIdx;
            if(clubHcp && clubHcp.handicapIndex) return clubHcp.handicapIndex
            else if(_player && _player.handicapIndex) return _player.handicapIndex
        }
        else if(clubHcp && attribute === 'hcpHome') {
            return ' (' + clubHcp.clubInfo.clubTag + ')'
        }
        else if(clubHcp)
            return clubHcp.handicap + ' (' + clubHcp.clubInfo.clubTag + ')'
        else return false
    }


    goCaddieMaster() {
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        // _required = '';
                        if (data.title)
                                      prompt.dismiss().then(()=> {
                                        this.nav.push(TeeFlightListsPage, {
                                            clubId: data.title
                                        })
                                      })
                        else {
                            // _required = 'Please enter Group Name';
                            // _message = '<br>Please enter the Group Name';
                            let msg = MessageDisplayUtil.getErrorMessage('', "Please enter Club Id");
                            MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl,
                                5000, "bottom");
                        }
                        return false;
                    }
                }
            ]
        });
        prompt.present();
        
        // this.navCtrl.push(TeeFlightListsPage)
    }

    goCaddieMarshall() {
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        // _required = '';
                        if (data.title)
                                      prompt.dismiss().then(()=> {
                                        this.nav.push(TeeFlightListsPage, {
                                            // StarterFlightListsPage
                                            clubId: data.title
                                        })
                                      })
                        else {
                            // _required = 'Please enter Group Name';
                            // _message = '<br>Please enter the Group Name';
                            let msg = MessageDisplayUtil.getErrorMessage('', "Please enter Club Id");
                            MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl,
                                5000, "bottom");
                        }
                        return false;
                    }
                }
            ]
        });
        prompt.present();
        // this.nav.push(StarterFlightListsPage)
    }

    goCaddieList() {
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        // _required = '';
                        if (data.title)
                                      prompt.dismiss().then(()=> {
                                        this.nav.push(CaddyListPage,{
                                            clubId: data.title
                                        })
                                      })
                        else {
                            // _required = 'Please enter Group Name';
                            // _message = '<br>Please enter the Group Name';
                            let msg = MessageDisplayUtil.getErrorMessage('', "Please enter Club Id");
                            MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl,
                                5000, "bottom");
                        }
                        return false;
                    }
                }
            ]
        });
        prompt.present();
    }

    goBuggyList() {
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        // _required = '';
                        if (data.title)
                                      prompt.dismiss().then(()=> {
                                        this.nav.push(BuggyListPage, {
                                            clubId: data.title,
                                            // userRoles: this.userRoles
                                        })
                                      })
                        else {
                            // _required = 'Please enter Group Name';
                            // _message = '<br>Please enter the Group Name';
                            let msg = MessageDisplayUtil.getErrorMessage('', "Please enter Club Id");
                            MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl,
                                5000, "bottom");
                        }
                        return false;
                    }
                }
            ]
        });
        prompt.present();
    }

    onHomeClick() {
        console.log("footer home click")
        this.nav.popToRoot();//this.nav.setRoot(PlayerHomePage);
    }

    onScoringClick(type: string) {
        let _title;
        let _message;
        if(type==='multiple') {
            _title = 'Multiple competitions';
            _message = 'You have multiple active tournaments. Would you like to select one?'
        } else if (type==='single') {
        //     <p class="competition-name"><i class="fa fa-flag ph-fa" aria-hidden="true"></i>
        //     {{(selectedCompetition$|async)?.competitionName}}
        //     {{"PlayerHomePage.isInProgress"|translate}}
        // </p>
        // <p class="go-scoring">Tee-off at {{(selectedCompetition$|async)?.startTime}} from hole
        //     {{(selectedCompetition$|async)?.startingHole}}. {{"PlayerHomePage.clickHereScoring"|translate}}</p>
        let _comp;
        let _compName;
        let _teeOffTime;
        let _startHole;
        let _clubName;

        // _compName = 
        this.playerHomeInfo$
        .filter(Boolean)
        .subscribe((homeInfo: PlayerHomeInfo)=>{
            // if(homeInfo.compsActiveToday && homeInfo.compsActiveToday.length === 1)
            //     return homeInfo.compsActiveToday[0].competitionName;
            // else return '';
            if(homeInfo.compsActiveToday && homeInfo.compsActiveToday.length === 1) {
                _compName = homeInfo.compsActiveToday[0].competitionName;
                _clubName = homeInfo.compsActiveToday[0].clubName;
            }
                

        });
        // .map((homeInfo: PlayerHomeInfo)=>{
        //     if(homeInfo.compsActiveToday && homeInfo.compsActiveToday.length === 1)
        //         return homeInfo.compsActiveToday[0].competitionName;
        //     else return '';
        // });
        
        // _comp = 
        // if(!_compName)
        // this.selectedCompetition$.filter(Boolean).subscribe((a: SelectedCompetition)=>{
        // //     console.log("inside selected competition", a);
        // //     if(a) {

        //         _compName = a.competitionName
        //         _teeOffTime = a.startTime
        //         _startHole = a.startingHole
        // //     }
        // })
        // if(!_clubName)
        // this.currentGameClub.filter(Boolean).subscribe((c)=>{
        //     _clubName = c
        // })
        
        // this.selectedCompetition$.filter(Boolean)
        // .map((competition: any)=>{
        //         return competition[0]
        // });



        console.log("single comp ", _compName, _clubName, type)
        console.log("single comp ", this.selectedCompetition$)
           

           
            
            _title = 'Competition in progress';
            _message = `You are registered to play in <br><b>`+_compName + "</b><br>at <b>"+_clubName+`</b>`+`.<br>
            Would you like to view scorecard now or search other tournaments?`;
            // _message = `You are registered to play in <b>`+_clubName+`</b>, Tee-off at <b>`+_teeOffTime+`</b> starting on hole <b>`+_startHole+`</b>.<br>
            // You are a scorer, would you like to score now or search other tournaments?`;
            // _message = `Competition <b>`+ _compName +`</b> is in progress.<br>` + `<br>Playing in <b>`+_clubName+`</b><br>`+
            // `Tee-off at <b>` + _teeOffTime+ `</b> from hole <b>`+ _startHole +`</b>`+
            // `<br>You are the scorer, tap Go to start or finish`;
        } else if(type==='comp-in-progress') {
            let _compName;

            this.playerHomeInfo$
            .filter(Boolean)
            .subscribe((homeInfo: PlayerHomeInfo)=>{
                // if(homeInfo.compsActiveToday && homeInfo.compsActiveToday.length === 1)
                //     return homeInfo.compsActiveToday[0].competitionName;
                // else return '';
                if(homeInfo.compsActiveToday && homeInfo.compsActiveToday.length === 1) {
                    _compName = homeInfo.compsActiveToday[0].competitionName;
                }
                    
    
            });
            // _compName = this.playerHomeInfo$
            // .filter(Boolean)
            // .map((homeInfo: PlayerHomeInfo)=>{
            //     if(homeInfo.compsActiveToday && homeInfo.compsActiveToday.length === 1)
            //         return homeInfo.compsActiveToday[0].competitionName;
            //     else return '';
            // });

            let msg = MessageDisplayUtil.getErrorMessage('Competition in progress', _compName+ ' is in progress');
                    //         MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl,
            return false;
        } else if(type==='comp-click') {
            let _comp;
        let _compName;
        let _teeOffTime;
        let _startHole;
        let _clubName;
        
        this.playerHomeInfo$
        .filter(Boolean)
        .subscribe((homeInfo: PlayerHomeInfo)=>{
            // if(homeInfo.compsActiveToday && homeInfo.compsActiveToday.length === 1)
            //     return homeInfo.compsActiveToday[0].competitionName;
            // else return '';
            if(homeInfo.compsActiveToday && homeInfo.compsActiveToday.length === 1) {
                _compName = homeInfo.compsActiveToday[0].competitionName;
                _clubName = homeInfo.compsActiveToday[0].clubName;
            }
                

        });

        // _comp = this.selectedCompetition$.filter(Boolean).subscribe((a: SelectedCompetition)=>{
        //     console.log("inside comp click competition", a);
        //     if(a) {

        //         _compName = a.competitionName
        //         _teeOffTime = a.startTime
        //         _startHole = a.startingHole
        //     }
        // })
        // this.currentGameClub.filter(Boolean).subscribe((c)=>{
        //     _clubName = c
        // })
        console.log("single comp ", _compName)
        console.log("single comp ", this.selectedCompetition$)
           
            _title = 'Competition in progress';
            // _message = `You are registered to play in <br><b>`+_clubName+`</b>`+`.<br>
            _message = `You are registered to play in <br><b>`+_compName + "</b><br>at <b>"+_clubName+`</b>`+`.<br>
            Would you like to view scorecard now or search other tournaments?`;
            // _message = `You are registered to play in <b>`+_clubName+`</b>, Tee-off at <b>`+_teeOffTime+`</b> starting on hole <b>`+_startHole+`</b>.<br>
            // You are a scorer, would you like to score now or search other tournaments?`;
            // _message = `Competition <b>`+ _compName +`</b> is in progress.<br>` + `<br>Playing in <b>`+_clubName+`</b><br>`+
            // `Tee-off at <b>` + _teeOffTime+ `</b> from hole <b>`+ _startHole +`</b>`+
            // `<br>You are the scorer, do you want to score or search tournaments?`;
        }
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: _title,
            // subTitle: _required,
            message: _message,
            // inputs: [{
            //     name: 'title',
            //     placeholder: 'Club Id',
            //     type: 'number'
            // }, ],
            buttons: [{
                text: 'Close',
                role: 'cancel',
                handler: data => {
                    prompt.dismiss();
                    return false;
                }
            },{
                    text: 'Search', //type==='comp-click'?'Search':'Cancel'
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                            // if(type==='comp-click') this.goCompList();
                            this.goCompList();
                        });
                        return false;
                    }
                },
                {
                    text: type==='comp-click'?'Scorecard':type==='multiple'?'Select':'Go',
                    handler: () => {
                        if(type==='multiple') this.onSelectCompetitionScoring();
                        else if(type==='single') this.onCompetitionScoringClick();
                        else if(type==='comp-click') this.onCompetitionScoringClick();
                        // _required = '';
                    //     if (data.title)
                    //                   prompt.dismiss().then(()=> {
                    //                     this.nav.push(BuggyListPage, {
                    //                         clubId: data.title
                    //                     })
                    //                   })
                    //     else {
                    //         // _required = 'Please enter Group Name';
                    //         // _message = '<br>Please enter the Group Name';
                    //         let msg = MessageDisplayUtil.getErrorMessage('', "Please enter Club Id");
                    //         MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl,
                    //             5000, "bottom");
                    //     }
                    //     return false;
                    }
                }
            ]
        });
        prompt.present();
    }

    onPlayGolfClick() {
        let _multipleComps;
        this.multipleComps.filter(Boolean).subscribe((a: any)=>{
            // if(a.compsActiveToday && a.compsActiveToday.length > 1)
            //     _multipleComps = true;
            _multipleComps = a;
        })

        let _normalGameOn;
        this.normalGameOn.filter(Boolean).subscribe((a)=>{
            _normalGameOn = a
        })

        let _competitionOn;
        this.competitionOn.filter(Boolean).subscribe((a)=>{
            _competitionOn = a
        });

        let _activeCompsToday;
        this.activeCompsToday.filter(Boolean).subscribe((a)=>{
            _activeCompsToday = a
        });

        let _singleActiveComp;
        this.singleActiveComp.filter(Boolean).subscribe((a)=>{
            _singleActiveComp = a
        })
        

        // console.log("normal game on", _normalGameOn, this.normalGameOn);
        // console.log("competition on", _competitionOn, this.competitionOn);
        // console.log("active comps today", _activeCompsToday, this._activeCompsToday);
        // console.log("multiple comps", _multipleComps, this.multipleComps);

        if(!(_normalGameOn)) {
            // && !(_competitionOn) && _activeCompsToday !== 1
            // console.log("on play golf click - new game")
            this.onNewRoundMenuClick()
        }
        // else if(_competitionOn) {
        
        //     this.onScoringClick('single')
        // }
        else if(_normalGameOn) {
            // console.log("on play golf click - normal")
            this.onNormalGameScoringClick();
        }
        // else if(_multipleComps) { 
        //     this.onScoringClick('multiple');
        //     // console.log("on play golf click - multiple")
        // }
        // else if(_activeCompsToday === 1 && _normalGameOn) {
        //     // console.log("on play golf click - active and normal")
        //     return false; //this.onCompetitionScoringClick();
        // } 

        // this.onSelectCompetitionScoring();
       
        // else if(this._activeCompsToday === 1 && (this.normalGameOn)
    }

    getPlayGolfBorderClass(type?: string) {
        let _multipleComps;
        this.multipleComps.filter(Boolean).subscribe((a: any )=>{
            // PlayerHomeInfo
            // console.log("get play golf border class: ", a, type)
            _multipleComps = a
            // if(a.compsActiveToday && a.compsActiveToday.length > 1)
            //     _multipleComps = true;
        })
        // this.multipleComps.take(1).subscribe((a: any)=>{
        //     console.log("get play golf border class: ", a, type)
        //     if(a.compsActiveToday && a.compsActiveToday.length > 1)
        //         _multipleComps = true;
        // })

        let _normalGameOn;
        this.normalGameOn.filter(Boolean).subscribe((a)=>{
            _normalGameOn = a
        })

        let _competitionOn;
        this.competitionOn.filter(Boolean).subscribe((a)=>{
            _competitionOn = a
        });

        let _activeCompsToday;
        this.activeCompsToday.filter(Boolean).subscribe((a)=>{
            _activeCompsToday = a
        });

        let _singleActiveComp;
        this.singleActiveComp.filter(Boolean).subscribe((a)=>{
            _singleActiveComp = a
        })
        if(type==='style') {
            
        // console.log("border class normal: ",type, _normalGameOn)
        // console.log("border class competition : ",type, _competitionOn)
        // console.log("border class active comps: ",type, _activeCompsToday)
        // console.log("border class multi comps: ",type, _multipleComps)
        
            // if(!(_normalGameOn) && !(_competitionOn) && _activeCompsToday !== 1) return ''
            // if(_activeCompsToday=== 1 && _normalGameOn) return 'red'
            // else if(_competitionOn) return 'red'
            // else if(_normalGameOn) return 'red'
            if(_normalGameOn) return 'red'
            // else if(_multipleComps) return 'blue'
            else return ''
        } 
        // let _class;
        // if(this.normalGameOn)
        //     _class = " blink_me" ;
        return 'home-box-inner';
        // + " blink_me"
    }

    getCompBorderClass(type?: string) {
        let _multipleComps;
        this.multipleComps.filter(Boolean).subscribe((a: any)=>{
            // PlayerHomeInfo
            // if(a.compsActiveToday && a.compsActiveToday.length > 1)
            //     _multipleComps = true;
            _multipleComps = a;
        })
        let _competitionOn;
        this.competitionOn.filter(Boolean).subscribe((a)=>{
            _competitionOn = a
        });

        let _activeCompsToday;
        this.activeCompsToday.filter(Boolean).subscribe((a)=>{
            _activeCompsToday = a
        });

        let _singleActiveComp;
        this.singleActiveComp.filter(Boolean).subscribe((a)=>{
            _singleActiveComp = a
        })

        // console.log("comp border class - multipleComps : ", _multipleComps)
        // console.log("comp border class - _competitionOn : ", _competitionOn)
        // console.log("comp border class - _activeCompsToday : ", _activeCompsToday)
        // console.log("comp border class - _singleActiveComp : ", _singleActiveComp)
        if(type==='style') {
            // if(_activeCompsToday=== 1 && _normalGameOn) return 'red'
            if(_activeCompsToday === 1) return 'red'
            // _competitionOn && 
            // else if(_normalGameOn) return 'red'
            else if(_multipleComps) return 'blue'
            else return ''
        } 
        // let _class;
        // if(this.normalGameOn)
        //     _class = " blink_me" ;
        return 'home-box-inner';
        // + " blink_me"
    }

    getPlayGolfImageClass(type?: string) {
        let _multipleComps;
        this.multipleComps.filter(Boolean).subscribe((a: any)=>{
            // if(a.compsActiveToday && a.compsActiveToday.length > 1)
            //     _multipleComps = true;
            _multipleComps = a;
        })

        let _normalGameOn;
        this.normalGameOn.filter(Boolean).subscribe((a)=>{
            _normalGameOn = a
        })

        let _competitionOn;
        this.competitionOn.filter(Boolean).subscribe((a)=>{
            _competitionOn = a
        });

        let _activeCompsToday;
        this.activeCompsToday.filter(Boolean).subscribe((a)=>{
            _activeCompsToday = a
        });

        let _singleActiveComp;
        this.singleActiveComp.filter(Boolean).subscribe((a)=>{
            _singleActiveComp = a
        })
        // console.log("golf image class:", type)
        let _class = '';
        if(!(_normalGameOn) && !(_competitionOn) && _activeCompsToday !== 1)
        _class = '';
        // else if(_competitionOn) _class = " filter-red" + " blink_me"
        // else if(_multipleComps) _class = " filter-blue" + " blink_me"
        else if(_normalGameOn) _class = " filter-red" + " blink_me"
        // else if(_activeCompsToday === 1 && _normalGameOn) 
        //     _class = " filter-red" + " blink_me";
        else _class = '';
        // if(type==='style') 
        return 'home-image-play-golf' + _class;
                // else return 'home-image'
    }

    getCompImageClass(type?: string) {
        let _multipleComps;
        this.multipleComps.filter(Boolean).subscribe((a: any)=>{
            // if(a.compsActiveToday && a.compsActiveToday.length > 1)
            //     _multipleComps = true;
            _multipleComps = a;
        })
        let _competitionOn;
        this.competitionOn.filter(Boolean).subscribe((a)=>{
            _competitionOn = a
        });

        let _activeCompsToday;
        this.activeCompsToday.filter(Boolean).subscribe((a)=>{
            _activeCompsToday = a
        });

        let _singleActiveComp;
        this.singleActiveComp.filter(Boolean).subscribe((a)=>{
            _singleActiveComp = a
        })
        // console.log("golf image class:", type)
        let _class = '';
        if(_activeCompsToday === 1) _class = " filter-red" + " blink_me"
        else if(_multipleComps) _class = " filter-blue" + " blink_me"
        else _class = '';
        // if(type==='style') 
        return 'home-image-play-golf' + _class;
                // else return 'home-image'
    }

    onCompClick() {
        let _multipleComps;
        this.multipleComps.filter(Boolean).subscribe((a: any)=>{
            // if(a.compsActiveToday && a.compsActiveToday.length > 1)
            //     _multipleComps = true;
            _multipleComps = a;
        })

        let _normalGameOn;
        this.normalGameOn.filter(Boolean).subscribe((a)=>{
            _normalGameOn = a
        })

        let _competitionOn;
        this.competitionOn.filter(Boolean).subscribe((a)=>{
            _competitionOn = a
        });

        let _activeCompsToday;
        this.activeCompsToday.filter(Boolean).subscribe((a)=>{
            _activeCompsToday = a
        });

        let _singleActiveComp;
        this.singleActiveComp.filter(Boolean).subscribe((a)=>{
            _singleActiveComp = a
        })

        

        // console.log("comp click - multipleComps : ", _multipleComps)
        // console.log("comp click - _competitionOn : ", _competitionOn)
        // console.log("comp click - _activeCompsToday : ", _activeCompsToday)
        // console.log("comp click - _singleActiveComp : ", _singleActiveComp)

        if(_competitionOn || _activeCompsToday || _multipleComps) {
            
            // console.log("on play golf click - single")
            if(_multipleComps) this.onScoringClick('multiple')
            else this.onScoringClick('comp-click')
            // this.onCompetitionScoringClick();
        } else this.goCompList();
    }

    goBookingChart() {
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        // _required = '';
                        if (data.title)
                                      prompt.dismiss().then(()=> {
                                        this.nav.push(BookingChartPage, {
                                            clubId: data.title
                                        })
                                      })
                        else {
                            // _required = 'Please enter Group Name';
                            // _message = '<br>Please enter the Group Name';
                            let msg = MessageDisplayUtil.getErrorMessage('', "Please enter Club Id");
                            MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl,
                                5000, "bottom");
                        }
                        return false;
                    }
                }
            ]
        });
        prompt.present();
    }

    goClubBooking() {
        // this.nav.push(BookingCalendarPage);
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        prompt.dismiss().then(()=> {
                            this.nav.push(BookingCalendarPage, {
                                clubId: data.title,
                                fromClub: true,
                            })
                          })
                        // if (data.title)
                        //               prompt.dismiss().then(()=> {
                        //                 this.nav.push(BookingCalendarPage, {
                        //                     clubId: data.title
                        //                 })
                        //               })
                        // else {
                        //     // _required = 'Please enter Group Name';
                        //     // _message = '<br>Please enter the Group Name';
                        //     let msg = MessageDisplayUtil.getErrorMessage('', "Please enter Club Id");
                        //     MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl,
                        //         5000, "bottom");
                        // }
                        return false;
                    }
                }
            ]
        });
        prompt.present();
        // this.nav.push(ClubCalendarComponent);
    } 

    goUserManagement() {
        // this.nav.push(BookingCalendarPage);
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        prompt.dismiss().then(()=> {
                            this.nav.push(ClubUserManagementPage, {
                                clubId: data.title
                            })
                          })
                        return false;
                    }
                }
            ]
        });
        prompt.present();
        // this.nav.push(ClubCalendarComponent);

    }
    onMyBookingsClick() {
        this.nav.push(BookingHomePage)
    }

    onFAQClick() {
        this.nav.push(FaqPage)
    }

    onNotificationsClick() { 
        this.nav.push(NotificationsPage);
    }

    
    // public captchaPassed: boolean = false;
    // public captchaResponse: string;

    // captchaResolved(response: string): void {

    //     this.zone.run(() => {
    //         this.captchaPassed = true;
    //         this.captchaResponse = response;
    //     });

    // }

    // sendForm(): void {

    //     let data = {
    //         captchaResponse: this.captchaResponse
    //     };      

    //     this.http.post('http://localhost:8080/test', data).subscribe(res => {
    //         console.log(res);
    //     });

    // }

    

    // public executeImportantAction(): void {
    //     // this.recaptchaV3Service.execute('importantAction')
    //     //   .subscribe((token) => this.handleToken(token));
    //   }

    //   public recentToken: string = '';
    //   public recentError?: { error: any };
    //   public readonly executionLog: Array<OnExecuteData | OnExecuteErrorData> = [];
      
    
    //   private allExecutionsSubscription: Subscription;
    //   private allExecutionErrorsSubscription: Subscription;
    //   private singleExecutionSubscription: Subscription;

    //   public executeAction(action: string): void {
    //     if (this.singleExecutionSubscription) {
    //       this.singleExecutionSubscription.unsubscribe();
    //     }
    //     this.singleExecutionSubscription = this.recaptchaV3Service.execute(action)
    //       .subscribe(
    //         (token) => {
    //           this.recentToken = token;
    //           this.recentError = undefined;
    //         },
    //         (error) => {
    //           this.recentToken = '';
    //           this.recentError = { error };
    //         },
    //       );
    //   }
    
    //   public ngOnInit() {
    //     this.allExecutionsSubscription = this.recaptchaV3Service.onExecute
    //       .subscribe((data) => this.executionLog.push(data));
    //     this.allExecutionErrorsSubscription = this.recaptchaV3Service.onExecuteError
    //       .subscribe((data) => this.executionLog.push(data));
    //   }
    
    //   public ngOnDestroy() {
    //     if (this.allExecutionsSubscription) {
    //       this.allExecutionsSubscription.unsubscribe();
    //     }
    //     if (this.allExecutionErrorsSubscription) {
    //       this.allExecutionErrorsSubscription.unsubscribe();
    //     }
    //     if (this.singleExecutionSubscription) {
    //       this.singleExecutionSubscription.unsubscribe();
    //     }
    //   }
    
    //   public formatToken(token: string): string {
    //     if (!token) {
    //       return '(empty)';
    //     }
    
    //     return `${token.substr(0, 7)}...${token.substr(-7)}`;
    //   }
    
    getPlayerCredits() {
        let _playerId;
        this.player$.take(1)
            .subscribe(player => {
                _playerId = player.playerId;
            });
        if(!_playerId) return false;
        this.totalClubCredits = 0;
        this.playerCredits = [];
        this.flightService.getPlayerCredits(_playerId)
        .subscribe((data)=>{
            if(data) {
                console.log("player id - ", _playerId, " -  credits : ", data, this.countryId)
                if(data && data.length > 0) {
                    data.forEach((cc: ClubCredit)=>{
                        JsonService.deriveFulImageURL(cc.club,'clubImage');
                        JsonService.deriveFulImageURL(cc.club,'clubLogo');
                    })
                    this.playerCredits = data
                    .filter((a: ClubCredit)=>{
                        return a.club.address.countryData.id === this.countryId
                    });
                    if(this.playerCredits && this.playerCredits.length > 0) {
                        this.totalClubCredits = this.playerCredits
                        .map((a)=>{
                            console.log("player credits map - ", a)
                            if(a) return a.balance
                            else return;
                        }).reduce((a,b)=>{
                            return a + b
                        });

                    }
                }
            }
        })
    }

    getClubCreditsCurrency() {
        if(!this.playerCredits) return;
        let _currency = this.playerCredits.filter((a: ClubCredit)=>{
            return a.club.address.countryData.id === this.countryId
        }).map((a)=>{
            return a.currency.symbol;
        })
        return _currency[0];
    }

    getClubCredits() {
        let _totalClubCredits = this.totalClubCredits; //858234200000;
        if(_totalClubCredits >= 1000 && _totalClubCredits < 1000000)
            return (_totalClubCredits/1000).toFixed(2) + 'K'
        else if(_totalClubCredits >= 1000000 && _totalClubCredits < 1000000000)
            return (_totalClubCredits/1000000).toFixed(2) + 'M'
        else if(_totalClubCredits >= 1000000000 && _totalClubCredits < 1000000000000)
            return (_totalClubCredits/1000000000).toFixed(2) + 'B'
        else return _totalClubCredits;
    }

    resolved(captchaResponse: string) {
        console.log(`Resolved captcha with response ${captchaResponse}:`);
    }

    goMemberManagement() {
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        prompt.dismiss().then(()=> {
                            console.log("manage member", data)
                            this.nav.push(MemberMenuModal), {
                                clubId: data.title,
                                fromClub: true,
                            }
                          })
                        return false;
                    }
                }
            ]
        });
        prompt.present();
    }

    goPlayerVoucher() {
        this.nav.push(PlayerVoucherModal)
    }

    goVoucherManagement() {
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        prompt.dismiss().then(()=> {
                            this.nav.push(ManageVoucherModal, {
                                fromClub: true,
                                clubId: data.title
                            })
                          })
                        return false;
                    }
                }
            ]
        });
        prompt.present();
    }

    goPrivilegeManagement() {
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        prompt.dismiss().then(()=> {
                            this.nav.push(ManageDiscountCardModal, {
                                clubId: data.title
                            })
                          })
                        return false;
                    }
                }
            ]
        });
        prompt.present();
    }

    getPlayerHcpSysDetail(handicapSystem) {
        if(!handicapSystem) return;
        if(!this.handicapSystem) return;
        if(this.handicapSystem && this.handicapSystem.length === 0) return '';
        let _hcpSystem: HandicapSystem;
        this.handicapSystem.filter((hcpSys)=>{
            if(hcpSys.id === handicapSystem) {
                _hcpSystem = hcpSys;
                return true;
            } else return false;
        })
        return _hcpSystem.shortCode;
    }

    refreshHandicapSystem() {
        this.handicapSystem = [];
        this.flightService.getHandicapSystemList()
        .subscribe((handicap: any)=>{
            // Array<HandicapSystem>
            if(handicap && handicap.length > 0) {
                this.handicapSystem = handicap;
            }
        })
    }

    getActiveBookings() {
        let _playerId;
        let _fromDate = moment().format("YYYY-MM-DD");
        
        this.player$.take(1)
            .subscribe(player => {
                    _playerId = player.playerId
            });
            
        // this.flightService.getBookingByPlayer(_playerId,_fromDate)
        this.flightService.getBookingForPlayer(_playerId, _fromDate)
        .subscribe((bookingByPlayerList: Array<TeeTimeBooking>) => {
            let _bookingList: Array<TeeTimeBooking>;
            if(bookingByPlayerList) {
                _bookingList = bookingByPlayerList;
                // _bookingList.forEach((b: TeeTimeBooking, idx: number)=>{
                //     // b.bookingStatus = 'CancelledByClub';
                //     if(idx === 0) b.bookingStatus = 'Booked';
                //     if(idx === 1) b.bookingStatus = 'CancelledByPlayer';
                    
                //     if(idx === 0) {
                //         b.flight = {
                //             status: 'Abandoned'
                //         };
                //     }
                //     if(idx === 1) {
                //         b.flight = {
                //             status: 'PlayFinished'
                //         };
                //     }
                // });
                _bookingList = _bookingList.filter((booking: TeeTimeBooking)=>{
                    if(booking.bookingStatus !== 'CancelledByClub' && booking.bookingStatus !== 'CancelledByPlayer')
                        return true
                    // if(booking.flight && booking.flight.status) {
                    //     if(booking.flight.status === 'Abandoned' ||  booking.flight.status === 'PlayFinished')
                    //         return false
                    //     else return true
                    // } else return true
                });
                console.log("booking for player - ", _bookingList)
                this.totalActiveBookings = _bookingList.length; 
            }
        })
    }

    goClubBookingList() {
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        prompt.dismiss().then(()=> {
                            this.nav.push(ClubBookingListPage, {
                                clubId: data.title
                            })
                          })
                        return false;
                    }
                }
            ]
        });
        prompt.present();
    }

    goCaddyScheduleDisplayPage() {
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        prompt.dismiss().then(()=> {
                            this.nav.push(CaddyScheduleDisplayPage, {
                                clubId: data.title
                            })
                          })
                        return false;
                    }
                }
            ]
        });
        prompt.present();
    }

    openSoundMenu() {
        
        let sound;
        sound = new Howl({
            src: ['assets/sound.mp3']
          });
          
        sound.play();

        let actionSheet = this.actionSheetCtl.create({
            buttons: [
                {
                    text   : 'Sound 1',
                    role   : 'destructive',
                    icon   : !this.platform.is('ios') ? 'exit' : null,
                    handler: () => {
                        actionSheet.dismiss()
                                   .then(() => {
                                       this.signout
                                   });
                        return false;
                    }
                }, {
                    text   : 'Settings',
                    icon   : !this.platform.is('ios') ? 'cog' : null,
                    handler: () => {
                        actionSheet.dismiss()
                                   .then(() => {
                                       this.nav.push(SettingsPage);
                                   });
                        return false;
                    }
                }, {
                    text   : 'Local Scorecards',
                    icon   : 'albums',
                    handler: () => {
                        actionSheet.dismiss().then(() => {
                            this.nav.push(ScorecardLocalListPage);
                        });
                        return false;
                    }
                }, {
                    text   : 'Event Logs',
                    icon   : 'buffer',
                    handler: () => {
                        actionSheet.dismiss().then(() => {
                            this.nav.push(EventLogListPage);
                        });
                        return false;
                    }
                }
            ]
        });
        actionSheet.addButton({
            text   : 'Cancel',
            role   : 'cancel', // will always sort to be on the bottom
            icon   : !this.platform.is('ios') ? 'close' : null,
            handler: () => {
                actionSheet.dismiss();
                return false;
            }
        });
        actionSheet.present();
    }

    goFacilityBookings() {
        this.nav.push(PlayerFacilityHomePage), {
            fromClub: true,
        }
    }

    goRefundRedeemHistory() {
        let prompt = this.alertCtrl.create({
            // Flight Name
            title: 'Enter a club Id to proceed',
            // subTitle: _required,
            message: 'Enter a club Id to proceed',
            inputs: [{
                name: 'title',
                placeholder: 'Club Id',
                type: 'number'
            }, ],
            buttons: [{
                    text: 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            // this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Go',
                    handler: data => {
                        prompt.dismiss().then(()=> {
                            console.log("manage member", data)
                            this.nav.push(ClubRefundRedeemHistoryPage), {
                                clubId: data.title,
                                fromClub: true,
                            }
                          })
                        return false;
                    }
                }
            ]
        });
        prompt.present();
    }

    appAttribute: any;
    getAppAttribute() { 
        console.log("[app attribute] : ")
        this.flightService.getAppAttributes()
        .subscribe((data: any)=>{
            console.log("[app attribute] : ", data)
            if(data) {
                data.filter((d)=>{
                    return d.page === 'playerHome'
                }).map((d)=>{
                    this.appAttribute = d
                });
                if(this.appAttribute) {
                    // let _maintenance = this.appAttribute.maintenance;
                    if(this.appAttribute.maintenance) {
                        this.displayMaintenance(this.appAttribute);
                    }
                    // let _announcement = this.appAttribute.annoucement;
                    if(this.appAttribute.announcement) {
                        this.displayAnnouncement(this.appAttribute);
                    }
                }
            }
        })
    }

    displayAnnouncement(appAttribute) {
        if(!appAttribute) return;
        let _announcement = appAttribute.announcement;
        let _fromDate = moment(_announcement.fromDate,"YYYY-MM-DD");
        let _toDate = moment(_announcement.toDate,"YYYY-MM-DD");
        console.log("display announcement - ", appAttribute, _fromDate,_toDate)
        console.log("display announcement - ", moment().isBetween(_fromDate,_toDate,'day', '[]'))
        console.log("display announcement - ", moment().isBetween(_fromDate,_toDate))
        console.log("display announcement - ", moment().isBetween(_fromDate,_toDate, undefined, "[]"))
        if(_announcement.showAnnouncement) {
            let _msg = "Welcome to myGolf2u";
            if(_announcement.announcementMessage) {
                _msg = _announcement.announcementMessage;
            }
            let _buttons = [];
                _buttons.push({
                    text   : "Okay",
                    role   : "cancel",
                    handler: () => {
                        _alert.dismiss(false);
                        return false;
                    }
                })
                let _alert = this.alertCtl.create({
                    title  : "Announcement",
                    message: _msg,
                    buttons: _buttons
                });
                _alert.onDidDismiss((exit: boolean) => {
                    if (exit) this.platform.exitApp();
                });
                if(moment().isBetween(_fromDate,_toDate,'day', '[]'))
                    _alert.present();
        }
    }

    displayMaintenance(appAttribute) {
        if(!appAttribute) return false;
        let _maintenance = appAttribute.maintenance;
        let _fromDate = _maintenance.fromDate;
        let _daysBefore = _maintenance.daysBefore;
        let _dateBefore;
        if(_daysBefore) _dateBefore = moment(_fromDate).add(-1*_daysBefore, "days");
        let _toDate = _maintenance.toDate;
        // if(_daysBefore) _dateBefore = moment(_toDate).add(-1*_daysBefore, "days");
        let _fromTime = _maintenance.fromTime;
        let _toTime = _maintenance.toTime;

        let _fromDateTime = moment(_fromDate+_fromTime,"YYYY-MM-DDHH:mm");
        // moment(_dateBefore).format("YYYY-MM-DD")
        
        let _toDateTime = moment(_toDate+_toTime,"YYYY-MM-DDHH:mm");
        console.log("[app attribute] from date", _fromDateTime)
        console.log("[app attribute] to date", _toDateTime)
        console.log("[app attribute] ", moment().isBetween(_fromDateTime,_toDateTime,'minute'))
        console.log("[app attribute] ", moment().isBetween(_fromDateTime,_toDateTime))
        console.log("[app attribute] ", moment().isBetween('2021-05-0412:00','2021-05-0412:30'))
        console.log("[app attribute] ", moment())
        if(_maintenance.showMaintenanceMessage) {
            // let _msg = "Server is currently under maintenance. <br>Scheduled time <br><b>"+moment(_fromDateTime).format("ddd, DD MMM YYYY HH:mm") + "</b> to <b>" + moment(_toDateTime).format("ddd, DD MMM YYYY HH:mm")+"</b>";
            let _msg = "The system will be unavailable during the following period : <br><b>"+moment(_fromDateTime).format("ddd, DD MMM YYYY HH:mm") + "</b> to <br><b>" + moment(_toDateTime).format("ddd, DD MMM YYYY HH:mm")+"</b>";
            if(_maintenance.maintenanceMessage) {
                _msg = _maintenance.maintenanceMessage + "<br><b>"+moment(_fromDateTime).format("ddd, DD MMM YYYY HH:mm") + "</b> to <br><b>" + moment(_toDateTime).format("ddd, DD MMM YYYY HH:mm")+"</b>";
            }
            let _buttons = [];
            if(_maintenance.blockForMaintenance && moment().isBetween(_fromDateTime,_toDateTime,'minute')) {
                if(this.platform.is("cordova"))
                _buttons.push({
                    text   : "Close",
                    role   : "cancel",
                    handler: () => {
                        if(this.platform.is("cordova"))
                            _alert.dismiss(true);
                        return false;
                    }
                })

            } else {
                _buttons.push({
                    text   : "Okay",
                    role   : "cancel",
                    handler: () => {
                        _alert.dismiss(false);
                        return false;
                    }
                })
            }
            let _alert = this.alertCtl.create({
                title  : "Server Maintenance",
                message: _msg,
                buttons: _buttons,
                enableBackdropDismiss: _maintenance.blockForMaintenance?false:true
            });
            _alert.onDidDismiss((exit: boolean) => {
                if (exit) this.platform.exitApp();
            });
            // if(moment().isBetween(_fromDate + " " + _fromTime, _toDate + " " + _toTime ))
            console.log("Maintenance : ", moment().isBetween(_fromDateTime, _toDateTime,'minute'),  moment().isBetween(_dateBefore,_toDate));
            console.log("Maintenance : ", _fromDateTime, _toDateTime);
            console.log("Maintenance : ", _dateBefore,_fromDate, _daysBefore, _toDate);
            // if(moment().isBetween(_fromDateTime, _toDateTime,'minute') ||  moment().isBetween(_dateBefore,moment(_toDate,"YYYY-MM-DD")))
            if(moment().isBetween(_dateBefore, _toDateTime,'minute'))
                _alert.present();
                // .endOf('day')
        }
    }

    languageToggle: boolean = false;
    onChangeLanguage() {
        console.log("changing language");
        this.languageToggle = !this.languageToggle;
        if(this.languageToggle)
            this.translator.setLanguage("my");
        else if(!this.languageToggle)
            this.translator.setLanguage("en");
        
    }

}
