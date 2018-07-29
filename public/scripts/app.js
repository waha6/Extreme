//***********VARIABLES***********/
var data ={
    ads:null,
    inbox:null,
    chat:null
};
const config = {
    apiKey: "AIzaSyDaQT4TZzbbVZUEUBvzrUPk6DDecxcbQAw",
    authDomain: "olx-pwapp.firebaseapp.com",
    databaseURL: "https://olx-pwapp.firebaseio.com",
    projectId: "olx-pwapp",
    storageBucket: "olx-pwapp.appspot.com",
    messagingSenderId: "1085851231788"
};
var storage, storageRef, db, functions, messaging, auth, user;
let con = document.querySelector('.container');
firebase.initializeApp(config);
firebaseConfig();
const addmessage = functions.httpsCallable('addMessage');
//***********LISTENERS***********/
messaging.onTokenRefresh(tokenRefresh);
messaging.onMessage(function (payload) {
    console.log('On message:', payload);
    console.log(payload.notification.click_action)
    if (window.location.href==payload.notification.click_action) return;
    var notificationTitle = payload.notification.title;
    var notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
        click_action: payload.notification.action,
    };
    Notification.requestPermission(function (result) {
        if (result === 'granted') {
            navigator.serviceWorker.ready.then(function (registration) {
                registration.showNotification(notificationTitle, notificationOptions)
            })
        }
    })
});
window.onhashchange=()=>{
    console.log('Hash:.............................................................')
    page=locationVar('page');pageLoad(page);
}
window.addEventListener('load',async (e) => {
    checkSub();
});
//***********FUNCTIONS***********/
function addScript(file) {
    let imported = document.createElement('script');
    imported.src = file;
    document.head.appendChild(imported)
}

function addFavorite(t) {
    updateUser('user', u().uid, "favoriteads", t.id);
    changeFavorite('');
}
function removeFavorite(t) {
    updateUser('user', u().uid, "favoriteads", t.id,'r');
    changeFavorite('');
}
function changeFavorite(id){
    let rf= document.querySelector('#rf')
    let af= document.querySelector('#af')
    if(!id){
        rf.style.display=(rf.style.display=='none')?'block':'none';
        af.style.display=(af.style.display=='none')?'block':'none'
        return;
    }
    if(u()){
    if(u().favoriteads.includes(id)){
        rf.style.display='block'
        af.style.display='none'
    }else{
        af.style.display='block'
        rf.style.display='none'
    }}else document.querySelector('.adoffline').style.display='none';
}
function addChat(c, d, chatdoc) {
    let ref = db.collection(c).doc(d);
    ref.get().then(r => {
        let a = r.data().chat;
        a.push(chatdoc);
        ref.update({
            'chat': a
        })
    })
}

function addMessage(c, d, chatdoc) {
    let ref = db.collection(c).doc(d);
    ref.get().then(r => {
        let a = r.data().messages;
        a.push(chatdoc);
        ref.update({
            'messages': a
        })
    })
}
function changeIcon(){
    let b=document.querySelector('.back.icon');
    let o=document.querySelector('.open.icon');
    if(checkPage('home')){
        b.style.display='none';
        o.style.display='block';
    }
    else {
        o.style.display='none';
        b.style.display='block';
    }
    
}
function adBox(id, content) {
    return `<div class="box" id="${id}" onclick="call('./#page=ad&adid=${id}')"><div class="adimg"><img src="${content.imageURL}" width="100%" height="100%"></div><div class="adtitle"><h1>${content.title}</h1></div><div class="aduser f50"><div>${content.category}</div><div><h2>${content.price}</h2></div></div><div class="addesciption notcomplete">${content.description}</div></div>`
}
//jj
function adPage(id, content) {
    return `<div class="adbox" id="${id}"><div class="adBtitle"><h1>${content.title}</h1></div><div class="adBdate"><h4>${time(content.date)}</h4></div><h3><div class="adBuser f50">User: ${content.uname}</div><div class="adBphone">Phone No:${content.phone}</div><div class="adBprice">${content.price}</div></h3><div class="adBcat"><h4>Category: " ${content.category}"</h4></div><div class="adimg"><img src="${content.imageURL}" width="100%" height="100%"></div><div class="addesciption">${content.description}</div>`+((!u())?'':'<div class="adoffline"><a><img id="rf" src="./images/star.svg" width="10%" onclick="removeFavorite(this.parentNode.parentNode.parentNode);"><img id="af" src="./images/favorite.svg" width="10%" onclick="addFavorite(this.parentNode.parentNode.parentNode);"></a></div>') + ((u() && content.uname != user.uname) ? `<form onsubmit="return sendMessage(this)" class='message-form' id='${content.uid}'><textarea name='text' rows='7' placeholder='Send message to user for buying this product'></textarea><button>Send</button></form>` : "") + `</div>`
}

