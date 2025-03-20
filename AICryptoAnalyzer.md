## AI Crypto Analyzer: Privacy Policy

Welcome to the AI Crypto Analyzer app for Android!

This is a closed source Android app developed by Elyahu Jacobi.

As an avid Android user myself, I take privacy very seriously.
I know how frustrating it is when apps collect your data without your knowledge.

### Data collected by the app

I hereby state, to the best of my knowledge and belief, that I have not programmed this app to collect any personally identifiable information. All data (app preferences (like theme) and alarms) created by the you (the user) is stored locally in your device only, and can be simply erased by clearing the app's data or uninstalling it.

### Explanation of permissions requested in the app

The list of permissions required by the app can be found in the `AndroidManifest.xml` file:

<br/>

| Permission | Why it is required |
| :---: | --- |
| `android.permission.INTERNET` | Enables the app to connect to the internet for various API access. Permission automatically granted by the system; can't be revoked by user.  |
| `android.permission.SCHEDULE_EXACT_ALARM` | Was introduced in Android 12 and required to set an exact alarm. If your device is running Android 12, the app requests this permission to set an exact alarm. This is the same as `USE_EXACT_ALARM`, except that you, the user, or the system, can revoke this permission at any time from Settings. Revoking this permission will, however, cancel all alarms set by the app. |
| `android.permission.RECEIVE_BOOT_COMPLETED` | When your device restarts, all alarms set in the system are lost. This permission enables the app to receive a message from the system once the system has rebooted and you have unlocked your device the first time. When this message is received, the app creates a service to set all the active alarms in the system.|
| `android.permission.POST_NOTIFICATIONS` | Required by the app to post notifications. Has to be granted by the user manually; can be revoked by the system or the user at any time. |

 <hr style="border:1px solid gray">

If you find any security vulnerability that has been inadvertently caused by me, or have any question regarding how the app protectes your privacy, please send me an email or post a discussion on GitHub, and I will surely try to fix it/help you.

Yours sincerely,  
Elyahu Jacobi.  
New York, USA  
ElyahuJacobi@gmail.com
