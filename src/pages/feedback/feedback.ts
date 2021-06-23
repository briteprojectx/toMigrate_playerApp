import {Platform, NavController, AlertController, LoadingController, ToastController} from "ionic-angular";
import {Component, Renderer} from "@angular/core";
import {adjustViewZIndex} from "../../globals";
import {TranslationService} from "../../i18n/translation-service";
import {MessageDisplayUtil} from "../../message-display-utils";
import {FeedbackCategory} from "../../data/feedback-data";
import {FeedbackService} from "../../providers/feedback-service/feedback-service";

@Component({
    templateUrl: 'feedback.html'
})
export class FeedbackPage
{
    public categories: Array<FeedbackCategory> = [];
    public category: string;
    public subject: string;
    public message: string;

    constructor(private platform: Platform,
        private nav: NavController,
        private renderer: Renderer,
        private alertCtl: AlertController,
        private loadingCtl: LoadingController,
        private toastCtl: ToastController,
        private translator: TranslationService,
        private feedbackService: FeedbackService) {

    }

    ionViewDidLoad() {
        let busy = this.loadingCtl.create({
            content: "Loading categories..."
        });
        busy.present().then(() => {
            this.feedbackService.getCategories()
                .subscribe((categories: Array<FeedbackCategory>) => {
                    busy.dismiss().then(() => {
                        this.categories = categories;
                    });
                }, (error) => {
                    busy.dismiss().then(() => {
                        let msg = MessageDisplayUtil.getErrorMessage(error, "Error loading feedback categories");
                        MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 5000, "bottom");
                    });

                });
        })
    }

    ionViewDidEnter() {
        adjustViewZIndex(this.nav, this.renderer);
    }

    submitFeedback() {
        let busy = this.loadingCtl.create({
            content: "Submitting feedback..."
        });
        busy.present().then(() => {
            this.feedbackService.sendFeedbackFromPlayer(this.category,
                this.subject, this.message)
                .subscribe((id: number) => {
                    busy.dismiss().then(() => {
                        let message = this.translator.translate("Feedback.FeedbackSuccessMessage");
                        let title   = this.translator.translate("Feedback.FeedbackSuccessTitle");
                        let alert   = this.alertCtl.create({
                            title  : title,
                            message: message,
                            buttons: [{
                                text   : "OK",
                                handler: () => {
                                    alert.dismiss().then(() => {
                                        this.category = "";
                                        this.subject  = "";
                                        this.message  = "";
                                        this.nav.pop();
                                    })
                                }
                            }]
                        });
                        alert.present();
                    });
                }, (error) => {
                    busy.dismiss().then(() => {
                        let msg = MessageDisplayUtil.getErrorMessage(error, "Error submitting your feedback. Try again later");
                        MessageDisplayUtil.showErrorToast(msg, this.platform, this.toastCtl, 5000, "bottom");
                    });
                });
        })

    }
}
