var LetiFramework = LetiFramework || {};

LetiFramework.NotificationService = LetiFramework.NotificationService || {};

LetiFramework.NotificationService.senderId = '969724924992';

LetiFramework.NotificationService.initialize = function() {
    if(LetiFramework.App.isPhoneGap()) {
        // register for push
        var push = PushNotification.init({ "android": {"senderID": this.senderId} });
        push.on('registration', this.onRegistration);
        push.on('notification', this.onNotification);
        push.on('error', this.onError);        
    }   
}

LetiFramework.NotificationService.onRegistration = function(data) {
    var registrationId = data.registrationId;

    // check if we need to update push regId
    LetiFramework.NetworkManager.postRequest("ReadFieldServlet",
    {
        modelType: LetiFramework.NetworkManager.MODEL_TYPE_PUSH_REGISTRATION, 
        sortField: "createdDateTimeStamp",
        sortDirection: 0,
        startIndex: 0,
        recordCount: 1,
        fieldNames: ["registrationId"],
        fieldValues: [registrationId]
    },
    function(data) {
        data = JSON.parse(data);                    
        if(data.readRecords.length == 0) {
            LetiFramework.NotificationService.sendRegistrationId(registrationId);
        }
    }, 
    function(err) {
        
    });
}

LetiFramework.NotificationService.onNotification = function(data) {
    // data.message,
    // data.title,
    // data.count,
    // data.sound,
    // data.image,
    // data.additionalData
}

LetiFramework.NotificationService.onError = function(e) {
    //alert(e.message);
}

LetiFramework.NotificationService.sendRegistrationId = function(registrationId) {
    LetiFramework.NetworkManager.postRequest("CreateServlet",
    {
        modelType: LetiFramework.NetworkManager.MODEL_TYPE_PUSH_REGISTRATION, 
        model: { 
            registrationId: registrationId, 
            appBuildId: LetiFramework.NetworkManager.appId
        }
    },
    function(data) {
        
    }, 
    function(err) {
        
    });
}