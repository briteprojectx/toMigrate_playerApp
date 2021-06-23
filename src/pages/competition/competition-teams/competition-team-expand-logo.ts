import {Component} from "@angular/core";
import {Teams} from "../../../data/competition-data";
import {ViewController, NavParams} from "ionic-angular";
/**
 * Created by ashok on 19/12/16.
 */
@Component({
    templateUrl: 'img-expand.html'
})
export class CompetitionTeamExpandLogo
{
    team: Teams;

    constructor(private viewCtrl: ViewController, private navParams: NavParams) {
        this.viewCtrl  = viewCtrl;
        this.navParams = navParams;
        //this.varThing1 = this.navParams.get('param1');
        this.team      = navParams.get("team");
    }

    close() {
        this.viewCtrl.dismiss();
    }
}
