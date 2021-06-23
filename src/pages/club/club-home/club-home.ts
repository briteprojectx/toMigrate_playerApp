import {NavController} from "ionic-angular/index";
import {Component} from "@angular/core";
import {AuthenticationService} from "../../../authentication-service";
import {SignIn} from "../../sign-in/sign-in";
import { SessionActions } from "../../../redux/session";
/**
 * Created by Ashok on 07-04-2016.
 */

@Component({
    templateUrl: "club-home.html"
})
export class ClubHomePage
{

    constructor(private auth: AuthenticationService,
        private nav: NavController,
        private sessionActions: SessionActions) {

    }

    public signout() {
        this.sessionActions.logout();
        this.auth.signout();
        this.nav.setRoot(SignIn, {
            signOut: true
        });
    }
}
