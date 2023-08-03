var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.editpassword = function(game) {}

LetiFramework.Ui.editpassword.prototype = {
	init: function() {
		LetiFramework.Analytics.trackPage("Edit Password");
		this.currentUser = LetiFramework.GameController.currentUser;
		this.screenConfig = LetiFramework.GameController.screensConfig.editpassword;
		this.currentPasswordConfig = this.screenConfig.current_password;
		this.passwordConfig = this.screenConfig.password;
		this.confirmPasswordConfig = this.screenConfig.confirm_password;
		this.pageComponents = [];
		this.soundObjects = [];
		this.pageSprites = {};
		if (LetiFramework.GameController.screenComponents && this.screenConfig.components) {
			this.pageComponents = LetiFramework.GameController.screenComponents[
				this.screenConfig.components];
		}
	},
	preload: function() {
		this.preloadSprites();
		if (!LetiFramework.App.isPhoneGap() && LetiFramework.GameController.bootConfig.web_version) return;
		LetiFramework.Utils.loadImage(this.screenConfig.background);
		LetiFramework.Utils.loadImage(this.screenConfig.home_button.image);
		for (var i = 0; i < this.pageComponents.length; i++) {
			var cmp = this.pageComponents[i];
			if (cmp.image) {
				if (cmp.type == 'spritesheet') {
					var path = LetiFramework.Utils.getImagePath(cmp.image);
					this.game.load.spritesheet(path, path, cmp.frame_width, cmp.frame_height);
				} else {
					LetiFramework.Utils.loadImage(cmp.image);
				}
			}

			if (cmp.interactivity && cmp.interactivity.audio) {
				if (!LetiFramework.App.isPhoneGap()) {
					this.loadAudio(cmp.interactivity.audio);
				}
			}
		}

		if (this.screenConfig.cancel_button.type == "image") {
			LetiFramework.Utils.loadImage(this.screenConfig.cancel_button.image);
		}

		if (this.screenConfig.save_button.type == "image") {
			LetiFramework.Utils.loadImage(this.screenConfig.save_button.image);
		}

		if (this.currentPasswordConfig.background.type == "image") {
			LetiFramework.Utils.loadImage(this.currentPasswordConfig.background.image);
		}

		if (this.passwordConfig.background.type == "image") {
			LetiFramework.Utils.loadImage(this.passwordConfig.background.image);
		}

		if (this.confirmPasswordConfig.background.type == "image") {
			LetiFramework.Utils.loadImage(this.confirmPasswordConfig.background.image);
		}

		if (!LetiFramework.App.isPhoneGap()) {
			this.loadAudio(this.screenConfig.audio);
		}
		this.soundPath = this.getSoundPath(this.screenConfig.audio);
	},
	create: function() {
		this.scene = this.game.add.group();

		this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY,
			LetiFramework.Utils.getImagePath(this.screenConfig.background));
		this.bg.anchor.set(0.5);
		this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);
		this.addToScene(this.bg);

		this.addComponents();

		var input = stores.get("userInput");
		var inputType = stores.get("inputType");
		stores.remove("userInput");
		ScriptProcessorNode.remove("inputType");

		if (inputType) {
			if (input) {
				stores.set(inputType, input);
			} else {
				stores.remove(inputType);
			}
		}

		this.createEditField(this.currentPasswordConfig, "Current Password");
		this.createEditField(this.passwordConfig, "New Password");
		this.createEditField(this.confirmPasswordConfig, "Confirm Password");

		var saveBtConfig = this.screenConfig.save_button;
		if (saveBtConfig.type == "image") {
			this.saveBt = this.game.add.sprite(saveBtConfig.position.x, saveBtConfig.position.y,
				LetiFramework.Utils.getImagePath(saveBtConfig.image));
			this.saveBt.scale.setTo(saveBtConfig.width / this.saveBt.width, saveBtConfig.height / this.saveBt.height);
			this.saveBt.inputEnabled = true;
			this.saveBt.input.useHandCursor = true;
			this.saveBt.events.onInputDown.add(this.saveHandler, this);
		} else if (saveBtConfig.type == "button") {
			this.saveBt = new LetiFramework.Ui.Button(this.game, saveBtConfig.position.x, saveBtConfig.position.y, saveBtConfig.width,
				saveBtConfig.height, saveBtConfig.text, saveBtConfig.text_style, saveBtConfig.button_style,
				this.saveHandler, this);
		}

		var cancelBtConfig = this.screenConfig.cancel_button;
		if (cancelBtConfig.type == "image") {
			this.cancelBt = this.game.add.sprite(cancelBtConfig.position.x, cancelBtConfig.position.y,
				LetiFramework.Utils.getImagePath(cancelBtConfig.image));
			this.cancelBt.scale.setTo(cancelBtConfig.width / this.cancelBt.width, cancelBtConfig.height / this.cancelBt.height);
			this.cancelBt.inputEnabled = true;
			this.cancelBt.input.useHandCursor = true;
			this.cancelBt.events.onInputDown.add(this.cancelHandler, this);
		} else if (cancelBtConfig.type == "button") {
			this.cancelBt = new LetiFramework.Ui.Button(this.game, cancelBtConfig.position.x, cancelBtConfig.position.y, cancelBtConfig.width,
				cancelBtConfig.height, cancelBtConfig.text, cancelBtConfig.text_style, cancelBtConfig.button_style,
				this.cancelHandler, this);
		}

		var homeBtPosition = this.screenConfig.home_button.position;
		this.homeBt = this.game.add.button(homeBtPosition.x, homeBtPosition.y,
			LetiFramework.Utils.getImagePath(this.screenConfig.home_button.image),
			function() {
				LetiFramework.Analytics.trackEvent("Edit Password", "Button Click", "Home", 0);
				LetiFramework.Renderer.render("Menu2");
			}, this, 2, 1, 0);
		this.homeBt.input.useHandCursor = true;

		if (LetiFramework.App.isPhoneGap()) {
			this.music = LetiFramework.SoundManager.getSound(this.soundPath, false);
		} else {
			this.music = this.game.add.audio(this.getSoundPath(this.screenConfig.audio));
		}

		this.soundObjects.push(this.music);

		if (LetiFramework.SoundManager.soundOn) {
			this.music.play();
		}
	},
	createEditField: function(fieldConfig, name) {
		if (fieldConfig.background.type == "image") {
			var fieldBg = this.game.add.sprite(fieldConfig.position.x, fieldConfig.position.y,
				LetiFramework.Utils.getImagePath(fieldConfig.background.image));
			fieldBg.fieldName = name;
			fieldBg.maxLen = fieldConfig.max_length;
			fieldBg.scale.setTo(fieldConfig.width / fieldBg.width, fieldConfig.height / fieldBg.height);
			fieldBg.inputEnabled = true;
			fieldBg.input.useHandCursor = true;
			fieldBg.events.onInputDown.add(this.fieldLabelHandler, this);
			this.addToScene(fieldBg);

			var txt = stores.get(name);
			if (txt == null) {
				txt = "";
			}
			var fieldTxt = this.game.add.text(
				fieldConfig.position.x, fieldConfig.position.y + 0.5 * fieldBg.height, txt, fieldConfig.text_style);
			fieldTxt.x += fieldConfig.paddingLeft || 20;
			fieldTxt.y -= 0.5 * fieldTxt.height;
			this.addToScene(fieldTxt);

			var labelConfig = fieldConfig.label;
			var fieldLabel = this.game.add.text(labelConfig.position.x, labelConfig.position.y,
				labelConfig.text, labelConfig.text_style);
			if (labelConfig.hint && txt.length > 0) {
				fieldLabel.visible = false;
			}
			this.addToScene(fieldLabel);
		} else if (fieldConfig.background.type == "bgcolor") {
			var txt = stores.get(name);
			if (txt == null) {
				txt = "";
			}
			var fieldBg = new LetiFramework.Ui.Button(this.game, fieldConfig.position.x, fieldConfig.position.y,
				fieldConfig.width, fieldConfig.height, txt, fieldConfig.text_style, fieldConfig.background.bgcolor,
				function() {
					LetiFramework.Renderer.currentState().fieldLabelHandler(fieldBg);
				}, this);
			fieldBg.fieldName = name;
			fieldBg.maxLen = fieldConfig.max_length;
			fieldBg.alignText('left');
			this.addToScene(fieldBg.buttonGroup);

			var labelConfig = fieldConfig.label;
			var fieldLabel = this.game.add.text(labelConfig.position.x, labelConfig.position.y,
				labelConfig.text, labelConfig.text_style);
			if (labelConfig.hint && txt.length > 0) {
				fieldLabel.visible = false;
			}
			this.addToScene(fieldLabel);
		}
	},
	fieldLabelHandler: function(src) {
		stores.set("inputType", src.fieldName);
		stores.set("prevScreen", "EditPassword");
		stores.set("maxLength", src.maxLen);
		LetiFramework.Renderer.render("Keyboard");
	},
	saveHandler: function() {
		LetiFramework.Analytics.trackEvent("Edit Password", "Button Click", "Save", 0);
		var currentPassword = stores.get("Current Password") || "";
		var newPassword = stores.get("New Password") || "";
		var confirmPassword = stores.get("Confirm Password") || "";
		var userOtherFields = JSON.parse(this.currentUser.otherRegisterFields);

		if (currentPassword.length) {
			if (userOtherFields.password != currentPassword) {
				this.showError("The current password is not valid.");
				return;
			}
		} else {
			this.showError("Please enter the current password");
			return;
		}

		if (!newPassword.length) {
			this.showError("Please enter the new password");
			return;
		}

		if (confirmPassword.length) {
			if (confirmPassword != newPassword) {
				this.showError("New password and confirm password do not match.");
				return;
			}
		} else {
			this.showError("Please enter confirm password");
			return;
		}

		if (newPassword == currentPassword) {
			this.showError("Current password and new password match.");
			return;
		}

		userOtherFields.password = newPassword;
		this.currentUser.otherRegisterFields = JSON.stringify(userOtherFields);

		if (LetiFramework.App.isPhoneGap()) {
			var self = this;
			// update user on server
			LetiFramework.NetworkManager.postRequest("UpdateServlet", {
					modelType: LetiFramework.NetworkManager.MODEL_TYPE_USER,
					model: {
						id: this.currentUser.id,
						otherRegisterFields: this.currentUser.otherRegisterFields
					}
				},
				function(data) {
					data = JSON.parse(data);
					if (data.rowCount > 0) {
						self.saveSuccessHandler();
					} else {
						// undo local password change
						userOtherFields.password = currentPassword;
						self.currentUser.otherRegisterFields = JSON.stringify(userOtherFields);

						var message = "Failed to change password.";
						LetiFramework.Analytics.trackEvent("Edit Password", "Failed", message, 0);
						alert(message);
					}
				},
				function() {
					self.showError("Save failed! Please check your internet connection.");
				});
		} else {
			this.saveSuccessHandler();
		}
	},
	saveSuccessHandler: function() {
		LetiFramework.Analytics.trackEvent("Edit Password", "Success");
		this.clearFields();
		LetiFramework.Db.update('users', this.currentUser);
		LetiFramework.Renderer.render("Menu");
	},
	cancelHandler: function() {
		LetiFramework.Analytics.trackEvent("Edit Password", "Button Click", "Cancel", 0);
		this.clearFields();
		LetiFramework.Renderer.render("Menu");
	},
	clearFields: function() {
		stores.remove("Current Password");
		stores.remove("New Password");
		stores.remove("Confirm Password");
	},
	showError: function(msg) {
		LetiFramework.Analytics.trackEvent("Edit Password", "Error", msg, 0);
		alert(msg);
	},
	addToScene: function(item) {
		this.scene.add(item);
	},
	shutdown: function() {
		this.scene.destroy();
		for (var i = 0; i < this.soundObjects.length; i++) {
			this.soundObjects[i].destroy();
		}
	},
	addComponents: function() {
		for (var i = 0; i < this.pageComponents.length; i++) {
			var asset = this.pageComponents[i];
			var position = asset.position;
			var animations = asset.animation;
			var interactivity = asset.interactivity;
			var cmp = null;

			if (asset.type == "shape") {
				cmp = this.game.add.graphics(position.x, position.y);
				cmp.beginFill(asset.color, 1);
				cmp.alpha = asset.alpha;
				if (asset.shape == "round_rect") {
					cmp.drawRoundedRect(0, 0, asset.width, asset.height, asset.radius);
				} else if (asset.shape == "rect") {
					cmp.drawRect(0, 0, asset.width, asset.height);
				}
				cmp.endFill();
			} else if (asset.type == "text") {
				cmp = this.game.add.text(position.x, position.y, asset.text, asset.style);
			} else if (asset.type == "image") {
				cmp = this.game.add.sprite(position.x, position.y, LetiFramework.Utils.getImagePath(asset.image));
				if (asset.hidden) cmp.visible = false;
				this.pageSprites[asset.image] = cmp;
				if (asset.width && asset.height) {
					cmp.scale.setTo(asset.width / cmp.width, asset.height / cmp.height);
				}
				cmp.x += cmp.width * 0.5;
				cmp.y += cmp.height * 0.5;
				cmp.anchor.set(0.5);
			} else if (asset.type == "spritesheet") {
				cmp = this.game.add.sprite(position.x, position.y, LetiFramework.Utils.getImagePath(asset.image));
				if (asset.hidden) cmp.visible = false;
				this.pageSprites[asset.image] = cmp;
				cmp.scale.setTo(asset.width / asset.frame_width, asset.height / asset.frame_height);
				cmp.x += cmp.width * 0.5;
				cmp.y += cmp.height * 0.5;
				cmp.anchor.set(0.5);

				if (asset.frames_1) {
					cmp.animations.add(asset.anim_name, asset.frames_1);
				} else {
					var frames = [];
					for (var j = asset.start_pos; j <= asset.stop_pos; j++) {
						frames.push(j);
					}
					cmp.animations.add(asset.anim_name, frames);
				}

				if (asset.frames_2) {
					//inverse animation
					cmp.animations.add(asset.anim_name + "_inv", asset.frames_2);
				}

				if (asset.start == "auto") {
					var anim = cmp.animations.play(asset.anim_name, asset.fps, asset.loop != 0);
					if (asset.loop > 0) {
						anim.onLoop.add(function(sprite, animation) {
							if (animation.loopCount === this.loop) {
								animation.loop = false;
							}
						}, asset);
						anim.onComplete.add(function(sprite, animation) {
							sprite.frame = this.start_pos;
						}, asset);
					}
				} else if (asset.start == "click") {
					cmp.inputEnabled = true;
					cmp.events.onInputDown.add(function(src) {
						LetiFramework.Analytics.trackEvent("Edit Password", "Interactivity", this.image, 0);

						var anim = src.animations.play(this.anim_name, this.fps, this.loop != 0);
						if (this.loop > 0) {
							anim.onLoop.add(function(sprite, animation) {
								if (animation.loopCount === this.loop) {
									animation.loop = false;
								}
							}, this);
							anim.onComplete.add(function(sprite, animation) {
								sprite.frame = this.start_pos;
							}, this);
						}
					}, asset);
				}
			}

			if (cmp) {
				this.addToScene(cmp);

				if (asset.link) {
					cmp.inputEnabled = true;
					cmp.input.useHandCursor = true
					cmp.events.onInputDown.add(function() {
						if (LetiFramework.App.isPhoneGap()) {
							window.open(this.link, '_system');
						} else {
							window.open(this.link);
						}
					}, asset);
				}

				if (animations) {
					for (var j = 0; j < animations.length; j++) {
						var animation = animations[j];
						if (animation.anim_type == "scale") {
							var scaleBy = animation.scale_value;
							var duration = animation.duration * this.animScale;
							var delay = animation.delay;
							this.game.add.tween(cmp.scale).to({
									x: scaleBy,
									y: scaleBy
								}, duration,
								Phaser.Easing.Linear.None, true, delay, animation.loop, animation.yoyo);
						} else if (animation.anim_type == "translate") {
							var location = animation.location;
							var duration = animation.duration * this.animScale;
							var delay = animation.delay;
							var tween = this.game.add.tween(cmp).to(location, duration,
								Phaser.Easing.Linear.None, true, delay, animation.loop, animation.yoyo);
							if (asset.stop_on_anim_end) {
								tween.onComplete.add(function(sprite, tween) {
									sprite.animations.stop();
									sprite.frame = this.stop_pos;
								}, asset);
							}
							if (asset.type == "spritesheet" && asset.frames_2 && animation.yoyo) {
								tween.onLoop.add(function(sprite, tween) {
									var name = sprite.animations.name == this.anim_name ?
										this.anim_name + "_inv" : this.anim_name;
									var anim = sprite.animations.play(name, asset.fps, asset.loop != 0);
								}, asset);
							}
						} else if (animation.anim_type == "fadeIn") {
							this.game.add.tween(cmp).from({
								alpha: 0
							}, duration, Phaser.Easing.Linear.None, true, delay, 0, false);
						}
					}
				}

				if (interactivity) {
					if (interactivity.action == "click") {
						cmp.inputEnabled = true;
						cmp.events.onInputDown.add(function(src) {
							var _this = LetiFramework.Renderer.currentState();
							LetiFramework.Analytics.trackEvent("Edit Password", "Interactivity", this.asset.image, 0);

							var animations = this.asset.interactivity.animation;
							var audio = this.asset.interactivity.audio;
							var toggle = this.asset.interactivity.toggle;
							if (animations) {
								for (var j = 0; j < animations.length; j++) {
									var animation = animations[j];
									if (animation.anim_type == "translate") {
										var duration = animation.duration * this.ctx.animScale;
										var delay = animation.delay;
										this.ctx.game.add.tween(src)
											.to(animation.location, duration, Phaser.Easing.Linear.None, false, delay)
											.to(this.position, duration, Phaser.Easing.Linear.None).start();
									}
								}
							}
							if (audio) {
								if (LetiFramework.SoundManager.soundOn) {
									_this.componentSound = _this.componentSound || {};
									var snd = _this.componentSound[audio];
									if (!snd) {
										var soundPath = _this.getSoundPath(audio);
										if (LetiFramework.App.isPhoneGap()) {
											snd = LetiFramework.SoundManager.getSound(soundPath, false);
										} else {
											snd = _this.game.add.audio(soundPath);
										}
										_this.componentSound[audio] = snd;
										_this.soundObjects.push(snd);
									}
									snd.play();
								}
							}
							if (toggle) {
								for (var j = 0; j < toggle.length; j++) {
									var cmp = _this.pageSprites[toggle[j]];
									cmp.visible = !cmp.visible;
								}
							}
						}, {
							asset: asset,
							index: i,
							position: {
								x: cmp.x,
								y: cmp.y
							},
							ctx: this
						});
					}
				}
			}
		} // end for i
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
	preloadSprites: function() {
		for (var i = 0; i < this.pageComponents.length; i++) {
			var cmp = this.pageComponents[i];
			if (cmp.image && cmp.type == 'spritesheet') {
				var path = LetiFramework.Utils.getImagePath(cmp.image);
				this.game.load.spritesheet(path, path, cmp.frame_width, cmp.frame_height);
			}
		}
	}
}