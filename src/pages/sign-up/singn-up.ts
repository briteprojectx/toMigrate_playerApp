import {NavController, AlertController, LoadingController, ToastController, Platform} from "ionic-angular/index";
import {Component, Renderer} from "@angular/core";
import {RequestMethod, Response} from "@angular/http";
import {Subscriber} from "rxjs/Subscriber";
import {FormBuilder, FormGroup, Validators, FormControl, AbstractControl} from "@angular/forms";
import {TranslationService} from "../../i18n/translation-service";
import {RemoteHttpService} from "../../remote-http";
import {RemoteRequest, ContentType} from "../../remote-request";
import * as globals from "../../globals";
import {adjustViewZIndex} from "../../globals";
import {AuthenticationService} from "../../authentication-service";
import {RemoteResponse} from "../../RemoteResponse";
import {PlayerInfo} from "../../data/player-data";
import {SignIn} from "../sign-in/sign-in";
import {MessageDisplayUtil} from "../../message-display-utils";

import {PlayerService} from '../../providers/player-service/player-service';
import {Country} from "../../data/country-location";
// NativeGeocoderOptions,
// import {NativeGeocoder,NativeGeocoderReverseResult,NativeGeocoderForwardResult} from "@ionic-native/native-geocoder";
// import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder';
import { Geolocation } from "@ionic-native/geolocation";
import { HandicapSystem } from "../../data/mygolf.data";
import { ClubFlightService } from "../../providers/club-flight-service/club-flight-service";

/**
 * The page class for sign up. The basic information for signing up with
 * myGolf is entered in this page. User's can change their profile information
 * later.
 * Created by Ashok on 02-04-2016.
 */

@Component({
    templateUrl: "sign-up.html",
    selector: "sign-up-page"
})
export class SignUp extends Subscriber<RemoteResponse>
{

    signupForm: FormGroup;
    handicapNo: number;
    firstName: AbstractControl;
    lastName: AbstractControl;
    handicap: AbstractControl;
    email: AbstractControl;
    password: AbstractControl;
    password2: AbstractControl;
    gender: AbstractControl;
    teeoff: AbstractControl;
    country: AbstractControl;
    nationality: AbstractControl;
    countryList: Array<Country>;
    selectedCountry: Country;
    location: any;

    geoLong: number;
    geoLat: number;
    geoEnc: any;
    stringGeo: string;
    geoName: string;

    handicapSystems: Array<HandicapSystem>;
    handicapSystem: any;
    constructor(private fb: FormBuilder,
        private renderer: Renderer,
        private translator: TranslationService,
        private http: RemoteHttpService,
        private auth: AuthenticationService,
        private nav: NavController,
        private alertCtl: AlertController,
        private loadingCtl: LoadingController,
        private platform: Platform,
        private toastCtl: ToastController,
        private playerService: PlayerService,
        private geolocation: Geolocation,
        private flightService: ClubFlightService
        // private nativeGeocoder: NativeGeocoder
        ) {
        super();
        this.signupForm = this.fb.group({
            firstName: new FormControl('', [<any>Validators.required, <any>Validators.maxLength(50)]),
            lastName : new FormControl('', [<any>Validators.maxLength(50)]),//['', Validators.compose([Validators.maxLength(50)])],
            handicap : new FormControl('24', [<any>Validators.required, <any>Validators.maxLength(50)]),//['', Validators.compose([Validators.required])],
            email    : new FormControl('', [<any>Validators.required, <any>Validators.maxLength(50)]),
            password : new FormControl('', [<any>Validators.required, <any>Validators.minLength(6), <any>Validators.maxLength(50)]),
            password2: new FormControl('', [<any>Validators.required, <any>Validators.minLength(6), <any>Validators.maxLength(50)]),
            gender   : new FormControl('M'),
            teeoff   : new FormControl('Blue'),
            country  : new FormControl('MYS'),
            nationality : new FormControl('MYS'),
            handicapSystem : new FormControl(''),
        });
        this.firstName  = this.signupForm.controls["firstName"];
        this.lastName   = this.signupForm.controls["lastName"];
        this.handicap   = this.signupForm.controls["handicap"];
        this.email      = this.signupForm.controls["email"];
        this.password   = this.signupForm.controls["password"];
        this.password2  = this.signupForm.controls["password2"];
        this.gender     = this.signupForm.controls["gender"];
        this.teeoff     = this.signupForm.controls["teeoff"];
        this.country    = this.signupForm.controls["country"];
        this.nationality = this.signupForm.controls["nationality"];
        this.handicapSystem = this.signupForm.controls["handicapSystem"]; 

    }

