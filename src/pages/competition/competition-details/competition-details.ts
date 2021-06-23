import {
  NavController,
  Platform,
  NavParams,
  ActionSheetController,
  ModalController,
  AlertController,
  LoadingController,
  ToastController,
  FabContainer
} from "ionic-angular";
import { Component, Renderer } from "@angular/core";
import * as moment from "moment";
import {
  CompetitionInfo,
  CompetitionDetails,
  createCompetitionDetails,
  FlightInfo,
  Leaderboard,
  createLeaderboardDetails,
  CompetitionPlayerInfo,
  CompetitionTeams
} from "../../../data/competition-data";
import { ClubMembership, PlayerInfo } from "../../../data/player-data";
import { ServerResult } from "../../../data/server-result";
// import { PlainScorecard } from "../../../data/scorecard";
// import { createGameRoundInfo } from "../../../data/game-round";
import { GameRoundInfo, createGameRoundInfo, PlayerHomeInfo, PlainScoreCard, FlightMember } from "../../../data/mygolf.data";
import { CompetitionService } from "../../../providers/competition-service/competition-service";
import { ScorecardService } from "../../../providers/scorecard-service/scorecard-service";
import { AuthenticationService } from "../../../authentication-service";
import { MessageDisplayUtil } from "../../../message-display-utils";
import { PlayerService } from "../../../providers/player-service/player-service";
import {
  NotificationHandlerInfo,
  AbstractNotificationHandlerPage
} from "../../../providers/pushnotification-service/notification-handler-constructs";
import { ScorecardDisplayPage } from "../../scorecard-display/scorecard-display";
import { GameRoundScoringPage } from "../../gameround-scoring/gameround-scoring";
import { TeamsPage } from "../competition-teams/competition-teams";
import { CompetitionSponsorsPage } from "../competition-sponsors/competition-sponsors";
import { PrizesPage } from "../competition-prizes/competition-prizes";
import { FlightsPage } from "../competition-flights/competition-flights";
import { CompetitionPlayersPage } from "../competition-players/competition-players";
import { LeaderboardPage } from "../competition-leaderboard/competition-leaderboard";
import { adjustViewZIndex } from "../../../globals";

import { ExpandCompetitionLogo } from "./competition-details-expand-logo";
import { DescriptionBoxPage } from "../../modal-screens/description-box/description-box";
import { CoursesDisplayPage } from "../../modal-screens/courses-display/courses-display";

import { CompetitionFulDetailsPage } from "./competition-full-details";

import { CompetitionPaymentConfirm } from "./competition-payment-confirmation";
import { SessionInfo } from '../../../data/authentication-info';
import { SessionDataService } from '../../../redux/session/session-data-service';
import { Subscription } from 'rxjs/Subscription';
import { PaymentService } from "../../../providers/payment-service/payment-service";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { PlayerHomeActions, PlayerHomeDataService } from "../../../redux/player-home";
import { CurrentScorecardActions, CurrentScorecardDataService } from "../../../redux/scorecard";
import { Observable} from 'rxjs';
import { ReturnStatement } from "@angular/compiler/src/output/output_ast";
import { LeagueScorecardPage } from "../competition-league-scorecard/competition-league-scorecard";
import { LeagueLeaderboardPage } from "../competition-league-leaderboard/competition-league-leaderboard";
import { ClubFlightService } from "../../../providers/club-flight-service/club-flight-service";
import { CompetitionLeagueMenuPage } from "../competition-league-menu/competition-league-menu";

