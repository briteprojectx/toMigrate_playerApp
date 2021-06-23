import {
    AlertController,
    LoadingController,
    ModalController,
    NavController,
    NavParams,
    Platform,
    ToastController
} from 'ionic-angular';
import {PlayerGroup, PlayerInfo, PlayerList} from '../../../data/player-data';
import {CourseInfo} from '../../../data/club-course';
import {PlayerGroupsPage} from '../../player-groups/player-groups';
import {TranslationService} from '../../../i18n/translation-service';
import {NormalgameService} from '../../../providers/normalgame-service/normalgame-service';
// import {PlainScorecard, PlayerRoundScores} from '../../../data/scorecard';
import {GameRoundScoringPage} from '../../gameround-scoring/gameround-scoring';
import {NormalGameFriendListPage} from '../friend-list/friend-list';
import {NewGameInfo} from '../../../data/game-round';
import {PlayerService} from '../../../providers/player-service/player-service';
import {FriendService} from '../../../providers/friend-service/friend-service';
import {HandicapService} from '../../../providers/handicap-service/handicap-service';
import {JsonService} from '../../../json-util';
import {Keyboard} from '@ionic-native/keyboard';
import {Component, Renderer} from '@angular/core';
import {isPresent} from 'ionic-angular/util/util';
import {MessageDisplayUtil} from '../../../message-display-utils';
import {adjustViewZIndex} from '../../../globals';
import {CurrentScorecardActions} from '../../../redux/scorecard/current-scorecard-actions';
import { TeeBoxPage } from '../../modal-screens/tee-box/tee-box';
import { TeeBox } from '../../../data/tee-box';
import * as moment from "moment";
import { CourseHandicapDetails, PlainScoreCard, PlayerRoundScores } from '../../../data/mygolf.data';
import { ClubFlightService } from '../../../providers/club-flight-service/club-flight-service';
;
@Component({
    templateUrl: 'flight-setup.html',
    selector: 'flight-setup-page'
})
export class FlightSetupPage
{
    // private selectedClub: ClubInfo;
    // private selectedCourses: Array<CourseInfo>;
    public gameInfo: NewGameInfo;
    public courseNames: string;
    public currentPlayer: any; //PlayerInfo;
    public otherPlayers: Array<any>; //Array<PlayerInfo>;
    public slots: Array<number> = [2, 3, 4];
    // myDate: string = String(new Date());
    // var b = moment();
    myDate: any = moment();
    teeTime: Date = new Date(); 
    prevTeeTime: Date = new Date();
    myTDate: Date = new Date();

    appFooterHide: boolean = true;
    //string = String(new Date());
    // myDate: Date = new Date();moment(flightTime).format("HH:mm");


    constructor(private navParams: NavParams,
        private nav: NavController,
        private renderer: Renderer,
        private modalCtl: ModalController,
        private loadingCtl: LoadingController,
        private alertCtl: AlertController,
        private toastCtl: ToastController,
        private playerService: PlayerService,
        private translation: TranslationService,
        private normalGameService: NormalgameService,
        private friendService: FriendService,
        private currentScorecardActions: CurrentScorecardActions,
        private keyboard: Keyboard,
        private platform: Platform,
        private handicapService: HandicapService,
        private flightService: ClubFlightService) {

            this.myDate = moment(new Date()).format("YYYY-MM-DDTHH:mmZ");
            this.teeTime = this.myDate;
            this.myTDate= this.myDate;
            // this.teeTime = String(this.myDate);


            console.log("[Time] Current new : ", this.teeTime)
        this.gameInfo = navParams.get("gameInfo");

        this.courseNames   = this.gameInfo.courses
                                 .filter(course => {
                                     return isPresent(course);
                                 }).map((c: CourseInfo) => {
                return c.courseName;
            }).reduce((first: string, second: string) => {
                return first + " | " + second;
            });
        this.currentPlayer = this.gameInfo.players[0];
        // this.storage.getCurrentPlayer();
        this.otherPlayers  = [];
        if (this.gameInfo.players.length > 1)
            this.gameInfo.players.forEach((player: PlayerInfo, idx: number) => {
                if (idx > 0) {
                    this.otherPlayers[idx - 1] = player;
                }
            });
    }

    ionViewDidEnter() {
        adjustViewZIndex(this.nav, this.renderer);
        console.log("game info ", this.gameInfo)
        this.gameInfo.players.forEach((p,idx) => {
            console.log("index ", idx)
            this._gettingCourseHandicap(idx+1);
        })
        
    }

