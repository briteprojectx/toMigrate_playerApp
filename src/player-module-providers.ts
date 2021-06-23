import {AuthenticationService} from './authentication-service';
import {TranslationService} from './i18n/translation-service';
import {ClubService} from './providers/club-service/club-service';
/**
 * Created by Ashok on 11-05-2016.
 */
import {CompetitionService} from './providers/competition-service/competition-service';
import {ConnectionService} from './providers/connection-service/connection-service';
import {DeviceService} from './providers/device-service/device-service';
import {EventLogService} from './providers/eventlog-service/eventlog-service';
import {FeedbackService} from './providers/feedback-service/feedback-service';
import {FiletransferService} from './providers/filetransfer-service/filetransfer-service';
import {FriendService} from './providers/friend-service/friend-service';
import {GeolocationService} from './providers/geolocation-service/geolocation-service';
import {ImageService} from './providers/image-service/image-service';
import {NormalgameService} from './providers/normalgame-service/normalgame-service';
import {PlayerService} from './providers/player-service/player-service';
import {PlayerAnalysisService} from './providers/playerAnalysis-service/playerAnalysis-service';
import {PlayerPerformanceService} from './providers/playerPerformance-service/playerPerformance-service';
import {PushNotificationService} from './providers/pushnotification-service/pushnotification-service';
import {ReferencedataService} from './providers/referencedata-service/referencedata-service';
import {ScorecardService} from './providers/scorecard-service/scorecard-service';
import {ScorecardStorageService} from './providers/scorecard-service/scorecard-storage-service';
import {ServerInfoService} from './providers/serverinfo-service/serverinfo-service';
import {RemoteHttpService} from './remote-http';
import {MyGolfStorageService} from './storage/mygolf-storage.service';
import {Preference} from './storage/preference';
import {VolatileStorage} from './storage/volatile-storage';
import {AdService} from './providers/ad-service/ad-service';
import { HandicapService } from './providers/handicap-service/handicap-service';
import { PaymentService } from './providers/payment-service/payment-service';
import { ClubFlightService } from './providers/club-flight-service/club-flight-service';
import { CustomSha1 } from './custom/sha1';
// import { ChartdateService } from './providers/booking-chart-service/chartdate.service';
// import { ChartcrudService } from './providers/booking-chart-service/chartcrud.service';
export const MYGOLF_PROVIDERS = [ConnectionService,
                                 GeolocationService,
                                 RemoteHttpService,
                                 TranslationService,
                                 MyGolfStorageService,
                                 AuthenticationService,
                                 Preference,
                                 VolatileStorage,
                                 CompetitionService,
                                 ScorecardService,
                                 ClubService,
                                 NormalgameService,
                                 FriendService,
                                 PlayerService,
                                 PlayerPerformanceService,
                                 PlayerAnalysisService,
                                 FiletransferService,
                                 ImageService,
                                 FeedbackService,
                                 ReferencedataService,
                                 PushNotificationService,
                                 ServerInfoService,
                                 ScorecardStorageService,
                                 DeviceService,
                                 EventLogService, AdService,
                                 HandicapService,
                                PaymentService,
                            ClubFlightService, 
                            CustomSha1
                            // ChartdateService, ChartcrudService
                    ];
