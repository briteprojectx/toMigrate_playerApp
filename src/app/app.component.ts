import {Component, ViewChild} from '@angular/core';
import {App, MenuController, IonicApp, Nav, NavController, Platform, ToastController} from 'ionic-angular';
import {setChartDefaults} from '../charts/chart-globals';
import {SignIn} from '../pages/sign-in/sign-in';
import {HandicapHistoryPage} from '../pages/handicap-history/handicap-history';
import {Subscription, Observable} from 'rxjs';
import {MessageDisplayUtil} from '../message-display-utils';
import {StatusBar} from '@ionic-native/status-bar';
import {Network} from '@ionic-native/network';
import {Dialogs} from '@ionic-native/dialogs';
import {SplashScreen} from '@ionic-native/splash-screen';
import { ProfilePage } from '../pages/profile/profile';
import { PlayerHomeInfo, PlayerInfo } from '../data/player-data';
import { PlayerHomeDataService } from '../redux/player-home';
import { SessionDataService } from '../redux/session';
import { BookingHomePage } from '../pages/booking/booking-home/booking-home';
import { FaqPage } from '../pages/faq/faq';
import { NotificationsPage } from '../pages/notifications/notifications';
import { ServerInfoService } from '../providers/serverinfo-service/serverinfo-service';
import { ServerInfo } from '../data/server-info';
import { ClubFlightService } from '../providers/club-flight-service/club-flight-service';
import { ViewController } from 'ionic-angular';
@Component({
    templateUrl: 'app.html'
})
export class MyApp
{
    @ViewChild(Nav) nav: Nav;

    // make HelloIonicPage the root (or first) page
    rootPage: any = SignIn;
    pages: Array<{title: string, component: any}>;

    private disconnectSubscriber: Subscription;
    // private connectSubscriner: Subscription;
    
    public playerHomeInfo$: Observable<PlayerHomeInfo>;
    public player$: Observable<PlayerInfo>;

    showLogin: boolean;
    loggedIn: boolean = false;

    isBookingRegistrationEnabled: boolean;

    constructor(public platform: Platform,
        public menu: MenuController,
        public toastCtl: ToastController,
        public statusBar: StatusBar,
        public network: Network,
        public dialogs: Dialogs,
        public splashScreen: SplashScreen,
        public app: App,
        public _ionicApp: IonicApp,
        public playerHomeService: PlayerHomeDataService,
        private sessionDataService: SessionDataService,
        private serverInfoService: ServerInfoService,
        private flightService: ClubFlightService) {
            
        this.initializeApp();
        // enablePlayerAppBooking
        this.serverInfoService.serverInfo()
        .subscribe((data: ServerInfo)=>{
            if(data) {
                this.isBookingRegistrationEnabled = data.enablePlayerAppBooking;
            }
        })

        platform.ready().then(() => {
            this.getAppAttribute();
      
            // Do your thing...
            if(!this.platform.is('cordova')) this.setupBackButtonBehavior ();
      
          });
      
        // set our app's pages
        this.pages = [
        ];
        this.playerHomeInfo$      = this.playerHomeService.playerHomeInfo();
        this.player$              = this.playerHomeInfo$
                                        .filter(Boolean)
                                        .map((playerHome: PlayerHomeInfo) => playerHome.player);

    }

    checkName() {
        let activePortal = this.nav.getActive();
        // this._ionicApp._loadingPortal.getActive() ||
        //       this._ionicApp._modalPortal.getActive() ||
        //       this._ionicApp._toastPortal.getActive() ||
        //       this._ionicApp._overlayPortal.getActive();
        let _msg = activePortal.component.name;
        // console.log("check name : ", activePortal)
        MessageDisplayUtil.showMessageToast(_msg,
        this.platform, this.toastCtl, 3000,'bottom');
    }

    private setupBackButtonBehavior () {

        // If on web version (browser)
        if (window.location.protocol !== "file:") {
    
          // Register browser back button action(s)
          window.onpopstate = (evt) => {
    
            // Close menu if open
            if (this.menu.isOpen()) {
              this.menu.close ();
              return;
            }
    
            // Close any active modals or overlays
            let activePortal = this._ionicApp._loadingPortal.getActive() ||
              this._ionicApp._modalPortal.getActive() ||
              this._ionicApp._toastPortal.getActive() ||
              this._ionicApp._overlayPortal.getActive();
    
            if (activePortal) {
              activePortal.dismiss();
              return;
            }
    
            // Navigate back
            if (this.app.getRootNav().canGoBack()) this.app.getRootNav().pop();
    
          };
    
          // Fake browser history on each view enter
          this.app.viewDidEnter.subscribe((app) => {
            history.pushState (null, null, "");
          });
    
        }
        
      }

