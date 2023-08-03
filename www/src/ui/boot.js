var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.boot = function(game) {}

LetiFramework.Ui.boot.prototype = {
	init: function() {
		if (LetiFramework.App.isPhoneGap()) {
			screen.orientation.lock(LetiFramework.GameController.bootConfig.orientation);
		}

		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.scale.setScreenSize(true);

		//this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
	},
	preload: function() {
		var hud = LetiFramework.GameController.screensConfig.hud;
		if (hud.label_custom_font) {
			LetiFramework.Utils.loadFont(hud.label_custom_font);
		}

		if (hud.text_custom_font) {
			LetiFramework.Utils.loadFont(hud.text_custom_font);
		}

		var tmap = LetiFramework.GameController.screensConfig.timelinemap;
		if(tmap) {
			LetiFramework.Utils.loadImage(tmap.close_button.image);
		}
	},
	create: function() {
		if (stores.get("savedInstance")) {
			if (LetiFramework.GameController.bootConfig.web_version) {
				LetiFramework.Renderer.render("Preloader");
			} else {
				// delete savedInstance and resume game
				stores.remove("savedInstance");
				// LetiFramework.GameController.fetchGameSteps();
				LetiFramework.GameController.resumeActivity();
			}
		} else {
			if (LetiFramework.App.isPhoneGap()) {
				this.startApp();
			} else if (LetiFramework.GameController.bootConfig.web_version) {
				LetiFramework.NetworkManager.getResources(function(data) {
					stores.set(LetiFramework.NetworkManager.resKey, JSON.parse(data));
					LetiFramework.Renderer.render("Preloader");
				}, function(error) {
					console.log(error);
					if (stores.get(LetiFramework.NetworkManager.resKey)) {
						LetiFramework.Renderer.render("Preloader");
					} else {
						alert('Could not initialize app! Preloader failed.');
					}
				});
			} else {
				this.startApp();
			}
		}
        // window.localStorage.setItem("standalone","1");
        // window.localStorage.setItem("standalone_game_type", 'luminous');

        // $.get(LetiFramework.NetworkManager.getHottseatBrandById(LetiFramework.NetworkManager.hottseatId)).done(function (response) {
        //     window.localStorage.setItem('brand',JSON.stringify(response));
        // });
        // $.get(LetiFramework.NetworkManager.getPrizesByBrand(LetiFramework.NetworkManager.hottseatId)).done(function (response) {
        //     window.localStorage.setItem('prizes',JSON.stringify(response))
        // });
        // $.get(LetiFramework.NetworkManager.getThemesByBrand(LetiFramework.NetworkManager.hottseatId)).done(function (response) {
        //     window.localStorage.setItem('theme',JSON.stringify(response));
        // });
        // $.get(LetiFramework.NetworkManager.getAdsByBrand(LetiFramework.NetworkManager.hottseatId)).done(function (response) {
        //     window.localStorage.setItem('ads',JSON.stringify(response));
        //     console.log('ad');
        // })
	},
	startApp: function() {
		if (LetiFramework.GameController.gup("page")) {
			LetiFramework.GameController.fetchGames();
		} else {
			LetiFramework.GameController.bootSequence();
		}
	}
}