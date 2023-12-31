var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.menu2 = function(game) {}

LetiFramework.Ui.menu2.prototype = {
    init: function() {
        LetiFramework.Analytics.trackPage("Menu2");

        LetiFramework.GameController.gameStarted = false;
        LetiFramework.GameController.currentStory = null;
        this.currentUser = LetiFramework.GameController.currentUser;
        this.screenConfig = LetiFramework.GameController.menuConfig;
        this.screenConfig2 = LetiFramework.GameController.bootConfig[LetiFramework.GameController.bootScreen];
        this.lockedDialog = this.screenConfig.lockedDialog;
        this.exitDialog = this.screenConfig.exitDialog;
        this.exitButton = this.exitDialog.exit_button;
        this.exitSignOutButton = this.exitDialog.exit_signout_button;
        this.closeExitDialogButton = this.exitDialog.close_button;

        this.focusedItem = 0;
        this.menuItems = [];
        this.focusedItemScale = 1.4;
        this.menuItemWidth = this.screenConfig.menu_item_width;
        this.menuItemHeight = this.screenConfig.menu_item_height;
        this.animScale = LetiFramework.Renderer.animScale;
        this.buttons = this.screenConfig2.buttons;
        this.pageComponents = [];
        this.soundObjects = [];
        this.pageSprites = {};
        if (LetiFramework.GameController.screenComponents && this.screenConfig2.components) {
            this.pageComponents = LetiFramework.GameController.screenComponents[
                this.screenConfig2.components];
        }

        if (LetiFramework.GameController.currentStorySound) {
            LetiFramework.GameController.currentStorySound.destroy();
            LetiFramework.GameController.currentStorySound = null;
        }
    },
    preload: function() {
        this.preloadSprites();
        if(!LetiFramework.App.isPhoneGap() && LetiFramework.GameController.bootConfig.web_version) return;
        var settingsDropDown = this.screenConfig.settings_button.children;
        var optionsDropDown = this.screenConfig.options_button.children;
        var shareDropDown = this.screenConfig.share_button.children;

        LetiFramework.Utils.loadImage(this.screenConfig.background);
        LetiFramework.Utils.loadImage(this.screenConfig.badge.image);
        LetiFramework.Utils.loadImage(this.exitDialog.background);
        LetiFramework.Utils.loadImage(this.screenConfig.settings_button.image);
        LetiFramework.Utils.loadImage(this.screenConfig.options_button.image);
        LetiFramework.Utils.loadImage(this.screenConfig.share_button.image);
        LetiFramework.Utils.loadImage(optionsDropDown.info_button.image);
        LetiFramework.Utils.loadImage(optionsDropDown.exit_button.image);
        LetiFramework.Utils.loadImage(settingsDropDown.sound_button.on_image);
        LetiFramework.Utils.loadImage(settingsDropDown.music_button.on_image);
        LetiFramework.Utils.loadImage(settingsDropDown.sound_button.off_image);
        LetiFramework.Utils.loadImage(settingsDropDown.music_button.off_image);
        LetiFramework.Utils.loadImage(settingsDropDown.edit_password_button.image);
        LetiFramework.Utils.loadImage(shareDropDown.facebook_button.image);
        LetiFramework.Utils.loadImage(shareDropDown.twitter_button.image);

        if (this.exitSignOutButton.type == "image") {
            LetiFramework.Utils.loadImage(this.exitSignOutButton.image);
        }

        if (this.exitButton.type == "image") {
            LetiFramework.Utils.loadImage(this.exitButton.image);
        }

        if (this.closeExitDialogButton.type == "image") {
            LetiFramework.Utils.loadImage(this.closeExitDialogButton.image);
        }

        for (var i in this.buttons) {
            var button = this.buttons[i];
            LetiFramework.Utils.loadImage(button.image);
        }

        for (var i = 0; i < this.pageComponents.length; i++) {
            var cmp = this.pageComponents[i];
            if (cmp.image) {
                if (cmp.type == 'spritesheet') {
                    var path = LetiFramework.Utils.getImagePath(cmp.image);
                    this.game.load.spritesheet(path, path, cmp.frame_width, cmp.frame_height);
                } else {
                    LetiFramework.Utils.loadImage(cmp.image);
                }
            } else if (cmp.type == 'text' && cmp.custom_font) {
                LetiFramework.Utils.loadFont(cmp.custom_font);
            }

            if (cmp.interactivity && cmp.interactivity.audio) {
                // if (!LetiFramework.App.isPhoneGap()) {
                    this.loadAudio(cmp.interactivity.audio);
                // }
            }
        }

        // if (!LetiFramework.App.isPhoneGap()) {
            this.loadAudio(this.screenConfig.audio);
        // }

        this.soundPath = this.getSoundPath(this.screenConfig.audio);
    },
    create: function() {
        this.createModals();

        this.scene = this.game.add.group();

        this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, LetiFramework.Utils.getImagePath(this.screenConfig.background));
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);
        this.addToScene(this.bg);

        this.addComponents();

        var settingsDropDown = this.screenConfig.settings_button.children;
        var optionsDropDown = this.screenConfig.options_button.children;
        var shareDropDown = this.screenConfig.share_button.children;
        var settingsBtPosition = this.screenConfig.settings_button.position;
        var optionsBtPosition = this.screenConfig.options_button.position;
        var shareBtPosition = this.screenConfig.share_button.position;

        this.fbBt = this.game.add.button(shareBtPosition.x, shareBtPosition.y,
            LetiFramework.Utils.getImagePath(shareDropDown.facebook_button.image),
            function() {
                LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Facebook", 0);
                LetiFramework.Utils.fbShare(
                    LetiFramework.NetworkManager.getBuildImageURL(),
                    LetiFramework.NetworkManager.appName,
                    LetiFramework.NetworkManager.appName,
                    LetiFramework.NetworkManager.appDescription,
                    LetiFramework.NetworkManager.fbAppLink);
            }, this, 2, 1, 0);
        this.fbBt.input.useHandCursor = true;
        this.fbBt.alpha = 0;
        this.addToScene(this.fbBt);

        this.twBt = this.game.add.button(shareBtPosition.x, shareBtPosition.y,
            LetiFramework.Utils.getImagePath(shareDropDown.twitter_button.image),
            function() {
                LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Twitter", 0);

                var params = [
                    "site=@letiarts",
                    "title=" + LetiFramework.NetworkManager.appName,
                    "description=" + LetiFramework.NetworkManager.appDescription,
                    "image=letiframework/build/" + LetiFramework.NetworkManager.appId + "/image/image.png",
                    "domain=http://letiarts.com",
                    "googleplayname=" + LetiFramework.NetworkManager.appName,
                    "googleplayurl=hellonurse://luminous.hellonurse",
                    "googleplayid=com.leti.letiframework.mcsp_hellonurse",
                    "t=" + new Date().getTime()
                ];

                LetiFramework.Utils.twShare(null, null,
                    "http://letiarts.com/luminous.php?" + encodeURI(params.join("&")));

                // LetiFramework.Utils.twShare(LetiFramework.NetworkManager.appDescription,
                //         LetiFramework.NetworkManager.getBuildImageURL(), null);
            }, this, 2, 1, 0);
        this.twBt.input.useHandCursor = true;
        this.twBt.alpha = 0;
        this.addToScene(this.twBt);

        this.infoBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y,
            LetiFramework.Utils.getImagePath(optionsDropDown.info_button.image),
            function() {
                LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Info", 0);
                LetiFramework.Renderer.render("About");
            }, this, 2, 1, 0);
        this.infoBt.input.useHandCursor = true;
        this.infoBt.alpha = 0;
        this.addToScene(this.infoBt);

        this.exitBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y,
            LetiFramework.Utils.getImagePath(optionsDropDown.exit_button.image),
            function() {
                LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Exit", 0);
                this.modals.showModal("exitGameModal");
            }, this, 2, 1, 0);
        this.exitBt.input.useHandCursor = true;
        this.exitBt.alpha = 0;
        this.addToScene(this.exitBt);

        this.soundBt = this.game.add.button(settingsBtPosition.x, settingsBtPosition.y,
            LetiFramework.Utils.getImagePath(LetiFramework.SoundManager.narrationOn ?
                settingsDropDown.sound_button.on_image : settingsDropDown.sound_button.off_image),
            function() {
                LetiFramework.SoundManager.narrationOn = !LetiFramework.SoundManager.narrationOn;
                if (LetiFramework.SoundManager.narrationOn) {
                    LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Sound On", 0);
                    this.soundBt.loadTexture(
                        LetiFramework.Utils.getImagePath(settingsDropDown.sound_button.on_image));
                } else {
                    LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Sound Off", 0);
                    this.soundBt.loadTexture(
                        LetiFramework.Utils.getImagePath(settingsDropDown.sound_button.off_image));
                }
            }, this, 2, 1, 0);
        this.soundBt.input.useHandCursor = true;
        this.soundBt.alpha = 0;
        this.addToScene(this.soundBt);

        this.musicBt = this.game.add.button(settingsBtPosition.x, settingsBtPosition.y,
            LetiFramework.Utils.getImagePath(LetiFramework.SoundManager.soundOn ?
                settingsDropDown.music_button.on_image : settingsDropDown.music_button.off_image),
            function() {
                LetiFramework.SoundManager.soundOn = !LetiFramework.SoundManager.soundOn;
                if (LetiFramework.SoundManager.soundOn) {
                    LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Music On", 0);
                    this.musicBt.loadTexture(LetiFramework.Utils.getImagePath(settingsDropDown.music_button.on_image));
                    if(this.music){
                        this.music.paused ? this.music.resume() : this.music.play();
                    }
                } else {
                    LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Music Off", 0);
                    this.musicBt.loadTexture(LetiFramework.Utils.getImagePath(settingsDropDown.music_button.off_image));
                    if(this.music){
                        this.music.pause();
                    }
                }
            }, this, 2, 1, 0);
        this.musicBt.input.useHandCursor = true;
        this.musicBt.alpha = 0;
        this.addToScene(this.musicBt);

        this.editPasswordBt = this.game.add.button(settingsBtPosition.x, settingsBtPosition.y,
            LetiFramework.Utils.getImagePath(settingsDropDown.edit_password_button.image),
            function() {
                LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Edit Password", 0);
                LetiFramework.Renderer.render("EditPassword");
            }, this, 2, 1, 0);
        this.editPasswordBt.input.useHandCursor = true;
        this.editPasswordBt.alpha = 0;
        this.addToScene(this.editPasswordBt);

        this.settingsBt = this.game.add.button(settingsBtPosition.x, settingsBtPosition.y,
            LetiFramework.Utils.getImagePath(this.screenConfig.settings_button.image),
            function() {
                LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Settings", 0);
                var soundTween = this.game.add.tween(this.soundBt);
                var musicTween = this.game.add.tween(this.musicBt);
                var editPasswordTween = this.game.add.tween(this.editPasswordBt);

                if (this.soundBt.alpha == 1) {
                    var settingsBtPosition = {
                        y: this.screenConfig.settings_button.position.y
                    };
                    soundTween.to(settingsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(function() {
                        this.soundBt.alpha = 0;
                    }, this);
                    musicTween.to(settingsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(function() {
                        this.musicBt.alpha = 0;
                    }, this);
                    editPasswordTween.to(settingsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(function() {
                        this.editPasswordBt.alpha = 0;
                    }, this);
                } else {
                    this.soundBt.alpha = 1;
                    this.musicBt.alpha = 1;
                    this.editPasswordBt.alpha = 1;

                    var settingsDropDown = this.screenConfig.settings_button.children;
                    var soundPos = {
                        y: settingsDropDown.sound_button.position.y
                    };
                    var musicPos = {
                        y: settingsDropDown.music_button.position.y
                    };
                    var editPasswordPos = {
                        y: settingsDropDown.edit_password_button.position.y
                    };

                    soundTween.to(soundPos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
                    musicTween.to(musicPos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
                    editPasswordTween.to(editPasswordPos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
                }
            }, this, 2, 1, 0);
        this.settingsBt.input.useHandCursor = true;
        this.addToScene(this.settingsBt);

        this.optionsBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y,
            LetiFramework.Utils.getImagePath(this.screenConfig.options_button.image),
            function() {
                LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Options", 0);

                var infoTween = this.game.add.tween(this.infoBt);
                var exitTween = this.game.add.tween(this.exitBt);

                if (this.infoBt.alpha == 1) {
                    var optionsBtPosition = {
                        y: this.screenConfig.options_button.position.y
                    };
                    infoTween.to(optionsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(function() {
                        this.infoBt.alpha = 0;
                    }, this);
                    exitTween.to(optionsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(function() {
                        this.exitBt.alpha = 0;
                    }, this);
                } else {
                    this.infoBt.alpha = 1;
                    this.exitBt.alpha = 1;

                    var optionsDropDown = this.screenConfig.options_button.children;
                    var infoPos = {
                        y: optionsDropDown.info_button.position.y
                    };
                    var exitPos = {
                        y: optionsDropDown.exit_button.position.y
                    };

                    infoTween.to(infoPos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
                    exitTween.to(exitPos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
                }
            }, this, 2, 1, 0);
        this.optionsBt.input.useHandCursor = true;
        this.addToScene(this.optionsBt);

        this.shareBt = this.game.add.button(shareBtPosition.x, shareBtPosition.y,
            LetiFramework.Utils.getImagePath(this.screenConfig.share_button.image),
            function() {
                LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Share", 0);

                var fbTween = this.game.add.tween(this.fbBt);
                var twTween = this.game.add.tween(this.twBt);

                if (this.fbBt.alpha == 1) {
                    var shareBtPosition = {
                        y: this.screenConfig.share_button.position.y
                    };
                    fbTween.to(shareBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(function() {
                        this.fbBt.alpha = 0;
                    }, this);
                    twTween.to(shareBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(function() {
                        this.twBt.alpha = 0;
                    }, this);
                } else {
                    this.fbBt.alpha = 1;
                    this.twBt.alpha = 1;

                    var optionsDropDown = this.screenConfig.share_button.children;
                    var fbPos = {
                        y: optionsDropDown.facebook_button.position.y
                    };
                    var twPos = {
                        y: optionsDropDown.twitter_button.position.y
                    };

                    fbTween.to(fbPos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
                    twTween.to(twPos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
                }
            }, this, 2, 1, 0);
        this.shareBt.input.useHandCursor = true;
        this.addToScene(this.shareBt);

        if (this.screenConfig.share_button.disabled == true) {
            this.fbBt.visible = false;
            this.twBt.visible = false;
            this.shareBt.visible = false;
        }

        for (var i in this.buttons) {
            var button = this.buttons[i];

            var img = this.game.add.sprite(button.position.x, button.position.y, LetiFramework.Utils.getImagePath(button.image));
            img.scale.setTo(button.width / img.width, button.height / img.height);
            img.inputEnabled = true;
            img.input.useHandCursor = true;
            img.events.onInputDown.add(function(src) {
                LetiFramework.Analytics.trackEvent(this.page, "Button Click", this.button.name, 0);
                if(this.button.name === "HIV" || this.button.name === "Malaria"){
                    window.localStorage.setItem("GameType",this.button.name);
                }
                if((this.button.name === "HIV" && window.localStorage.getItem("HIV_OtherFields"))|| (this.button.name === "Malaria" && window.localStorage.getItem("Malaria_OtherFields"))
                ){
                    LetiFramework.GameController.bootScreen = this.button.next_screen2;
                }else{
                    LetiFramework.GameController.bootScreen = this.button.next_screen;
                }

                LetiFramework.GameController.bootSequence();
            }, {
                page: this.pageName,
                button: button
            });

            this.scene.add(img);
        }

        this.scrollContainer = this.game.add.group();
        this.addToScene(this.scrollContainer);

        var margin = 0;

        // if (LetiFramework.App.isPhoneGap()) {
        //     this.music = LetiFramework.SoundManager.getSound(this.soundPath, false);
        // } else {
        if(this.screenConfig.audio && this.screenConfig.audio != ""){
            this.music = this.game.add.audio(this.getSoundPath(this.screenConfig.audio));
            this.soundObjects.push(this.music);
        }
        // }
        
        if (LetiFramework.SoundManager.soundOn) {
            if(this.music){
                this.music.play();
            }
        }

        if (this.screenConfig.transition_delay) {
            var self = this;
            setTimeout(function() {
                LetiFramework.GameController.bootScreen = self.screenConfig.next_screen;
                LetiFramework.GameController.bootSequence();
            }, this.screenConfig.transition_delay);
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
                if (asset.custom_font) {
                    var txt = LetiFramework.Utils.wrapText(asset.text, asset.custom_font);
                    cmp = this.game.add.bitmapText(position.x, position.y,
                        LetiFramework.Utils.getFontPath(asset.custom_font), txt, asset.custom_font.font_size);
                } else {
                    cmp = this.game.add.text(position.x, position.y, asset.text, asset.style);
                }
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
                        LetiFramework.Analytics.trackEvent("Menu", "Interactivity", this.image, 0);

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
                    cmp.input.useHandCursor = true;
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
                        cmp.input.useHandCursor = true;
                        cmp.events.onInputDown.add(function(src) {
                            var _this = LetiFramework.Renderer.currentState();
                            LetiFramework.Analytics.trackEvent("Menu", "Interactivity", this.asset.image, 0);

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
                                        // if (LetiFramework.App.isPhoneGap()) {
                                        //     snd = LetiFramework.SoundManager.getSound(soundPath, false);
                                        // } else {
                                            snd = _this.game.add.audio(soundPath);
                                        // }
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
    addToScene: function(item) {
        this.scene.add(item);
    },
    shutdown: function() {
        this.scene.destroy();
        for (var i = 0; i < this.soundObjects.length; i++) {
            this.soundObjects[i].destroy();
        }
    },
    pause: function() {
        if (LetiFramework.SoundManager.soundOn) {
            if(this.music){
                this.music.pause();
            }
        }
    },
    resume: function() {
        if (LetiFramework.SoundManager.soundOn) {
            if(this.music){
                this.music.paused ? this.music.resume() : this.music.play();
            }
        }
    },
    createUnlockEpisodeModal: function(unlockMessage) {
        var unlockEpisodeBt = this.createDialogButton(this.lockedDialog.close_button);

        unlockEpisodeBt.callback = function() {
            LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Close Dialog", 0);
            LetiFramework.Renderer.currentState().modals.destroyModal("unlockEpisodeModal");
        }

        var unlockEpisodeText = {
            type: "text",
            content: unlockMessage
        };
        for (var k in this.lockedDialog.text_style) {
            unlockEpisodeText[k] = this.lockedDialog.text_style[k];
        }

        //// Episode not available Notif modal ////
        this.modals.createModal({
            type: "unlockEpisodeModal",
            includeBackground: true,
            modalCloseOnInput: true,
            itemsArr: [{
                type: "image",
                content: this.lockedDialog.background,
                offsetY: this.lockedDialog.offsetY,
                offsetX: this.lockedDialog.offsetX,
                contentScale: this.lockedDialog.bg_scale
            },
                unlockEpisodeText,
                unlockEpisodeBt
            ]
        });

        this.modals.showModal("unlockEpisodeModal");
    },
    createModals: function() {
        this.modals = new gameModal(this.game);

        var exitSignOutBt = this.createDialogButton(this.exitSignOutButton);
        var self = this;
        exitSignOutBt.callback = function() {
            var showLogin = LetiFramework.GameController.currentUser.id > 0;
            LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Exit & Sign Out", 0);
            LetiFramework.Renderer.currentState().modals.hideModal("exitGameModal");
            LetiFramework.GameController.logoutUser();
            LetiFramework.App.isPhoneGap() && (navigator.app ? navigator.app.exitApp() : navigator.device && navigator.device.exitApp());
            if (!LetiFramework.App.isPhoneGap() && showLogin) {
                LetiFramework.GameController.bootScreen = self.exitSignOutButton.next_screen;
                LetiFramework.GameController.bootSequence();
            }else if(showLogin){

            }
        }

        var exitBt = this.createDialogButton(this.exitButton);
        exitBt.callback = function() {
            LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Exit Game", 0);
            LetiFramework.Renderer.currentState().modals.hideModal("exitGameModal");
            LetiFramework.App.isPhoneGap() && (navigator.app ? navigator.app.exitApp() : navigator.device && navigator.device.exitApp());
        }

        var closeBt = this.createDialogButton(this.closeExitDialogButton);
        closeBt.callback = function() {
            LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Close Dialog", 0);
            LetiFramework.Renderer.currentState().modals.hideModal("exitGameModal");
        }

        //// Exit Game modal ////
        this.modals.createModal({
            type: "exitGameModal",
            includeBackground: true,
            modalCloseOnInput: true,
            itemsArr: [{
                type: "image",
                content: LetiFramework.Utils.getImagePath(this.exitDialog.background),
                offsetY: this.exitDialog.offsetY,
                offsetX: this.exitDialog.offsetX,
                contentScale: this.exitDialog.bg_scale
            },
                exitSignOutBt,
                exitBt,
                closeBt
            ]
        });

        var closeComingSoonBt = this.createDialogButton(this.lockedDialog.close_button);
        closeComingSoonBt.callback = function() {
            LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Close Dialog", 0);
            LetiFramework.Renderer.currentState().modals.hideModal("comingSoonModal");
        }

        var comingSoonText = {
            type: "text",
            content: "Coming Soon"
        };
        for (var k in this.lockedDialog.text_style) {
            comingSoonText[k] = this.lockedDialog.text_style[k];
        }

        //// Episode not available Notif modal ////
        this.modals.createModal({
            type: "comingSoonModal",
            includeBackground: true,
            modalCloseOnInput: true,
            itemsArr: [{
                type: "image",
                content: LetiFramework.Utils.getImagePath(this.lockedDialog.background),
                offsetY: this.lockedDialog.offsetY,
                offsetX: this.lockedDialog.offsetX,
                contentScale: this.lockedDialog.bg_scale
            },
                comingSoonText,
                closeComingSoonBt
            ]
        });
    },
    createDialogButton: function(buttonConfig) {
        var dialogBt = null;
        if (buttonConfig.type == "text") {
            var btTextStyle = buttonConfig.text_style;
            dialogBt = {
                type: "text",
                content: buttonConfig.text,
                fontSize: btTextStyle.fontSize,
                fontFamily: btTextStyle.fontFamily,
                color: btTextStyle.color,
                stroke: btTextStyle.stroke,
                strokeThickness: btTextStyle.strokeThickness
            };
        } else if (buttonConfig.type == "image") {
            dialogBt = {
                type: "image",
                content: LetiFramework.Utils.getImagePath(buttonConfig.image),
                contentScale: buttonConfig.image_scale
            };
        }

        dialogBt.offsetX = buttonConfig.offsetX;
        dialogBt.offsetY = buttonConfig.offsetY;

        return dialogBt;
    },
    loadStoryCover: function(game) {
        var key = this.getStoryCoverImageKey(game);
        this.game.load.image(key, key);
    },
    loadEpisodeCover: function(game) {
        var key = this.getEpisodeCoverImageKey(game);
        this.game.load.image(key, key);
    },
    getStoryCoverImageKey: function(game) {
        var key;
        // if (LetiFramework.App.isPhoneGap()) {
        //     key = LetiFramework.FileManager.getStoryCoverPath(game.id, game.cover);
        // } else {
            key = 'assets/stories/' + game.id + '/cover/' + game.cover;
        // }
        return key;
    },
    getEpisodeCoverImageKey: function(game) {
        var key;
        // if (LetiFramework.App.isPhoneGap()) {
        //     key = LetiFramework.FileManager.getEpisodeCoverPath(game.storyId, game.id, game.cover);
        // } else {
            key = 'assets/stories/' + game.storyId + '/episodes/' + game.id + '/cover/' + game.cover;
        // }
        return key;
    },
    getSoundPath: function(name) {
        return 'assets/sound/' + name;
    },
    loadAudio: function(name) {
        if(name){
            var key = this.getSoundPath(name);
            this.game.load.audio(key, key);
        }
    },
    addMenuItemClickHandler: function() {
        for (var i = 0; i < this.games.length; i++) {
            this.menuItems[i].inputEnabled = true;
            this.menuItems[i].input.useHandCursor = true;
            this.menuItems[i].events.onInputDown.add(this.clickedMenuItem, this);
        }
    },
    clickedMenuItem: function(src) {
        this.clickedItem = src;
        console.log(src);
    },
    scrollMenuItems: function(direction) {
        if (direction == 'left' || direction == 'right') {
            var this_ = LetiFramework.Renderer.currentState();
            var count = this_.menuItems.length;
            var sign = direction == 'left' ? -1 : 1;

            for (var i = 0; i < count; i++) {
                var menuItem = this_.menuItems[i];
                var menuItemTween = this_.game.add.tween(menuItem);

                if (menuItem.x + 0.5 * menuItem.width == this_.game.world.centerX) {
                    menuItem.scale.setTo(1);
                    menuItem.scale.setTo(this_.menuItemWidth / menuItem.width, this_.menuItemHeight / menuItem.height);
                    menuItem.x = this_.game.world.centerX - menuItem.width * 0.5;
                }

                menuItemTween.to({
                    x: menuItem.x + sign * (this_.itemsMargin + menuItem.width)
                }, 100, Phaser.Easing.Linear.None, true).onComplete.add(function() {
                    if (this.menuItem.x + 0.5 * this.menuItem.width == this.ctx.game.world.centerX) {
                        this.menuItem.scale.multiply(this.ctx.focusedItemScale, this.ctx.focusedItemScale);
                        this.menuItem.x = this.ctx.game.world.centerX - this.menuItem.width * 0.5;
                    }
                }, {
                    menuItem: menuItem,
                    ctx: this_
                });
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

            var actionSwipe = dx > minimum.distance || dy > minimum.distance;

            if (eventDuration > minimum.duration && actionSwipe) {
                this.clickedItem = null;
                var sign = 0;
                var animateEnd = false;

                // Check direction
                if (endPoint.x - startPoint.x > minimum.distance) {
                    direction = 'right';
                    if (this.focusedItem > 0) {
                        this.focusedItem--;
                    } else {
                        sign = 1;
                        animateEnd = true;
                        direction = null;
                    }
                } else if (startPoint.x - endPoint.x > minimum.distance) {
                    direction = 'left';
                    if (this.focusedItem < this.games.length - 1) {
                        this.focusedItem++;
                    } else {
                        sign = -1;
                        animateEnd = true;
                        direction = null;
                    }
                } else if (endPoint.y - startPoint.y > minimum.distance) {
                    direction = 'bottom';
                } else if (startPoint.y - endPoint.y > minimum.distance) {
                    direction = 'top';
                }

                if (direction) {
                    callback(direction);
                }

                if (animateEnd) {
                    for (var i = 0; i < this.menuItems.length; i++) {
                        var menuItem = this.menuItems[i];
                        var menuItemTween = this.game.add.tween(menuItem);
                        menuItemTween.to({
                            x: menuItem.x + sign * 50
                        }, 100, Phaser.Easing.Bounce.Out, true, 0, 0, true);
                    }
                }
            } else {
                var src = this.clickedItem;
                if (src) {
                    this.clickedItem = null;
                    for (var i = 0; i < this.menuItems.length; i++) {
                        if (src == this.menuItems[i]) {
                            if (i == this.focusedItem) {
                                var game = this.games[i];
                                if (game.storyId) {
                                    // clicked an episode item
                                    LetiFramework.Analytics.trackEvent(
                                        "Menu", "Episode Selection", game.name, 0);
                                    if (game.available) {
                                        var unlockMessage = LetiFramework.GameController.initializeGame(game);
                                        if (unlockMessage) {
                                            //this.createUnlockEpisodeModal(unlockMessage);
                                            alert(unlockMessage);
                                        }
                                    } else {
                                        this.modals.showModal("comingSoonModal");
                                    }
                                } else {
                                    // clicked a story item
                                    LetiFramework.Analytics.trackEvent(
                                        "Menu", "Story Selection", game.name, 0);
                                    LetiFramework.GameController.currentStory = game;
                                    console.log(game);
                                    LetiFramework.Renderer.render("SubMenu");
                                }
                            } else {
                                var direction = i < this.focusedItem ? "right" : "left";
                                this.focusedItem += direction == "right" ? -1 : 1;
                                this.scrollMenuItems(direction);
                            }
                            break;
                        }
                    }
                }
            }
        }, this);
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