    ionViewWillLeave() {
        this.gameInfo.players = [this.currentPlayer];
        this.gameInfo.players.push(...this.otherPlayers);
    }

    contactsAvaialble() {
        return true;
    }

    _reducedTeebox() {
        let courses: Array<CourseInfo> = this.gameInfo.courses;
        let selCourse: CourseInfo;
        selCourse = courses.reduce((a: CourseInfo,b: CourseInfo): CourseInfo => {
            if(a.teeBoxes.length < b.teeBoxes.length)
                return a
                else return b
        })

        return selCourse.teeBoxes;
    }

    private _gettingCourseHandicap(slot: number) {
        let idx = slot - 2;
        let teeBox: string;
        let playerId: number;

        let reducedTeebox = this._reducedTeebox();
        console.log("###### start ######")
        console.log("Slot ",slot," | idx ",idx)
        console.log("all", this.otherPlayers)
        if(slot === 1) console.log("teeboxreduced tbox before player",this.currentPlayer.teeOffFrom)
        else console.log("teeboxreduced tbox before player",this.otherPlayers[idx].teeOffFrom)

        console.log("Before Teeboxreduced ",reducedTeebox)
        let _tbox = reducedTeebox
        .filter((t: TeeBox) => {
            if(slot === 1) return this.currentPlayer.teeOffFrom === t.name
            else return this.otherPlayers[idx].teeOffFrom === t.name;
        })
        .map((t: TeeBox) => {
            return t.name
        });

        console.log("Teeboxreduced ",_tbox, reducedTeebox)
        if(_tbox.length === 1) {
            if(slot === 1) 
                this.currentPlayer.teeOffFrom = String(_tbox)
            else this.otherPlayers[idx].teeOffFrom = String(_tbox)
        } else if(_tbox.length === 0) {
            if(slot === 1) 
                this.currentPlayer.teeOffFrom = String(reducedTeebox[0].name)
            else this.otherPlayers[idx].teeOffFrom = String(reducedTeebox[0].name)
        }

        if(slot === 1) {
            playerId = this.currentPlayer.playerId;
            teeBox =  this.currentPlayer.teeOffFrom;
        } else {
            playerId = this.otherPlayers[idx].playerId;
            teeBox =  this.otherPlayers[idx].teeOffFrom;
        }

        
        
        
        console.log("game info : ",this.gameInfo)
        console.log("reduced tbox : ",teeBox, reducedTeebox, _tbox)
        console.log("###### end ######")

        // playerId = this.gameInfo.players[slot-1].playerId;
        // let teeBox = this.gameInfo.players[slot-1].teeOffFrom;
        let firstNineCourse: number;
        let secondNineCourse: number;
        // console.log("teebox 0", this.gameInfo.players[slot-1].teeOffFrom)
        firstNineCourse = this.gameInfo.courses[0].courseId;
        if(this.gameInfo.courses[1]) secondNineCourse = this.gameInfo.courses[1].courseId;

        let player = this._playerInSlot(slot);
        // this.handicapService.getCourseHandicap(playerId,teeBox,firstNineCourse,secondNineCourse)
        // .subscribe((handicap: number)=>{
        //     console.log("getting course handicap",handicap)
        //     player.handicap = handicap;
        // }, (error)=> {

        // });

        this.flightService.getLatestCourseHandicap(playerId,teeBox,firstNineCourse,secondNineCourse)
        .subscribe((courseHandicap: CourseHandicapDetails)=>{
            console.log("getting latest course handicap",courseHandicap)
            player.handicap = courseHandicap.handicap;
            player.courseHandicap = courseHandicap;
            if(slot === 1) this.currentPlayer.courseHandicap;
            else this.otherPlayers[idx].courseHandicap;
            console.log("getting latest course handicap - "+slot," | courseHandicap: ",this.otherPlayers[slot - 2])
            console.log("getting latest course handicap - "+slot," | courseHandicap: ",this.currentPlayer)
        }, (error)=> {

        })
    }

    /**
     * Checks whether Save flight option available
     * @returns {boolean}
     */
    canSaveFlight(): boolean {
        let count = this.otherPlayers.filter((p: PlayerInfo) => {
            return (p != null);
        }).length;
        return !this.gameInfo.groupSelected && count > 0;
    }

    imageUrl(slot: number) {
        let idx = slot - 2;
        if (this.otherPlayers[idx])
            return this.otherPlayers[idx].photoUrl;
        else return "img/default_user.png";
    }

