import { FaqPage } from './../faq/faq';
import {NavController, NavParams} from "ionic-angular/index";
import {Renderer, Component} from "@angular/core";
import {AboutPage} from "../about/about";
import {FeedbackPage} from "../feedback/feedback";
import { ContactUsPage, HelpURLs } from '../contact-us/contact-us';
import { ClubFlightService } from '../../providers/club-flight-service/club-flight-service';

/**
 * Created by Ashok on 29-03-2016.
 */
@Component({
    templateUrl: "settings.html"
})
export class SettingsPage
{
    helpURL: string;

    constructor(private nav: NavController,
        private renderer: Renderer,
        private navParams: NavParams,
        private flightService: ClubFlightService) {
    }

    ionViewDidLoad() {
        // this.refreshHelpUrl();
    }

    refreshHelpUrl () {
        this.flightService.getHelp()
        .subscribe((helpURL: Array<HelpURLs> ) => {
            if(helpURL && helpURL.length > 0) {
                // && helpURL.length > 0
                this.helpURL = helpURL[0].url
            }
            // else this.helpURL = 'http://portal.mygolf2u.com/document/help-contents/mobile/help_content.html'
            console.log("get help url items", helpURL)
        }, (error)=>{

        }, ()=>{
        })

    }

    callAboutPage() {
        this.nav.push(AboutPage);
    }

    callHelpPage() {
        this.flightService.getHelp()
        .subscribe((helpURL: Array<HelpURLs> ) => {
            if(helpURL && helpURL.length > 0) {
                // && helpURL.length > 0
                this.helpURL = helpURL[0].url;
                console.log("get help url items", this.helpURL)
                window.open(this.helpURL, '_self');
            }
            // else this.helpURL = 'http://portal.mygolf2u.com/document/help-contents/mobile/help_content.html'
            
        }, (error)=>{

        }, ()=>{
        })
        // console.log("help url ", this.helpURL)
        // if(this.helpURL) {
        //     // console.log("help url ", this.helpURL)
        //     window.open(this.helpURL, '_self');
        // } 
        // else {
        //     this.refreshHelpUrl();
        //     setTimeout(()=>{
        //         this.callHelpPage();
        //     }, 1000)
        // }
        // window.open('http://mygolf2u.com/document/help-contents/mobile/help_content.html', '_self');
    }

    callFeedbackPage() {
        this.nav.push(FeedbackPage);
    }

    callFAQPage() {
        this.nav.push(FaqPage)
    }
    callContactUsPage() {
        this.nav.push(ContactUsPage);
    }

}
