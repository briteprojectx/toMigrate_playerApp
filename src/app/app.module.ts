import {ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {IonicStorageModule} from '@ionic/storage';
import {compose} from '@ngrx/core/compose';
import {EffectsModule} from '@ngrx/effects';
import {combineReducers, StoreModule} from '@ngrx/store';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import '../../node_modules/chart.js/dist/Chart.bundle.js';
import '../../node_modules/chartjs-color-string/color-string.js';
import '../../node_modules/chartjs-color/index.js';
import {MygolfChartComponent} from '../charts/mygolf-chart';
import {NativeProviders} from '../native-plugin-providers';
import {PLAYER_MODULE_PAGES} from '../player-module-pages';
import {PLAYER_MODULE_PIPES} from '../player-module-pipes';
import {MYGOLF_PROVIDERS} from '../player-module-providers';
import {AppSync} from '../redux/appstate';
import {DeviceActionEffects} from '../redux/device';
import {PlayerHomeEffects} from '../redux/player-home';
import {PushNotificationEffects} from '../redux/pushnotf';
import {ReduxProviders} from '../redux/redux-providers';
import {RootReducer} from '../redux/root-reducer';
import {CurrentScorecardEffects} from '../redux/scorecard';
import {SessionEffects} from '../redux/session';
import {localStorageSync} from '../redux/storage-sync';
import {WebsocketEffects} from '../redux/wstomp';
import {MyApp} from './app.component';
import {AdvertisementComponent} from '../custom/advertisement-component';
import {AdhandlerComponent} from '../custom/adhandler-component';
// import { CountdownModule, CountdownGlobalConfig } from 'ngx-countdown';
import { CountdownTimerModule } from 'ngx-countdown-timer';
import { NgCalendarModule } from 'ionic2-calendar';
import { IonicPageModule } from 'ionic-angular';
import { BookingCalendarPage } from '../pages/booking/booking-calendar/booking-calendar';
// import { StarRatingModule } from 'ionic3-star-rating';
// import { RouterModule, Routes} from '@angular/router';
// import {IonicImageLoader} from 'ionic-image-loader';
// import { DragulaModule } from 'ng2-dragula';
// import { RecaptchaV3Module, RecaptchaModule, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { RecaptchaModule } from 'ng-recaptcha';


// const routes: Routes = [
//     { path: 'm2uhcp', component: HandicapHistoryPage}
// ]

const prodReducer = compose(localStorageSync({
        keys     : AppSync,
        prefix: 'mygolf2uapp',
        rehydrate: true
    }),
    combineReducers)(RootReducer);
export function appReducer(state: any = {}, action: any) {
    return prodReducer(state, action);
}

// function countdownConfigFactory(): CountdownGlobalConfig {
//     return { format: 'mm:ss' };
//   }
@NgModule({
    declarations   : [
        MyApp,
        MygolfChartComponent,
        AdvertisementComponent,
        AdhandlerComponent,
        ...PLAYER_MODULE_PIPES,
        ...PLAYER_MODULE_PAGES,
    ],
    imports        : [
        BrowserModule,
        HttpModule,
        StoreModule.provideStore(appReducer),
        // StoreDevtoolsModule.instrumentOnlyWithExtension({
        //     maxAge: 5
        // }),
        IonicModule.forRoot(MyApp, {
            iconMode: "ios",
            spinner : "ios",
            // locationStrategy: 'path',
        }, 
        // {
        //     links: [
        //         {component: HandicapHistoryPage, name: 'm2u Handicap', segment: 'm2uhcp'}
        //     ]
        // }
        ),
        IonicPageModule.forChild(PLAYER_MODULE_PAGES),
        IonicStorageModule.forRoot(),
        EffectsModule.runAfterBootstrap(PushNotificationEffects),
        EffectsModule.runAfterBootstrap(DeviceActionEffects),
        EffectsModule.runAfterBootstrap(SessionEffects),
        EffectsModule.runAfterBootstrap(PlayerHomeEffects),
        EffectsModule.runAfterBootstrap(CurrentScorecardEffects),
        EffectsModule.runAfterBootstrap(WebsocketEffects),
        // CountdownModule,
        CountdownTimerModule.forRoot(),
        NgCalendarModule,
        // IonicImageLoader.forRoot(),
        // IonicImageLoader
        // CUSTOM_ELEMENTS_SCHEMA
        // RouterModule.forRoot(routes)
        // DragulaModule.forRoot(),
        // StarRatingModule,
        RecaptchaModule.forRoot(),
        // RecaptchaV3Module,
    ],
    // exports: [RouterModule],
    bootstrap      : [IonicApp],
    entryComponents: [
        MyApp,
        MygolfChartComponent,
        ...PLAYER_MODULE_PAGES
    ],
    providers      : [{
        provide : ErrorHandler,
        useClass: IonicErrorHandler,
    },
    // { 
    //     provide: RECAPTCHA_V3_SITE_KEY, 
    //     useValue: '6LcJQM0ZAAAAAGVMmPWu6tTK4JzCj_TvNXm4gOIy'}, 
                      ...NativeProviders,
                      ...MYGOLF_PROVIDERS,
                      ...ReduxProviders,
                    //   { provide: CountdownModule, useFactory: countdownConfigFactory }
                    ],
    // schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    schemas:[CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],

})
export class AppModule {
}