    slotFilled(slot: number) {
        let idx = slot - 2;
        return this.otherPlayers.length > idx && isPresent(this.otherPlayers[idx]);
    }

    playerInSlot(slot: number) {
        if (this.slotFilled(slot))
            return this.otherPlayers[slot - 2].playerName;
        else return this.translation.translate("FlightSetup.SelectPlayer") + " " + slot;
    }

    _playerInSlot(slot: number): any {
        if (slot === 1)
            return this.currentPlayer;
        else if (this.slotFilled(slot)) {
            return this.otherPlayers[slot - 2]
        }
        else return null;
    }

    playerHandicap(slot: number): number {
        if (this.slotFilled(slot))
            return this.otherPlayers[slot - 2].handicap;
        else return 0;
    }

    getPlayerHcpDetails(slot: number, attribute?: string) {
        // console.log("get player hcp details - slot : ", slot, " - ", this.currentPlayer.courseHandicap)
        // console.log("get player hcp details - slot : ", slot, " - ", this.otherPlayers[slot - 2].courseHandicap)
        // if (slot === 1)
        //     if(this.currentPlayer && this.currentPlayer.courseHandicap)
        //         return this.currentPlayer.courseHandicap.handicapSystem;
        // else if (this.slotFilled(slot)) {
        //     if(this.otherPlayers[slot - 2] && this.otherPlayers[slot - 2].courseHandicap)
        //         return this.otherPlayers[slot - 2].courseHandicap.handicapSystem;
        // }
        if (this.slotFilled(slot)) {
            if(this.otherPlayers[slot - 2] && this.otherPlayers[slot - 2].courseHandicap) {
                if(attribute === 'ratings') {
                    return "CR : "+this.otherPlayers[slot - 2].courseHandicap.rating.courseRating + " | SR : " + this.otherPlayers[slot - 2].courseHandicap.rating.slopeRating
                } else return this.otherPlayers[slot - 2].courseHandicap.handicapSystem;
            } else return '';
                
        }
        else return '';
    }
    playerTee(slot: number, other?: boolean): string {
        if (this.slotFilled(slot))
            return this.otherPlayers[slot - 2].teeOffFrom;
        else return 'Blue';
    }

    /**
     * This method checke whether the game can be started or not
     */
    canStartGame() {
        return true;
    }

    /**
     * When delete button is clicked for a player in the flight
     * @param idx The position of the player in the flight
     */
    onPlayerDelete(slot: number) {
        if (this.slotFilled(slot)) {
            this.gameInfo.groupSelected = false;
            this.otherPlayers.splice(slot - 2, 1);
        }
    }

    onPlayerSelect(slot: number) {

        if (!this.slotFilled(slot)) {
            if (!this.gameInfo.availablePlayers || !this.gameInfo.availablePlayers.length) {
                let loading = this.loadingCtl.create({
                    dismissOnPageChange: false,
                    showBackdrop       : false
                });
                // loading.onDidDismiss((friendRequests: PlayerList) => {
                //     if (friendRequests) {
                //         this.gameInfo.availablePlayers = friendRequests.players;
                //         this._openPlayerSelection(slot);
                //     }
                // });
                loading.present().then(() => {
                    this.friendService.searchFriends("", true)
                        .subscribe((friends: PlayerList) => {
                            loading.dismiss().then(() => {
                                this.gameInfo.availablePlayers = friends.players;
                                this._openPlayerSelection(slot);
                            });
                        }, (error) => {
                            loading.dismiss();
                        })
                });

            }
            else
                this._openPlayerSelection(slot);

        }
    }

    private _openPlayerSelection(slot: number) {
        let playersToExclude = new Array<PlayerInfo>();
        playersToExclude.push(this.currentPlayer);
        playersToExclude.push(...this.otherPlayers);
        let clubModal = this.modalCtl.create(NormalGameFriendListPage, {
            openedModal     : true,
            playersToExclude: playersToExclude,
            gameInfo        : this.gameInfo
        });
        clubModal.onDidDismiss((data: PlayerInfo) => {
            //Check whether the club info is passed
            if (data) {
                this.playerService.getPlayerInfo(data.playerId)
                .subscribe((playerInfo: PlayerInfo)=>{
                    if(playerInfo) {
                        let player                  = JsonService.clone(playerInfo);
                        this.otherPlayers[slot - 2] = player;
                        if(!this.otherPlayers[slot - 2].handicap) {
                            if(this.otherPlayers[slot - 2].gender === 'F')
                                this.otherPlayers[slot - 2].handicap = 36
                            else this.otherPlayers[slot - 2].handicap = 24
                        }
                        this._gettingCourseHandicap(slot);
                    }
                },(error)=>{

                },()=>{
                })
            }
        });
        clubModal.present();
    }

