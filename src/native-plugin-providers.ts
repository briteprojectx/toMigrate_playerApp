import {Camera} from '@ionic-native/camera';
import {File} from '@ionic-native/file';
import {Network} from '@ionic-native/network';
import {Transfer} from '@ionic-native/transfer';
import {OneSignal} from '@ionic-native/onesignal';
import {Toast} from '@ionic-native/toast';
import {Geolocation} from '@ionic-native/geolocation';
import {Keyboard} from '@ionic-native/keyboard';
import {Device} from '@ionic-native/device';
import {Dialogs} from '@ionic-native/dialogs';
import {DatePicker} from '@ionic-native/date-picker';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {AppVersion} from '@ionic-native/app-version';
import {BatteryStatus} from '@ionic-native/battery-status';
import {Contacts} from '@ionic-native/contacts';
// import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult  } from '@ionic-native/native-geocoder';
// import {AppRate} from '@ionic-native/app-rate';
 
/**
 * Created by ashok on 02/05/17.
 */
export const NativeProviders = [
    AppVersion,
    Camera,
    Contacts,
    File,
    Network,
    Transfer,
    Geolocation,
    OneSignal,
    Toast,
    Keyboard,
    Device,
    Dialogs,
    DatePicker,
    InAppBrowser,
    StatusBar,
    SplashScreen,
    BatteryStatus,
    // NativeGeocoder,
    // AppRate,
    // NativeGeocoder,NativeGeocoderOptions,NativeGeocoderReverseResult

]