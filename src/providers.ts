/**
 * Created by Ashok on 11-05-2016.
 */
import {CompetitionService} from "./providers/competition-service/competition-service";
import {GeolocationService} from "./providers/geolocation-service/geolocation-service";
import {ScorecardService} from "./providers/scorecard-service/scorecard-service";
import {MyGolfStorageService} from "./storage/mygolf-storage.service";
import {ConnectionService} from "./providers/connection-service/connection-service";
import {RemoteHttpService} from "./remote-http";
import {TranslationService} from "./i18n/translation-service";
import {Preference} from "./storage/preference";
import {VolatileStorage} from "./storage/volatile-storage";
import {AuthenticationService} from "./authentication-service";
import {ClubService} from "./providers/club-service/club-service";
import {NormalgameService} from "./providers/normalgame-service/normalgame-service";
import {PlayerService} from "./providers/player-service/player-service";
import {PlayerPerformanceService} from "./providers/playerPerformance-service/playerPerformance-service";
import {PlayerAnalysisService} from "./providers/playerAnalysis-service/playerAnalysis-service";
import {FiletransferService} from "./providers/filetransfer-service/filetransfer-service";
import {FriendService} from "./providers/friend-service/friend-service";
import {ImageService} from "./providers/image-service/image-service";
import {FeedbackService} from "./providers/feedback-service/feedback-service";
import {ReferencedataService} from "./providers/referencedata-service/referencedata-service";
import {PushNotificationService} from "./providers/pushnotification-service/pushnotification-service";
import {ServerInfoService} from "./providers/serverinfo-service/serverinfo-service";
import {EventLogService} from "./providers/eventlog-service/eventlog-service";
import {ScorecardStorageService} from "./providers/scorecard-service/scorecard-storage-service";
import {DeviceService} from './providers/device-service/device-service';
import {AdService} from './providers/ad-service/ad-service';


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
                                 ServerInfoService, EventLogService,
                                 ScorecardStorageService, DeviceService, AdService];
