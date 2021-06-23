import {NavController, NavParams, ViewController} from "ionic-angular/index";
import {CompetitionService} from "../../providers/competition-service/competition-service";
import {CompetitionInfo} from "../../data/competition-data";
import {Component} from "@angular/core";
/**
 * Created by Ashok on 21-06-2016.
 */
@Component({
    templateUrl: "modal-competition.html"
})
export class ModalCompetition
{
    playerId: number;
    competitions: Array<CompetitionInfo> = [];

    constructor(private nav: NavController,
        private navParams: NavParams,
        private viewCtl: ViewController,
        private compSevice: CompetitionService) {
        this.playerId = navParams.get("playerId");
    }

    ionViewDidLoad() {
        this.compSevice.getCompetitionsInProgress(this.playerId)
            .subscribe((comps: Array<CompetitionInfo>) => {
                this.competitions = comps;
            });
    }

    onCompetitionSelected(comp: CompetitionInfo) {
        this.viewCtl.dismiss(comp);
    }

    close() {
        this.viewCtl.dismiss();
    }
}
