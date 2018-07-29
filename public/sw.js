const files = ["./", "./scripts/app.js", "./styles/style.css", "./styles/style[small].css", "./styles/style[medium].css", "./styles/style[large].css", "./styles/style[exlarge].css", "./manifest.json", "./assests/login.json", "./assests/submitads.json", "./images/favorite.svg","./images/star.svg", "./images/icons/icon-72x72.png", "./images/icons/icon-96x96.png", "./images/icons/icon-128x128.png", "./images/icons/icon-144x144.png", "./images/icons/icon-152x152.png", "./images/icons/icon-192x192.png", "./images/icons/icon-384x384.png", "./images/icons/icon-512x512.png", '/__/firebase/5.2.0/firebase-app.js', '/__/firebase/5.2.0/firebase-auth.js', '/__/firebase/5.2.0/firebase-firestore.js', '/__/firebase/5.2.0/firebase-storage.js', '/__/firebase/5.2.0/firebase-messaging.js', '/__/firebase/5.2.0/firebase-functions.js'];
const currentver = "0.2.0";
const previousver = "0.1.0";
var CACHE = 'EX-' + currentver;
var dataCACHE = 'EXData';
self.addEventListener('install', function (evt) {
    console.log('SW installed');
    evt.waitUntil(precache());
});
self.addEventListener('activate', evt => {
    console.log("SW activate");
    caches.has('EX-' + previousver).then(() => {
        caches.delete('EX-' + previousver)
    })
    return self.clients.claim();
});
self.addEventListener('fetch', function (evt) {
    evt.respondWith((navigator.onLine) ? fromNetwork(evt.request) : fromCache(evt.request))
});
function precache() {
    return caches.open(CACHE).then(function (cache) {
        return cache.addAll(files)
    })
}
function fromCache(req) {
    return caches.match((req.url.indexOf("?page") != -1) ? new Request("./") : req).catch(() => fromNetwork(req))
}
async function cacheRefresh(wu,res){
    let check=location.origin != (wu).origin;
    ((check) ? caches.open(dataCACHE) : caches.open(CACHE)).then(d => {
        if(check&&res.type!='opaque')   return;
            d.put((wu.toString().indexOf("/?page")!=-1)?wu.origin:wu, res);
    })
}
function fromNetwork(req) {
    return fetch(req).then(res => {
       cacheRefresh(new URL(req.url),res.clone());
        return res
    }).catch(() => {
        return caches.match((req.url.toString().indexOf("/?page") != -1) ? new Request("./") : req)
    })
}