    onStartGameClick() {

        // let currentHour = moment().format("HH");
        // let currentMin = moment().format("mm");
        // let valid:boolean = true;
        // // let prevTeeTime = this.teeTime;
        // let selHour = moment(this.teeTime).format("HH");
        // let selMin = moment(this.teeTime).format("mm");

        // let selDate = moment().format("YYYY-MM-DD");

        // //Here you create the game
        // if(this.teeTime) {
        //     console.log("[Current Time] Tee Time : ", this.teeTime, this.myTDate)
        //     if(Number(selHour) > Number(currentHour))
        //         valid = false;
        //         else if(Number(selHour) <= Number(currentHour) && Number(selMin) > Number(currentMin) )
        //             valid = false;
        // }



        let valid: boolean = true;
        let selDate = moment(this.myTDate).format("YYYY-MM-DD");
        let selTime = moment(this.teeTime).format("HH:mm");
        let currentDate= moment().format("YYYY-MM-DD");
        let currentTime = moment().format("HH:mm");

        console.log("on start click",selDate,selTime)
        console.log("on start click current",currentDate,currentTime)
        console.log("on start click compare date ", selDate > currentDate)
        console.log("on start click compare time ", selTime > currentTime)

        if(selDate > currentDate) {
            // console.log("date more")
            valid = false;
        }
        // else if(selDate > currentDate && selTime > currentTime) {
        //     console.log("all more")
        //     valid = false
        // } 
        else if (selDate == currentDate && selTime > currentTime) {
            // console.log("only time more")
            valid = false
        }

        if(!valid) {
            let subTitle = "Please set tee-off date and time in the past or today";
                                    MessageDisplayUtil.showErrorToast(subTitle, this.platform,
                                        this.toastCtl, 3000, "bottom");
            return false;
        }

        

        let scorecard = this._createNewGame();
        console.log("onStartGameClick() : ",scorecard);
        // scorecard.playerRoundScores.for
        scorecard = this.normalGameService.deriveIndexToUse(scorecard);
        scorecard     = this.normalGameService.startGame(scorecard, this.teeTime, this.myTDate);
        this.currentScorecardActions.startNewNormalGame(scorecard, this.currentPlayer.playerId)
            .then(()=>{
                this.currentScorecardActions.setScoringPlayer(this.currentPlayer.playerId);
                this.nav.push(GameRoundScoringPage, {
                    scorecard    : scorecard,
                    currentPlayer: this.currentPlayer
                }).then(() => {
                    this.nav.remove(1, this.nav.length() - 2);
                });
            });


    }

    onHomeClick() {
        let confirm = this.alertCtl.create({
            title  : "Discard Game",
            message: "Do you want to discard all settings for the game and exit?",
            buttons: [{
                text   : "No",
                role   : "cancel",
                handler: () => {
                    confirm.dismiss();
                    return false;
                }
            }, {
                text   : "Yes",
                handler: () => {
                    confirm.dismiss().then(() => {
                        this.nav.popToRoot();
                    });
                    return false;
                }
            }]
        });
        confirm.present();
    }

    onGetFlightClick() {
        let pgModal = this.modalCtl.create(PlayerGroupsPage, {
            selectAndReturn: true
        });
        pgModal.onDidDismiss((pg: PlayerGroup) => {
            if (pg) {
                if(pg.players.length > 0) this.otherPlayers = [];
                pg.players.filter((p: PlayerInfo) => {
                    return p.playerId !== this.currentPlayer.playerId;
                }).forEach((p: PlayerInfo, idx: number) => {
                    console.log("p", p)
                    console.log("idx", idx)
                    this.otherPlayers[idx] = p;
                    this._gettingCourseHandicap(idx+2);
                });
                this.gameInfo.groupSelected = true;
            }
        });
        pgModal.present();

    }

    onSaveFlightClick() {
        let prompt = this.alertCtl.create({
            title  : 'Flight Name',
            message: "Enter a name for this new Flight",
            inputs : [
                {
                    name       : 'title',
                    placeholder: 'Flight Name'
                },
            ],
            buttons: [
                {
                    text   : 'Cancel',
                    handler: data => {
                        prompt.dismiss().then(() => {
                            this.keyboard.close();
                        });
                        return false;
                    }
                },
                {
                    text   : 'Save',
                    handler: data => {
                        prompt.dismiss()
                              .then(() => {
                                  this.keyboard.close();
                                  if (data.title)
                                      this._createPlayerGroup(data.title);
                              });
                        return false;
                    }
                }
            ]
        });
        prompt.present();
    }

