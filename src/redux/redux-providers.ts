import {DeviceActionEffects, DeviceActions, DeviceDataService} from './device';
import {PlayerHomeActions, PlayerHomeDataService, PlayerHomeEffects} from './player-home';
import {PushNotificationActions, PushNotificationEffects} from './pushnotf';
import {CurrentScorecardActions, CurrentScorecardDataService, CurrentScorecardEffects} from './scorecard';
import {ServerInfoActions, ServerInfoDataService} from './server';
import {SessionActions, SessionDataService, SessionEffects} from './session/';
import { WebsocketActions, WebsocketDataService, WebsocketEffects} from './wstomp';
/**
 * Created by ashok on 10/05/17.
 */

export const ReduxProviders = [
    SessionActions, SessionDataService, SessionEffects,
    ServerInfoActions, ServerInfoDataService,
    DeviceActions, DeviceActionEffects, DeviceDataService,
    PushNotificationActions, PushNotificationEffects,
    CurrentScorecardActions, CurrentScorecardDataService, CurrentScorecardEffects,
    PlayerHomeActions, PlayerHomeDataService, PlayerHomeEffects,
    WebsocketActions, WebsocketDataService, WebsocketEffects
];