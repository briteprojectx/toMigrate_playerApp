import {
    LoadingController,
    ModalController,
    NavController,
    NavParams,
    Platform,
    ToastController,
    ViewController
} from 'ionic-angular';
import {PlayerInfo, PlayerList} from '../../../data/player-data';
import {FriendService} from '../../../providers/friend-service/friend-service';
import {NewContactPage} from '../../new-contact/new-contact';
import {NewGameInfo} from '../../../data/game-round';
import {Keyboard} from '@ionic-native/keyboard';
import {Component} from '@angular/core';
import {MessageDisplayUtil} from '../../../message-display-utils';
import {PlayerService} from '../../../providers/player-service/player-service';
@Component({
    templateUrl: 'friend-list.html'
})
export class NormalGameFriendListPage {
    listMode: string                    = 'friends';
    openedModal: boolean                = false;
    playersToExclude: Array<PlayerInfo> = [];
    gameInfo: NewGameInfo;
    listFriends: PlayerList;

    friends: Array<PlayerInfo> = [];
    players: Array<PlayerInfo> = [];
    searchQuery: string        = "";
    searchPlayers: string      = "";

    constructor(private nav: NavController,
        private navParams: NavParams,
        private modalCtl: ModalController,
        private loadCtl: LoadingController,
        private platform: Platform,
        private keyboard: Keyboard,
        private toastCtl: ToastController,
        private friendService: FriendService,
        private playerService: PlayerService,
        private viewCtl: ViewController) {
        this.openedModal = navParams.get("openedModal");
        let exclusion    = navParams.get("playersToExclude");
        this.gameInfo    = navParams.get("gameInfo");
        if (exclusion) {
            this.playersToExclude.push(...exclusion);
        }

        this.listFriends = {
            totalPages : 0,
            currentPage: 0,
            totalItems : 0,
            totalInPage: 0,
            success    : true,
            players    : new Array<PlayerInfo>()
        };
        if (this.gameInfo.availablePlayers && this.gameInfo.availablePlayers.length) {
            this.listFriends.players = this.gameInfo.availablePlayers.filter((p: PlayerInfo) => {
                let found = this.playersToExclude.filter(pl => {
                    return pl.playerId === p.playerId;
                });
                return found.length === 0;
            });
        }

    }

    ionViewDidLoad() {

        if (!this.listFriends.players.length)
            this._refreshValues();
        else {
            this._filterOnSearch();
        }

    }

    ionViewWillLeave() {
        console.log("Leaving the view");
        if (this.platform.is('ios') || this.platform.is('cordova'))
            this.keyboard.close();
    }

    onSearchInput() {
        this._filterOnSearch();
    }

    onSearchPlayers() {
        if (!this.searchPlayers)
            this.players = [];
        else
            this.playerService.searchPlayers(this.searchPlayers, true, 1)
                .subscribe((playerList: PlayerList) => {
                    if (playerList && playerList.players) {
                        this.players = playerList.players.filter(p => {
                            let excluded = this.playersToExclude.find((pe => {
                                return pe.playerId === p.playerId;
                            }));
                            return !excluded;
                        });
                    }
                });
    }

    friendSelected(item: PlayerInfo) {
        this.viewCtl.dismiss(item);
    }

    getImage(item: PlayerInfo) {
        if (item.thumbnail)
            return item.thumbnail;
        else if (item.photoUrl)
            return item.photoUrl;
        else
            return "img/default_user.png";
    }

    private _refreshValues() {
        let busy = this.loadCtl.create({
            content: "Please wait...",
            duration    : 5000,
        });
        busy.present().then(() => {
            this.friendService.searchFriends("", true)
                .subscribe((friendRequests: PlayerList) => {
                    busy.dismiss().then(() => {
                        this.listFriends.players       = friendRequests.players.filter(p => {
                            let found = this.playersToExclude.filter(pl => {
                                return pl.playerId === p.playerId;
                            });
                            return found.length === 0;
                        });
                        this.gameInfo.availablePlayers = this.listFriends.players;
                        // this._filterOnSearch();
                        this.friends                   = this.listFriends.players;
                    });

                }, (error) => {
                    busy.dismiss().then(() => {
                        let msg = MessageDisplayUtil.getErrorMessage(error, "Error getting friend list");
                        MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 5000, "bottom");
                    })
                });
        });

    }

    private _filterOnSearch() {
        if (!this.searchQuery)
            this.friends = this.listFriends.players;
        else {
            this.friends = this.listFriends.players.filter((p: PlayerInfo) => {
                let name = p.playerName;
                if (name && name.indexOf(this.searchQuery) >= 0)
                    return true;
                else return false;
            })
        }
    }

    newContact() {
        let newContactModal = this.modalCtl.create(NewContactPage, {
            openedAsDialog: true
        });
        newContactModal.onDidDismiss((data: PlayerInfo) => {
            //Check whether the club info is passed
            if (data) {
                this.playerSelected(null, data);
            }
        });
        newContactModal.present();
    }

    playerSelected(event, item: PlayerInfo) {

        if (this.openedModal) {
            this.viewCtl.dismiss(item);
        }
    }

    close() {
        this.viewCtl.dismiss();
    }
}
