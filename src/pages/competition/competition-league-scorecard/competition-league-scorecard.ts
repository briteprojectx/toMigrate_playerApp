import {
  ActionSheetController,
  AlertController,
  Events,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  Platform,
  ToastController
} from 'ionic-angular';
import { isPresent } from 'ionic-angular/util/util';
import { Keyboard } from '@ionic-native/keyboard';
import { Component, Renderer2 } from '@angular/core';
//external libraries
import { MessageDisplayUtil } from '../../../message-display-utils';
//data
import {
  CompetitionCategory,
  CompetitionDetails,
  CompetitionInfo,
  CompetitionTeams,
  createLeaderboardDetails,
  Leaderboard,
  LeaderboardPlayer,
  Teams
} from '../../../data/competition-data';
import { SearchCriteria } from '../../../data/search-criteria';
import { PlainScorecard } from '../../../data/scorecard';
//providers/services
import { CompetitionService } from '../../../providers/competition-service/competition-service';
import { ScorecardService } from '../../../providers/scorecard-service/scorecard-service';
import { AuthenticationService } from '../../../authentication-service';
//pages
import { ScorecardDisplayPage } from '../../scorecard-display/scorecard-display';
import { adjustViewZIndex } from '../../../globals';
import { ConnectionService } from '../../../providers/connection-service/connection-service';
import { SessionInfo } from '../../../data/authentication-info';
import { SessionDataService } from '../../../redux/session/session-data-service';
import { SessionActions } from '../../../redux/session/session-actions';
import { LeaderboardFiltersPage } from '../competition-leaderboard/competition-leaderboard-filter/competition-leaderboard-filter';
import { ClubFlightService } from '../../../providers/club-flight-service/club-flight-service';
import { LeagueScorecards, LeagueRoundDetails, PlayerRoundScores, EclecticPlayerScore, EclecticPlayerRound, LeagueRound} from '../../../data/mygolf.data';
/*
 Generated class for the Competition prizes page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'competition-league-scorecard.html',
  selector: 'competition-league-scorecard-page'
})
export class LeagueScorecardPage {
  searchCriteria: SearchCriteria;
  competition: CompetitionInfo;
  leaderboards: Leaderboard;
  filteredPlayers: Array<LeaderboardPlayer> = new Array<LeaderboardPlayer>();
  //leaderboardPlayers: Array<LeaderboardPlayer> =  new Array<LeaderboardPlayer>();
  leaderboardPlayers: Array<LeaderboardPlayer> = new Array<LeaderboardPlayer>();
  roundNo: number = 1;
  searchQuery: string = '';
  visible: boolean;

  categories: Array<CompetitionCategory> = new Array<CompetitionCategory>();
  selectedCategoryName: string = '';
  scoringFormat: string;
  details: CompetitionDetails;
  selectedOrderBy: number;
  category: Array<CompetitionCategory> = new Array<CompetitionCategory>();
  errorObj: Leaderboard;

  showSortBy: string = "Gross";
  showCategoryName: string;
  showRoundNo: string = "Overall";

  selectedSortBy: number = 2;
  selectedCategoryId: string = '';
  selectedRoundNo: number;

  scorecard: PlainScorecard;

  compTeams: CompetitionTeams;

  private needRefresh: boolean = true;

  sortToggle: boolean = true;

  refreshedAttempt: boolean = false;

  hideHomeButton: boolean = false;
  showLogout: boolean = false;
  doneRefresh: boolean = false;
  errorMsg: string = "";
  session: SessionInfo;

  showTeam: boolean = false;
  showEventMode: string = "";

  scorecardView: number = 2;

  leagueScorecards: LeagueScorecards;
  compSeasonId: number;
  currentSeasonRound: LeagueRound;
  leagueRounds: Array<LeagueRound>;
  constructor(public nav: NavController,
    private renderer: Renderer2,
    private keyboard: Keyboard,
    private connService: ConnectionService,
    public navParams: NavParams,
    private modalCtl: ModalController,
    private loadingCtl: LoadingController,
    private toastCtl: ToastController,
    private actionSheetCtl: ActionSheetController,
    private auth: AuthenticationService,
    private compService: CompetitionService,
    private events: Events,
    private platform: Platform,
    private sessionService: SessionDataService,
    private sessionActions: SessionActions,
    private scorecardService: ScorecardService,
    private alertCtrl: AlertController,
    private flightService: ClubFlightService) {
    // super();

    this.nav = nav;
    this.searchCriteria = compService.getSearch();
    this.showCategoryName = "All Categories";
    this.hideHomeButton = navParams.get("hideHomeButton");
    this.showLogout = navParams.get("showLogout");
    if (!isPresent(this.searchCriteria.competitionLeaderboardSortBy))
      this.searchCriteria.competitionLeaderboardSortBy = 2;
    this.selectedOrderBy = 2;//this.searchCriteria.competitionLeaderboardSortBy;
    this.selectedSortBy = this.selectedOrderBy;

    if (!isPresent(this.searchCriteria.competitionLeaderboardGroupBy)) {
      this.searchCriteria.competitionLeaderboardGroupBy = '';
    }
    this.searchQuery = '';
    this.visible = false;

    this.compSeasonId = navParams.get("compSeasonId");


    if (navParams.get("leaderboards")) {

      this.competition = navParams.get("competition");
      this.scoringFormat = this.competition.scoringFormat;
      this.leaderboards = navParams.get("leaderboards");
      this.leaderboardPlayers = navParams.get("leaderboardPlayers");
      this.filteredPlayers = this.leaderboardPlayers;
      this.roundNo = navParams.get("roundNo");
      this.selectedRoundNo = this.roundNo;
      this.showRoundNo = "Round " + String(this.roundNo);

      this.categories = navParams.get("categories");
      console.log("from competition details");
      this.compService.setLeaderboardFilter(
        this.selectedOrderBy,
        this.roundNo
      );
      if (this.competition.teamEvent) {
        // this.showCategoryName = "All Teams";
        // this.compTeams        = navParams.get("teams");
        this.showTeam = navParams.get("showTeam");
        if(this.showTeam)
          this.showEventMode = "View Individual";
          else
          this.showEventMode = "View Teams";
      }
      // this.refreshLeaderboard(null);
    } else {
      this.competition = navParams.get("competition");
      this.roundNo = navParams.get("roundNo");
      this.selectedRoundNo = this.roundNo;
      this.showRoundNo = "Round " + String(this.roundNo);

      this.scoringFormat = this.competition.scoringFormat;
      // this.refreshCompetitionDetails();
      console.log("from scoring");

    }
    this.leaderboards = createLeaderboardDetails();
    this.errorObj = createLeaderboardDetails();
  }

  ionViewDidLoad() {


    if (this.needRefresh) {
      if (!this.navParams.get("leaderboards"))
        this._setLeaderboardFilter(); // this.refreshLeaderboard(null);
      else {
        this._setLeaderboardFilter(true);
        this.refreshCompetitionDetails();

      }
    }
    this.refreshLeagueScorecards();

  }

  toggleTeamEvent() {
    if(this.showTeam){
      this.showTeam = false;
      this.showEventMode = 'View Teams';
    } else if (!this.showTeam) {
      this.showTeam = true;
      this.showEventMode = 'View Individuals';
    }
    this._setLeaderboardFilter();
  }
  async deriveSession() {
    this.session = await this.sessionService.getSession().toPromise();
  }
  toggleSearch() {
    this.visible = !this.visible; //searchBar;//
  }

  onSearchCancel() {
    this.toggleSearch();
    if (this.platform.is('ios') && this.platform.is('cordova'))
      this.keyboard.close();
  }

  onOptionClick() {
    console.log(this.categories, this.competition.totalRounds, this.roundNo, this.competition.competitionId, this.scoringFormat);
    let option = this.modalCtl.create(LeaderboardFiltersPage, {
      categories: this.categories,
      totalRounds: this.competition.totalRounds,
      currentRound: this.roundNo,
      compId: this.competition.competitionId,
      scoringFormat: this.scoringFormat
    });
    // option.onDidDismiss((roundNumber: number, category: Array<CompetitionCategory>) => {
    option.onDidDismiss((data: any) => {
      if (data.roundNumber >= 0) {
        this.roundNo = data.roundNumber;
        this.onRefreshClick(null);
      }
      this.category = data.selectedCategory;//category;
      console.log("Selected Category:", this.category);
    });
    option.present()

  }
  logout() {
    this.sessionActions.logout();
  }
  public onHomeClick() {
    this.nav.popToRoot();//this.nav.setRoot(PlayerHomePage);
    console.log("onHomeClick")
  }

  onRefreshClick(refresher) {
    // this.refreshLeaderboard(refresher);
    this.refreshLeagueScorecards();
  }

  onSearchInput(searchbar) {
    if (this.searchQuery && this.searchQuery.length > 0)
      this.filteredPlayers = this.leaderboardPlayers.filter((p: LeaderboardPlayer) => {
        return (p.lastName.toLowerCase() + " " + p.firstName.toLowerCase()).indexOf(this.searchQuery.toLowerCase()) >= 0;
      });
    else this.filteredPlayers = this.leaderboardPlayers;

  }

  private refreshLeaderboard(refresher) {
    console.log("onRefreshClick() - START");


    let loader = this.loadingCtl.create({
      content: 'Refreshing Scorecards. Please wait...'
    });
    this.leaderboards = createLeaderboardDetails();
    this.errorObj = createLeaderboardDetails();
    this.refreshedAttempt = false;

    loader.present().then(() => {
      this.compService.getLeaderboard(this.competition.competitionId)
        .subscribe((leaderboards: Leaderboard) => {
          loader.dismiss().then(() => {
            this.refreshedAttempt = true;

            this.leaderboards = leaderboards;
            this.leaderboardPlayers = this.leaderboards.players;
            this.filteredPlayers = this.leaderboardPlayers;
            console.log("Success:", this.leaderboards);
            this.doneRefresh = true;

          })

        }, (error) => {
          loader.dismiss();
          this.doneRefresh = false;
          this.errorObj = error;
          // let msg = "";
          console.log("Error obj:", this.errorObj);
          if (refresher) refresher.complete();
          if (!this.connService.isConnected()) {
            this.errorMsg = "Loading leaderboard failed because your internet connection is down";
          }
          else
            this.errorMsg = MessageDisplayUtil.getErrorMessage(error,
              "Loading leaderboard timed out. Please refresh");

          MessageDisplayUtil.showErrorToast(this.errorMsg, this.platform, this.toastCtl, 5000, "bottom");
        }, () => {
          if (refresher) refresher.complete();

          if (this.platform.is('ios') && this.platform.is('cordova'))
            this.keyboard.close();
        });
    })

  }

  private refreshCompetitionDetails() {
    let loader = this.loadingCtl.create({
      content: 'Please wait...'
    });

    this.refreshedAttempt = false;
    loader.present().then(() => {
      this.compService.getDetails(this.competition.competitionId)
        .subscribe((details: CompetitionDetails) => {
          this.details = details;
          this.categories = this.details.categories;
          this.compService.getLeaderboard(this.competition.competitionId)
            .subscribe((leaderboards: Leaderboard) => {
              loader.dismiss().then(() => {
                this.refreshedAttempt = true;
                this.leaderboards = leaderboards;
                this.leaderboardPlayers = this.leaderboards.players;
                this.filteredPlayers = this.leaderboardPlayers;
                console.log("Success:", this.leaderboards);

              })

            }, (error) => {
              loader.dismiss();
              this.errorObj = error;
            }, () => {
              if (this.platform.is('ios') && this.platform.is('cordova'))
                this.keyboard.close();
              // if (this.leaderboards.totalInPage == 0) console.log("xdo sini hah");
              // console.log("complete:", this.leaderboards)
              // console.log("complete error:", this.errorObj)
            });
        }, (error) => {
          loader.dismiss().then(() => {
            MessageDisplayUtil.showErrorToast("Error getting competition details", this.platform,
              this.toastCtl, 3000, "bottom");
          });

        }, () => {

        });
    }, (error) => {
      console.log("Error Object: " + JSON.stringify(error));
    });

  }

  private _setLeaderboardFilter(firstRefresh = false) {
    let selectedRoundNo;
    console.log("Show Team:" + this.showTeam);
    if (this.selectedRoundNo == 0)
      selectedRoundNo = '';
    else if (this.competition.totalRounds == 1)
      selectedRoundNo = '';
    else selectedRoundNo = this.selectedRoundNo;
    this.compService.setLeaderboardFilter(
      this.selectedSortBy,
      selectedRoundNo,
      this.selectedCategoryId,
      this.showTeam
      // this.competition.teamEvent
    );
    if (!firstRefresh)
      this.refreshLeaderboard(null);
    // this.refreshCompetitionDetails();
  }

  public openCategory() {
    let actionSheet = this.actionSheetCtl.create({
      buttons: [

        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom
          icon: !this.platform.is('ios') ? 'close' : null,
          handler: () => {
            actionSheet.dismiss();
            return false;
          }
        }
      ]
    });
    let tempCategoryName = "";
    if (this.categories.length > 0)
      tempCategoryName = "All Categories";
    else tempCategoryName = "No Category";
    actionSheet.addButton(
      {
        text: tempCategoryName,
        role: 'destructive',
        icon: 'filter',
        handler: () => {
          actionSheet.dismiss()
            .then(() => {
              this.selectedCategoryId = "";
              this._setLeaderboardFilter();
              this.showCategoryName = tempCategoryName

            });
          return false;
        }
      });

    this.categories.forEach((c: CompetitionCategory) => {
      // console.log(c)

      if (c.forGrouping) {
        actionSheet.addButton(
          {
            text: c.categoryName + " (" + c.fromHandicap +" - "+c.toHandicap +")",
            role: 'destructive',
            icon: 'filter',
            handler: () => {
              actionSheet.dismiss()
                .then(() => {

                  console.log(c)
                  this.showCategoryName = c.categoryName + " (" + c.fromHandicap +" - "+c.toHandicap +")";
                  this.selectedCategoryId = String(c.categoryId);
                  this._setLeaderboardFilter();


                });
              return false;
            }
          });
      }
    });
    actionSheet.present();

  }

  public openSortBy() {
    // this.showSortBy = "";
    let actionSheet = this.actionSheetCtl.create({
      buttons: [
        {
          text: 'Gross',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'exit' : null,
          handler: () => {
            actionSheet.dismiss()
              .then(() => {
                this.toggleSortBy("gross");
              });
            return false;

          }
        }, {
          text: 'Net',
          icon: !this.platform.is('ios') ? 'cog' : null,
          handler: () => {
            actionSheet.dismiss()
              .then(() => {
                this.toggleSortBy("net");
              });

            return false;
          }
        },
        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom
          icon: !this.platform.is('ios') ? 'close' : null,
          handler: () => {
            actionSheet.dismiss();
            return false;
          }
        }
      ]
    });

    actionSheet.present();
  }

  public openRound() {
    // this.showRoundNo = "";
    let actionSheet = this.actionSheetCtl.create({
      buttons: [

        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom
          icon: !this.platform.is('ios') ? 'close' : null,
          handler: () => {
            actionSheet.dismiss();
            return false;
          }
        }
      ]
    });
    let roundNo = this.competition.totalRounds;

    actionSheet.addButton(
      {
        text: 'Overall',
        role: 'destructive',
        icon: !this.platform.is('ios') ? 'exit' : null,
        handler: () => {
          actionSheet.dismiss()
            .then(() => {
              this.showRoundNo = "Overall";
              this.selectedRoundNo = 0;
              this.roundNo = 0;
              this._setLeaderboardFilter();


            });
          return false;

        }
      });
    for (let i = 1; i <= roundNo; i++) {
      actionSheet.addButton(
        {
          text: 'Round ' + i,
          role: 'destructive',
          icon: 'filter',
          handler: () => {
            actionSheet.dismiss()
              .then(() => {

                this.showRoundNo = "Round " + i;
                this.selectedRoundNo = i;
                this.roundNo = i;
                this._setLeaderboardFilter();


              });
            return false;

            //  this.goScorecard();
          }
        });
    }

    actionSheet.present();
  }

  getSortBy(sortBy: string) { // defining class

    if (sortBy == 'gross' && this.searchCriteria.competitionLeaderboardSortBy == 2)
      return "sortedBy";
    if (sortBy == 'net' && (this.searchCriteria.competitionLeaderboardSortBy == 3 || this.searchCriteria.competitionLeaderboardSortBy == 4))
      return "sortedBy";

  }

  toggleSortBy(sortBy: string) {
    if (this.showSortBy.toLowerCase() == sortBy) return false;

    if (sortBy == 'gross') {
      this.showSortBy = "Gross"
      this.selectedSortBy = 2;
      this._setLeaderboardFilter();
      this.sortToggle = true;

    } else if (sortBy == 'net') {
      if (this.scoringFormat != "Stableford" && this.scoringFormat != "Peoria")
        this.selectedSortBy = 3;
      if (this.scoringFormat == "Stableford" || this.scoringFormat == "Peoria")
        this.selectedSortBy = 4;
      this.showSortBy = "Net"
      this.sortToggle = false;

      this._setLeaderboardFilter();

    }

  }

  getPlayerScorecard(playerId: string) {
    let loader = this.loadingCtl.create({
      dismissOnPageChange: true,
      showBackdrop: false,
      cssClass: "nobg"
    });
    loader.present().then(() => {
      this.scorecardService.getCompetitionScorecard(this.competition.competitionId, this.selectedRoundNo, Number(playerId), true)
        .subscribe((scorecard: PlainScorecard) => {
          loader.dismiss().then(() => {
            let subTitle = "No scorecard to display";
            if (scorecard) {
              this.nav.push(ScorecardDisplayPage, {
                scorecard: scorecard,
                editing: true
              });
            } else MessageDisplayUtil.displayInfoAlert(this.alertCtrl, "", subTitle, "OK");
            console.log(scorecard);

          });
        }, (error) => {
          loader.dismiss().then(() => {
            let subTitle = "No scorecard to display";
            MessageDisplayUtil.displayInfoAlert(this.alertCtrl, "", subTitle, "OK");
          });

        }, () => {

        });
    });

  }

  public openTeams() {
    let actionSheet = this.actionSheetCtl.create({
      buttons: [

        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom
          icon: !this.platform.is('ios') ? 'close' : null,
          handler: () => {
            actionSheet.dismiss();
            return false;
          }
        }
      ]
    });
    let tempTeamName = "";
    if (this.compTeams.totalItems > 0)
      tempTeamName = "All Teams";
    else tempTeamName = "No Team";
    actionSheet.addButton(
      {
        text: tempTeamName,
        role: 'destructive',
        icon: 'filter',
        handler: () => {
          actionSheet.dismiss()
            .then(() => {
              this.selectedCategoryId = "";
              this._setLeaderboardFilter();
              return false;
            });

          //  this.goScorecard();
        }
      });

    this.compTeams.competitionTeams.forEach((c: Teams) => {
      // console.log(c)

      // if (c.forGrouping) {
      actionSheet.addButton(
        {
          text: c.teamName,
          role: 'destructive',
          icon: 'filter',
          handler: () => {
            actionSheet.dismiss()
              .then(() => {

                console.log(c)
                this.showCategoryName = c.teamName;
                this.selectedCategoryId = String(c.teamId);
                this._setLeaderboardFilter();

                return false;
              });

            //  this.goScorecard();
          }
        });
      // }
    });
    actionSheet.present();

  }

  checkScoringCategory() {
    let hasScoringCategory: boolean = false;
    this.categories.forEach((c: CompetitionCategory) => {
      if (c.forGrouping) {
        // console.log("check:",c);
        hasScoringCategory = true;
        // return c.forGrouping
      }

    })
    return hasScoringCategory;
  }

  changeScorecardView(view: number) {
    this.scorecardView = view;
  }

  refreshLeagueScorecards(compId?: number) {
    let _compId;
    if(compId) _compId = compId;
    else _compId = this.competition.competitionId
    this.flightService.getLeagueScorecards(_compId)
    .subscribe((data: LeagueScorecards)=>{
      console.log("refresh league scorecards : ", data)
      if(data) {
        this.leagueScorecards = data;
        this.getLeagueRounds(this.compSeasonId);
        this.currentSeasonRound = data.leagueRound 
      }
    })
  }


  getLeagueRounds(seasonId: number) {
    this.flightService.getLeagueRounds(seasonId)
        .subscribe((data)=>{
          if(data) this.leagueRounds = data;
          console.log("league rounds : ", data)
        })
  }

  getScorecardHeader(attribute: string, whichNine: number) {
    if(!this.leagueScorecards) return; 
    let _details = this.leagueScorecards.leagueRoundDetails;
    if(_details && !_details.holeIndexes) return;
    if(_details && _details.holeIndexes.length === 0) return;
    if(!_details) return;
      // let _maxIdx = 9*whichNine;
      let _nine = 9;
      let _minNine = _nine*(whichNine - 1);

      let _indexes = _details.holeIndexes.filter((v,i)=>{
        if(whichNine === 1) return i<_nine
        else return i>= _minNine && i<_nine*whichNine
      });
      let _pars = _details.holePars.filter((v,i)=>{
        if(whichNine === 1) return i<_nine
        else return i>= _minNine && i<_nine*whichNine
      });
    switch(attribute) {
      // case 'holeNo':
      //   if(whichNine === 1) {
      //     return details.
      //   }
      
      case 'holeIndex':
        return _indexes;
      case 'holePar':
        return _pars;
    }
  }

  getScorecardScores(playerScores: Array<EclecticPlayerScore>, attribute: string, whichNine: number) {
    if(!this.leagueScorecards) return; 
    let _details = playerScores;
      // let _maxIdx = 9*whichNine;
      let _nine = 9;
      let _minNine = _nine*(whichNine - 1);

      let _scores: Array<EclecticPlayerScore> = _details.filter((v,i)=>{
        if(whichNine === 1) return i<_nine
        else return i>= _minNine && i<_nine*whichNine
      });
    switch(attribute) {
      // case 'holeNo':
      //   if(whichNine === 1) {
      //     return details.
      //   }
      
      case 'gross':
        return _scores;
      case 'net':
        return _scores;
    }
  }

  deriveClasses(scores: Array<EclecticPlayerScore>, idx: number, whichNine: number) {
    // let score = scores[idx];
    if(!this.leagueScorecards) return; 
    let _details = scores;
      // let _maxIdx = 9*whichNine;
      let _nine = 9;
      let _minNine = _nine*(whichNine - 1);

      let score: Array<EclecticPlayerScore> = _details.filter((v,i)=>{
        if(whichNine === 1) return i<_nine
        else return i>= _minNine && i<_nine*whichNine
      });
    if (score[idx].grossScore === 1)
        return "hole-in-one";
    // let diff   = (this.scoreDisplay === "Net")
    //     ? score.netScore - score.parScore
    //     : score.actualScore - score.parScore;
    let diff = score[idx].grossScore - score[idx].holePar
    let result = "";
    switch (diff) {
        case -3:
            result = "score-albatross";
            break;
        case -2:
            result = "score-eagle"
            break;
        case -1:
            result = "score-birdie";
            break;
        case 0:
            result = "score-par"
            break;
        case 1:
            result = "";
            break;
        case 2:
            result = "";
            break;
        case 3:
            result = "";
            break;
        default:
            result = ""
    }
    return result;
  }

  getBtnTbox(color: string) {
    let tboxStyle: string;

    if(color === 'White') {
        return 'button-teebox ' + 'button-teebox-white'
    } else return 'button-teebox'
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

  getAdjustedTotal(playerRound: EclecticPlayerRound) {
    let _scoringFormat = this.competition.scoringFormat;
    // if(_scoringFormat === 'Strokeplay') {
    //   return playerRound.
    // }
    // 'Stableford'
    return playerRound.totalNetAdj;
  }

  prevRound() {
    let _idx;
    this.leagueRounds.forEach((lr, idx)=>{
      if(lr.competitionId === this.currentSeasonRound.competitionId) {
        if(lr.roundNo === this.currentSeasonRound.roundNo) {
          _idx = idx;
        }
      }
    });
    if(_idx>=0) {
      this.refreshLeagueScorecards(this.leagueRounds[_idx-1].competitionId)
      // this.currentSeasonRound = this.leagueRounds[_idx-1];
    }
    
  }

  nextRound() {
    let _idx;
    this.leagueRounds.forEach((lr, idx)=>{
      if(lr.competitionId === this.currentSeasonRound.competitionId) {
        if(lr.roundNo === this.currentSeasonRound.roundNo) {
          _idx = idx;
        }
      }
    });
    if(_idx>=0) {
      this.refreshLeagueScorecards(this.leagueRounds[_idx+1].competitionId)
      // this.currentSeasonRound = this.leagueRounds[_idx-1];
    }
  }

  getTitle() {
    return 'Eclectic Scorecards';
  }

}