    initializeApp() {
        this.platform.ready().then(() => {
            setChartDefaults();
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.statusBar.show();
            this.statusBar.overlaysWebView(false);
            // this.statusBar.overlaysWebView(true);
            // StatusBar.hide();
            this.hideSplashScreen();
            this.platform.registerBackButtonAction(() => {

                let nav = this.app.getRootNav();
                let activeNav = this.app.getActiveNav();
                if (nav === activeNav && nav.getActive() && nav.getActive().isFirst())
                    this.confirmAndExit(nav);
                else
                    this.app.navPop();

            }, 101);

            this.disconnectSubscriber = this.network.onDisconnect()
                .subscribe(()=>{
                    MessageDisplayUtil.showErrorToast("You have lost your data connection.",
                        this.platform, this.toastCtl, 3000,'bottom');

                });

        });

        this.platform.ready().then(() => {
            document.addEventListener('backbutton', () => {
                // console.log("clicking on back button")
            //  if (this.navCtrl.canGoBack()) {
            //    this.platform.exitApp()
            //    return;
            //  }
            //  this.navCtrl.pop()
           }, false);
            });

            // this.sessionDataService.showLoginForm().subscribe((show: boolean) => {
            //     this.showLogin = show;
            //     if (show) {
            //         // this.sessionDataService.getCurrentUser()
            //         //     .subscribe((currUser: CurrentUser) => {
            //         //         this.username.setValue(currUser.userName);
            //         //     });
            //     }
                
            // });

            this.sessionDataService.getSessionStatus().subscribe((data: any)=>{
                // console.log("get session status ", data)
                if(data===1) this.loggedIn = true;
                else if(data === 3) this.loggedIn = false;
                else this.loggedIn = false;
            })
    }

    openPage(page) {
        // close the menu when clicking a link from the menu
        this.menu.close();
        // navigate to the new page if it is not the current page
        this.nav.push(page.component);
    }

    confirmAndExit(nav: NavController) {
        if (this.platform.is("cordova")) {
            // console.log("Native confirm dialog");
            this.dialogs.confirm("Do you want to exit myGolf2u ?", "Exit App", ["No", "Exit"])
                   .then((result: any) => {
                       if (result && result === 2) {
                           this.platform.exitApp();
                       }
                   });
        }
    }

    hideSplashScreen() {
        if (this.splashScreen && this.splashScreen.hide) {
            setTimeout(() => {
                this.splashScreen.hide();
            }, 100);
        }
    }

    onHomeClick() {
        if(this.disableFooterPage(3)) return false;
        // console.log("footer home click")
        this.nav.popToRoot();//this.nav.setRoot(PlayerHomePage);
    }

    openProfile() {
        if(this.disableFooterPage(5)) return false;
        this.nav.push(ProfilePage, {
            type  : 'playerProfile',
            player: this.player$
        });
    }

    
    onMyBookingsClick() {
        if(this.disableFooterPage(1)) return false;
        if(!this.isBookingRegistrationEnabled) {
            MessageDisplayUtil.showErrorToast("Booking & Registration feature will be coming soon.",
            this.platform, this.toastCtl, 3000,'bottom');
            return false;
        }

        // if(this.fromClub) this.nav.push(BookingCalendarPage , {clubId: _clubId})
        // else this.nav.push(BookingHomePage);
        this.nav.push(BookingHomePage);
    }
    
    onFAQClick() {
        if(this.disableFooterPage(4)) return false;
        // if(this.paymentClickedBoolean) return false;
        this.nav.push(FaqPage)
    }

    
    onNotificationsClick() { 
        if(this.disableFooterPage(2)) return false;
        this.nav.push(NotificationsPage);
    }

