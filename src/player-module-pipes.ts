import {SafePipe} from "./custom/safe-pipe";
import {TranslationPipe} from "./i18n/TranslationPipe";
import {Focuser} from "./custom/focuser";
/**
 * Created by ashok on 22/11/16.
 */

export const PLAYER_MODULE_PIPES = [
    SafePipe,
    TranslationPipe,
    Focuser
]
