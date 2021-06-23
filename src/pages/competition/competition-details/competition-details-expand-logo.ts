import {Component} from "@angular/core";
import {CompetitionInfo} from "../../../data/competition-data";
import {ViewController, NavParams} from "ionic-angular";
/**
 * Created by ashok on 19/12/16.
 */
@Component({
    templateUrl: 'competition-img-expand.html'
})
export class ExpandCompetitionLogo
{
    /*static get parameters() {
     return [[ViewController],[NavParams]];
     }*/
    competition: CompetitionInfo;

    constructor(private viewCtrl: ViewController, private navParams: NavParams) {
        this.viewCtrl    = viewCtrl;
        this.navParams   = navParams;
        //this.varThing1 = this.navParams.get('param1');
        this.competition = navParams.get("competition");
    }

    close() {
        this.viewCtrl.dismiss();
    }
}
