var LetiFramework = LetiFramework || {};

LetiFramework.App = LetiFramework.App || {};

LetiFramework.App.scaled = 1;

LetiFramework.App.initialize = function() {

    if (this.isPhoneGap()) {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("pause", this.onPause, false);
        document.addEventListener("resume", this.onResume, false);
        document.addEventListener("backbutton", this.onBackKeyDown, false);
    } else {
        this.onDeviceReady();
    }
}

LetiFramework.App.isPhoneGap = function() {
    return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/);
}

LetiFramework.App.onBackKeyDown = function(e) {
    e.preventDefault();
}

LetiFramework.App.removeOnBackKeyDown = function(e) {
    document.removeEventListener("backbutton", this.onBackKeyDown, false);
}

LetiFramework.App.onPause = function() {
    var state = LetiFramework.Renderer.currentState();
    if (state) {
        state.pause();
    }
}

LetiFramework.App.onResume = function() {
    var state = LetiFramework.Renderer.currentState();
    if (state) {
        state.resume();
    }
}

LetiFramework.App.onDeviceReady = function() {
    LetiFramework.App.initializeFramework();
}

LetiFramework.App.initializeFramework = function() {
    // Initialize net
    LetiFramework.NetworkManager.initialize();

    // Initialize analytics
    if (LetiFramework.App.isPhoneGap()) {
        // get GA Tracking Id
        LetiFramework.NetworkManager.postRequest("ReadServlet", {
                modelType: LetiFramework.NetworkManager.MODEL_TYPE_APP_BUILD,
                id: LetiFramework.NetworkManager.appId
            },
            function(data) {
                data = JSON.parse(data);
                if (data.readRecords.length > 0) {
                    var app = data.readRecords[0];
                    var trackingId = app.analyticsTrackingId;
                    if (trackingId.length > 0) {
                        stores.set("analyticsTrackingId", trackingId);
                        LetiFramework.Analytics.initialize(trackingId);
                    }
                }
            },
            function(err) {

            });
    } else {
        // Initialize Web GA
        (function(i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
        LetiFramework.Analytics.initialize('UA-41236206-16');

        // Initialize FB Web SDK
        window.fbAsyncInit = function() {
            FB.init({
                appId: '975842222485362',
                xfbml: true,
                version: 'v2.6'
            });
        };

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }

    // Initialize google notification
    //LetiFramework.NotificationService.initialize();

    // Initialize file man
    LetiFramework.FileManager.initialize();   

    // Initialize DB
    LetiFramework.Db.initialize();
    // LetiFramework.Db.clear();
    //LetiFramework.Db.printDb();

    // Initialize Sound man
    LetiFramework.SoundManager.initialize();

    // Initialize Renderer
    LetiFramework.Renderer.initialize();

    // Initialize Game Controller
    LetiFramework.GameController.initialize();
}

// Initialize Luminous powered App
LetiFramework.App.initialize();