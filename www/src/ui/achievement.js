var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.achievement = function(game) {}

LetiFramework.Ui.achievement.prototype = {
	init: function() {
		LetiFramework.Analytics.trackPage("Achievement");
		this.currentUser = LetiFramework.GameController.currentUser;
		this.screenConfig = LetiFramework.GameController.screensConfig.achievement;
		this.badges = LetiFramework.Db.readByKeyValue("badges", "user_id", LetiFramework.GameController.currentUser.id);

		this.itemRow = this.screenConfig.list_row;
		this.listPosition = {
			x: 0,
			y: 0
		};
		this.listBottom = 0;
		this.noScroll = true;
	},
	preload: function() {
		if(!LetiFramework.App.isPhoneGap() && LetiFramework.GameController.bootConfig.web_version) return;
		LetiFramework.Utils.loadImage(this.screenConfig.background);
		LetiFramework.Utils.loadImage(this.screenConfig.home_button.image);
		LetiFramework.Utils.loadImage(this.itemRow.facebook_icon.image);
		LetiFramework.Utils.loadImage(this.itemRow.twitter_icon.image);
		var nav_back = stores.get('screen_nav_back');
		if(nav_back) LetiFramework.Utils.loadImage(nav_back.image);
		for (var i = 0; i < this.badges.length; i++) {
			this.loadBadgeFile(this.badges[i].story_id, this.badges[i].episode_id, this.badges[i].badge_image);
		}
		if (this.itemRow.background.type == "image") {
			LetiFramework.Utils.loadImage(this.itemRow.background.image);
		}
		if (!LetiFramework.App.isPhoneGap()) {
			this.loadAudio(this.screenConfig.audio);
		}
		this.soundPath = this.getSoundPath(this.screenConfig.audio);

		if (this.screenConfig.title.custom_font) {
			LetiFramework.Utils.loadFont(this.screenConfig.title.custom_font);
		}

		if (this.itemRow.title_custom_font) {
			LetiFramework.Utils.loadFont(this.itemRow.title_custom_font);
		}

		if (this.itemRow.message_custom_font) {
			LetiFramework.Utils.loadFont(this.itemRow.message_custom_font);
		}
	},
	create: function() {
		this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 
			LetiFramework.Utils.getImagePath(this.screenConfig.background));
		this.bg.anchor.set(0.5);
		this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

		var homeBtPosition = this.screenConfig.home_button.position;
		var backImage = this.screenConfig.home_button.image;
		var cb = function() {
			LetiFramework.Analytics.trackEvent("Achievement", "Button Click", "Home", 0);
			LetiFramework.Renderer.render("Menu");
		}
		
		var nav_back = stores.get('screen_nav_back');
		if(nav_back) {
			backImage = nav_back.image;
			if(nav_back.position) homeBtPosition = nav_back.position;
			cb = function() {
				LetiFramework.Analytics.trackEvent("Achievement", "Button Click", "Back", 0);
				LetiFramework.GameController.resume = true;
				LetiFramework.GameController.initializeGame(LetiFramework.GameController.currentGame, true);
			}
			stores.remove('screen_nav_back');
		}

		this.homeBt = this.game.add.button(homeBtPosition.x, homeBtPosition.y, 
			LetiFramework.Utils.getImagePath(backImage), cb, this, 2, 1, 0);
		this.homeBt.input.useHandCursor = true;

		var titleArea = this.screenConfig.title;
		var contentArea = this.screenConfig.list_background;

		var panel1Width = contentArea.width;
		var panel1Height = contentArea.height;

		var panel1 = this.game.add.graphics(contentArea.position.x, contentArea.position.y);
		panel1.beginFill(contentArea.color, 1);
		panel1.alpha = contentArea.alpha;
		if (contentArea.shape == "round_rect") {
			panel1.drawRoundedRect(0, 0, panel1Width, panel1Height, contentArea.radius);
		} else if (contentArea.shape == "rect") {
			panel1.drawRect(0, 0, panel1Width, panel1Height);
		}
		panel1.endFill();

		var panel2Width = titleArea.background.width;
		var panel2Height = titleArea.background.height;

		var panel2 = this.game.add.graphics(titleArea.position.x, titleArea.position.y);
		panel2.beginFill(titleArea.background.color, 1);
		panel2.alpha = titleArea.background.alpha;
		if (titleArea.background.shape == "round_rect") {
			panel2.drawRoundedRect(0, 0, panel2Width, panel2Height, titleArea.background.radius);
		} else if (titleArea.background.shape == "rect") {
			panel2.drawRect(0, 0, panel2Width, panel2Height);
		}
		panel2.endFill();

		if (titleArea.custom_font) {
			var title = this.game.add.bitmapText(this.game.world.centerX, panel2Height / 2 + panel2.y,
				LetiFramework.Utils.getFontPath(titleArea.custom_font), 
				LetiFramework.Utils.wrapText(titleArea.text, titleArea.custom_font), 
				titleArea.custom_font.font_size);
			title.anchor.set(0.5);
		} else {
			var title = this.game.add.text(this.game.world.centerX, panel2Height / 2 + panel2.y,
				titleArea.text, titleArea.text_style);
			title.anchor.set(0.5);
		}

		this.badgesGroupList = this.game.add.group();
		this.badgesGroupList.x = panel1.x;
		this.badgesGroupList.y = panel1.y;
		this.badgesGroupList.width = panel1Width;
		this.badgesGroupList.height = panel1Height;

		this.listPosition.x = panel1.x;
		this.listPosition.y = panel1.y;
		this.listBottom = panel1.y + panel1Height;

		//	A mask is a Graphics object
		this.mask = this.game.add.graphics(0, 0);

		//	Shapes drawn to the Graphics object must be filled.
		this.mask.beginFill(0xffffff);

		//	Here we'll draw a shape for the list
		if (contentArea.shape == "round_rect") {
			this.mask.drawRoundedRect(panel1.x, panel1.y, panel1Width, panel1Height, contentArea.radius);
		} else if (contentArea.shape == "rect") {
			this.mask.drawRect(panel1.x, panel1.y, panel1Width, panel1Height);
		}

		//	And apply it to the Sprite
		this.badgesGroupList.mask = this.mask;

		var spacing = this.itemRow.vertical_spacing;
		var padding = this.itemRow.padding;

		var rowW = this.itemRow.background.width;
		var rowH = this.itemRow.background.height;

		this.noScroll = (this.badges.length * (rowH + spacing) - spacing) < panel1Height;

		var self = this;
		for (var i = 0; i < this.badges.length; i++) {
			(function(badge) {
				var url = LetiFramework.NetworkManager.getBadgeImageURL(
					badge.story_id, badge.episode_id, badge.badge_image);

				var badgeGroup = self.game.add.group();
				badgeGroup.x = 0;
				badgeGroup.y = i * (spacing + rowH);
				badgeGroup.width = rowW;
				badgeGroup.height = rowH;

				var rowBg = self.drawRowBackground();
				badgeGroup.add(rowBg);

				var badgeSprite = self.game.add.sprite(
					padding.left, padding.top, self.getBadgePath(badge.story_id, badge.episode_id, badge.badge_image));
				badgeSprite.scale.setTo(self.itemRow.badgeWidth / badgeSprite.width, self.itemRow.badgeHeight / badgeSprite.height);
				badgeGroup.add(badgeSprite);

				var badgeText;
				if (self.itemRow.title_custom_font) {
					var cf = self.itemRow.title_custom_font;
					badgeText = self.game.add.bitmapText(badgeSprite.x + badgeSprite.width + 5, badgeSprite.y, 
						LetiFramework.Utils.getFontPath(cf),
						LetiFramework.Utils.wrapText(badge.badge_text, cf), cf.font_size);
				} else {
					badgeText = self.game.add.text(badgeSprite.x + badgeSprite.width + 5,
						badgeSprite.y, badge.badge_text, self.itemRow.title_style);
				}

				badgeGroup.add(badgeText);

				var badgeMsg;
				if (self.itemRow.message_custom_font) {
					var cf = self.itemRow.message_custom_font;
					badgeMsg = self.game.add.bitmapText(badgeText.x, badgeText.y + badgeText.height, 
						LetiFramework.Utils.getFontPath(cf),
						LetiFramework.Utils.wrapText(badge.badge_action, cf), cf.font_size);
				} else {
					badgeMsg = self.game.add.text(badgeText.x, badgeText.y + badgeText.height,
						badge.badge_action, self.itemRow.message_style);
				}

				badgeGroup.add(badgeMsg);

				var twIcon = self.game.add.button(rowW - padding.right, 0.5 * rowH, 
					LetiFramework.Utils.getImagePath(self.itemRow.twitter_icon.image), function() {
					LetiFramework.Analytics.trackEvent("Achievement", "Button Click", "Twitter Share Badge", 0);
					var params = [
						"site=" + LetiFramework.NetworkManager.site,
						"title=" + badge.badge_text,
						"description=" + badge.badge_action,
						"image=letiframework/stories/" + badge.story_id + "/episodes/" + badge.episode_id + "/badge/" + badge.badge_image,
						"domain=" + LetiFramework.NetworkManager.domain,
						"googleplayname=" + LetiFramework.NetworkManager.appName,
						"googleplayurl=" + LetiFramework.NetworkManager.googlePlayUrl,
                    	"googleplayid=" + LetiFramework.NetworkManager.googlePlayId,
						"t=" + new Date().getTime()
					];

					LetiFramework.Utils.twShare(null, null,
						LetiFramework.NetworkManager.twitterCardUrl + encodeURI(params.join("&")));
				}, this, 2, 1, 0);
				twIcon.input.useHandCursor = true;
				twIcon.scale.setTo(self.itemRow.twitter_icon.width / twIcon.width, self.itemRow.twitter_icon.height / twIcon.height);
				twIcon.x -= twIcon.width;
				twIcon.y -= 0.5 * twIcon.height;
				badgeGroup.add(twIcon);

				var fbIcon = self.game.add.button(twIcon.x, twIcon.y, 
					LetiFramework.Utils.getImagePath(self.itemRow.facebook_icon.image), function() {
					LetiFramework.Analytics.trackEvent("Achievement", "Button Click", "Facebook Share Badge", 0);
					LetiFramework.Utils.fbShare(
						url,
						badge.badge_text,
						badge.badge_text,
						badge.badge_action,
						LetiFramework.NetworkManager.fbAppLink);
				}, this, 2, 1, 0);
				fbIcon.input.useHandCursor = true;
				fbIcon.scale.setTo(self.itemRow.facebook_icon.width / fbIcon.width, self.itemRow.facebook_icon.height / fbIcon.height);
				fbIcon.x -= fbIcon.width;
				badgeGroup.add(fbIcon);

				if (self.itemRow.disable_social == true) {
					fbIcon.visible = false;
					twIcon.visible = false;
				}

				self.badgesGroupList.add(badgeGroup);
			})(this.badges[i]);
		}

		if (LetiFramework.App.isPhoneGap()) {
			this.music = LetiFramework.SoundManager.getSound(this.soundPath, false);
		} else {
			this.music = this.game.add.audio(this.getSoundPath(this.screenConfig.audio));
		}

		if (LetiFramework.SoundManager.soundOn) {
			this.music.play();
		}

		this.listenSwipe(this.scrollBadges);
	},
	drawRowBackground: function() {
		var type = this.itemRow.background.type;
		var width = this.itemRow.background.width;
		var height = this.itemRow.background.height;
		var color = this.itemRow.background.color;
		var alpha = this.itemRow.background.alpha;
		var shape = this.itemRow.background.shape;
		var image = this.itemRow.background.image;
		var radius = this.itemRow.background.radius;

		var rowBg = null;

		if (type == "image") {
			rowBg = this.game.add.sprite(0, 0, LetiFramework.Utils.getImagePath(image));
			rowBg.scale.setTo(width / rowBg.width, height / rowBg.height);
		} else {
			rowBg = this.game.add.graphics(0, 0);
			rowBg.beginFill(color, 1);
			rowBg.alpha = alpha;
			if (shape == "round_rect") {
				rowBg.drawRoundedRect(0, 0, width, height, radius);
			} else if (shape == "rect") {
				rowBg.drawRect(0, 0, width, height);
			}
			rowBg.endFill();
		}

		return rowBg;
	},
	shutdown: function() {
		this.music.destroy();
	},
	getSoundPath: function(name) {
		return "assets/sound/" + name;
	},
	loadAudio: function(name) {
		if(name){
			var key = this.getSoundPath(name);
			this.game.load.audio(key, key);
		}
    },
	getBadgePath: function(sId, eId, name) {
		return 'assets/stories/' + sId + '/episodes/' + eId + '/content/badges/' + name;
	},
	loadBadgeFile: function(storyId, episodeId, fileName) {
		var key = this.getBadgePath(storyId, episodeId, fileName);
		if (LetiFramework.App.isPhoneGap()) {
			var url = LetiFramework.FileManager.getEpisodeBadgeFilePath(storyId, episodeId, fileName);
			this.game.load.image(key, url);
		} else {
			this.game.load.image(key, key);
		}
		return key;
	},
	scrollBadges: function(direction, delta) {
		var _this = LetiFramework.Renderer.currentState();

		if (_this.noScroll) return;

		if (direction == "top" || direction == "bottom") {
			_this.badgesGroupList.y += delta;

			var listPositionY = _this.badgesGroupList.y
			var listBottom = _this.badgesGroupList.y + _this.badgesGroupList.height;

			var reset = 0;

			if (listPositionY > _this.listPosition.y) {
				reset = _this.listPosition.y - listPositionY;
			} else if (listBottom < _this.listBottom) {
				reset = _this.listBottom - listBottom;
			}

			if (reset != 0) {
				listPositionY = _this.badgesGroupList.y + reset;
				_this.game.add.tween(_this.badgesGroupList).to({
						y: listPositionY
					},
					100, Phaser.Easing.Linear.None, true, 100);
			}
		}
	},
	listenSwipe: function(callback) {
		var eventDuration;
		var startPoint = {};
		var endPoint = {};
		var direction;
		var minimum = {
			duration: 30,
			distance: 100
		}

		this.game.input.onDown.add(function(pointer) {
			startPoint.x = pointer.clientX;
			startPoint.y = pointer.clientY;
		}, this);

		this.game.input.onUp.add(function(pointer) {
			direction = '';
			eventDuration = this.game.input.activePointer.duration;

			endPoint.x = pointer.clientX;
			endPoint.y = pointer.clientY;

			var dx = Math.abs(endPoint.x - startPoint.x);
			var dy = Math.abs(endPoint.y - startPoint.y);
			var delta = 0;

			var actionSwipe = dx > minimum.distance || dy > minimum.distance;

			if (eventDuration > minimum.duration && actionSwipe) {

				// Check direction
				if (endPoint.x - startPoint.x > minimum.distance) {
					direction = 'right';
					delta = dx;
				} else if (startPoint.x - endPoint.x > minimum.distance) {
					direction = 'left';
					delta = -dx;
				} else if (endPoint.y - startPoint.y > minimum.distance) {
					direction = 'bottom';
					delta = dy;
				} else if (startPoint.y - endPoint.y > minimum.distance) {
					direction = 'top';
					delta = -dy;
				}

				if (direction) {
					callback(direction, delta);
				}
			}
		}, this);
	}
}