function closeNav(t) {
    t.classList.add('hide')
}

function j(s,r,d) {
    window.history.go('.');
    window.location.href=s
}

function call(s, r = 1, d = 1) {
    if("#"+s.split('#')[1]==location.hash) return ;
    if(s!='./#') {
        document.querySelector('.container').innerHTML=loader();
        if(checkMobile()&&(locationVar('inbox')||locationVar('chat'))) history.go('#');
    }
    if(s.indexOf('page=')!=-1){ 
        if(checkMobile()&&locationVar('page')){
                if(s.indexOf('page=inbox')!=-1) history.replaceState(null,null,'./#');
                if(s.indexOf('?page=chat')!=-1)
                    location.assign(s);
                else if(s=='./#') history.go('#') 
                else location.replace(s);}
        else location.assign(s);
    }else window.location.href=s; 
}

function cu() {
    auth = firebase.auth().currentUser;
    return auth
}

function checkSub() {
    if (u()) subNotifications()
}

function chatPage() {
    con.innerHTML=loader();
    let chatid = locationVar('chatid');
    let n = 0;
    db.collection('chat').doc(chatid).onSnapshot(r => {
        let s = r.data();
        let sb = s.sname == u().uname;
        let content = s.messages;
        if (con.querySelector('.loader')||con.querySelector('fc.messageBox')) con.innerHTML = `<main class='fc'><div class="adbox"><div class="name f50"><div><h2>${s.sname}</h2></div><div><h2>${s.bname}</h2></div></div><div><h3>${s.adtitle}</h3></div><div class='chatBox' id='${r.id}'></div><form onsubmit="return sendReplay(this)" class="message-form"><textarea name="text" rows="4" placeholder="Message replay"></textarea><button>Replay</button><label hidden id='mid'>${(sb)?s.bid:s.sid}</label></form></div><main>`;
        let m = document.querySelector('.chatBox');
        for (n; n < content.length; n++) m.innerHTML += makeChat(content[n], sb);
        if (m) m.scrollTop = m.scrollHeight
    })
}
function docData(e){
    let j=[];
    e.forEach(r=>{
    let k = r.doc.data();
    k['id']=r.doc.id;
    j.push(k);
    });
    return j
}
function firebaseConfig() {
    storage = firebase.storage();
    storageRef = storage.ref();
    firebase.firestore().settings({
        timestampsInSnapshots: !0
    });
    firebase.firestore().enablePersistence();
    db = firebase.firestore();
    functions = firebase.functions();
    messaging = firebase.messaging();
    cu();
    u()
}
function home(r){
    if (!con.querySelector('main')) con.innerHTML = '<main></main>';
    let m = document.querySelector('main');
    m.innerHTML='';
    r.forEach(s=>{if(s)m.innerHTML += adBox(s.id, s)})
}
async function homePage() {
    con.innerHTML=loader();
    home(data.ads);
    if(!data.inbox&&u()) inboxData();
}
async function adsData(){
    await db.collection('ads').orderBy('date', 'desc').onSnapshot((r) => {
        if(!data.ads){
            data.ads=docData(r.docChanges());
        }
        else {
            let k=docData(r.docChanges());
            data.ads=k.concat(data.ads);
        }
        if(first){
            first=false;
            pageLoad(locationVar('page'));
        }else if(checkPage('home')) home(data.ads);
    })
    return ;
}
function checkPage(s){
    if(!location.search){
        if(!location.hash) return 'home'==s
        else{
            return locationVar('page')==s
        }
    }else return locationVar('page')==s
    
}
function inbox(e){
    if (!con.querySelector('main')) con.innerHTML = '<main class="fc"><div class="messageBox flexC"></div></main>';
    let m = con.querySelector('main div');
   e.chat.forEach(async s=>{
        m.innerHTML = (await makemessage(s)) + m.innerHTML;
        })
}
function inboxPage() {
    con.innerHTML=loader();
    if(!data.inbox) inboxData();
    else inbox(data.inbox)
}
async function inboxData(){
    await db.collection('SIM').doc(u().messageid).onSnapshot(async (r) => {
        data.inbox = await r.data();
        if(checkPage('inbox')) inbox(data.inbox);
     })
}
function loader() {
    return '<div class="man"><div class="loader"></div></div>'
}

