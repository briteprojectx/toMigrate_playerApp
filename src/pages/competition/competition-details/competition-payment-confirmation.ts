import {Component} from '@angular/core';
import {CompetitionDetails, CompetitionInfo} from '../../../data/competition-data';
import {NavParams, ViewController, ToastController} from 'ionic-angular';
import { InAppBrowserOptions, InAppBrowser } from '@ionic-native/in-app-browser';
import { MessageDisplayUtil } from "../../../message-display-utils";
import { LoadingController } from 'ionic-angular';
import { PaymentService } from "../../../providers/payment-service/payment-service";
import { Platform } from 'ionic-angular';
import { PlayerInfo } from '../../../data/player-data';
import { PaymentDetails, PlayerPaid } from '../../../data/payment-bill';


/**
 * Created by ashok on 19/12/16.
 */
@Component({
    templateUrl: 'competition-payment-confirmation.html',
    selector: 'competition-payment-confirmation-page'
})
export class CompetitionPaymentConfirm
{
    competition: CompetitionInfo;
    details:  CompetitionDetails;
    player: PlayerInfo;
    toggleRegister: boolean = false;

    compCollectionId: string;
    paidBillId: string;
    paymentStatus: string = 'pending';

    getCollSuccess: boolean = false;

    options : InAppBrowserOptions = {
      location : 'yes',//Or 'no' 
      hidden : 'no', //Or  'yes'
      clearcache : 'yes',
      clearsessioncache : 'yes',
      zoom : 'yes',//Android only ,shows browser zoom controls 
      hardwareback : 'yes',
      mediaPlaybackRequiresUserAction : 'no',
      shouldPauseOnSuspend : 'no', //Android only 
      closebuttoncaption : 'Close', //iOS only
      disallowoverscroll : 'no', //iOS only 
      toolbar : 'yes', //iOS only 
      enableViewportScale : 'no', //iOS only 
      allowInlineMediaPlayback : 'no',//iOS only 
      presentationstyle : 'pagesheet',//iOS only 
      fullscreen : 'yes',//Windows only    
  };

    constructor(private viewCtrl: ViewController,
      private navParams: NavParams,
      private iab: InAppBrowser,
      private toastCtl: ToastController,
      private loadingCtl: LoadingController,
      private paymentService: PaymentService,
      private platform: Platform) {
        this.viewCtrl    = viewCtrl;
        this.navParams   = navParams;
        this.competition = this.navParams.get("competition");
        this.details = this.navParams.get("details");
        this.player = this.navParams.get("player");


        console.log("Payment Confirm - Details : ", this.details)
        console.log("Payment Confirm - Comp : ", this.competition)
        console.log("Payment Confirm - Player: ", this.player)
        if(this.competition.competitionId) this.getCompetitionCollection(this.competition.competitionId)

    }

    close() {
        this.viewCtrl.dismiss();
    }

    goRegister() {
      let paymentURL = this.details.paymentUrl;
      window.open(paymentURL, '_self');
    }

    goPaidRegister() {
      console.log("paid register clicked")
      this.viewCtrl.dismiss({
        paid: this.paymentStatus,
        success: true
      })
    }

    onCompCollClick() {
      this.getCompetitionCollection(this.competition.competitionId)
    }


    createRemoteBill(collectionId?: string) {
      // console.log("create remote bill")
      let _collectionId: string;
      if(collectionId) _collectionId = collectionId
      else _collectionId = this.compCollectionId

      console.log("create remote bill",_collectionId,collectionId,this.compCollectionId)

      let loader = this.loadingCtl.create({
          content     : "Procesing Payment...",
          showBackdrop: false
      });


      loader.present().then(()=>{
          this.paymentService.createRemoteBill(collectionId)
      .subscribe((data:any)=>{
          loader.dismiss().then(()=>{
              console.log("get billplz collections", data)
              if(data.url) {
                  if (this.platform.is('cordova')) {
                      this.openWithInAppBrowser(data.url)
                  } else 
                  // this.openWithCordovaBrowser(data.url);
                  window.open(data.url, '_system');

                  
              }
              if(data) {
                this.paidBillId = data.id;

                console.log("before interval", this.paymentStatus)
                let intervalId = setInterval(()=>{
                  console.log("interval : ", this.paymentStatus)
                  if(this.paymentStatus.toLowerCase() !== 'paid') this.getBill(this.paidBillId)
                  else clearInterval(intervalId);
                }, 5000);
                
              }
          })
          
      }, (error) => {

      }, ()=> {

      })
      })
      
  }

