import {NavController, AlertController, ToastController} from "ionic-angular";
import {PlayerHomePage} from "./player-home";
import {FriendService} from "../../providers/friend-service/friend-service";
import {ServerResult} from "../../data/server-result";
import * as global from "../../globals";
import {MessageDisplayUtil} from "../../message-display-utils";

/**
 * Created by ashok on 13/09/16.
 */

export class PlayerHomeNotification
{

    constructor(private nav: NavController,
        private playerHome: PlayerHomePage,
        private friendService: FriendService,
        private alertCtl: AlertController,
        private toastCtl: ToastController) {

    }

    /**
     * Handles the
     * @param data
     * @param nav
     */
    public handlePushNotification(pushData: any) {
        if (pushData && pushData.additionalData) {
            console.log("Active page is " + (typeof this.nav.getActive()));

            let viewCtl = this.nav.getActive();
            if (viewCtl instanceof PlayerHomePage)
                console.log("Player home page is active");

            let data = pushData.additionalData;
            if (data.competitionStarted) {
                this._onCompetitionStart(pushData, data.competitionStarted);
            }
            else if (data.competitionCancelled) {
                console.log("Competition cancelled " + data.competitionCancelled);
                if (this.nav.length() === 1)
                    this._onCompetitionCancel(pushData, data);
                else {
                    if (global.SharedObject.homeInfo)
                        global.SharedObject.homeInfo.needRefresh = true;
                }

            }
            else if (data.friendRequest) {
                this._onFriendRequest(pushData, data.friendRequest);
            }
            else if (data.friendRequestAcceptance) {
                this._onFriendRequestAccepted(pushData, data.friendRequestAcceptance);
            }
            else if (data.flightChanged) {
                this._onFlightChange(pushData, data.flightChanged);
            }
            else if (data.scoringFinished && this.nav.length() === 1) {
                this._displayAndRefresh(pushData);
            }
        }
    }

    private _onCompetitionStart(pushData: any, data: any) {
        if (!pushData.isActive || this.nav.length() === 1)
            this._displayAndRefresh(pushData);
        else if (global.SharedObject.homeInfo)
            global.SharedObject.homeInfo.needRefresh = true;
        // }
        // else
        //     this.playerHome.refreshHome(null);
    }

    private _onCompetitionCancel(pushData: any, data: any) {
        if (!pushData.isActive || this.nav.length() === 1)
            this._displayAndRefresh(pushData);
        else if (global.SharedObject.homeInfo)
            global.SharedObject.homeInfo.needRefresh = true;
    }

    private _onFriendRequest(data: any, friendRequest: any) {
        let alert = this.alertCtl.create({
            title  : data.title,
            message: data.message + ". Do you want to accept the request?",
            buttons: [{
                text   : "Accept",
                handler: () => {
                    alert.dismiss(true);
                    return false;
                }
            }, {
                text   : "Reject",
                handler: () => {
                    alert.dismiss(false);
                    return false;
                }
            }, {
                text   : "Close",
                role   : "destructive",
                handler: () => {
                    alert.dismiss("cancel");
                    return false;
                }
            }]
        });
        alert.onDidDismiss((accept: boolean) => {
            if (accept) {
                this.friendService.acceptFriendRequest(friendRequest.fromPlayerId)
                    .subscribe((result: ServerResult) => {
                        if (result.success)
                            this.playerHome.refreshHome(null);
                    }, (error) => {
                        let msg =
                                MessageDisplayUtil.getErrorMessage(error,
                                    "Error occured while accepting friend request");
                        if (msg) {
                            let toast = this.toastCtl.create({
                                message            : msg,
                                duration           : 5000,
                                showCloseButton    : true,
                                closeButtonText    : "X",
                                dismissOnPageChange: false
                            });
                            toast.present();
                        }
                    }, () => {
                        // this.nav.push(FriendListPage);
                        console.log("Accepting friend");

                    });
            } else if (!accept) {
                // this.nav.push(FriendListPage);
                console.log("Rejecting friend");
            }
        });
        alert.present();
    }

    private _onFriendRequestAccepted(data: any, acceptance: any) {
        if (!data.isActive || this.nav.length() === 1) {
            this._displayAndRefresh(data);
        }
        else if (global.SharedObject.homeInfo)
            global.SharedObject.homeInfo.needRefresh = true;

    }

    private _onFlightChange(data: any, flightNo: string) {
        if (data.isActive && this.nav.length() === 1) {
            let toast = this.toastCtl.create({
                message            : data.message,
                duration           : 5000,
                showCloseButton    : true,
                closeButtonText    : "X",
                dismissOnPageChange: false
            });
            toast.present();
        }
    }

    private _displayAndRefresh(data: any) {
        let toast = this.toastCtl.create({
            message            : data.message,
            duration           : 5000,
            showCloseButton    : true,
            closeButtonText    : "X",
            dismissOnPageChange: false
        });
        toast.onDidDismiss(() => {
            this.playerHome.refreshHome(null);
        });
        toast.present();
    }
}
