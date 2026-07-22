// Public contract of the notifications feature for other features.
// Cross-feature callers import THIS module (domain), never data/.
export { registerFcmToken as registerPushToken, removeFcmToken as removePushToken } from '../data/legacy/handleFcmMessaging';
