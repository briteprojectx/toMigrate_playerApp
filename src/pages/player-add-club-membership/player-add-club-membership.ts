import {NavController, Events, AlertController, LoadingController} from "ionic-angular";
import {Component, Renderer} from "@angular/core";
import {getDistanceInKM, adjustViewZIndex} from "../../globals";
import {ClubInfo} from "../../data/club-course";
import {GeolocationService} from "../../providers/geolocation-service/geolocation-service";
import {ClubService} from "../../providers/club-service/club-service";

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
    templateUrl: 'player-add-club-membership.html'
})
export class AddClubMembershipPage
{
    public refresher: any;
    public infinite: any;
    public searchQuery: string = "";

    public recentClubs: Array<ClubInfo>;
    public nearByClubs: Array<ClubInfo>;

    constructor(private nav: NavController,
        private renderer: Renderer,
        private alertCtl: AlertController,
        private geo: GeolocationService,
        private clubService: ClubService,
        private events: Events,
        private loadingCtl: LoadingController) {
        this.recentClubs = new Array<ClubInfo>();
        this.nearByClubs = new Array<ClubInfo>();

    }

    ionViewDidLoad() {
        this._refreshValues();
    }

    ionViewDidEnter() {
        adjustViewZIndex(this.nav, this.renderer);
    }

    onSearchInput(searchbar) {
        this._refreshValues();
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
        this.refresher = refresher;
        this._refreshValues();
    }

    clubSelected(event, item: ClubInfo) {
        this.events.publish("clubSelected", item);
        this.clubMembershipNumberPrompt();
    }

    private _refreshValues() {
        let loader = this.loadingCtl.create({});

        loader.present().then(() => {
            this.clubService.getRecentClubs(0)
                .subscribe((recentClubs: Array<ClubInfo>) => {

                    this.clubService.getNearbyClubs(3000)
                        .subscribe((nearbyClubs: Array<ClubInfo>) => {
                            loader.dismiss().then(() => {
                                this.recentClubs = recentClubs;
                                this.nearByClubs = nearbyClubs;
                            })
                        }, (error) => {
                            loader.dismiss();
                            console.log(error);
                        }, () => {
                            if (this.refresher) {
                                this.refresher.complete();
                                this.refresher = null;
                            }
                        });
                }, (error) => {
                    loader.dismiss();
                    console.log(error);
                }, () => {
                    if (this.refresher) {
                        this.refresher.complete();
                        this.refresher = null;
                    }
                });
        })

    }

    clubMembershipNumberPrompt() {
        let prompt = this.alertCtl.create({
            title  : 'Club Membership',
            message: "Enter your club Membership Number",
            inputs : [
                {
                    name       : 'membershipNumber',
                    placeholder: 'Membership Number'
                },
            ],
            buttons: [
                {
                    text   : 'Cancel',
                    handler: data => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text   : 'Save',
                    handler: data => {
                        this.nav.pop();
                    }
                }
            ]
        });
        prompt.present();
    }
}
