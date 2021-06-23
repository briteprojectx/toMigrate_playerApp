import {NavController, Events, AlertController, LoadingController} from "ionic-angular";
import {Component, Renderer} from "@angular/core";
import {getDistanceInKM, adjustViewZIndex} from "../../globals";
import {MessageDisplayUtil} from "../../message-display-utils";
import {ClubInfo} from "../../data/club-course";
import {ClubMembership} from "../../data/player-data";
import {PlayerService} from "../../providers/player-service/player-service";
import {GeolocationService} from "../../providers/geolocation-service/geolocation-service";
import {AddClubMembershipPage} from "../player-add-club-membership/player-add-club-membership";

/**
 * The competition list page class. This class lists the competitions. There are
 * three types of listing
 *  This class extends Subscriber which is passed as parameter for Remote Http method so that
 *  results are processed
 */
@Component({
    templateUrl: 'player-club-membership.html'
})
export class ClubMembershipPage
{
    public memberships: Array<ClubMembership> = [];
    public clubIds: Array<number>             = [];

    constructor(private nav: NavController,
        private renderer: Renderer,
        private alertCtl: AlertController,
        private playerService: PlayerService,
        private geo: GeolocationService,
        private events: Events,
        private loadingCtl: LoadingController) {

    }

    ionViewDidLoad() {
        this._refreshMemberships();
    }

    ionViewDidEnter() {
        adjustViewZIndex(this.nav, this.renderer);
    }

    private _refreshMemberships() {
        let loader = this.loadingCtl.create({});

        loader.present().then(() => {
            this.playerService.getPlayerMemberships()
                .subscribe((memberships: Array<ClubMembership>) => {
                    loader.dismiss().then(() => {
                        this.memberships = memberships;
                        this.clubIds     = [];
                        memberships.forEach((m: ClubMembership) => {
                            this.clubIds.push(m.club.clubId);
                        });
                    })

                }, (error) => {
                    loader.dismiss();
                    let msg = MessageDisplayUtil.getErrorMessage(error);
                    MessageDisplayUtil.displayErrorAlert(this.alertCtl, "Membership",
                        msg, "OK");
                });
        });
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

    openAddClubMembership() {
        this.nav.push(AddClubMembershipPage);
    }
}
