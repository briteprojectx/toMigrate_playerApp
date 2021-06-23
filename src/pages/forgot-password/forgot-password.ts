import {NavController, AlertController, LoadingController, ToastController, Platform} from "ionic-angular/index";
import {FormBuilder, AbstractControl, FormGroup} from "@angular/forms";
import {RequestMethod, Response} from "@angular/http";
import {Component, Renderer} from "@angular/core";
import {RemoteHttpService} from "../../remote-http";
import {RemoteRequest, ContentType} from "../../remote-request";
import * as globals from "../../globals";
import {adjustViewZIndex} from "../../globals";
import {MessageDisplayUtil} from "../../message-display-utils";
import {ServerResult} from "../../data/server-result";
import {SignIn} from "../sign-in/sign-in";
import {ConnectionService} from '../../providers/connection-service/connection-service';

@Component({
    templateUrl: 'forgot-password.html',
})
export class ForgotPassword
{
    public otpExist: boolean;
    public forgotForm: FormGroup;
    public email: AbstractControl;
    public password: AbstractControl;
    public password2: AbstractControl;
    public otp: AbstractControl;

    constructor(fb: FormBuilder,
        private nav: NavController,
        private renderer: Renderer,
        private alertCtl: AlertController,
        private loadingCtl: LoadingController,
        private toastCtl: ToastController,
        private platform: Platform,
        private connService: ConnectionService,
        private http: RemoteHttpService) {

        this.forgotForm = fb.group({
            'email': [''],
            'password': [''],
            'password2': [''],
            'otp': ['']
        });
        this.email      = this.forgotForm.controls["email"];
        this.password = this.forgotForm.controls["password"];
        this.password2 = this.forgotForm.controls["password2"];
        this.otp = this.forgotForm.controls["otp"];
    }

    ionViewDidEnter() {
        adjustViewZIndex(this.nav, this.renderer);
    }
    requestOTP() {
        if (this.forgotForm.value.email !== '') {
            let req  = new RemoteRequest(globals.ServerUrls.startRestPassword,
                RequestMethod.Post,
                ContentType.URL_ENCODED_FORM_DATA, {
                    email: this.forgotForm.value.email
                }
            );
            let busy = this.loadingCtl.create({
                content: "Requesting OTP..."
            });
            busy.present().then(()=>{
                this.http.execute(req).subscribe((resp: Response)=>{
                    busy.dismiss().then(()=>{
                        let result: ServerResult = resp.json();
                        if(result.success) {
                            let alert = this.alertCtl.create({
                                title: 'Password Reset',
                                message: "OTP for resetting your password is generated and sent to above email.",
                                buttons: ['OK']
                            });
                            alert.onDidDismiss(()=>{
                                this.otpExist = true;
                            });
                            alert.present();
                        }
                    });

                },(error)=>{
                    busy.dismiss().then(()=>{
                        let msg = MessageDisplayUtil.getError(error, this.platform, this.connService,
                            'Error generating OTP for resetting password.');
                        let alert = this.alertCtl.create({
                            title: 'Password Reset',
                            message: "OTP for resetting your password is generated and sent to above email.",
                            buttons: ['OK']
                        });

                        alert.present();
                    });

                })
            });
        }
        else {
            let alert = this.alertCtl.create({
                title: 'Invalid details',
                message: "Please enter your valid email used for signing in.",
                buttons: ['OK']
            });
            alert.present();
        }
    }
    changePassword() {
        if (this.forgotForm.value.email !== '' &&
            this.forgotForm.value.password !== '' &&
            this.forgotForm.value.otp) {
            if(this.forgotForm.value.password !== this.forgotForm.value.password2){
                let alert = this.alertCtl.create({
                    title: 'Password Mismatch',
                    message: 'Passwords you entered do not match.',
                    buttons: ['OK']
                });
                alert.present();
                return;
            }
            let req  = new RemoteRequest(globals.ServerUrls.resetPassword,
                RequestMethod.Post,
                ContentType.URL_ENCODED_FORM_DATA, {
                    email: this.forgotForm.value.email,
                    password: this.forgotForm.value.password,
                    otp: this.forgotForm.value.otp
                }
            );
            let busy = this.loadingCtl.create({
                content: "Changing password..."
            });
            this.http.execute(req).subscribe((resp: Response)=> {
                busy.dismiss().then(()=>{
                    let result: ServerResult = resp.json();
                    if(result.success){
                        let alert = this.alertCtl.create({
                            title:'Reset Password',
                            message: 'Successfully changed your password. Login with new credentials.',
                            buttons: ['OK']
                        });
                        alert.onDidDismiss(()=>{
                            this.nav.setRoot(SignIn);
                        });
                        alert.present();
                    }
                });

            }, (error)=> {
                busy.dismiss().then(()=>{
                    let msg = MessageDisplayUtil.getError(error,this.platform, this.connService, 'Error occured while changing password');
                    let alert = this.alertCtl.create({
                        title: 'Reset Password Error',
                        message: msg,
                        buttons: ['OK']
                    });
                    alert.present();
                })
            })
        }
        else {
            let alert = this.alertCtl.create({
                message: "You have to enter valid email, password and OTP for resetting password.",
            });
            alert.present();
        }
    }
    // onSubmit() {
    //     if (this.forgotForm.value.email !== '') {
    //         let req  = new RemoteRequest(globals.ServerUrls.forgotPassword,
    //             RequestMethod.Post,
    //             ContentType.URL_ENCODED_FORM_DATA, {
    //                 email: this.forgotForm.value.email
    //             }
    //         );
    //         let busy = this.loadingCtl.create({
    //             content: "Resetting password..."
    //         });
    //         busy.present().then(() => {
    //             this.http.execute(req)
    //                 .subscribe((resp: Response) => {
    //                     busy.dismiss().then(() => {
    //                         let result: ServerResult = resp.json();
    //                         if (result.success) {
    //                             let alert = this.alertCtl.create({
    //                                 title  : "Reset Password",
    //                                 message: result.message,
    //                                 buttons: [{
    //                                     text   : "OK",
    //                                     handler: () => {
    //                                         alert.dismiss().then(() => {
    //                                             this.nav.setRoot(SignIn);
    //                                         });
    //                                     }
    //                                 }]
    //                             });
    //                             alert.present();
    //                         }
    //                         else {
    //                             MessageDisplayUtil.showErrorToast(result.message, this.platform, this.toastCtl, 5000, "bottom");
    //                         }
    //                     });
    //                 }, (error) => {
    //                     busy.dismiss().then(() => {
    //                         let msg = MessageDisplayUtil.getErrorMessage(error, "Error resetting password. Try again later");
    //                         MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 5000, "bottom");
    //                     })
    //                 });
    //         });
    //
    //     }
    // }

}
