import {
    AlertController,
    LoadingController,
    NavController,
    NavParams,
    Platform,
    ToastController,
    ViewController
} from 'ionic-angular';
import {ClubService} from '../../../providers/club-service/club-service';
import {CourseInfo} from '../../../data/club-course';
import {FlightSetupPage} from '../flight-setup/flight-setup';
import {NewGameInfo} from '../../../data/game-round';
import {Component, Renderer} from '@angular/core';
import {isPresent} from 'ionic-angular/util/util';
import {adjustViewZIndex} from '../../../globals';
import {MessageDisplayUtil} from '../../../message-display-utils';
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
    templateUrl: 'select-course.html',
    selector   : 'select-course-page'
})
export class SelectCoursePage
{
    gameInfo: NewGameInfo;
    // private selectedClub: ClubInfo;
    clubCourses: Array<CourseInfo> = [];

    constructor(private nav: NavController,
        private renderer: Renderer,
        private platform: Platform,
        private navParams: NavParams,
        private viewCtl: ViewController,
        private toastCtl: ToastController,
        private loadingCtl: LoadingController,
        private clubService: ClubService,
        private alertCtrl: AlertController) {
        // this.selectedClub = navParams.get("club");
        this.gameInfo        = navParams.get("gameInfo");
        // let selectFirstNine  = this.alertCtrl.create({
        //     title: 'Select First Nine'
        //
        // });
        // let selectSecondNine = this.alertCtrl.create({
        //     title: 'Select Second Nine'
        //
        // });
    }

    ionViewDidLoad() {
        let loader = this.loadingCtl.create({
            content: "Please wait...",
            duration    : 5000,
        });
        loader.present().then(() => {
            this.clubService.getClubCourses(this.gameInfo.club.clubId)
                .subscribe((courses: Array<CourseInfo>) => {
                    loader.dismiss().then(() => {
                        this.clubCourses = courses;
                        this.clubCourses.forEach(course => {
                            if (this.gameInfo.courses && this.gameInfo.courses[0] && this.gameInfo.courses[0].courseId === course.courseId) {
                                this.gameInfo.courses[0] = course;
                            }
                            if (this.gameInfo.courses && this.gameInfo.courses[1] && this.gameInfo.courses[1].courseId === course.courseId) {
                                this.gameInfo.courses[1] = course;
                            }
                        });
                    });

                }, (error) => {
                    loader.dismiss().then(() => {
                        let msg = MessageDisplayUtil.getErrorMessage(error, "Error getting courses for selected club");
                        MessageDisplayUtil.showMessageToast(msg, this.platform, this.toastCtl, 3000, "bottom");
                    });
                });
        })

    }

    ionViewDidEnter() {
        adjustViewZIndex(this.nav, this.renderer);
    }

    onNextClick() {
        if (!isPresent(this.gameInfo.courses[1]) || !isPresent(this.gameInfo.courses[1].courseId))
            this.gameInfo.courses.splice(1);
        this.nav.push(FlightSetupPage, {
            gameInfo: this.gameInfo
        });
    }
}
