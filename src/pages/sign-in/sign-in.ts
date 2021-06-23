import {Component, ViewChild, Input} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AppVersion} from '@ionic-native/app-version';
import {Keyboard} from '@ionic-native/keyboard';
import {Network} from '@ionic-native/network';
import {
    AlertController,
    App,
    MenuController,
    NavController,
    NavParams,
    Platform,
    ToastController
} from 'ionic-angular/index';
import {isPresent} from 'ionic-angular/util/util';
import {Observable} from 'rxjs';
import {AuthenticationService} from '../../authentication-service';
import {CurrentUser, SessionInfo, SessionState} from '../../data/authentication-info';
import {ServerInfo} from '../../data/server-info';
import * as global from '../../globals';
import {MessageDisplayUtil} from '../../message-display-utils';
import {ConnectionService} from '../../providers/connection-service/connection-service';
import {DeviceService} from '../../providers/device-service/device-service';
import {GotoPageHandlerInterface} from '../../providers/pushnotification-service/pushnotification-handler';
import {PushNotificationService} from '../../providers/pushnotification-service/pushnotification-service';
import {ServerInfoService} from '../../providers/serverinfo-service/serverinfo-service';

import {ServerInfoActions} from '../../redux/server/serverinfo-actions';
import {SessionDataService} from '../../redux/session/session-data-service';
import {ClubHomePage} from '../club/club-home/club-home';
import {ForgotPassword} from '../forgot-password/forgot-password';
import {MygolfGotoPageHandler} from '../mygolfapp-gotopage-handler';
import {PlayerHomePage} from '../player-home/player-home';
import {SignUp} from '../sign-up/singn-up';
import {SessionActions} from '../../redux/session/session-actions';
import {StompOverWebsocketService} from '../../redux/wstomp/stomp-over-websocket-service';
import {Subscription} from 'rxjs/Subscription';
import { ScorerAppHomePage } from '../home/scorer-app-home';
/**
 * Created by Ashok on 29-03-2016.
 */
@Component({
    templateUrl: "sign-in.html",
    selector   : "sign-in-page"
})
export class SignIn {
    username: AbstractControl;
    password: AbstractControl;
    authForm: FormGroup;
    showLogin: boolean = false;
    state: string      = "initializing";
    initializationError: string;
    serverInfo: ServerInfo;
    showPassword: boolean;
    serverUnreachable: boolean;
    private gotoPageHandler: GotoPageHandlerInterface;
    private sessionStatusSubscription: Subscription;
    retryClicked: boolean = false;
    
    @ViewChild('input') myInput ;

    constructor(private nav: NavController,
        public sessionDataService: SessionDataService,
        private navParams: NavParams,
        private app: App,
        private keyboard: Keyboard,
        private network: Network,
        private connService: ConnectionService,
        private appVersion: AppVersion,
        private auth: AuthenticationService,
        private menu: MenuController,
        private alertCtl: AlertController,
        private toastCtl: ToastController,
        private fb: FormBuilder,
        private platform: Platform,
        private deviceService: DeviceService,
        private serverInfoService: ServerInfoService,
        private serverActions: ServerInfoActions,
        private sessionActions: SessionActions,
        private pushService: PushNotificationService) {
        console.log("In Sign-In page");
        this.menu.enable(false);
        this.authForm        = this.fb.group({
            username: new FormControl('', [Validators.required, Validators.minLength(3)]),
            password: new FormControl('', [Validators.required])
        });
        this.username        = this.authForm.controls["username"];
        this.password        = this.authForm.controls["password"];
        this.gotoPageHandler = new MygolfGotoPageHandler();
    }

    ionViewDidLoad() {
        this.platform.ready().then(() => {
            console.log("Checking server version");
            this.pushService.setControllers(this.app, this.nav, this.alertCtl,
                this.toastCtl, this.gotoPageHandler);

            // this.onPageInit();
            this._init();
            setTimeout(() => {
                // this.myInput.setFocus();
                // this.keyboard.show();
              },500);
        });

        this.serverUnreachable = !this.connService.isConnected()
    }

    ionViewWillUnload() {
        if(this.sessionStatusSubscription){
            this.sessionStatusSubscription.unsubscribe();
            this.sessionStatusSubscription = null;
        }
    }

    ionViewDidEnter() {
    }

