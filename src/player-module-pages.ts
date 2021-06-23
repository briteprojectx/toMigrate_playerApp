import {AboutPage} from "./pages/about/about";
import {AddClubListPage} from "./pages/add-club-list/add-club-list";
import {AddLocationPage} from "./pages/add-location/add-location";
import {AddStateListPage} from "./pages/add-state-list/add-state-list";
import {ChangePasswordPage} from "./pages/change-password/change-password";
import {CompetitionDetailsPage} from "./pages/competition/competition-details/competition-details";
import {CompetitionFilterPage} from "./pages/competition/competition-filter/competition-filter";
import {SignIn} from "./pages/sign-in/sign-in";
import {SignUp} from "./pages/sign-up/singn-up";
import {FlightsPage} from "./pages/competition/competition-flights/competition-flights";
import {LeaderboardPage} from "./pages/competition/competition-leaderboard/competition-leaderboard";
import {LeaderboardFiltersPage} from "./pages/competition/competition-leaderboard/competition-leaderboard-filter/competition-leaderboard-filter";
import {PlayerHomePage} from "./pages/player-home/player-home";
import {ClubHomePage} from "./pages/club/club-home/club-home";
import {CompetitionListPage} from "./pages/competition/competition-list/competition-list";
import {CompetitionPlayersPage} from "./pages/competition/competition-players/competition-players";
import {PrizesPage} from "./pages/competition/competition-prizes/competition-prizes";
import {TeamsPage} from "./pages/competition/competition-teams/competition-teams";
import {EditProfilePage} from "./pages/edit-profile/edit-profile";
import {FeedbackPage} from "./pages/feedback/feedback";
import {ForgotPassword} from "./pages/forgot-password/forgot-password";
import {FriendListPage} from "./pages/friend-list/friend-list";
import {GameRoundScoringPage} from "./pages/gameround-scoring/gameround-scoring";
import {HoleGoogleMapPage} from "./pages/gameround-scoring/hole-googlemap";
import {HoleAnalysisPage} from "./pages/hole-analysis/hole-analysis";
import {HoleAnalysisFilterPage} from "./pages/hole-analysis-filter/hole-analysis-filter";
import {NewContactPage} from "./pages/new-contact/new-contact";
import {ChangeCoursePage} from "./pages/normalgame/change-course/change-course";
import {ClubListPage} from "./pages/normalgame/club-list/club-list";
import {CourseListPage} from "./pages/normalgame/course-list/course-list";
import {FlightSetupPage} from "./pages/normalgame/flight-setup/flight-setup";
import {NormalGameFriendListPage} from "./pages/normalgame/friend-list/friend-list";
import {SelectCoursePage} from "./pages/normalgame/select-course/select-course";
import {PerformanceClubListPage} from "./pages/performance/club-list/club-list";
import {PlayerChartsPage} from "./pages/performance/player-charts/player-charts";
import {PerformanceFilters} from "./pages/performance/player-performance-filter/player-performance-filter";
import {RecentClubListPage} from "./pages/performance/recent-club/recent-club";
import {SearchPlayerListPage} from "./pages/search-player-list/search-player-list";
import {AddClubMembershipPage} from "./pages/player-add-club-membership/player-add-club-membership";
import {ClubMembershipPage} from "./pages/player-club-membership/player-club-membership";
import {FavouriteListPage} from "./pages/player-favourite-list/player-favourite-list";
import {PlayerGroupsPage} from "./pages/player-groups/player-groups";
import {ProfilePage} from "./pages/profile/profile";
import {ProfileImageEdit} from "./pages/profile/profile-image-edit";
import {ScorecardDisplayPage} from "./pages/scorecard-display/scorecard-display";
import {ScorecardFilterPage} from "./pages/scorecard-filter/scorecard-filter";
import {ScorecardListPage} from "./pages/scorecard-list/scorecard-list";
import {ScoringTestPage} from "./pages/scoring-test/scoring-test";
import {ModalCompetition} from "./pages/scoring-test/modal-competition";
import {SettingsPage} from "./pages/settings/settings";
import {FriendImageShow} from "./pages/profile/friend-image-show";
import {PerformanceCourseListPage} from "./pages/performance/course-list/course-list";
import {PerformanceSearchPlayerListPage} from "./pages/performance/search-player-list/search-player-list";
import {CompetitionScoring} from "./pages/competition/competition-scoring/competition-scoring";
import {DescriptionBoxPage} from "./pages/modal-screens/description-box/description-box";
import {CompetitionTeamDetails} from "./pages/competition/competition-teams/competition-team-details";
import {CompetitionSponsorsPage} from "./pages/competition/competition-sponsors/competition-sponsors";
import {DeleteScorecardModal} from "./pages/scorecard-display/delete-scorecard-modal";
import {GotoHoleModal} from "./pages/gameround-scoring/goto-hole-modal";
import {GameScoringExpandImage} from "./pages/gameround-scoring/gamescoring-expand-image";
import {CompetitionLeaderboardTeamFilter} from "./pages/competition/competition-leaderboard/leaderboard-team-filter";
import {ExpandCompetitionLogo} from "./pages/competition/competition-details/competition-details-expand-logo";
import {CompetitionTeamExpandLogo} from "./pages/competition/competition-teams/competition-team-expand-logo";
import {CompetitionFulDetailsPage} from "./pages/competition/competition-details/competition-full-details";
import {CourseBox} from "./pages/modal-screens/course-box/course-box";
import {SetupPlayingCoursesPage} from "./pages/normalgame/select-course/setup-playing-courses";
import {CompetitionPaymentConfirm} from "./pages/competition/competition-details/competition-payment-confirmation";
import {ScorecardLocalListPage} from "./pages/scorecard-local-list/scorecard-local-list";
import {EventLogListPage} from "./pages/event-log/eventlog-list";
import {CoursesDisplayPage} from "./pages/modal-screens/courses-display/courses-display";
import { CountryListPage } from "./pages/modal-screens/country-list/country-list";
import { HandicapHistoryPage } from "./pages/handicap-history/handicap-history";
import { HandicapHistoryDetailsPage } from "./pages/handicap-history-details/handicap-history-details";
import { DeleteHandicapHistoryDetailsModal } from "./pages/handicap-history-details/delete-handicap-history-details-modal";
import { PlayerClubHandicap } from "./pages/modal-screens/player-club-handicap/player-club-handicap";
import { TeeBoxPage } from "./pages/modal-screens/tee-box/tee-box";
import { EditTeeoffPage } from "./pages/modal-screens/edit-teeoff/edit-teeoff";
import { PlayerListPage } from "./pages/modal-screens/player-list/player-list";
import { TestPaymentPage } from "./pages/modal-screens/test-payment/test-payment";
import { PlayerSubscriptionPage } from "./pages/modal-screens/player-subscription/player-subscription";
import { BookingHomePage } from "./pages/booking/booking-home/booking-home";
import { BookingDetailsPage } from "./pages/booking/booking-details/booking-details";
import { TeeFlightListsPage } from "./pages/booking/tee-flight-lists/tee-flight-lists";
import { TeeBuggyListPage } from "./pages/booking/tee-buggy-list/tee-buggy-list";
import { FlightBuggyListsPage } from "./pages/booking/flight-buggy-lists/flight-buggy-lists";
import { BookingSearchPage } from "./pages/booking/booking-search/booking-search";
import { SelectDatesPage } from "./pages/modal-screens/select-dates/select-dates";
import { BookingListPage } from "./pages/booking/booking-list/booking-list";
import { BookingClubListPage } from "./pages/booking/booking-club-list/booking-club-list";
import { StarterFlightListsPage } from "./pages/booking/starter-flight-lists/starter-flight-lists";