    showFooterPage() {

            enum pageToExclude {
                'SetupPlayingCoursesPage',
                'FlightSetupPage',
                'CompetitionPlayersPage',
                'PlayerMg2uCreditsModal', //n4-4
                'RefundBookingPlayersModal',
                'CaddyScheduleDisplayPage',
                'ClubBookingListPage',
                'BookingCalendarPage',
            };

            // enum pageIdToExclude {
            //     'n4-1', //clubBookingListPage
            //     'n4-2', //refundRedeemHistory
            // }
            let _showFooter = true;
            // let nav = this.app.getActiveNavs()[0];
            // let activeView = nav.getActive();
            // alert("id : "+activeView.id+ " name : "+activeView.name);
            
            // MessageDisplayUtil.showErrorToast("id : "+activeView.id+ " name : "+activeView.name,
            // this.platform, this.toastCtl, 2000,'bottom');
            // alert("name activeView.name);
            let viewAll = this.nav.getAllChildNavs();
            // console.log("active nav : ", viewAll)
            let activePortal = this.nav.getActive();
            let name = activePortal.component.name;
            let activeView = this.nav.getActive();
            // MessageDisplayUtil.showErrorToast("id : "+activeView.id+ " name : "+activeView.name,
            // this.platform, this.toastCtl, 500,'bottom');
            if(activeView && activeView.instance && activeView.instance.appFooterHide) _showFooter = false;
            this.nav.viewDidEnter.subscribe(item=> {
                const viewController = item as ViewController;
                const n = viewController.name;
                name = viewController.name;
                const id = viewController.id;
                // console.log('active nav: ' + n);
                // console.log('active nav 2: ' + viewController);
                // console.log(item);
                // console.dir('active nav 4: ' + item);
                // console.table('active nav 5: ' + item);
                // MessageDisplayUtil.showErrorToast("id : "+id+ " name : "+n,
                // this.platform, this.toastCtl, 500,'bottom');


                // for(let value in pageToExclude) {
                //     if(n.toLowerCase().includes(value.toLowerCase())) {
                //         _showFooter = false;
                //         continue;
                //     }
                        
                // }
            });

            // console.log('active nav 6 : ', activePortal)
            // console.log('active nav 6 : ', activeView)

            for(let value in pageToExclude) {
                if(name.toLowerCase().includes(value.toLowerCase())) {
                    _showFooter = false;
                    continue;
                }                    
            }

            // for(let value in pageIdToExclude) {
            //     // if(activeView.id.toLowerCase().includes(value.toLowerCase())) {
            //     if(activeView.id.toLowerCase() === value.toLowerCase()) {
            //         _showFooter = false;
            //         continue;
            //     }
                    
            // }
            return _showFooter
      
        
    }

    // disableFooterPage() {
    //     enum pageToDisable {
    //         'SetupPlayingCoursesPage',
    //         'FlightSetupPage',
    //         'CompetitionPlayersPage',
    //         'PlayerMg2uCreditsModal',
    //     }
    //     let _showFooter = true;
    //     let activePortal = this.nav.getActive();
    //     let name = activePortal.component.name;

    //     for(let value in pageToExclude) {
    //         if(name === value) {
    //             _showFooter = false;
    //             continue;
    //         }
                
    //     }

    //     // if(name === pageToExclude)
    //     //     _showFooter = false;
    //     return _showFooter
    // }
    disableFooterPage(type?: number) {
        let _disableFooter = false;
        let activePortal = this.nav.getActive();
        let name = activePortal.component.name;

        if(type === 1) { //mybookings
            if(name === 'BookingHomePage') _disableFooter = true;
        } else if(type === 2) { //notifications
            if(name === 'NotificationsPage') {
                _disableFooter = true;
            }
            // NotificationsPage
        } else if(type === 3) { //home
            if(name === 'PlayerHomePage') {
                _disableFooter = true;
            }
            // BookingHomePage
        } else if(type === 4) { //FAQ
            if(name === 'FaqPage') _disableFooter = true;
            // FaqPage
        } else if(type === 5) { //profile
            if(name === 'ProfilePage')
                _disableFooter = true;
        }

        return _disableFooter;
    }

    
    appAttribute: any;
    showConsoleLog: boolean = false;
    getAppAttribute() { 
        console.log("[app attribute] : ")
        this.flightService.getAppAttributes()
        .subscribe((data: any)=>{
            console.log("[app attribute] : ", data)
            if(data) {
                data.filter((d)=>{
                    return d.page === 'mainApp'
                }).map((d)=>{
                    this.appAttribute = d
                });

                if(this.appAttribute) {
                    if(this.appAttribute.showConsoleLog) 
                        this.showConsoleLog = this.appAttribute.showConsoleLog;
                }

            }
        },(error)=>{

        }, ()=>{
            // console.log = null;
            if(!this.showConsoleLog) {
                console.log = function() {};
            } 
            // else if(this.showConsoleLog && console && console.log) console.log = null;
        })
    }

}