function locationVar(st) {
    let n;
    (window.location.search||window.location.hash).substring(1).split("&").forEach(s => {
        let v = s.split("=");
        if (st == v[0]) n = v[1]
    });
    return n || null
}

function logout(item) {
    firebase.auth().signOut();
    localStorage.user = null;
    if(!location.hash&&!location.search) location.reload();
    else history.go(-(history.length-2));
}

function makeChat(c, sb) {
    return `<div class='#'><div>${c.context.replace(/\n/g,'<br>')}</div><div>${time(c.date)}</div></div>`.replace('#', (c.sb != sb) ? 'sChat' : 'bChat')
}

function makemessage(c) {
    return c.get().then(content => {
        id = content.id;
        content = content.data();
        let arr = content.messages;
        arr = arr[arr.length - 1];
        return `<div class="messageC flexC" onclick="call('./?page=chat&chatid=${id}')"><div><h2>Seller : ${content.sname}</h2></div><div><h2>Buyer : ${content.bname}</h2></div><div><h3>${content.adtitle}</h3></div><div id='mContent' class='notcomplete'>${arr.context}</div><div><h3>${time(arr.date)}</h3></div></div>`
    })
}

async function myadsPage() {
    con.innerHTML=loader();
    data.ads.forEach(s => {
        if (!con.querySelector('main')) con.innerHTML = '<main></main>';
        let m = document.querySelector('main');
        if(u().adsid.includes(s.id))
            m.innerHTML += adBox(s.id, s)
        })
}
async function myFavoritePage() {
    con.innerHTML=loader();
    let fAds = u().favoriteads;
    data.ads.forEach(s => {
        if (!con.querySelector('main')) con.innerHTML = '<main></main>';
        let m = document.querySelector('main');
        if(fAds.includes(s.id))
            m.innerHTML += adBox(s.id, s)
        })
}

function openNav(t) {
    t.classList.remove('hide')
}