    onPlayerHandicapClick(slot) {
        let player = this._playerInSlot(slot);
        if (!player) return;
        let prompt = this.alertCtl.create({
            title  : "Player Handicap",
            message: "Enter a value to override the calculated player handicap for this game.",
            inputs : [
                {
                    name       : 'handicap',
                    type       : 'number',
                    value      : player.handicap + "",
                    placeholder: 'Hcp allowed from -10 to 36'
                }
            ],
            buttons: [
                {
                    text   : 'Cancel',
                    role   : 'cancel',
                    handler: data => {
                        if (this.platform.is('ios') && this.platform.is('cordova'))
                            this.keyboard.close();
                        console.log('Cancel clicked');
                        prompt.dismiss().then(() => {
                            return false;
                        });
                        return false;
                    }
                },
                {
                    text   : 'Change',
                    handler: (data) => {
                        console.log("handicap:", data.handicap);
                        if (this.platform.is('ios') && this.platform.is('cordova'))
                            this.keyboard.close();
                            let newHandicap = parseInt(data.handicap);

                        if (isPresent(data) && isPresent(data.handicap)) {
                            if (newHandicap && ( newHandicap > 36 || newHandicap < -10 )) {
                                prompt.dismiss().then(() => {
                                    let subTitle = "Please enter value from -10 to 36";
                                    MessageDisplayUtil.showErrorToast(subTitle, this.platform,
                                        this.toastCtl, 3000, "bottom");
                                });

                            }
                            else if (newHandicap || newHandicap === 0) {
                                player.handicap = newHandicap;
                                prompt.dismiss().then(() => {
                                    console.log("[handicap] success change : ",player,player.handicap)
                                    return false;
                                });

                            }
                        }
                        return false;
                    }
                }
            ]
        });
        prompt.present();
    }

