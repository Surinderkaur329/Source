var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.preloader = function(game) {}

LetiFramework.Ui.preloader.prototype = {
	images: null,
	sounds: null,
	fonts: null,
	init: function() {
		this.showProgress();
		var resources = stores.get(LetiFramework.NetworkManager.resKey);
		if (resources) {
			this.images = resources.images;
			this.sounds = resources.sounds;
			this.fonts = resources.fonts;
		}
	},
	preload: function() {
		if (this.images && this.sounds && this.fonts) {
			var host = LetiFramework.GameController.bootConfig.web_host;
			for (var i in this.images) {
				var image = this.images[i];
				this.game.load.image(image, host + image);
			}

			for (var i in this.sounds) {
				var sound = this.sounds[i];
				this.game.load.audio(sound, host + sound);
			}

			for (var i in this.fonts) {
				var font = this.fonts[i];
				font = font.substring(0, font.indexOf('.'));
				this.game.load.bitmapFont(font, font + '.png', font + '.fnt');
			}
		} else {
			alert('Could not initialize app! Preloader failed.');
		}
	},
	create: function() {
		this.hideProgress();
		if (stores.get("savedInstance")) {
			console.log('resume');
			// delete savedInstance and resume game
			stores.remove("savedInstance");
			LetiFramework.GameController.fetchGameSteps();
			// LetiFramework.GameController.resumeActivity();
		} else {
			this.startApp();
		}
	},
	startApp: function() {
		if (LetiFramework.GameController.gup("page")) {
			LetiFramework.GameController.fetchGames();
		} else {
			LetiFramework.GameController.bootSequence();
		}
	},
	showProgress: function() {
		this.game.canvas.style.display = "none";
		window.localStorage.setItem('pause', 'true');
		var img = "assets/img/" + LetiFramework.GameController.bootConfig.preloader.load_progress_gif;

		var p = '<img style="display: block;margin-left: auto;margin-right: auto;" src="' + img + '" alt="Loading...">';

		var div = document.createElement('div');
		div.setAttribute('id', 'load-progress-panel');
		div.innerHTML = p;

		document.body.appendChild(div);
	},
	hideProgress: function() {
		window.localStorage.removeItem("pause");
		$('#load-progress-panel').remove();
        this.game.canvas.style.display = "block";
	}
}