import { BuggyListPage } from "./pages/modal-screens/buggy-list/buggy-list";
import { CaddyListPage } from "./pages/modal-screens/caddy-list/caddy-list";
import { BuggyDetailsPage } from "./pages/modal-screens/buggy-list/buggy-details/buggy-details";
import { CaddyDetailsPage } from "./pages/modal-screens/caddy-list/caddy-details/caddy-details";
import { PricesDisplayPage } from "./pages/modal-screens/prices-display/prices-display";
import { AddPlayerListPage } from "./pages/modal-screens/add-player-list/add-player-list";
import { BuggySeatingPage } from "./pages/modal-screens/buggy-seating/buggy-seating";
import { PlayerAddressPage } from "./pages/modal-screens/player-address/player-address";
import { ImageZoom } from "./pages/modal-screens/image-zoom/image-zoom";
import { TeeSlotListModal } from "./pages/modal-screens/tee-slot-list/tee-slot-list";
import { ExternalPaymentPage } from "./pages/modal-screens/external-payment/external-payment";
import { BookingChartPage } from "./pages/booking/booking-chart/booking-chart";
import { BookingCalendarPage } from "./pages/booking/booking-calendar/booking-calendar";
import { ClubCalendarComponent } from "./pages/booking/club-calendar/club-calendar";
// import { BookingDetailModalComponent } from "./pages/booking/booking-detail-modal/booking-detail-modal";
import { SlotsDetailComponent } from "./pages/booking/slots-detail/slots-detail";
// import { ClubBookingDetailsPage } from "./pages/booking/by-club/booking-details/booking-details";
import { FaqPage } from "./pages/faq/faq";
import { GroupBookingOption } from "./pages/modal-screens/group-booking-option/group-booking-option";
import { ContactUsPage } from "./pages/contact-us/contact-us";
import { CustomSha1 } from "./custom/sha1";
import { NotificationsPage } from "./pages/notifications/notifications";
import { ClubUserManagementPage } from "./pages/club/club-home/club-user-management/club-user-management";
import { CaddyFlightListsPage } from "./pages/booking/caddy-flight-lists/caddy-flight-lists";
import { RatingsListPage } from "./pages/modal-screens/ratings-list/ratings-list";
import { RefundBookingPlayersModal } from "./pages/modal-screens/refund-booking-players/refund-booking-players";
import { VoucherListModal } from "./pages/modal-screens/voucher-list/voucher-list";
import { MemberMenuModal } from "./pages/modal-screens/member-menu/member-menu";
import { PlayerVoucherModal } from "./pages/modal-screens/player-voucher/player-voucher";
import { CaddyFlightDetailsPage } from "./pages/booking/caddy-flight-details/caddy-flight-details";
import { AddPlayerTypeDiscountModal } from "./pages/modal-screens/player-voucher/add-player-type-discount/add-player-type-discount";
import { ManageVoucherModal } from "./pages/modal-screens/manage-voucher/manage-voucher";
import { PlayerMg2uCreditsModal } from "./pages/modal-screens/player-mg2u-credits/player-mg2u-credits";
import { SearchDiscountCompanyModal } from "./pages/modal-screens/player-voucher/search-discount-company/search-discount-company";
import { RedeemPlayerClubCreditsModal } from "./pages/modal-screens/redeem-player-club-credits/redeem-player-club-credits";
import { ManageDiscountCardModal } from "./pages/modal-screens/manage-discount-card/manage-discount-card";
import { ProgramClubListPage } from "./pages/modal-screens/player-voucher/program-club-list/program-club-list";
import { LeagueLeaderboardPage } from "./pages/competition/competition-league-leaderboard/competition-league-leaderboard";
import { LeagueScorecardPage } from "./pages/competition/competition-league-scorecard/competition-league-scorecard";
import { LeagueLowestPage } from "./pages/competition/competition-league-lowest/competition-league-lowest";
import { CompetitionLeagueMenuPage } from "./pages/competition/competition-league-menu/competition-league-menu";
import { ClubBookingListPage } from "./pages/booking/club-booking-list/club-booking-list";
import { CaddyScheduleDisplayPage } from "./pages/modal-screens/caddy-schedule-display/caddy-schedule-display";
import { CaddyUnavailabilityPage } from "./pages/modal-screens/caddy-list/caddy-unavailability/caddy-unavailability";
import { PlayerFacilityHomePage } from "./pages/booking/player-facility-home/player-facility-home";
import { PlayerRefundRedeemHistoryPage } from "./pages/modal-screens/player-refund-redeem-history/player-refund-redeem-history";
import { ClubRefundRedeemHistoryPage } from "./pages/booking/club-refund-redeem-history/club-refund-redeem-history";
// import { PlayerOptionModalComponent } from "./pages/booking/player-option-modal/player-option-modal";
// import { ScorerAppHomePage } from "./pages/home/scorer-app-home";
// import {ClubListPage} from "./pages/normalgame/club-filter/club-filter";

