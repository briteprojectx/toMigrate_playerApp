import {GotoPageHandlerInterface} from '../providers/pushnotification-service/pushnotification-handler';
import {NavController} from 'ionic-angular';
import {AbstractNotificationHandlerPage} from '../providers/pushnotification-service/notification-handler-constructs';
import * as global from '../globals';
import {CompetitionDetailsPage} from './competition/competition-details/competition-details';
import {FlightsPage} from './competition/competition-flights/competition-flights';
import {FriendListPage} from './friend-list/friend-list';
/**
 * Created by ashok on 20/03/17.
 */

export class MygolfGotoPageHandler implements GotoPageHandlerInterface {
    gotoPage(nav: NavController, type: string, data: any, needRefresh: boolean) {
        console.log("mygolf goto page handler : ", nav, type, data, needRefresh);
        if(type === AbstractNotificationHandlerPage.TYPE_COMP_ROUND_STARTED){
            global.SharedObject.homeInfo.needRefresh = true;
            // this.nav.popToRoot();
            nav.popToRoot();
        }
        else if(type === AbstractNotificationHandlerPage.TYPE_COMP_INFO_CHANGED){
            let compId = data.competitionDetailChanged;
            nav.push(CompetitionDetailsPage,{
                competitionId: compId
            });
        }
        else if(type === AbstractNotificationHandlerPage.TYPE_FLIGHTS_GENERATED){
            let compId = data.competitionId;
            let roundNo = data.roundNo;
            console.log("Comp Id:" + compId + ", round:" + roundNo);
            nav.push(FlightsPage,{
                competitionId: compId,
                roundNo: roundNo
            });
        }
        else if(type === AbstractNotificationHandlerPage.TYPE_FRIEND_REQUEST){
            // alert("Pushing friend list page");
            nav.push(FriendListPage,{
                homeInfo: global.SharedObject.homeInfo
            });
        }
        else if(type === AbstractNotificationHandlerPage.TYPE_FRIEND_REQUEST_ACCEPTED){
            // alert("Pushing friend list page");
            nav.push(FriendListPage,{
                homeInfo: global.SharedObject.homeInfo
            });
        }
    }

}