    private _createPlayerGroup(groupName: string) {
        let loader = this.loadingCtl.create({
            showBackdrop: false,
            content     : "Saving player group..."
        });

        let playerIds = this.otherPlayers.map(p => p.playerId);
        loader.present().then(() => {
            this.playerService.savePlayerGroup(groupName, playerIds)
                .subscribe((result: boolean) => {
                    loader.dismiss(true).then(() => {
                        let msg = "The player group" + groupName + " created successfully";
                        MessageDisplayUtil.showMessageToast(msg, this.platform, this.toastCtl,
                            2000, "bottom");
                    });
                }, (error) => {
                    loader.dismiss().then(() => {
                        let msg = MessageDisplayUtil.getErrorMessage(error, "Error saving player group");
                        MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl,
                            5000, "bottom");
                    });
                })
        });

    }

    /**
     * Creates a new game and returns it based on the selection
     * @returns {PlainScoreCard}
     * @private
     */
    private _createNewGame(): PlainScoreCard {
        let scorecard = this.normalGameService.createNewGame();
        this.normalGameService.setClubForGame(scorecard, this.gameInfo.club);

        this.normalGameService.setCourses(scorecard, this.gameInfo.courses);
        let players = [];
        players.push(this.currentPlayer);
        // this.otherPlayers.forEach((p: PlayerInfo)=> {
        //     players.push(p);
        // })
        players.push(...this.otherPlayers);
        this.gameInfo.players = players;
        this.normalGameService.setPlayers(scorecard, players);
        //Set the current player as scorer
        scorecard.playerRoundScores.forEach((pr: PlayerRoundScores) => {
            pr.scoringPlayerId = this.currentPlayer.playerId;
        });
        return scorecard;
    }

    getTeeColor(color: string) { 
        if(color === 'White') {
            return 'light'
        } else if(color === 'Red') {
            return 'danger'
        } else if(color === 'Black') {
            return 'dark'
        } else if(color === 'Blue') {
            return 'secondary'
        } else if(color === 'Gold') {
            return 'gold'
        } else return 'secondary'
    }

    getBtnTbox(color: string) {
        let tboxStyle: string;

        if(color === 'White') {
            return 'button-teebox ' + 'button-teebox-white'
        } else return 'button-teebox'
        // else if(color === 'Red') {
        //     return "{"+tboxStyle+"}"
        // } else if(color === 'Black') {
        //     tboxStyle = tboxStyle +"'background-color': '#30bb5b';"
        //     return "{"+tboxStyle+"}"
        // } else if(color === 'Blue') {
        //     tboxStyle = tboxStyle +"'background-color': 'white;'"
        //     return "{"+tboxStyle+"}"
        // } else if(color === 'Gold') {
        //     tboxStyle = tboxStyle +"'background-color': '#30bb5b';"
        //     return "{"+tboxStyle+"}"
        // } else {
        //     tboxStyle = tboxStyle +"'background-color': '#30bb5b';"
        //     return "{"+tboxStyle+"}"
        // }
    }

    onTeeboxSelect(slot: number) {
        let courses: Array<CourseInfo> = this.gameInfo.courses;
        let selCourse: CourseInfo;
        selCourse = courses.reduce((a: CourseInfo,b: CourseInfo): CourseInfo => {
            if(a.teeBoxes.length < b.teeBoxes.length)
                return a
                else return b
        })
        let modal = this.modalCtl.create(TeeBoxPage, {
            teeBoxes: selCourse.teeBoxes
        });
        modal.onDidDismiss((teebox: TeeBox) => {
            if(teebox) {
                let idx = slot - 2;
                if(slot === 1) {
                    this.currentPlayer.teeOffFrom = teebox.name
                    this._gettingCourseHandicap(1);
                }
                else {
                    this.otherPlayers[idx].teeOffFrom = teebox.name;
                    this._gettingCourseHandicap(slot);
                }
            }
        });
        modal.present();
    }

    checkTime() {
        let localTime = moment(this.teeTime).format("HH:mm");
        let message = this.teeTime + "<br>" + localTime
        MessageDisplayUtil.displayInfoAlert(this.alertCtl,"Debug",message,"OK")

    }

    validDate(value?) {
        let currentDate = moment().format("YYYY-MM-DD");
        let selDate = moment(this.myTDate).format("YYYY-MM-DD");
        let valid: boolean = true;

        if(this.myTDate) {
            if(currentDate < selDate) {
                valid = false;
            }
        }

        if(!valid) {
            // this.teeTime = this.prevTeeTime
            let subTitle = "Please set tee-off date in the past or today";
                                    MessageDisplayUtil.showErrorToast(subTitle, this.platform,
                                        this.toastCtl, 3000, "bottom");
            // MessageDisplayUtil.displayErrorAlert(this.alertCtl,"Tee-off Time","Please set tee-off time in the past","OK")
            return false;
        }
    }

    validTime(value?) {
        let currentHour = moment().format("HH");
        let currentMin = moment().format("mm");
        let valid:boolean = true;
        // let prevTeeTime = this.teeTime;
        let selHour = moment(this.teeTime).format("HH");
        let selMin = moment(this.teeTime).format("mm");

        // console.log("[Current Time] Previous Time : ", this.prevTeeTime)
        // console.log("[Current Time] Hour : ", currentHour)
        // console.log("[Current Time] Minute : ", currentMin)
        // console.log("[Current Time] sel Hour : ", selHour)
        // console.log("[Current Time] sel Min : ", selMin)
        if(this.teeTime) {
            // console.log("[Current Time] Tee Time : ", this.teeTime)
            if(Number(selHour) > Number(currentHour))
                valid = false;
                else if(Number(selHour) <= Number(currentHour) && Number(selMin) > Number(currentMin) )
                    valid = false;
        }
        // console.log("[Current Time] Valid : ", valid)
        if(!valid) {
            // this.teeTime = this.prevTeeTime
            let subTitle = "Please set tee-off time in the past or today";
                                    MessageDisplayUtil.showErrorToast(subTitle, this.platform,
                                        this.toastCtl, 3000, "bottom");
            // MessageDisplayUtil.displayErrorAlert(this.alertCtl,"Tee-off Time","Please set tee-off time in the past","OK")
            return false;
        }
            

    }

    setPrevTime() {
        console.log("[Current Time] Prev Time : ", this.prevTeeTime, this.teeTime)
        // this.prevTeeTime = this.teeTime;
    }

    cancel() {
        // this.teeTime = this.prevTeeTime;
        console.log("[Current Time] Cancel ", this.prevTeeTime, this.teeTime)
    }

    onItemPlayerClick(slot) {
        if(!this.slotFilled(slot) && (slot === 2 || this.slotFilled(slot-1)))  this.onPlayerSelect(slot);
        else return false;
    }
}