async function pageLoad(pg) {
    if(checkMobile()&&matchMedia( '(display-mode: standalone)' ).matches) changeIcon();
    if(first&&!checkPage('chat')){
        await adsData();
        return;
    }
    b = 2;
    document.querySelectorAll(".signin").forEach(r => {
        r.style.display = (u()) ? "block" : "none";
    });
    document.querySelectorAll(".signout").forEach(r => {
        r.style.display = (!u()) ? "block" : "none";
    });
    document.querySelector('#unpwa').innerHTML = (u()) ? user.uname : '';
    if (pg === "submitad") submitAd();
    else if (pg === "login" && !u()) SignIn();
    else if (pg === "register" && !user) SignIn();
    else if (pg === "search") search();
    else if (pg === "ad") showAd();
    else if (pg === "inbox" && user) inboxPage();
    else if (pg === "myads" && user) myadsPage();
    else if (pg === "myfavorite" && user) myFavoritePage();
    else if (pg === "chat" && user) {
        chatPage();
        v = '';
        b++
    } else {
        homePage();
        return;
    }
}
function checkMobile(){
    return /Android/i.test(navigator.userAgent)||/iPad|iPhone|iPod/.test(navigator.userAgent)||/windows phone/i.test(navigator.userAgent)
}
function setError(errorMessage, time) {
    let err = document.querySelector('#err');
    setTimeout(() => {
        closeNav(err)
    }, time);
    openNav(err);
    document.querySelector('#errmessage').innerHTML = errorMessage
}
function search() {
    let text = locationVar("text") || '';
    let cat = locationVar("cat");
    con.innerHTML=loader();
    con.innerHTML = '<div class="man"><div class="loader"></div></div>';
    function d(r){
        if (!con.querySelector('main')) con.innerHTML = '<main></main>';
            let m = document.querySelector('main');
            r.forEach(s => {
                let d = s.data();
                if (d.title.toLowerCase().indexOf(text.toLowerCase()) != -1) m.innerHTML += adBox(s.id, d)
            })
    }
    function e(r,t){
        if (!con.querySelector('main')) con.innerHTML = '<main></main>';
            let m = document.querySelector('main');
            r.forEach(s => {
                if (s.title.toLowerCase().indexOf(text.toLowerCase()) != -1&&t(s.category)) m.innerHTML += adBox(s.id, s)
            })
    }
    if(data.ads)
        if (cat == 'all')
            e(data.ads,j=>true);
        else
            e(data.ads,j=>j==cat);
    else if (cat == 'all')
        db.collection('ads').get().then(r => {d(r)})
    else
        db.collection('ads').where('category', '==', cat).get().then(r => {d(r)})
    document.querySelector('#searchbar').reset();
}
function showAd() {
    let id = locationVar('adid');
    data.ads.forEach(s=>{
        if(id==s.id){
            con.innerHTML = adPage(id, s);
            changeFavorite(id)
        }
    })
}
function sendMessage(t) {
    if (t.text.value != '') {
        let adid = document.querySelector('.adbox').id;
        let adtitle = document.querySelector('.adBtitle>h1').innerHTML;
        let sname = document.querySelector('.adBuser').innerHTML.split(': ')[1];
        let sid = document.querySelector('.message-form').id;
        let chatid = u().uname + '-' + adid + '-' + sname;
        let sb = !1;
        let mObj = {
            'context': t.text.value,
            'date': firebase.firestore.Timestamp.now(),
            'sb': sb
        };
        let chatdoc = db.collection('chat').doc(chatid);
        chatdoc.get().then(r => {
            addmessage({
                'uid': sid,
                'content': t.text.value,
                'name': user.uname,
                'url': window.location.origin + "/?page=chat&chatid=" + chatid
            });
            if (r.exists) {
                updateUser('chat', chatid, 'messages', mObj, '', 1)
            } else {
                chatdoc.set({
                    'bid': u().uid,
                    'sid': sid,
                    'bname': user.uname,
                    'sname': sname,
                    'messages': [mObj],
                    'adid': adid,
                    'adtitle': adtitle
                }).then(() => {
                    addChat('SIM', u().messageid, chatdoc);
                    db.collection('user').doc(sid).get().then(r => {
                        addChat('SIM', r.data().messageid, chatdoc)
                    })
                })
            }
        })
    }
    t.reset();
    return !1
}
function sendReplay(t) {
    if (t.text.value != '') {
        let sname = document.querySelector('.adbox div:first-child h2').innerHTML;
        let chatid = document.querySelector('.chatBox').id;
        let sb = sname == u().uname;
        let mObj = {
            'context': t.text.value,
            'date': firebase.firestore.Timestamp.now(),
            'sb': sb
        };
        addMessage('chat', chatid, mObj);
        let l = t.querySelector('label').innerHTML;
        addmessage({
            'uid': l,
            'content': t.text.value,
            'name': u().uname,
            'url': window.location.href
        })
    }
    t.reset();
    return !1
}
function SignIn() {
    fetch("../assests/login.json").then(r => r.json()).then(json => {
        document.querySelector(".container").innerHTML = "" + ((page == 'register') ? json.register : (page == 'login') ? json.login : "")
    })
}

function subNotifications() {
    messaging.requestPermission().then(() => tokenRefresh()).catch((err) => {
        console.log("error getting permission :(")
    })
}

