// serviceWorkerRegistration.js
const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
      window.location.hostname === "[::1]" ||
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)|localhost)/
      )
  );
  
  export function register() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        const swUrl = "/service-worker.js";
  
        if (isLocalhost) {
          checkValidServiceWorker(swUrl);
        } else {
          registerValidSW(swUrl);
        }
      });
    }
  }
  
  function registerValidSW(swUrl) {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log("Service Worker registriert:", registration);
      })
      .catch((error) => {
        console.error("Service Worker Registrierung fehlgeschlagen:", error);
      });
  }
  
  function checkValidServiceWorker(swUrl) {
    fetch(swUrl)
      .then((response) => {
        if (
          response.status === 404 ||
          response.headers.get("content-type")?.indexOf("javascript") === -1
        ) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister();
            window.location.reload();
          });
        } else {
          registerValidSW(swUrl);
        }
      })
      .catch(() => {
        console.log("Keine Internetverbindung gefunden. App läuft im Offline-Modus.");
      });
  }
  
  export function unregister() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.unregister();
      });
    }
  }
  