/*
 Generated class for the CompetitionListPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'competition-details.html',
  selector: 'competition-details-page'
})
export class CompetitionDetailsPage {

  scorecard: PlainScoreCard;
  competition: CompetitionInfo;
  compId: number;
  details: CompetitionDetails;
  flights: Array<FlightInfo> = new Array<FlightInfo>();
  leaderBoard: Leaderboard;
  currentRound: number = 1;
  gameRound: GameRoundInfo;
  countDays: number;
  countDaysText: string;
  countDaysRound: number;
  scoringRound: number = 0;
  freshCompInfo: boolean = true;
  clubName: string;
  memberships: Array<ClubMembership> = [];
  compTeams: CompetitionTeams;
  roundList: Array<number> = [];

  needRefresh: boolean = true;
  session: SessionInfo;

  showTeam: boolean = false;

  currentPlayer: PlayerInfo;

  flightPublished: boolean = true;

  
  public playerHomeInfo$: Observable<PlayerHomeInfo>;
  public player$: Observable<PlayerInfo>;

  playerIsPlaying: Array<any>;

  isEclectic: boolean = false;

  constructor(private nav: NavController,
    private renderer: Renderer,
    private platform: Platform,
    private navParams: NavParams,
    private actionSheetCtl: ActionSheetController,
    private modalCtl: ModalController,
    private alertCtl: AlertController,
    private toastCtl: ToastController,
    private loadingCtl: LoadingController,
    private compService: CompetitionService,
    private auth: AuthenticationService,
    private scorecardService: ScorecardService,
    private sessionService: SessionDataService,
    private playerService: PlayerService,
    private paymentService: PaymentService,
    private iab: InAppBrowser,
    private playerHomeActions: PlayerHomeActions,
    private currentScorecardActions: CurrentScorecardActions,
    private playerHomeService: PlayerHomeDataService,
    private currentScorecardService: CurrentScorecardDataService,
    private flightService: ClubFlightService) {

    this.competition = navParams.get("competition");
    if (!this.competition) {
      this.compId = navParams.get("competitionId");
      this.competition = {
        competitionId: this.compId
      }

    }

    this.details = createCompetitionDetails();
    this.leaderBoard = createLeaderboardDetails();
    this.gameRound = createGameRoundInfo();
    this.flights = new Array<FlightInfo>();

    
    this.playerHomeInfo$      = this.playerHomeService.playerHomeInfo();
    this.player$              = this.playerHomeInfo$
                                    .filter(Boolean)
                                    .map((playerHome: PlayerHomeInfo) => playerHome.player);


  }

  ionViewDidLoad() {
    // this.sessionService.getSession()
    //   .take(1)
    //   .subscribe((session: SessionInfo) => {
    //     this.session = session;
    //   })
    //   console.log("Get session Info : ",this.session)
    // this.needRefresh = false;
    // this.refreshPage(false);

  }

  ionViewDidEnter() {
    this.sessionService.getSession()
      .take(1)
      .subscribe((session: SessionInfo) => {
        this.session = session;
      })
      
    adjustViewZIndex(this.nav, this.renderer);
    if (this.needRefresh) {
      this.needRefresh = false;
      this.refreshPage(false);
    }
  }
  
  ionViewWillEnter() {
    
    let _fromFlight = this.navParams.get("fromFlight");
    if(_fromFlight) this.flightPublished = this.navParams.get("flightPublished");
    console.log("from flight - ", _fromFlight, " : ", this.flightPublished);
    if(!this.flightPublished) {
      let subTitle = 'Flights have not been published yet';
      MessageDisplayUtil.displayInfoAlert(this.alertCtl, "", subTitle, "OK");
    }
  }
  async deriveSession() {
    this.session = await this.sessionService.getSession().toPromise();
  }
  refreshPage(pushData: any) {
    this.onRefreshClick(null);
  }

  public getNotifications(): Array<NotificationHandlerInfo> {
    let notifications = new Array<NotificationHandlerInfo>();
    notifications.push({
      type: AbstractNotificationHandlerPage.TYPE_COMP_INFO_CHANGED,
      whenActive: 'showToast',
      needRefresh: true
    });
    return notifications;
  }

  onRefreshClick(refresher) {
    this.freshCompInfo = true;
    this._refreshCompetitionInfo(refresher);

  }

  private _refreshCompetitionInfo(refresher, attribute?: string) {
    let loader = this.loadingCtl.create({
      content: "Please wait...",
      showBackdrop: true,
      duration: 5000,
    });
    loader.onDidDismiss(() => {
      if (refresher) refresher.complete();
    });
    loader.present().then(() => {
      this.compService.getCompetitionInfo((this.competition) ? this.competition.competitionId : this.compId)
        .subscribe((comp: CompetitionInfo) => {
          this.competition = comp;
          this.flightService.checkLeagueCompetition(this.competition? this.competition.competitionId : this.compId)
          .subscribe((data)=>{
            console.log("check league competition - eclectic : ", data)
            this.isEclectic = data;
          })
          this._init();
          //Get competition details
          this.compService.getDetails(this.competition.competitionId)
            .subscribe((details: CompetitionDetails) => {
              this.details = details;
              //Get the scoring round
              this.compService.getScoringRoundNumber(this.competition.competitionId)
                .subscribe((roundNo: number) => {
                  console.log("[Scoring] Round No : ", roundNo)
                  this.scoringRound = roundNo;
                  //Get players
                  this.compService.getPlayersRegistered(this.competition.competitionId)
                    .subscribe((players: CompetitionPlayerInfo[]) => {
                      this.details.players = players;
                      let _player;
                      this.player$.take(1).subscribe((player: PlayerInfo)=>{
                        if(player) _player = player
                      })

                      this.playerIsPlaying = this.details.players.filter((compPlayer: CompetitionPlayerInfo)=>{
                        if(compPlayer && compPlayer.playerId && _player && _player.playerId) {
                          return compPlayer.playerId === _player.playerId
                        } else return false;
                      })

                      this.competition.totalRegistered = this.details.players.length;
                      this.compService.getCompetitionTeams(this.competition.competitionId)
                        .subscribe((compTeams: CompetitionTeams) => {
                          this.compTeams = compTeams;
                          if (this.currentRound == null) {
                            this.currentRound = this.details.roundInProgress;
                            if (!this.currentRound) this.currentRound = this.details.nextRound;
                          }
                          if (this.currentRound != null) {
                            this.compService.getFlights(this.competition.competitionId, this.currentRound)
                              .subscribe((flights: Array<FlightInfo>) => {
                                this.flights = flights;
                                console.log("get flights", this.flights)
                                loader.dismiss().then(() => {
                                  this._onRefreshComplete();
                                  if(attribute === 'refreshFlight') {
                                    this.goFlights(attribute);
                                  }
                                });
                              }, (error) => {
                                loader.dismiss();
                              })
                          }
                          else {
                            loader.dismiss();
                            adjustViewZIndex(this.nav, this.renderer);
                          }
                        }, (error) => { //Error getting comp teams
                          loader.dismiss().then(() => {
                            this._onRefreshComplete();
                          });
                        })
                    }, (error) => { //Error getting comp players
                      loader.dismiss().then(() => {
                        this._onRefreshComplete();
                      });
                    })

                }, (error) => { //Error getting scoring round
                  this.scoringRound = 0;
                  loader.dismiss(() => {
                    this._onRefreshComplete();
                    let msg = MessageDisplayUtil.getErrorMessage(error, "Error getting scoring round");
                    MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 3000, "bottom");
                  });
                });
            }, (error) => {
              loader.dismiss(() => {
                this._onRefreshComplete();
                let msg = MessageDisplayUtil.getErrorMessage(error, "Error getting competition details");
                MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 3000, "bottom");
              });
            })

          // this.doRefresh(refresher, loader);
        }), (error) => {
          loader.dismiss().then(() => {
            this._onRefreshComplete();
            let msg = MessageDisplayUtil.getErrorMessage(error, "Error getting competition information");
            MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 3000, "bottom");
          });
        }, () => {


        }
    });
  }

  private _onRefreshComplete() {
    if (this.freshCompInfo) {
      // if (this.currentRound == null) {
      if (this.competition.status == "Completed") {
        this.currentRound = this.competition.totalRounds
        console.log("Completed:" + this.competition.totalRounds + "Round:" + this.currentRound)

      } else {
        this.currentRound = this.details.roundInProgress;
        if (!this.currentRound) this.currentRound = this.details.nextRound;
        if (!this.currentRound) this.currentRound = 1;
      }
    }
    this.gameRound = this.details.gameRounds.filter((gr: GameRoundInfo, idx: number) => {
      return gr.roundNo == this.currentRound;

    }).pop();
    this.roundList = [];

    for (let i = 1; i <= this.competition.totalRounds; i++) {
      this.roundList.push(i);
    }
    console.log(this.roundList)


    adjustViewZIndex(this.nav, this.renderer);

    // this.getPlayerInfo();
  }

  private refreshPlayers() {
    this.compService.getPlayersRegistered(this.competition.competitionId)
      .subscribe((players: CompetitionPlayerInfo[]) => {
        this.details.players = players;
        this.competition.totalRegistered = this.details.players.length;
      })
  }

  private _init() {
    var b = moment();
    var a = moment(this.competition.startDate);

    this.countDays = a.diff(b, 'days', true) + 1;
    this.countDays = Math.round(this.countDays * 100) / 100
    this.countDaysRound = a.diff(b, 'days') + 1; // =1
    console.log(this.countDays);
    if (this.countDays >= 0.00 && this.countDays <= 0.99) {
      this.countDaysText = 'Starts today';
    }
    if (this.countDays < 0) {
      this.countDaysText = 'Not started yet';
    }
    if (this.countDays >= 1.00 && this.countDays <= 1.99) {
      this.countDaysText = 'Starts tomorrow ';
    }
    if (this.countDays >= 2) {
      this.countDaysText = 'Starts in ' + this.countDaysRound + ' days';
    }

  }

  public roundNoToDisplay(): string {
    if (this.details && this.details.roundInProgress)
      return "R" + this.details.roundInProgress;
    else if (this.details && this.details.nextRound)
      return "R" + this.details.nextRound;
    else return "R1";
  }

  openMenu() {
    let actionSheet = this.actionSheetCtl.create({

      buttons: [

        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom
          icon: !this.platform.is('ios') ? 'close' : null,
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    let roundNo = this.competition.totalRounds;
    for (let i = 1; i <= roundNo; i++) {
      actionSheet.addButton(
        {
          text: 'Round ' + i,
          role: 'destructive',
          icon: 'filter',
          handler: () => {

            this.currentRound = i;
            //  this.roundInfo = this.getSelectedRoundInfo();
            //this.doRefresh(null);
            //+ this.roundInfo.id
            this.gameRound = this.details.gameRounds.filter((gr: GameRoundInfo) => {
              return gr.roundNo == this.currentRound;
            }).pop();
            this.freshCompInfo = false;
            this._refreshCompetitionInfo(null);
            console.log("Round Score:" + this.gameRound.grossTotal)
            console.log('Clicked for Round : ' + this.currentRound + '\n');
            //  this.goScorecard();
          }
        });
    }

    actionSheet.present();
  }

  checkBtnRegister() {
    if ((this.competition.status != 'Completed') &&
      (this.competition.registered == false) &&
      (this.competition.closedForRegistration == false)) {
      return true;

    }
  }

  checkBtnDeRegister() {
    if ((this.competition.status != 'Completed') && (this.competition.status != 'In Progress') &&
      (this.competition.registered == true) &&
      (this.competition.closedForRegistration == false)) {
      return true;
    }
  }

  getSelectedRoundInfo() {

    return this.details.gameRounds.filter((gr: GameRoundInfo) => {
      return gr.roundNo == this.currentRound;
    }).pop();
  }

  CompetitionDetailsModal() {
    let modal = this.modalCtl.create(CompetitionFulDetailsPage, { competition: this.competition });
    modal.present();
  }

  getPlayerInFlight() {
    if(!this.flights) return;
    let _player: PlayerInfo;
    this.player$.take(1).subscribe((player)=>{
      _player = player;
    });
    let _playerInFlight;

    _playerInFlight = this.flights.filter((flight: FlightInfo)=>{
      return flight.playerFlight
      // _playerInFlight = flight.flightMembers.filter((flightMember)=>{
      //   return flightMember.playerId === _player.playerId
      // })
    });

    // console.log("get player in flight - ", this.currentRound, this.flights)
    if(_playerInFlight && _playerInFlight.length === 0 || !_playerInFlight) {
      return false;
    }
    else return true;
  
  }

  goScorecard() {
    let loader = this.loadingCtl.create({
      content: 'Getting scorecard. Please wait...'
    });
    if (this.competition.status == 'Upcoming') {
      let subTitle = "Competition has not started";
      MessageDisplayUtil.displayInfoAlert(this.alertCtl, "", subTitle, "OK");
      return false;
    }

    let _player: PlayerInfo;
    this.player$.take(1).subscribe((player)=>{
      _player = player;
    })
    let _playerInFlight;
    _playerInFlight = this.flights.filter((flight: FlightInfo)=>{
      return flight.playerFlight
    });
    // this.flights.filter((flight)=>{
    //   _playerInFlight = flight.flightMembers.filter((flightMember)=>{
    //     return flightMember.playerId === _player.playerId
    //   })
    // });
    
    // if(_playerInFlight && _playerInFlight.length === 0 || !_playerInFlight) {
    if(!this.getPlayerInFlight()) {
      let _msg = "You are not playing in this round."
      MessageDisplayUtil.showErrorToast(_msg, this.platform, this.toastCtl,3000, 'bottom')
      return false;
    }

    this.gameRound = this.details.gameRounds.filter((gr: GameRoundInfo, idx: number) => {
      return gr.roundNo == this.currentRound;
    }).pop();
    console.log('Clicked for scorecard: ' + this.gameRound.id + '\n');
    loader.present().then(() => {
      this.scorecardService.getScorecard(this.gameRound.id)
        .subscribe((scorecard: PlainScoreCard) => {
          loader.dismiss().then(() => {
            this.scorecard = scorecard;
            if (this.scorecard.success) {
              this.nav.push(ScorecardDisplayPage, {
                scorecard: this.scorecard,
                competition: this.competition,
                gameRound: this.gameRound,
                isCompetition: true,
                editing: true
              });
            } else console.log(this.scorecard.message);
          });


        }, (error) => {
          //let title = "No Sponsors";
          let _error = error.json();
          loader.dismiss();
          console.log("go scorecard error ", error)
          let subTitle = _error.message;
          MessageDisplayUtil.displayErrorAlert(this.alertCtl, "", subTitle, "OK");

        }, () => {
          //if (isPresent(this.gameRound)) {

        });
    });
    //if(this.scorecard.success){

    //            this.nav.push(ScorecardPage, {

    /*	} else {
     let title = "No Sponsors";
     let subTitle = this.scorecard.message;
     MessageDisplayUtil.displayInfoAlert(this.alertCtl, "", subTitle, "OK");
     }
     */

  }

  onCompetitionScoringClick() {
    if(!this.currentRound) return;
    if(!this.competition) return;
    if(this.competition && !this.competition.competitionId) return;
    if(this.getPlayerStatus()==='Withdrawn') return;
    let _player: PlayerInfo;
    this.player$.take(1).subscribe((player)=>{
      _player = player;
    })
    let _competitionId;
    let _isScorer;
    this.scorecardService.clearScorecard().subscribe((scorecard)=>{
      console.log("clearing scorecard : ", scorecard)
    });

    let _today = moment().format("YYYY-MM-DD");
    let _startDate = moment(this.competition.startDate).format("YYYY-MM-DD");
    let _endDate = moment(this.competition.endDate).format("YYYY-MM-DD");
    console.log("compettion scoring today ", _today);
    console.log("compettion scoring start", this.competition.startDate, _startDate);
    console.log("compettion scoring date", this.competition.endDate, _endDate);
    if(_startDate > _today && _endDate < _today) {
      let _msg = "Competition is not active anymore"
      MessageDisplayUtil.showErrorToast(_msg, this.platform, this.toastCtl,3000, 'bottom')
      return false;
    } else if(_endDate < _today) {
      let _msg = "Competition is not active anymore"
      MessageDisplayUtil.showErrorToast(_msg, this.platform, this.toastCtl,3000, 'bottom')
      return false;
    } 

    // this.flights.filter((flight)=>{
      
    //   flight.flightMembers.filter((flightMember)=>{
    //     flightMember.playerId === return 
    //   })
    // })
    this.compService.getScorers(this.competition.competitionId, this.currentRound)
    .subscribe((data)=>{
      if(data) {
        let _playerInFlight;
        this.compService.getFlights(this.competition.competitionId, this.currentRound)
        .subscribe((flights: Array<FlightInfo>) => {
          flights.filter((flight)=>{
            _playerInFlight = flight.flightMembers.filter((flightMember)=>{
              return flightMember.playerId === _player.playerId
            })
          })
        })
        // if(_playerInFlight && _playerInFlight.length === 0 || !_playerInFlight) {
          if(!this.getPlayerInFlight()) {
          let _msg = "You are not playing in this round."
          MessageDisplayUtil.showErrorToast(_msg, this.platform, this.toastCtl,3000, 'bottom')
          return false;
        }
        _isScorer = data.filter((data)=>{
          return data.playerId === _player.playerId 
        })
        console.log("get scorers : data ", data)
        console.log("get scorers : isScorer ", _isScorer)
        console.log("get scorers : current round ", this.currentRound)
        console.log("get scorers : player ",_player)
        console.log("get scorers : isPlayer ", this.playerIsPlaying)
        setTimeout(()=>{
          if(this.playerIsPlaying && this.playerIsPlaying.length > 0) {
            this.scorecardService.getCurrentScorecard()
              .subscribe((scorecard: PlainScoreCard) => {
                console.log("on competition scoring click : scorecard - ", scorecard)
                console.log("on competition scoring click : competition - ", this.competition)
                console.log("on competition scoring click : scorer - ", _isScorer)
      
                if((scorecard && scorecard.competitionId !== this.competition.competitionId) || !scorecard) {
                  
                console.log("inner - on competition scoring click : scorecard - ", scorecard)
                console.log("inner - on competition scoring click : competition - ", this.competition)
                console.log("inner - on competition scoring click : scorer - ", _isScorer)
                  if(_isScorer && _isScorer.length === 0 || !_isScorer) {
                    this.scorecardService.getScorecard(this.details.gameRounds[this.currentRound-1].id)
                    .subscribe((scorecard: PlainScoreCard) => {
                      console.log("get scorecard : ", scorecard)
                      this.nav.push(GameRoundScoringPage, {
                        scorecard: scorecard,
                        competition: this.competition,
                        currentPlayer: _player,
                        editingScorecard: _isScorer&&_isScorer.length>0?true:false,
                        // editingScorecard: true,
                      }, {
                          direction: "forward"
                        })
                    }, (error)=>{
                      let _error = error.json();
                                    
                      console.log("error : ", error)
                      let _msg = _error.message;
                      MessageDisplayUtil.showErrorToast(_msg, this.platform, this.toastCtl,3000, 'bottom')
                      return false;
                    })
                  } else if(_isScorer && _isScorer.length > 0) {
                    let loader = this.loadingCtl.create({
                      content            : "Getting scorecard. Please wait...",
                      dismissOnPageChange: false
                  });
                  loader.present().then(()=>{
                    let _getCompetitionScoring = this.playerHomeActions.getCompetitionScoring(this.competition.competitionId, _player.playerId, loader);
                    console.log("get comp scoring : ",_getCompetitionScoring)
                    let getScorecard = setInterval(()=>{
                        this.scorecardService.getCurrentScorecard()
                        .subscribe((scorecard: PlainScoreCard) => {
                            console.log("get current scorecard actual : ", scorecard)
                            if(scorecard && scorecard.competitionId === this.competition.competitionId) {
                              clearInterval(getScorecard);
                                this.compService.getCompetitionInfo(this.competition.competitionId)
                                .subscribe((comp: CompetitionInfo) => {
                                    loader.dismiss().then(() => {
                                        this.currentScorecardActions.setScoringPlayer(_player.playerId);
                                        this.nav.push(GameRoundScoringPage, {
                                            scorecard    : scorecard,
                                            competition  : comp,
                                            currentPlayer: _player
                                        })
                                    }); 
                                }, (error) => {
                                    if(loader) loader.dismiss();
                                    clearInterval(getScorecard)
                                }, ()=>{
                                    // if(loader) loader.dismiss();
                                });
                                }
                                // else {
                                //   this.scorecardService.getScorecard(this.details.gameRounds[this.currentRound-1].id)
                                //   .subscribe((scorecardNon: PlainScoreCard) => {
                                //     if(scorecardNon) clearInterval(getScorecard)
                                //     console.log("get scorecard  error : ", scorecardNon)
                                //     this.nav.push(GameRoundScoringPage, {
                                //       scorecard: scorecardNon,
                                //       competition: this.competition,
                                //       currentPlayer: _player,
                                //       // editingScorecard:true,
                                //       viewOnly: true,
                                //       // editingScorecard: true,
                                //     }, {
                                //         direction: "forward"
                                //       })
                                //   }, (error)=>{
                                    
                                //       let _error = error.json();
                                                    
                                //       console.log("error : ", error)
                                //       let _msg = _error.message;
                                //       MessageDisplayUtil.showErrorToast(_msg, this.platform, this.toastCtl,3000, 'bottom')
                                //       return false;
                                //   })
                                // }
                            
                        }, (error)=>{
                          this.scorecardService.getScorecard(this.details.gameRounds[this.currentRound-1].id)
                          .subscribe((scorecardNon: PlainScoreCard) => {
                            console.log("get scorecard  error : ", scorecardNon)
                            this.nav.push(GameRoundScoringPage, {
                              scorecard: scorecardNon,
                              competition: this.competition,
                              currentPlayer: _player,
                              editingScorecard: false,
                              // editingScorecard: true,
                            }, {
                                direction: "forward"
                              })
                          }, (error)=>{
                            
                      let _error = error.json();
                                    
                      console.log("error : ", error)
                      let _msg = _error.message;
                            MessageDisplayUtil.showErrorToast(_msg, this.platform, this.toastCtl,3000, 'bottom')
                            return false;
                          })
                            }, ()=>{
                              
                            //  clearInterval(getScorecard)
                            });
                        },3000)
                    // this.compService.getOrCreateScorecard(this.competition.competitionId, true, _player.playerId)
                    // .subscribe((scorecardIn: PlainScoreCard)=>{
                    //   if(scorecardIn) {
                    //     this.currentScorecardActions.setScoringPlayer(_player.playerId);
                    //     this.nav.push(GameRoundScoringPage, {
                    //       scorecard: scorecardIn,
                    //       competition: this.competition,
                    //       currentPlayer: _player,
                    //       // editingScorecard: _isScorer&&_isScorer.length>0?true:false,
                    //       // editingScorecard: true,
                    //     }, {
                    //         direction: "forward"
                    //       })
                    //   }
                    // },(error)=>{
                    //   console.log("get or create scorecard error : ", error);
                    //   this.scorecardService.getScorecard(this.details.gameRounds[this.currentRound-1].id)
                    //   .subscribe((scorecard: PlainScoreCard) => {
                    //     console.log("get scorecard : ", scorecard)
                    //     this.nav.push(GameRoundScoringPage, {
                    //       scorecard: scorecard,
                    //       competition: this.competition,
                    //       currentPlayer: _player,
                    //       editingScorecard: _isScorer&&_isScorer.length>0?true:false,
                    //       // editingScorecard: true,
                    //     }, {
                    //         direction: "forward"
                    //       })
                    //   })
                    // })
                  })
                    
                  }
                  
                      
                } 

                else {
                  if(scorecard) _competitionId = scorecard.competitionId;
                  else _competitionId = this.competition.competitionId?this.competition.competitionId:this.compId;
                  this.compService.getCompetitionInfo(_competitionId)
                    .subscribe((comp: CompetitionInfo) => {
                      console.log("on competition scoring click : comp - ", comp)
                      this.playerService.getPlayerInfo(this.session.playerId)
                        .subscribe((player: PlayerInfo)=>{
                          console.log("on competition scoring click : player - ", player)
                          if(scorecard) {
                            this.nav.push(GameRoundScoringPage, {
                              scorecard: scorecard,
                              competition: comp,
                              currentPlayer: player
                            }, {
                                direction: "forward"
                              })
        
                          } else {
                            let loader = this.loadingCtl.create({
                              content            : "Getting scorecard. Please wait...",
                              dismissOnPageChange: false
                          });
                              // console.log("on comp scoring click : ", this.activeComps)
                              let _compId;
                              // this.playerHomeInfo$.filter(Boolean).subscribe((a: PlayerHomeInfo)=>{
                              //     if(a.compsActiveToday && a.compsActiveToday.length > 0)
                              //     _compId = a.compsActiveToday[0].competitionId
                              // });
                              _compId = this.competition.competitionId;
                              this.playerHomeActions.getCompetitionScoring(_compId, this.session.playerId, loader);
                              let getScorecard = setInterval(()=>{
                                  this.scorecardService.getCurrentScorecard()
                                  .subscribe((scorecard: PlainScoreCard) => {
                                      console.log("get current scorecard : ", scorecard)
                                      if(scorecard) {
                                          clearInterval(getScorecard);
                                          this.compService.getCompetitionInfo(_compId)
                                          .subscribe((comp: CompetitionInfo) => {
                                              // loader.dismiss().then(() => {
                                                  this.currentScorecardActions.setScoringPlayer(this.session.playerId);
                                                  this.nav.push(GameRoundScoringPage, {
                                                      scorecard    : scorecard,
                                                      competition  : comp,
                                                      currentPlayer: _player
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
                          }
                        
                            
                        })
                      
                    })
                }
                
      
              }, (error) => {
      
              });
      
          }

        },1000)
      }
    });

    
    // if(1) return;
    // console.log("Scoring Round : ",this.scoringRound)
    // if (this.scoringRound > 0) {
    


    
    

  }

  goSponsors() {
    if (this.details.sponsors.length < 1) {

      let subTitle = 'No sponsors have been defined for this competition';//'Sponsors have not been defined for this competition yet';
      MessageDisplayUtil.displayInfoAlert(this.alertCtl, "", subTitle, "OK");

    } else {
      this.nav.push(CompetitionSponsorsPage, {
        competition: this.competition,
        sponsors: this.details.sponsors
      });
    }
  }

  goPrizes() {
    console.log("Prize count:", this.prizeCount())
    if (this.prizeCount() < 1) {

      let subTitle = 'No Prizes have been defined for this competition'; //'Prizes have not been defined for this competition yet';
      MessageDisplayUtil.displayInfoAlert(this.alertCtl, "", subTitle, "OK");

    } else {
      this.nav.push(PrizesPage, {
        competition: this.competition,
        prizes: this.details.prizes,
        teamPrizes: this.details.teamPrizes,
        categories: this.details.categories
      });
    }
  }

  toggleTeamEvent(type) {
    console.log("Toggle Team Event:" + type)
    if (type == 'individual') {
      this.showTeam = false;
    } else if (type == 'team') {
      this.showTeam = true;
    }

    this.goLeaderboard();
  }
  // goTeamLeaderboard(){
  //   this.showTeam = true;
  //
  //   this.goLeaderboard();
  // }

  goLeaderboard() {
    // this._refreshCompetitionInfo(null);
    if (this.competition.status == 'Upcoming' || this.competition.status == 'Not Started') {
      let subTitle = "Competition has not started. Please refresh to update competition status.";
      MessageDisplayUtil.displayInfoAlert(this.alertCtl, "", subTitle, "OK");
      return false;
    }
    if (!this.competition.showLeaderBoard && this.competition.status != 'Completed') {
      let subTitle = "Leaderboard is disabled by the Organizer. It will be available once the competition is completed.<br> Please refresh to update competition status.";
      MessageDisplayUtil.displayInfoAlert(this.alertCtl, "", subTitle, "OK");
      return false;
    }
    if (this.currentRound == null) {
      this.currentRound = this.details.roundInProgress;
      if (!this.currentRound) this.currentRound = this.details.nextRound;
    }
    if (this.currentRound != null) {
      this.nav.push(LeaderboardPage, {
        competition: this.competition,
        leaderboards: this.leaderBoard,
        leaderboardPlayers: this.leaderBoard.players,
        roundNo: this.currentRound,
        categories: this.details.categories,
        teams: this.competition.teamEvent ? null : null,
        showTeam: this.showTeam
        // this.compTeams : null
      });

    }

  }

  goPlayers() {
    if (this.details.players.length < 1) {

      let subTitle = 'Players have not registered for this competition yet';
      MessageDisplayUtil.displayInfoAlert(this.alertCtl, "", subTitle, "OK");

    } else {
      this.nav.push(CompetitionPlayersPage, {
        competition: this.competition,
        players: this.details.players,
        roundNo: this.currentRound,
        categories: this.details.categories
      });
    }
  }

  onImageClick() {
    let modal = this.modalCtl.create(ExpandCompetitionLogo, { competition: this.competition });
    modal.present();
  }

  goFlights(attribute?: string) {
    console.log("game round : ", this.gameRound)
    if(this.gameRound.status === 'Pending' && !attribute) {
      this._refreshCompetitionInfo(null,'refreshFlight');
      return false;
    }

    
    
    if (this.gameRound && this.gameRound.status === 'Pending' && !this.gameRound.publishFlights) {
      let _multipleRounds = false;
      if(this.competition && this.competition.totalRounds > 1) _multipleRounds = true;

      let subTitle;
      if(_multipleRounds) subTitle = 'Flights for round ' + this.gameRound.roundNo + ' have not been published yet.';//'Flights have not been defined for this competition yet';
      else if(!_multipleRounds) subTitle = 'Flights have not been published yet';
      MessageDisplayUtil.displayInfoAlert(this.alertCtl, "", subTitle, "OK");
      return false;
    }
    if (this.flights.length < 1) {

      let subTitle = 'No flights have been defined for this round';//'Flights have not been defined for this competition yet';
      MessageDisplayUtil.displayInfoAlert(this.alertCtl, "", subTitle, "OK");
      return false;
      /*  let alert = Alert.create({
       title: 'No Flights',
       subTitle: 'There is no flight assigned for this competition',
       buttons: ['OK']
       });
       this.nav.present(alert);*/

    } else {
      this.gameRound = this.details.gameRounds.filter((gr: GameRoundInfo, idx: number) => {
        return gr.roundNo == this.currentRound;
      }).pop();
      // this.nav.push(FlightsPage, {
      //     competition: this.competition,
      //     flights: this.flights,
      //     gameRound: this.gameRound
      // });
      this.nav.push(FlightsPage, {
        competitionId: this.competition.competitionId,
        roundNo: this.gameRound.roundNo
      });
    }
  }

  goTeams() {
    if (this.compTeams.totalItems == 0) {
      let subTitle = 'No teams have been assigned to this competition';//'Flights have not been defined for this competition yet';
      MessageDisplayUtil.displayInfoAlert(this.alertCtl, "", subTitle, "OK");
      return false;
    } else {
      this.nav.push(TeamsPage, {
        competition: this.competition,
        flights: this.flights,
        gameRound: this.gameRound,
        compTeams: this.compTeams
      });

    }

  }

  goHome() {
    this.nav.popToRoot();//this.nav.setRoot(PlayerHomePage);
  }

  private onClubRegisterClick(clubId: number) {
    // console.log(this.getPlayerMembership(this.competition.clubName));
    let alert2 = this.alertCtl.create({
      //title: 'Confirm register',
      title: 'Registration',
      message: 'This competition is only for <b>' + this.competition.clubName + '</b>. Are you a member of the club?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            alert2.dismiss();
          }
        },
        {
          text: 'Yes',
          handler: () => {
            alert2.dismiss().then(() => {
              this.openMembershipOptions(clubId);
            });

          }
        }
      ]
    });
    alert2.present();

  }

  // private _addMembershipAndRegister(){
  //
  // }
  openMembershipOptions(clubId: number, membership?: string) {
    let prompt = this.alertCtl.create({
      title: 'Club Membership',
      message: "Enter your Membership Number for <b>" + this.competition.clubName + "</b> and click Save",
      inputs: [
        {
          name: 'title',
          placeholder: 'Membership Number',
          value: membership
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            prompt.dismiss();
            return false;
          }
        },
        {
          text: 'Save',
          handler: data => {
            if (data && data.title)
              prompt.dismiss()
                .then(() => {
                  this._addMembership(clubId, data.title);
                });
            else {
              MessageDisplayUtil.showErrorToast("You have not entered membership number", this.platform, this.toastCtl, 5000, "bottom");

            }

            return false;
          }
        }

      ]
    });
    prompt.present();
  }

  private _addMembership(clubId: number, membership: string) {
    this.playerService.updateClubMembership(clubId, membership)
      .subscribe(() => {
        // this._refreshMemberships();
      }, (error) => {

      }, () => {
        this.register();

      })
  }

  public onRegisterClick() {
    if (this.details.paymentMandatory) {
      this.goPayment();
      return;
    }
    // let canRegister: boolean = false;
    if (this.competition.type == "Members") {
      this.getPlayerMembership(this.competition.clubName);
      return false;
    } else {
      // canRegister = true;
      let alert = this.alertCtl.create({
        //title: 'Confirm register',
        title: 'Registration',
        message: 'Are you sure you want to register?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              alert.dismiss();
              return false;
            }
          },
          {
            text: 'Yes',
            handler: () => {
              alert.dismiss().then(() => {
                this.register();
              });
              return false;
            }
          }
        ]
      });

      alert.present();

    }
  }

  private register(ignoreOverlap: boolean = false) {
    let register = this.loadingCtl.create({
      showBackdrop: false,
      content: "Registering..."
    });

    register.present().then(() => {
      this.compService.register(this.competition.competitionId,
        this.session.playerId, ignoreOverlap)
        .subscribe((result: ServerResult) => {
          register.dismiss().then(() => {
            if (result.success) {
              this.competition.registered = true;
              MessageDisplayUtil.showMessageToast(result.message, this.platform,
                this.toastCtl, 3000, "bottom");
              this.refreshPlayers();
            }
            else {
              this._conditionalRegister(result.message);
            }
          });
        }, (error) => {
          register.dismiss().then(() => {
            let msg = MessageDisplayUtil.getErrorMessage(error, "Error occured while registering for this comptetition. Try again later.");
            MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 5000, "bottom");
          });

        });
    });

  }

  private _conditionalRegister(msg: string) {
    let confirmOverlap = this.alertCtl.create({
      title: "Competition Registration",
      message: msg + ". Do you want to still register for this competition ?",
      buttons: [
        {
          text: "No",
          role: "Cancel",
          handler: () => {
            confirmOverlap.dismiss();
            return false;
          }
        },
        {
          text: "Register",
          handler: () => {
            confirmOverlap.dismiss(true);
            return false;
          }
        }
      ]
    });
    confirmOverlap.onDidDismiss((data) => {
      if (data) {
        this.register(true);
      }
    });
    confirmOverlap.present();
  }

  onDeregisterClick() {
    let alert = this.alertCtl.create({
      //title: 'Confirm de-register',
      title: 'De-Register',// 'Confirm to de-register from this competition?',
      message: 'Are you sure you want to de-register from this competition?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            alert.dismiss();
            return false;
          }
        },
        {
          text: 'Yes',
          handler: () => {
            alert.dismiss().then(() => {
              this.deregister();
            });
            return false;
          }
        }
      ]
    });
    alert.present();
  }

  deregister() {
    let busy = this.loadingCtl.create({
      content: "Deregistering..."
    });
    busy.present().then(() => {
      this.compService.deregister(this.competition.competitionId, this.session.playerId)
        .subscribe((result: ServerResult) => {
          busy.dismiss().then(() => {
            this.competition.registered = false;
            MessageDisplayUtil.showMessageToast(result.message, this.platform, this.toastCtl, 3000, "bottom");
            this.refreshPlayers();
          });
        }, (error) => {
          let msg = MessageDisplayUtil.getErrorMessage(error, "Error de-registering from competition. Try again later.");
          MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 5000, "bottom");
        });
    });

  }

  /**
   * Refresh the competition details from the server
   * @param refresher
   */

  selectGameRound(roundNo) {
    this.gameRound = this.details.gameRounds.filter((gr: GameRoundInfo, idx: number) => {
      return gr.roundNo == roundNo;
    }).pop();
    return this.gameRound;
  }

  checkRoundInProgress() {
    if (this.competition.status == 'In Progress') {
      if (this.gameRound.roundNo == this.currentRound) {
        if (this.gameRound.status == "Pending" || this.gameRound.status == "InProgress")
          return true;
        else return false;
      }

    }
    else return false;
  }

  checkRoundCompleted() {
    //let gameRound = this.selectGameRound(this.currentRound)
    //console.log("Current Round:"+this.gameRound.status)

    if (this.competition.status == 'Completed') {
      return true
    }
    else if (this.competition.status == 'In Progress') {
      if (this.gameRound && this.gameRound.status == "Completed")
        return true;

    }
  }

  onDescriptionClick() {
    let modal = this.modalCtl.create(DescriptionBoxPage, {
      title: this.competition.competitionName,
      headerName: 'Description',
      description: this.competition.description
    });
    // let modal = this.modalCtl.create(CompetitionDescriptionPage, {competition: this.competition});
    modal.present();
  }

  onRulesClick() {
    // let modal = this.modalCtl.create(CompetitionRulesPage, {competition: this.competition});
    let modal = this.modalCtl.create(DescriptionBoxPage, {
      title: this.competition.competitionName,
      headerName: 'Competition Rules',
      description: this.competition.rules
    });
    modal.present();
  }

  onCourseClick() {
    let modal = this.modalCtl.create(CoursesDisplayPage, {
      competition: this.competition,
      headerName: 'Courses Play',
      gameRound: this.details.gameRounds
    });
    modal.present();
  }

  private getPlayerMembership(clubName: string) {
    let selectedClubName: string = "";
    let loader = this.loadingCtl.create({
      showBackdrop: false
    });
    loader.onDidDismiss((data: Array<ClubMembership>) => {
      console.log("Loader dismiss data:", data);
      if (data) {
        this.clubName = data.map((membership: ClubMembership, idx: number) => {
          //return membership.homeClub
          return membership.club.clubName = clubName;
        }).pop();

        selectedClubName = this.clubName;
        console.log("This clubName:", this.clubName);
        console.log("clubName passed:", clubName);
        console.log("selectedClubName:", selectedClubName);
        if (this.clubName == clubName) this.register();
        else this.onClubRegisterClick(this.competition.clubId);
      }
      else return false;

    });
    loader.present();
    this.playerService.getPlayerMemberships()
      .subscribe((memberships: Array<ClubMembership>) => {
        this.memberships = memberships;

        // this.clubIds = [];
        // memberships.forEach((m: ClubMembership) => {
        //     this.clubIds.push(m.club.clubId);
        // });
      }, (error) => {
        let msg = MessageDisplayUtil.getErrorMessage(error);
        MessageDisplayUtil.displayErrorAlert(this.alertCtl, "Membership",
          msg, "OK");
        loader.dismiss(null)

      }, () => {
        loader.dismiss(this.memberships)
      });

  }

  prizeCount(): number {
    let prizeTotal = 0;

    if (this.details.prizes.length && this.details.teamPrizes.length)
      prizeTotal = this.details.teamPrizes.length + this.details.prizes.length;
    else if (this.details.teamPrizes.length)
      prizeTotal = this.details.teamPrizes.length;
    else if (this.details.prizes.length)
      prizeTotal = prizeTotal = this.details.prizes.length;

    return prizeTotal;
  }

  selectedRound(roundNo: number, fab: FabContainer) {
    fab.close();
    this.currentRound = roundNo;
    //  this.roundInfo = this.getSelectedRoundInfo();
    //this.doRefresh(null);
    //+ this.roundInfo.id
    this.gameRound = this.details.gameRounds.filter((gr: GameRoundInfo) => {
      return gr.roundNo == this.currentRound;
    }).pop();
    this.freshCompInfo = false;
    this._refreshCompetitionInfo(null);

  }

  goPayment() {
    let playerInfo: PlayerInfo;
    this.playerService.getPlayerInfo(this.session.playerId)
                .subscribe((player: PlayerInfo)=>{
                  let modal = this.modalCtl.create(CompetitionPaymentConfirm,
                    {
                      details: this.details,
                      competition: this.competition,
                      player: player
                    });
              
                    modal.onDidDismiss((data: any) => {
                      if(data) {
                        if(data.paid.toLowerCase() === 'paid' && data.success ){
                          this.register();
                        }
                      }
                    })
                    modal.present();
                });
    console.log("go payment player - ", playerInfo, "| session - ", this.session.playerId)

    

    // modal.onDidDismiss((data: any) => {
    //     console.log("[Dismiss] Scorecard : ", data)
    //     if (data) {
    //         console.log("scorecard after : ",data)
    //         if(data.type === 'testCall') {
    //             // this.testCall();
    //         } else if(data.type === 'getRemoteCollections') {
    //             this.getRemoteCollections(data.collectionId);
    //         }else if(data.type === 'getLocalCollections') {
    //             this.getLocalCollections(data.collectionId);
    //         } else if(data.type === 'getBill') {
    //             this.getBill(data.billId);
    //         } else if(data.type === 'createBill') {
    //             this.createBill(data.collectionId);
    //         } else if(data.type === 'createRemoteBill') {
    //             this.createRemoteBill(data.collectionId);
    //         }
    //         // this.scorecard = data.scorecard
    //         // this._onCurrentHoleChange();
    //     }
    // });
    
  }

  getTestCallAPI() {
    this.compService.testAPIcall()
    .subscribe((data) => {

    });

    }
    getPlayerStatus() {
      if(!this.flights) return false;
      if(!this.player$) return false;
      let _player: PlayerInfo;
      this.player$.take(1).subscribe((player)=>{
        _player = player;
      });
      let _playerInFlight: FlightInfo; //Array<FlightInfo>;
      let _playerStatus: any; //Array<FlightMember>;

      this.flights.filter((flight: FlightInfo)=>{
        return flight.playerFlight
        // _playerInFlight = flight.flightMembers.filter((flightMember)=>{
        //   return flightMember.playerId === _player.playerId
        // })
      }).map((flight: FlightInfo)=>{
        _playerInFlight = flight;
      });
      if(_playerInFlight && _playerInFlight.flightMembers.length > 0) {
        _playerInFlight.flightMembers.filter((member: any)=>{
          return member.playerId === _player.playerId
        })
        .map((member: any)=>{
          _playerStatus = member;
        })
        
      console.log("get player status ", _player, this.flights, _playerInFlight, _playerStatus)
        if(_playerStatus) {
          return _playerStatus.status
        } else return false;

      } else return false;
    }

    goLeagueScorecard() {
      this.nav.push(LeagueScorecardPage, {
        competition: this.competition,
        leaderboards: this.leaderBoard,
        leaderboardPlayers: this.leaderBoard.players,
        roundNo: this.currentRound,
        categories: this.details.categories,
        teams: this.competition.teamEvent ? null : null,
        showTeam: this.showTeam
      });
    }

    goLeagueLeaderboard() {
      this.nav.push(LeagueLeaderboardPage, {
        competition: this.competition,
        leaderboards: this.leaderBoard,
        leaderboardPlayers: this.leaderBoard.players,
        roundNo: this.currentRound,
        categories: this.details.categories,
        teams: this.competition.teamEvent ? null : null,
        showTeam: this.showTeam
      });
      
    }

    isCompetitionEclectic() { 
      return this.isEclectic;
      // this.flightService.checkLeagueCompetition(this.compId)
      // .subscribe((data)=>{
      //   console.log("check eclectic : ", data)
      //   return data;
      // })
    }

    goLeagueMenu() {
      this.nav.push(CompetitionLeagueMenuPage, {
        competition : this.competition,
        compId  : this.compId
      });
    }

    
}
