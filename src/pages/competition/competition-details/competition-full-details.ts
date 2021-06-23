import {Component} from "@angular/core";
import {CompetitionInfo} from "../../../data/competition-data";
import {ViewController, NavParams} from "ionic-angular";
/**
 * Created by ashok on 19/12/16.
 */
@Component({
    templateUrl: 'competition-full-details.html',
    selector: 'competition-full-details-page'
})
export class CompetitionFulDetailsPage
{
    competition: CompetitionInfo;

    constructor(private viewCtrl: ViewController, private navParams: NavParams) {
        this.viewCtrl    = viewCtrl;
        this.navParams   = navParams;
        this.competition = navParams.get("competition");
    }

    close() {
        this.viewCtrl.dismiss();
    }
}