    ionViewDidLoad() {
        // this.geolocation.getCurrentPosition().then((resp) => {
        //     console.log("[geo] latitude : ",resp.coords.latitude)
        //     console.log("[geo] longitude: ",resp.coords.longitude)
        //     console.log("[geo] accuracy : ",resp.coords.accuracy)
        //     this.geoLat = resp.coords.latitude;
        //     this.geoLong = resp.coords.longitude;
        //     if(this.platform.is('ios') || this.platform.is('cordova')) this.geoEnc = this.getGeoencoder(this.geoLat,this.geoLong);
        //     // console.log("[geo] getgeoencoder() : ",this.getGeoencoder(resp.coords.latitude,resp.coords.longitude));
        // }).catch((error) => {
        //     console.log("[geo] error getting location", error);
        // });

        
    }

//     reverseGeocode(lat : number, lng : number) : Promise<any>{
//    return new Promise((resolve, reject) =>
//    {
//       this.nativeGeocoder.reverseGeocode(lat, lng)
//       .then((result : NativeGeocoderReverseResult) =>
//       {
//           console.log("[geo] : ", result)
//          let str : string   = ''; //`The reverseGeocode address is ${result.street} in ${result.countryCode}`;
//          resolve(str);
//       })
//       .catch((error: any) =>
//       {
//          reject(error);
//       });
//    });
// }

// forwardGeocode(keyword : string) : Promise<any>
// {
//    return new Promise((resolve, reject) =>
//    {
//       this.nativeGeocoder.forwardGeocode(keyword)
//       .then((coordinates : NativeGeocoderForwardResult) =>
//       {
//           console.log("[geo] Coordinates : ", coordinates)
//          let str : string   = ''; //`The coordinates are latitude=${coordinates.latitude} and longitude=${coordinates.longitude}`;
//          resolve(str);
//       })
//       .catch((error: any) =>
//       {
//          reject(error);
//       });
//    });
// }

    // getGeoencoder(latitude,longitude): any {
    //     this.nativeGeocoder.reverseGeocode(latitude, longitude)
    //   .then((result: NativeGeocoderReverseResult) => {
    //     let geoAddress = this.generateAddress(result[0]);
    //     console.log("[geo] result : ",result)
    //     console.log("[geo] generate address : ", geoAddress) 
    //     // this.stringGeo = result[0].countryCode;
    //     // this.geoName = result[0].countryName;
    //     this.geoName = 'Indonesia';
    //     console.log("[geo] geoCode : ", this.stringGeo);
    //     console.log("[geo] geoName : ",this.geoName);
    //     if(this.geoName) this.selectCountry(this.geoName);
    //     return result
    //   })
    //   .catch((error: any) => {
    //     alert('Error getting location'+ JSON.stringify(error));
    //   });
    // }

    selectCountry(countryName: string) {

        // this.clubInfo   = this.memberships.filter((membership: ClubMembership, idx: number) => {
        //     return membership.homeClub
        // }).map((membership: ClubMembership) => {
        //     return membership.club;
        // }).pop();


        this.selectedCountry= this.countryList
        .filter((c: Country) => {
            return c.name === countryName
        })
        .pop();

        // this.country.id = this.selectedCountry.id

        console.log("[geo] this.selectedCountry : ", this.selectedCountry)
    }

    generateAddress(addressObj){
        let obj = [];
        let address = "";
        for (let key in addressObj) {
          obj.push(addressObj[key]);
          console.log("[geo] key : ", key, addressObj[key])
        //   if(key === 'countryName') this.geoName = addressObj[key]
        }
        obj.reverse();
        for (let val in obj) {
          if(obj[val].length)
          address += obj[val]+', ';
        }
      return address.slice(0, -2);
    }
    

    ionViewDidEnter() {
        adjustViewZIndex(this.nav, this.renderer);
        this.getCountry();
        this.refreshHandicapSystem();
        // let curr_lat;
        // let curr_long;
        
        // this.geolocation.getCurrentPosition().then((resp) => {
        //     console.log("[geo] latitude : ",resp.coords.latitude)
        //     console.log("[geo] longitude: ",resp.coords.longitude)
        //     console.log("[geo] accuracy : ",resp.coords.accuracy)
        // }).catch((error) => {
        //     console.log("[geo] error getting location", error);
        // });

        // let watch = this.geolocation.watchPosition();
        //     watch.subscribe((data) => {
        //      // data can be a set of coordinates, or an error (if an error occurred).
        //      curr_lat = data.coords.latitude;
        //      curr_long = data.coords.longitude;
        //      console.log("[geo] data latitude : ",data.coords.latitude)
        //      console.log("[geo] data longitude : ",data.coords.longitude)
        //      console.log("[geo] what do you have in data", data)
        //     });

        // let options: NativeGeocoderOptions = {
        //     useLocale: true,
        //     maxResults: 5
        // }
        // 52.5072095, 13.1452818


    //     this.nativeGeocoder.reverseGeocode(curr_lat, curr_long)
    //     .then((result: NativeGeocoderResult[]) => {
    //         console.log(JSON.stringify(result[0]));
    //         this.location = JSON.stringify(result[0]) 
    //     }).catch((error: any) => console.log(error));
      
    //   this.nativeGeocoder.forwardGeocode('Berlin', options)
    //     .then((coordinates: NativeGeocoderForwardResult[]) => console.log('The coordinates are latitude=' + coordinates[0].latitude + ' and longitude=' + coordinates[0].longitude))
    //     .catch((error: any) => console.log(error));
    }

    onGenderChange(value) {
        // this.gender = value;
    }