function submitcreateform() {
    let form = document.querySelector('.register-form');
    let mail = form.mail.value;
    let pass = form.pass.value;
    if (!(mail && pass && form.name.value && form.phone.value >= 10)) {
        setError("Fill Form Correctly", 2000);
        return !1
    }
    firebase.auth().createUserWithEmailAndPassword(mail, pass).then(async user => {
        auth = firebase.auth().currentUser;
        let mid = await db.collection('SIM').add({
            chat: []
        }).then(r => r.id);
        let uobj = {
            "adsid": [],
            "favoriteads": [],
            "messageid": mid,
            "phonenumber": "+92" + form.phone.value,
            "uemail": auth.email,
            "uid": auth.uid,
            "uname": form.name.value,
            'tokenid': ''
        };
        db.collection("user").doc(auth.uid).set(uobj).then(async res => {
            auth.updateProfile({
                displayName: uobj.uname
            });
            localStorage.setItem("user", JSON.stringify(uobj));
            form.reset();
            window.location.hash="";
        });
        return !1
    }).catch((error) => {
        setError(error.message, 5000)
    });
    return !1
}

function submitloginform() {
    let form = document.querySelector('.login-form');
    let mail = form.mail.value;
    let pass = form.pass.value;
    firebase.auth().signInWithEmailAndPassword(mail, pass).then(async (u) => {
        auth = firebase.auth().currentUser;
        let uobj;
        if (u) {
            await db.collection('user').doc(auth.uid).get().then(r => {
                uobj = r.data()
            });
            localStorage.setItem('user', JSON.stringify(uobj))
        }
        location.replace('#');
        return !1
    }).catch(function (error) {
        setError(error.message, 3000)
    });
    return !1
}

function submitAd() {
    if (u()) {
        fetch("../assests/submitads.json").then(r => r.json()).then(json => {
            document.querySelector(".container").innerHTML = "" + json.data
        })
    } else {
        window.location.hash="page=login"
    }
}
async function submitPushAd() {
    auth = firebase.auth().currentUser;
    let form = document.querySelector('.ads-form');
    let title = form.title.value;
    let cat = document.querySelector('#category').value;
    let descrip = form.description.value;
    let pric = form.price.value;
    let img = "";
    if (!(form.pic.value && title && descrip && pric)) {
        setError("Fill form correctly", 2000);
        return 0
    }
    let stored = await storageRef.child(`adimg/${form.pic.files[0].name}/`);
    let snap = await stored.put(form.pic.files[0]);
    let snapshot = await snap.ref.getDownloadURL().then(url => {
        img = url
    });
    db.collection('ads').add({
        "uid": u().uid,
        "uname": user.uname,
        "phone": user.phonenumber,
        "title": title,
        "category": cat,
        "description": descrip,
        "phone": user.phonenumber,
        "imageURL": img,
        "date": firebase.firestore.Timestamp.now(),
        "price": "Rs:" + pric
    }).then(ad => {
        updateUser('user', user.uid, "adsid", ad.id)
    });
    form.reset()
}

function time(o) {
    return new Date(Number(o.seconds + "" + Math.round(o.nanoseconds / 1000000))).toString().split(' GMT')[0]
}

function tokenRefresh() {
    messaging.getToken().then(t => {
        updateUser('user', u().uid, 'tokenid', t, 'n')
    }).catch(function (err) {
        console.log('Unable to retrieve refreshed token ', err)
    })
}

function u() {
    user = (localStorage.user) ? JSON.parse(localStorage.user) : null;
    return user
}

function updateUser(c, id, name, value, type, re) {
    let data = db.collection(c).doc(id);
    data.get().then(r => r.data()).then(a => a[name]).then(a => {
        if(type=='r') a.pop(value);
        else if (type == 'n') a = value;
        else if (!a.includes(value)) a.push(value);
        else return !1;
        if (!re) {
            let j = JSON.parse(localStorage.user || '{}');
            j[name] = a;
            localStorage.user = JSON.stringify(j)
        }
        data.update(JSON.parse(`{${JSON.stringify(name)}:${JSON.stringify(a)}}`))
    })
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("sw.js").then(() => {
        console.log('SW Registerd');
    }, () => {
        console.log('SW Registration Failed')
    })
} else {
    console.log('SW Not Supported')
}