  createBill(collectionId?: string) {


      let _collectionId: string;
      if(collectionId) _collectionId = collectionId
      else _collectionId = this.compCollectionId
      console.log("create bill ",_collectionId,collectionId,this.compCollectionId)
      console.log("create bill - player ",this.player)
      let loader = this.loadingCtl.create({
          content     : "Procesing Payment...",
          showBackdrop: false
      });

      let playerPaid: PlayerPaid = {
        player_id: this.player.playerId
      }

      let paymentDetails: any = {
        "collection_id": collectionId,
        "amount": 77*100,
        "email": this.player.email,
        "name": this.player.playerName,
        "mobile": this.player.phone,
        "description": "Registering for Competition "+this.competition.competitionId,
        "currency": 'MYR',
        "paid_by": this.player.userId,
        "player": {
          "player_id": this.player.playerId,
          // "competition_id": this.competition.competitionId
        },
        // "paid_for": {
        //   "player_id": this.player.playerId
        // },
        // "competition_id": this.competition.competitionId,
        "callback_url": 'http://devlet.mygolf2u.com/rest/payment/callback',
        "redirect_url": 'http://m.mygolf2u.com/test/payment_redirect.html',
        "bill_type": 'competition_player',
        "bill_type_id": this.competition.competitionId
      }
      setTimeout(()=>{
        loader.dismiss().then(()=> {})
      },300000)

      loader.present().then(() => {
          this.paymentService.createBill(_collectionId,paymentDetails)
          .subscribe((data:any)=>{
              loader.dismiss().then(()=> {
                  console.log("get billplz collections", data)
                  if(data) {
                    this.paidBillId = data.id
                  }
                  if(data.url) {
                      if (this.platform.is('cordova')) {
                          this.openWithInAppBrowser(data.url)
                      } else {
                          // this.openWithCordovaBrowser(data.url);
                          let win = window.open(data.url, '_system');
                          win.onunload = function () {
                              console.log("window unload")
                          }
                      }
                      
                  }
                  if(data) {
                    this.paidBillId = data.id;
    
                    console.log("before interval", this.paymentStatus)
                    let intervalId = setInterval(()=>{
                      console.log("interval : ", this.paymentStatus)
                      if(this.paymentStatus.toLowerCase() !== 'paid') this.getBill(this.paidBillId)
                      else clearInterval(intervalId);
                    }, 5000);
                    
                  }
              }, (error) => {
                if (error) {
                  console.log("Error : ",error.json())  
                  let _error = error.json()
                  if(_error.status === "500" || _error.status === "404") {
                    console.log("Server unreachable")
                    MessageDisplayUtil.showMessageToast('Server Unreachable', 
                    this.platform, this.toastCtl,3000, "bottom")
                  } else if (_error.status === 500 || _error.status === 404) {
                    console.log("Server unreachable JSON")
                    MessageDisplayUtil.showMessageToast('Server Unreachable', 
                    this.platform, this.toastCtl,3000, "bottom")
                  }
                }
                          })
              
          })
      })

      
  }
  getCollections() {
      // this.paymentService.getCollections()
      // .subscribe((data:any)=> {

      // });
      console.log("get collections");
  }

  getRemoteCollections(collectionId?: string) {
      this.paymentService.getRemoteCollections()
      .subscribe((data:any)=>{
          console.log("get billplz collections", data)
      })
  }

  getLocalCollections(collectionId?: string) {
      this.paymentService.getLocalCollections(collectionId)
      .subscribe((data:any)=>{
          console.log("get local billplz collections", data)
      })
  }

  getBill(billId?: string) {
      console.log("calling getBill")
      this.paymentService.getBill(billId)
      .subscribe((data:any)=>{
          console.log("get local billplz bill", data)
          if(data.state.toLowerCase() === 'paid') {
            this.toggleRegister = true;
            this.paymentStatus = 'Paid'
          } else if(data.state.toLowerCase() === 'due') {
            this.paymentStatus = 'Due'
            this.toggleRegister = false;
          }  
          else this.toggleRegister = false;
      })
  }

  getCompetitionCollection(competitionId?: number) {
    this.paymentService.getCompCollection(competitionId)
    .subscribe(((data: any)=> {
      console.log("get competition collection", data)
      if(data) {
        this.compCollectionId = data[0].id
        console.log("get comp collection : ",data)
        console.log("compCollectionId - data : ",data[0].id," || this : ",this.compCollectionId)
        this.paymentService.getBillCompetition(competitionId)
        .subscribe((dataBill: any) => {
          console.log("Data bill competition : ", dataBill)
        })
        
      }
    }))
  }



  public openWithSystemBrowser(url : string){
      let target = "_system";
      let browser = this.iab.create(url,target,this.options);
      MessageDisplayUtil.showMessageToast('Browser closed', 
      this.platform, this.toastCtl,3000, "bottom")

      browser.on('exit').subscribe(() => {
          console.log('browser closed');
          MessageDisplayUtil.showMessageToast('exit Browser closed', 
                              this.platform, this.toastCtl,3000, "bottom")
      }, (err) => {
          if(err) console.error(err);
      });
      // browser.close();
  }
  public openWithInAppBrowser(url : string){
      let target = "_blank";
      let browser = this.iab.create(url,target,this.options);
      MessageDisplayUtil.showMessageToast('Browser closed', 
      this.platform, this.toastCtl,3000, "bottom")

      browser.on('exit').subscribe(() => {
          MessageDisplayUtil.showMessageToast('exit Browser closed', 
          this.platform, this.toastCtl,3000, "bottom")
          console.log('browser closed');
      }, (err) => {
          if(err) console.error(err);
      });
      // browser.close();
  }
  public openWithCordovaBrowser(url : string){
      let target = "_self";
      let browser = this.iab.create(url,target,this.options);
      MessageDisplayUtil.showMessageToast('Browser closed', 
      this.platform, this.toastCtl,3000, "bottom")

      browser.on('exit').subscribe(() => {
          MessageDisplayUtil.showMessageToast('exit Browser closed', 
          this.platform, this.toastCtl,3000, "bottom")
          console.log('browser closed');
      }, (err) => {
          if(err) console.error(err);
      });
      browser.close();
  }  


  // this.getRemoteCollections(data.collectionId);
  //         }else if(data.type === 'getLocalCollections') {
  //             this.getLocalCollections(data.collectionId);
  //         } else if(data.type === 'getBill') {
  //             this.getBill(data.billId);
  //         } else if(data.type === 'createBill') {
  //             this.createBill(data.collectionId);
  //         } else if(data.type === 'createRemoteBill') {
  //             this.createRemoteBill(data.collectionId);
}
