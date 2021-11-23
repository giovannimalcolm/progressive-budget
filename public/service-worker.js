const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.js",
    "/manifest.json",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
  ];

const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

//install
self.addEventListener("install", function(event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        console.log("Opened cache");
        return cache.addAll(FILES_TO_CACHE);
      })
    );

  });


  // fetch
self.addEventListener("fetch", function(evt) {
    // cache all successful requests to the API
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // store the response in the cache if it was good
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // when there's a network request failure, try to get data from the cache
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
  
    //provide static assets thru cache using if the request isn't for the API 
    evt.respondWith(
        fetch(evt.request).catch(function() {
       return caches.match(evt.request).then(function(response) {
           if (response) {
            return response;
        } else if (evt.request.headers.get("accept").includes("text/html")) {
            return catches.match("/");
        }
    });
  })
);
});