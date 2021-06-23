import {Component} from '@angular/core';
import {NewGameInfo} from '../../../data/game-round';
import {LoadingController, NavController, NavParams, Platform, PopoverController} from 'ionic-angular';
import {CourseBox} from '../../modal-screens/course-box/course-box';
import {ClubService} from '../../../providers/club-service/club-service';
import {CourseInfo} from '../../../data/club-course';
import {FlightSetupPage} from '../flight-setup/flight-setup';
/**
 * Created by ashok on 22/12/16.
 */

@Component({
    selector   : 'setup-playing-courses-page',
    templateUrl: 'setup-playing-courses.html'
})
export class SetupPlayingCoursesPage
{
    gameInfo: NewGameInfo;
    courses: Array<CourseInfo>;
    appFooterHide: boolean = true;
    constructor(private nav: NavController,
        private platform: Platform,
        private navParams: NavParams,
        private loadingCtl: LoadingController,
        private clubService: ClubService,
        private popoverCtl: PopoverController) {
        this.gameInfo = navParams.get("gameInfo");
    }
    ionViewDidLoad(){
        let busy = this.loadingCtl.create({
            content: "Loading courses..."
        });
        busy.present().then(()=>{
            this.clubService.getClubCourses(this.gameInfo.club.clubId)
                .subscribe((courses: Array<CourseInfo>)=>{
                    this.courses = courses;
                    busy.dismiss();
                },(error)=>{

                })
        });
    }
    removeCourse(index: number) {
        this.gameInfo.courses.splice(index, 1);
    }

    appendCourse(event) {
        let popover = this.popoverCtl.create(CourseBox,{
            courses: this.courses
        });
        popover.onDidDismiss((data: CourseInfo)=>{
            if(data){
                this.gameInfo.courses.push(data);
            }
        });
        popover.present({
            ev: event
        });
    }
    onNextClick(){
        this.nav.push(FlightSetupPage, {
            gameInfo: this.gameInfo
        });
    }
}