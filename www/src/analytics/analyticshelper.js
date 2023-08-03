var LetiFramework = LetiFramework || {};

LetiFramework.Analytics = LetiFramework.Analytics || {};

LetiFramework.Analytics.addCustomDimensions = function() {
	// A logged in user
	var user = LetiFramework.GameController.currentUser;
	if(user && user.otherRegisterFields) {
		var otherRegisterFields = JSON.parse(user.otherRegisterFields);		
		if(otherRegisterFields.institution) this.addCustomDimension(1, otherRegisterFields.institution);		
		if(otherRegisterFields.course) this.addCustomDimension(2, otherRegisterFields.course);
		if(otherRegisterFields.gender) this.addCustomDimension(4, otherRegisterFields.gender);
		this.addCustomDimension(3, otherRegisterFields.mode);
	}
}

/*
 * Initialize analytics
 * where trackingId is your Google Analytics Mobile App property
 */
LetiFramework.Analytics.initialize = function(trackingId) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.startTrackerWithId(trackingId);
	} else {
		ga('create', trackingId, 'auto');
	}
}

/*
 * To track a Screen (PageView):
 */
LetiFramework.Analytics.trackPage = function(page) {
	this.addCustomDimensions();
	if(LetiFramework.App.isPhoneGap()) {
		if(window.analytics)		
		   window.analytics.trackView(page);
	} else {		
		ga('send', 'pageview', page);
	}
}

/*
 * To track an Event:
 * Label and Value are optional, Value is numeric
 */
LetiFramework.Analytics.trackEvent = function(category, action, label, value) {
	this.addCustomDimensions();
	if(LetiFramework.App.isPhoneGap()) {
		//window.analytics.trackEvent(category, action, label, value);
	} else {
		ga('send', 'event', category, action, label ? JSON.stringify(label) : null, value);
	}
}

/*
 * To track an Exception:
 * where fatal is boolean
 */
LetiFramework.Analytics.trackException = function(description, fatal) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.trackException(description, fatal);
	}
}

/*
 * To track User Timing (App Speed):
 * where intervalInMilliseconds is numeric
 */
LetiFramework.Analytics.trackTiming = function(category, intervalInMilliseconds, variable, label) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.trackTiming(category, intervalInMilliseconds, variable, label);
	}
}

/*
 * To add a Transaction (Ecommerce)
 * where Revenue, Tax, and Shipping are numeric
 */
LetiFramework.Analytics.addTransaction = function(id, affiliation, revenue, tax, shipping, currencyCode) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.addTransaction(id, affiliation, revenue, tax, shipping, currencyCode);
	}
}

/*
 * To add a Transaction Item (Ecommerce)
 * where Price and Quantity are numeric
 */
LetiFramework.Analytics.addTransactionItem = function(id, name, sku, category, price, quantity, currencyCode) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.addTransactionItem(id, name, sku, category, price, quantity, currencyCode);
	}
}

/*
 * To add a Custom Dimension
 */
LetiFramework.Analytics.addCustomDimension = function(key, value) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.addCustomDimension(key, value, this.onSuccess, this.onError);
	} else {
		ga('set', 'dimension' + key, value);
	}
}

/*
 * To set a UserId:
 */
LetiFramework.Analytics.setUserId = function(userId) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.setUserId(userId);
	}
}

/*
 * To enable verbose logging:
 */
LetiFramework.Analytics.debugMode = function() {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.debugMode();
	}
}

LetiFramework.Analytics.onSuccess = function() {
	
}

LetiFramework.Analytics.onError = function() {
	
}