import {
    ActionSheetController,
    LoadingController,
    NavController,
    NavParams,
    Platform,
    ToastController
} from 'ionic-angular';
import {Keyboard} from '@ionic-native/keyboard';
import {Component, Renderer} from '@angular/core';
import {RemoteHttpService} from '../../../remote-http';
import {AuthenticationService} from '../../../authentication-service';
import {CompetitionInfo, CompetitionPlayerInfo, CompetitionCategory} from '../../../data/competition-data';
import {CompetitionService} from '../../../providers/competition-service/competition-service';
import {adjustViewZIndex} from '../../../globals';
import {MessageDisplayUtil} from '../../../message-display-utils';
import {SessionInfo} from '../../../data/authentication-info';
import {SessionDataService} from '../../../redux/session/session-data-service';
import { isBlank } from 'ionic-angular/util/util';
/*
 Generated class for the CompetitionPlayersPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'competition-players.html',
    selector: 'competition-players-page'
})
export class CompetitionPlayersPage
{
  
    appFooterHide: boolean = true;
    //private actionSheet: ActionSheet;
    public competition: CompetitionInfo;
    public players: Array<CompetitionPlayerInfo>         = new Array<CompetitionPlayerInfo>();
    public filteredPlayers: Array<CompetitionPlayerInfo> = new Array<CompetitionPlayerInfo>();
    public roundNo: number;
    public visible: boolean;
    public searchQuery: string                           = '';

    public sortBy: string                                = 'name';
    public sortByBoolean: boolean;
    public sortByDisplay: string                         = '';
    public sortToggle: boolean                           = true;
    public categories: Array<CompetitionCategory> = new Array<CompetitionCategory>();
    public showCategoryName: string;

    constructor(public nav: NavController,
        private renderer: Renderer,
        private keyboard: Keyboard,
        private toastCtl: ToastController,
        public navParams: NavParams,
        private http: RemoteHttpService,
        private loadingCtl: LoadingController,
        private actionSheetCtl: ActionSheetController,
        private auth: AuthenticationService,
        private platform: Platform,
        private sessionService: SessionDataService,
        private compService: CompetitionService) {
        this.nav             = nav;
        this.competition     = navParams.get("competition");
        this.players         = navParams.get("players");
        this.roundNo         = navParams.get("roundNo");
        this.categories         = navParams.get("categories");
        this.visible         = false;
        this.searchQuery     = '';
        this.filteredPlayers = this.players;
        this.showCategoryName = "All Categories";


        this.sortBy        = 'name';
        this.sortByBoolean = false;
        this.sortByDisplay = 'Handicap';
    }

    ionViewDidEnter() {
        adjustViewZIndex(this.nav, this.renderer);


    }

    onRefreshClick(filter, refresher) {
        let loader = this.loadingCtl.create({
            content: 'Loading player list, Please wait...'
        });

        loader.present().then(() => {
            this.compService.getPlayersRegistered(this.competition.competitionId, this.sortBy)
                .subscribe((players: CompetitionPlayerInfo[]) => {
                        loader.dismiss().then(() => {
                            this.players         = players;
                            this.filteredPlayers = this.players;

                            this.onSearchCancel();
                            this.searchQuery = "";
                        })
                    }, (error) => {
                        loader.dismiss().then(() => {
                            let msg = MessageDisplayUtil.getErrorMessage(error, "Error refreshing the registered players");
                            MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 5000, "bottom");
                        })
                    },
                    () => {
                        if (refresher) refresher.complete();
                        if (filter)
                            this.onSearchInput(null);
                        if (this.platform.is('ios') && this.platform.is('cordova'))
                            this.keyboard.close();
                    })
        });

    }

    toggle(searchBar, search) {
        console.log(this.visible)
        this.visible = searchBar;
        //searchBar.setFocus();
        if (this.visible) {
            console.log("set focus toggle")
        }
    }

    onSearchCancel() {
        this.toggle(false, null);
    }

    onHomeClick() {
        this.nav.popToRoot();//this.nav.setRoot(PlayerHomePage);
    }

    onSearchInput(searchbar) {
        if (this.searchQuery && this.searchQuery.length > 0)
            this.filteredPlayers = this.players.filter((p: CompetitionPlayerInfo) => {
                return p.playerName.toLowerCase().indexOf(this.searchQuery.toLowerCase()) >= 0;
            });
        else this.filteredPlayers = this.players;
        this.showCategoryName = 'All Categories'
    }

    toggleSortDisplay(str: string) {
        // this.sortByBoolean = !this.sortByBoolean;
        // if (this.sortByBoolean) {
        //     this.sortBy        = 'handicap';
        //     this.sortByDisplay = 'Name';
        // }
        // else {
        //     this.sortBy        = 'name';
        //     this.sortByDisplay = "Handicap";
        // }
        // if (this.sortBy == 'name') {
        //     this.sortToggle = true;
        // } else if (this.sortBy == 'handicap') {
        //     this.sortToggle = false;
        // }
        if(this.sortBy !== str){
            this.sortBy = str;
            this.onRefreshClick(true, null);
        }


    }

    getSortBy(sortBy: string) { // defining class

        if (sortBy == 'name' && this.sortBy == 'name')
            return "sortedBy";
        if (sortBy == 'handicap' && this.sortBy == 'handicap')
            return "sortedBy";

    }

    public onMenuSortClick() {
        console.log('Sort click');
        let actionSheet = this.actionSheetCtl.create({
            buttons: [
                {
                    text    : 'Sort By : ' + this.sortByDisplay,
                    role    : 'destructive',
                    cssClass: 'sort-by',
                    handler : () => {
                        actionSheet.dismiss()
                                   .then(() => {
                                       this.toggleSortDisplay("");
                                   });

                        //    console.log('Sign Out clicked');
                        return false;
                    }
                },
                {
                    text   : 'Cancel',
                    role   : 'cancel', // will always sort to be on the bottom
                    icon   : !this.platform.is('ios') ? 'close' : null,
                    handler: () => {
                        console.log('Cancel clicked');
                        actionSheet.dismiss()
                        return false;
                    }
                }
            ]
        });
        actionSheet.present();
    }

    getFlagUrl(flagUrl: string) {
        if(flagUrl === null || isBlank(flagUrl) ) return null
        else {
            let flagIcon = flagUrl.split("/")
            // return "img/flag/"+flagUrl.split[2]
            return "img/flag/"+flagIcon[2]

        }
    }

    public checkScoringCategory() {
        let hasScoringCategory: boolean = false;
        this.categories.forEach((c: CompetitionCategory) => {
          if (c.forGrouping) {
            console.log("check:",c);
            hasScoringCategory = true;
            // return c.forGrouping
          }
    
        })
        return hasScoringCategory;
      }

      public openCategory() {
          console.log("open category", this.categories)
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
                //   this.selectedCategoryId = "";
                //   this._setLeaderboardFilter();

                console.log("category selected")
                  this.showCategoryName = tempCategoryName
                  this.filteredPlayers = this.players;
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
                      this.filteredPlayers = this.players.filter((p: CompetitionPlayerInfo) => {
                          return p.category === c.categoryName;
                      })
                    //   this.selectedCategoryId = String(c.categoryId);
                    //   this._setLeaderboardFilter();
    
    
                    });
                  return false;
                }
              });
          }
        });
        actionSheet.present();
    
      }
}
