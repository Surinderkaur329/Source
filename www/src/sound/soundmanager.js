var LetiFramework = LetiFramework || {};

LetiFramework.SoundManager = LetiFramework.SoundManager || {};

LetiFramework.SoundManager.soundOn = true; // for sfx and bg
LetiFramework.SoundManager.narrationOn = true;

LetiFramework.SoundManager.initialize = function() {
	if(LetiFramework.App.isPhoneGap()){//Device
		//
	}else{//Web
		window.localStorage.setItem('pause',true);
		LetiFramework.SoundManager.soundOn = false;
	}
}

LetiFramework.SoundManager.getSound = function(src, loop) {
	return new LetiFramework.Sound.SoundObject(src, loop);
}