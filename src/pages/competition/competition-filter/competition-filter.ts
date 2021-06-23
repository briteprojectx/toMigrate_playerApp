import {NavController, Platform, ViewController} from 'ionic-angular';
import {DatePicker} from '@ionic-native/date-picker';
import {Component, Renderer} from '@angular/core';
import {isPresent} from 'ionic-angular/util/util';
import {SearchCriteria} from '../../../data/search-criteria';
import {Country} from '../../../data/country-location';
import {CompetitionService} from '../../../providers/competition-service/competition-service';
import {adjustViewZIndex} from '../../../globals';
import * as moment from 'moment';

import {PlayerService} from '../../../providers/player-service/player-service';

@Component({
    templateUrl: 'competition-filter.html',
    selector: 'competition-filter-page'
})
export class CompetitionFilterPage
{
    public searchCriteria: SearchCriteria;
    public startDate: Date;
    public endDate: Date;
    public isoStartDate: string;
    public isoEndDate: string;
    public countryList: Array<Country>;

    constructor(private viewCtl: ViewController,
        private renderer: Renderer,
        private datePicker: DatePicker,
        public platform: Platform,
        public nav: NavController,
        // private events: Events,
        private compService: CompetitionService,
        private playerService: PlayerService) {
        this.searchCriteria = compService.getSearch();
        if (!isPresent(this.searchCriteria.periodType))
            this.searchCriteria.periodType = "NONE";
        this.endDate      = moment().toDate();
        this.startDate    = moment().add(-1, "months").toDate();
        this.isoEndDate   = moment().toISOString();
        this.isoStartDate = moment().add(-1, "months").toISOString();

    }

    ionViewDidLoad() {
        this.getCountry();
    }

    ionViewEntered() {
        adjustViewZIndex(this.nav, this.renderer);
    }

    onCancelClick() {
        this.viewCtl.dismiss(false);
    }

    onApplyClick() {
        this.compService.setSearch(this.searchCriteria);
        if (this.searchCriteria.periodType === "CUSTOM") {
            if (this.isCordova()) {
                this.compService.setFilterStartDate(this.startDate);
                this.compService.setFilterEndDate(this.endDate);

            } else {
                console.log("Start date:", moment(this.isoStartDate).isValid());
                console.log("End date:", moment(this.isoEndDate).isValid());
                let parseStartDate = moment(this.isoStartDate, "YYYY-MM-DD").toDate();
                let parseEndDate   = moment(this.isoEndDate, "YYYY-MM-DD").toDate();

                this.compService.setFilterStartDate(parseStartDate);
                this.compService.setFilterEndDate(parseEndDate);

            }

        }
        else {
            this.compService.setFilterStartDate(null);
            this.compService.setFilterEndDate(null);
        }

        this.viewCtl.dismiss(true);
        // this.events.publish("competition:filterChanged");
        // this.nav.pop();
    }

    isCordova() {
        return this.platform.is("cordova");
    }

    startDateDisplay() {
        return moment(this.startDate).format("MMM DD, YYYY");
    }

    endDateDisplay() {
        return moment(this.endDate).format("MMM DD, YYYY");
    }

    onStartDateChange(event) {
        this.startDate = moment(event.target.value, "YYYY-MM-DD").toDate();
    }

    onEndDateChange(event) {
        this.endDate = moment(event.target.value, "YYYY-MM-DD").toDate();
    }

    onStartDateClick() {
        this.datePicker.show({
            date: this.startDate,
            mode: "date"
        }).then((date: Date) => {
            this.startDate = date;
        })
    }

    onEndDateClick() {
        this.datePicker.show({
            date: this.endDate,
            mode: "date"
        }).then((date: Date) => {
            this.endDate = date;
        });
    }

    maxPeriodLength(): number {
        if (this.searchCriteria.periodType) {
            switch (this.searchCriteria.periodType) {
                case "MONTH":
                    return 60;
                case "DAY":
                    return 900;
                case "WEEK":
                    return 52;
                case "YEAR":
                    return 5;
            }
        }
        return 0;
    }

    onPeriodTypeChange(event) {
        if (this.searchCriteria.periodType) {
            let maxValue = this.maxPeriodLength();
            if (!this.searchCriteria.periodLength || this.searchCriteria.periodLength > maxValue) {
                switch (this.searchCriteria.periodType) {
                    case "MONTH":
                        this.searchCriteria.periodLength = 1;
                        break;
                    case "DAY":
                        this.searchCriteria.periodLength = 30;
                        break;
                    case "WEEK":
                        this.searchCriteria.periodLength = 4;
                        break;
                    case "YEAR":
                        this.searchCriteria.periodLength = 1;
                        break;
                    default:
                        this.searchCriteria.periodLength = 0;
                }
            }

        }
    }


    getCountry() {
        this.playerService.getCountryList()
                .subscribe((data: Array<Country>) => {
                            // console.log("Country Sign Up : ",data)
                            this.countryList = data;
                            console.log("Country List Comp Filter : ", this.countryList)
        });
    }
}