    getCountry() {
        this.playerService.getCountryList()
                .subscribe((data: Array<Country>) => {
                            console.log("Country Sign Up : ",data)
                            this.countryList = data;
                            console.log("Country List Sign Up : ", this.countryList)
    }),(error)=>{

    }, () => {
    };
}


    onSubmit(value: any) {
        //validate whether password1 and password 2 are same
        if (value.password !== value.password2) {
            let alert = this.alertCtl.create({
                title  : this.translator.translate("SignUpPage.password-mismatch-title"),
                message: this.translator.translate("SignUpPage.password-mismatch-message"),
                buttons: [this.translator.translate("SignUpPage.alert-ok")]
            });
            alert.present();
            return false;
        }

        if (!value.handicap) {
            if (value.gender == 'M') {
                value.handicap = 24;
            }
            else {
                value.handicap = 36;
            }
        }

        let req     = new RemoteRequest(globals.ServerUrls.registerPlayer,
            RequestMethod.Post,
            ContentType.URL_ENCODED_FORM_DATA,
            value);
            // console.log("signing up new player [Content type] : ", ContentType.URL_ENCODED_FORM_DATA)
            // console.log("signing up new player [value] : ", value)
        let loading = this.loadingCtl.create({
            showBackdrop: false,
            cssClass    : "nobg",
            content     : "Signing up..."
        });
        loading.present().then(() => {
            this.http.execute(req)
                .subscribe((resp: Response) => {
                    let prResult: PlayerInfo = resp.json();
                    this.auth.setCurrenUser(prResult.email);
                    loading.dismiss().then(() => {
                        let alert = this.alertCtl.create({
                            title  : 'Registration!',
                            message: 'You registration was successfull.<br>Please login with your email and password',
                            buttons: [
                                {
                                    text   : 'OK',
                                    handler: () => {
                                        alert.dismiss()
                                             .then(() => {
                                                 this.nav.setRoot(SignIn);
                                             });
                                        return false;
                                    }
                                }
                            ]
                        });
                        alert.present();
                    });
                }, (error: Response) => {
                    let prResult = error.json();
                    loading.dismiss().then(() => {
                        if (prResult.errorMessage) {
                            MessageDisplayUtil.showErrorToast(prResult.errorMessage, this.platform, this.toastCtl, 5000, "bottom");
                        }
                    });
                });
        });

    }

    
    refreshHandicapSystem() {
        this.handicapSystems = [];
        this.flightService.getHandicapSystemList()
        .subscribe((handicap: any)=>{
            // Array<HandicapSystem>
            if(handicap && handicap.length > 0) {
                let _defHcpSystem;
                _defHcpSystem = handicap.filter((hcpSystem)=>{
                    if(!this.handicapSystem || (this.handicapSystem && !this.handicapSystem.value))  {
                        if(hcpSystem.defaultSystem) return true;
                        // this.handicapSystem.value = hcpSystem.id;
                    }
                    // hcpSystem.
                });
                this.handicapSystems = handicap;
                let _defHcpSys
                if(_defHcpSystem && _defHcpSystem.length > 0) _defHcpSys = _defHcpSystem[0].id
                // this.signupForm.value.handicapSystem = _defHcpSystem[0].id;
                // this.fb.control({
                //     handicapSystem: _defHcpSystem[0].id 
                // })
                // this.handicapSystem = _defHcpSystem[0].id;

                // this.signupForm = this.fb.group({
                //     handicapSystem : _defHcpSystem[0].id,
                // });
                
                this.signupForm = this.fb.group({
                    firstName: new FormControl('', [<any>Validators.required, <any>Validators.maxLength(50)]),
                    lastName : new FormControl('', [<any>Validators.maxLength(50)]),//['', Validators.compose([Validators.maxLength(50)])],
                    handicap : new FormControl('24', [<any>Validators.required, <any>Validators.maxLength(50)]),//['', Validators.compose([Validators.required])],
                    email    : new FormControl('', [<any>Validators.required, <any>Validators.maxLength(50)]),
                    password : new FormControl('', [<any>Validators.required, <any>Validators.minLength(6), <any>Validators.maxLength(50)]),
                    password2: new FormControl('', [<any>Validators.required, <any>Validators.minLength(6), <any>Validators.maxLength(50)]),
                    gender   : new FormControl('M'),
                    teeoff   : new FormControl('Blue'),
                    country  : new FormControl('MYS'),
                    nationality : new FormControl('MYS'),
                    handicapSystem : new FormControl(_defHcpSys),
                });
                this.firstName  = this.signupForm.controls["firstName"];
                this.lastName   = this.signupForm.controls["lastName"];
                this.handicap   = this.signupForm.controls["handicap"];
                this.email      = this.signupForm.controls["email"];
                this.password   = this.signupForm.controls["password"];
                this.password2  = this.signupForm.controls["password2"];
                this.gender     = this.signupForm.controls["gender"];
                this.teeoff     = this.signupForm.controls["teeoff"];
                this.country    = this.signupForm.controls["country"];
                this.nationality = this.signupForm.controls["nationality"];
                this.handicapSystem = this.signupForm.controls["handicapSystem"]; 
            }
        })
    }
}
