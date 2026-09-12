const CACHE_NAME = "workout-check-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css?v=2",
    "./script.js?v=2",
    "./manifest.json",
    "./images/routine-guide.png",
    "./images/icon-192.png",
    "./images/icon-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES))
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(
                names
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        )
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const copy = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, copy);
                });

                return response;
            })
            .catch(() =>
                caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;

                    if (event.request.mode === "navigate") {
                        return caches.match("./index.html");
                    }
                })
            )
    );
});