import {sessionReducer} from './session';
import {serverInfoReducer} from './server';
import {deviceDataReducers} from './device';
import {pushNotificationReducers} from './pushnotf';
import {currentScorecardReducers} from './scorecard';
import {playerHomeReducers} from './player-home';
import {websocketReducers} from './wstomp';
/**
 * Created by ashok on 10/05/17.
 */

export const RootReducer = {
    serverInfo: serverInfoReducer,
    sessionInfo: sessionReducer,
    deviceInfo: deviceDataReducers,
    pushNotification: pushNotificationReducers,
    currentScorecard: currentScorecardReducers,
    playerHomeData: playerHomeReducers,
    websocketStatus: websocketReducers
}