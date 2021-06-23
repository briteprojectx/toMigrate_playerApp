import {NavController, NavParams} from 'ionic-angular';
import {isPresent} from 'ionic-angular/util/util';
import {Component} from '@angular/core';
import {RemoteHttpService} from '../../../remote-http';
import {CompetitionInfo} from '../../../data/competition-data';
import {SponsorInfo} from '../../../data/SponsorInfo';
/*
 Generated class for the Competition Sponsors page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    selector   : 'competition-sponsors-page',
    templateUrl: 'competition-sponsors.html'
})
export class CompetitionSponsorsPage
{
    public competition: CompetitionInfo;
    public show: boolean                = false;
    public sponsors: Array<SponsorInfo> = new Array<SponsorInfo>();

    constructor(private nav: NavController,
        private navParams: NavParams,
        private http: RemoteHttpService) {
        this.nav         = nav;
        this.competition = navParams.get("competition");
        this.sponsors    = navParams.get("sponsors");
        this.show        = (isPresent(this.sponsors)) ? true : false;

    }

    onHomeClick() {
        this.nav.popToRoot();//this.nav.setRoot(PlayerHomePage);
    }
}
