var pushButton;
var swRegistration;

var subscriptions = [];

function updateSubscriptionOnServer (subscription) {
    console.log(subscription);
    if (subscription)
      fetch('/subscription', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription.toJSON())
      })
      .then(r => r.text())
      .then(r => console.log('[server] ' + r));
}

function urlB64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}

function subscribeUser() {
  var applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function initialiseUI() {
    pushButton.addEventListener('click', function() {
        pushButton.disabled = true;
        if (isSubscribed) {
            unsubscribeUser();
        } else {
            subscribeUser();
        }
    });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
        isSubscribed = !(subscription === null);

        updateSubscriptionOnServer(subscription);

        if (isSubscribed) {
            console.log('User IS subscribed.');
        } else {
            console.log('User is NOT subscribed.');
        }

        updateBtn();
    });
}

function updateBtn() {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

    if (isSubscribed) {
        pushButton.textContent = 'Disable Push Messaging';
    } else {
        pushButton.textContent = 'Enable Push Messaging';
    }
  
    pushButton.disabled = false;
}

window.addEventListener('load', function () {
    pushButton = document.querySelector('#PushButton');
    applicationServerPublicKey = 'BFcqYfeUHMJI6qvRn0klkev-9L6uHuEP2HwvF6SsNvkm1Y9Vb_U0m7eNjMgrYWXvHe5P1ZKaifDHW3fAdsn22Lg';

    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');

        navigator.serviceWorker.register('sw.js')
        .then(function(swReg) {
            console.log('Service Worker is registered', swReg);

            swRegistration = swReg;

            initialiseUI();
        })
        .catch(function(error) {
            console.error('Service Worker Error', error);
        });
    } else {
        console.warn('Push messaging is not supported');
        pushButton.textContent = 'Push Not Supported';
    }
});