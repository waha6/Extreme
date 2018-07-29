importScripts('/__/firebase/5.2.0/firebase-app.js');
importScripts('/__/firebase/5.2.0/firebase-messaging.js');
const config = {
    messagingSenderId: "1085851231788"
};
firebase.initializeApp(config);
console.log("firebase Service worker are register.");
const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  var notificationTitle = payload.notification.title;
  var notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
    action: payload.notification.action,
  };
  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});