    ionViewWillLeave() {
        if (this.platform.is('ios') && this.platform.is('cordova')) {
            this.keyboard.close();
        }
    }

    toggleShowPassword(event) {
        console.log("sign-in event:", event)
        this.showPassword = !this.showPassword;
        return false;
    }

    public onPageInit(retry?: boolean) {
        this.retryClicked = retry;

        setTimeout(()=>{
            this.retryClicked = false;
        },10000)
        // this.platform.ready().then(() => {
        //     console.log("Checking server version");
        //     this.pushService.setControllers(this.app, this.nav, this.alertCtl,
        //         this.toastCtl, this.gotoPageHandler);

        this.serverActions.refresh();
            // this._init();
        // });
    }

    private _init() {
        this.serverActions.refresh();
        this.sessionDataService.showLoginForm().subscribe((show: boolean) => {
            this.showLogin = show;
            console.log("_init showLogin : ", show, this.showLogin)
            if (show) {
                this.sessionDataService.getCurrentUser()
                    .subscribe((currUser: CurrentUser) => {
                        this.username.setValue(currUser.userName);
                    });
            }
            
        });
        
        this.sessionDataService.getServerInfo()
        .subscribe((serverInfo: ServerInfo) => {
            console.log("session data service - server info : ", serverInfo);
            this.serverInfo = serverInfo
        });

        this.sessionStatusSubscription = this.sessionDataService.getSessionStatus()
            .distinctUntilChanged()
            .subscribe((status: SessionState)=>{
                this.sessionDataService.getSession()
                    .take(1)
                    .subscribe((session: SessionInfo)=>{
                        if(status === SessionState.LoginFailed){
                            let toast = this.toastCtl.create({
                                message: session.exception,
                                duration: 5000,
                                showCloseButton: true,
                                closeButtonText: 'OK'
                            });
                            toast.present().then(()=>{
                                this.sessionActions.clearLoginError();
                            });
                            MessageDisplayUtil.showErrorToast(session.exception, this.platform, this.toastCtl, 5000, 'bottom');

                        }
                        else if(status === SessionState.LoggedIn) {
                            this.mainPage(session);
                        }
                        console.log("[get session] session info ", session)
                    }, (error) => {
                        console.log("[get session] error ", error)
                    });
                    console.log("[get session] status : ",status)

            });
        console.log("Calling server action refresh");

    }




    public signin() {
        if (!this.authForm.value.username || !this.authForm.value.password) {
            let subTitle = "Please enter email and password";
            MessageDisplayUtil.displayErrorAlert(this.alertCtl, "", subTitle, "OK");
            if (this.platform.is('ios') && this.platform.is('cordova')) {
                this.keyboard.close();
            }
            return false;
        }
        this.sessionActions.login(this.authForm.value.username, this.authForm.value.password, 'play');
    }


    signup() {
        this.nav.push(SignUp);
    }

    forgotPassword() {
        this.nav.push(ForgotPassword);
    }

    mainPage(session?: SessionInfo) {
        this.menu.enable(true);
        // session = this.auth.currentSession();

        console.log("Loading Main Page " + JSON.stringify(this.serverInfo));
        console.log("Loading Main Page - info " + this.serverInfo);
        console.log("Current Session: ",session);
        console.log("Loading Main Page ", this.platform.platforms())
        if (this.platform.is('ios') && this.platform.is('cordova')) {
            this.keyboard.close();
        }
        if (isPresent(session)) {
            if ("Player" === session.userType) {
                // this.pushService.playerLoggedIn(session.playerId);
                this.nav.setRoot(PlayerHomePage);
                
                // this.nav.setRoot(ScorerAppHomePage);
                // this.nav.insert(0, PlayerHomePage)
                // this.nav.popToRoot();
                // this.pushService.initPlayer(this.serverInfo.pushServerInfo, session.playerId)
                //     .subscribe((oneSignal: boolean) => {
                //         this.nav.setRoot(PlayerHomePage)
                //     },(error)=>{
                //         this.nav.setRoot(PlayerHomePage)
                //     });
            }
            else if ("Club" === session.userType) {
                this.nav.setRoot(ClubHomePage);
            }
        }
        else {
            console.error("Current session not found");
        }
    }

    exitApp() {
        console.log("Exiting app");
        this.platform.exitApp();
    }

    isCordova() {
        return this.platform.is('cordova');
    }

    onSignout() {
        this.sessionActions.logout();
    }
}