/**
 * Created by ashok on 22/11/16.
 */
export const MY_PAGES            = [
    AboutPage
]
export const PLAYER_MODULE_PAGES = [ 
    AboutPage,
    AddClubListPage,
    AddLocationPage,
    AddStateListPage,
    ChangePasswordPage,
    ClubHomePage,
    CompetitionDetailsPage,
    CompetitionFilterPage,
    FlightsPage,
    LeaderboardPage,
    LeaderboardFiltersPage,
    CompetitionListPage,
    CompetitionPlayersPage,
    PrizesPage,
    CompetitionSponsorsPage,
    TeamsPage,
    CompetitionScoring,
    EditProfilePage,
    FeedbackPage,
    ForgotPassword,
    FriendListPage,
    FriendImageShow,
    GameRoundScoringPage,
    HoleGoogleMapPage,
    HoleAnalysisPage,
    HoleAnalysisFilterPage,
    NewContactPage,
    ChangeCoursePage,
    ClubListPage,
    CourseListPage,
    FlightSetupPage,
    NormalGameFriendListPage,
    SelectCoursePage,
    PerformanceClubListPage,
    PlayerChartsPage,
    PerformanceCourseListPage,
    PerformanceSearchPlayerListPage,
    PerformanceFilters,
    RecentClubListPage,
    SearchPlayerListPage,
    AddClubMembershipPage,
    ClubMembershipPage,
    FavouriteListPage,
    PlayerGroupsPage,
    PlayerHomePage,
    ProfilePage,
    ProfileImageEdit,
    ScorecardDisplayPage, ScorecardFilterPage, ScorecardListPage, DeleteScorecardModal,
    ScoringTestPage, ModalCompetition,
    SettingsPage,
    SignIn, SignUp,
    DescriptionBoxPage, CompetitionTeamDetails, CompetitionFulDetailsPage,
    CompetitionTeamExpandLogo,
    GotoHoleModal, GameScoringExpandImage, CompetitionLeaderboardTeamFilter,
    ExpandCompetitionLogo, CourseBox, SetupPlayingCoursesPage, CoursesDisplayPage,
    CompetitionPaymentConfirm, ScorecardLocalListPage, EventLogListPage,
    CountryListPage, HandicapHistoryPage, HandicapHistoryDetailsPage, DeleteHandicapHistoryDetailsModal,
    PlayerClubHandicap, TeeBoxPage, EditTeeoffPage, PlayerListPage, TestPaymentPage,PlayerSubscriptionPage,
    BookingHomePage, BookingDetailsPage, TeeFlightListsPage, TeeBuggyListPage,FlightBuggyListsPage, BookingSearchPage,
    SelectDatesPage, BookingListPage, StarterFlightListsPage, BuggyListPage, CaddyListPage, BuggyDetailsPage, CaddyDetailsPage,
    BookingClubListPage, PricesDisplayPage, AddPlayerListPage, BuggySeatingPage, PlayerAddressPage,
    ImageZoom, TeeSlotListModal, ExternalPaymentPage, 
    BookingChartPage,
    BookingCalendarPage,
    ClubCalendarComponent,
    // BookingDetailModalComponent,
    SlotsDetailComponent,
    // ClubBookingDetailsPage,
    FaqPage,
    GroupBookingOption,
    ContactUsPage,
    NotificationsPage,
    ClubUserManagementPage,
    CaddyFlightListsPage,
    RatingsListPage,
    RefundBookingPlayersModal,
    VoucherListModal,
    MemberMenuModal,
    PlayerVoucherModal,
    CaddyFlightDetailsPage,
    AddPlayerTypeDiscountModal,
    ManageVoucherModal,
    PlayerMg2uCreditsModal,
    SearchDiscountCompanyModal,
    RedeemPlayerClubCreditsModal,
    ManageDiscountCardModal,
    ProgramClubListPage,
    LeagueLeaderboardPage, LeagueLowestPage, LeagueScorecardPage,
    CompetitionLeagueMenuPage,
    ClubBookingListPage,
    CaddyScheduleDisplayPage,
    CaddyUnavailabilityPage,
    PlayerFacilityHomePage,
    PlayerRefundRedeemHistoryPage,
    ClubRefundRedeemHistoryPage
    // PlayerOptionModalComponent
    // ScorerAppHomePage
];
