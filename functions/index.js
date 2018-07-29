const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.addMessage = functions.https.onCall((data, context) => {
  console.info(data.uname);  
  return admin.firestore().collection('user').doc(data.uid).get().then(r=>{
    let d=r.data();
    let c=data.content.slice(0,40);
    const payload = {
      notification: {
       title: `New Message from ${data.name}`,
       body: c,
       icon: '../images/icons/icon-72x72.png',
       click_action: data.url
  }
}
console.info("payload of Message"+payload);
return admin.messaging().sendToDevice(d.tokenid,payload);
  });
  return 'ERROR';
});