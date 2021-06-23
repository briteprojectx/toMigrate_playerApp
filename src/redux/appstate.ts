import {SessionInfo} from '../data/authentication-info';
import {DeviceInfo} from '../data/device-info';
import {ServerInfo} from '../data/server-info';
import {PlayerHomeData} from './player-home/player-home-data';
import {PushNotificationStatus} from './pushnotf/pushnotification-status';
import {CurrentScorecard} from './scorecard';
import {WebsocketStatus} from './wstomp/websocket-status';
/**
 * Created by ashok on 10/05/17.
 */
export interface AppState {
    readonly sessionInfo: SessionInfo;
    readonly serverInfo: ServerInfo;
    readonly deviceInfo: DeviceInfo;
    readonly pushStatus: PushNotificationStatus;
    readonly currentScorecard: CurrentScorecard;
    readonly playerHomeData: PlayerHomeData;
    readonly websocketStatus: WebsocketStatus;
    readonly teetimeBooking: any;
}
export const AppSync = [
 {
    //  sessionInfo: ['userName', 'password', 'authToken', 'userId', 'playerId', 'clubId', 'organizerId', 'userType','countryId','countryName','flagUrl']
     sessionInfo: ['userName', 'password', 'authToken', 'userId', 'playerId', 'clubId', 'organizerId', 'userType', 'admin', 'name', 'user','countryId','countryName','flagUrl']

 },
{
    playerHomeData: ['competitionSelectedForScoring']
}
 ];