var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.submenu = function(game) {};

LetiFramework.Ui.submenu.prototype = {
    init: function() {
        LetiFramework.Analytics.trackPage("SubMenu");

        LetiFramework.GameController.gameStarted = false;
        this.currentUser = LetiFramework.GameController.currentUser;
        this.screenConfig = LetiFramework.GameController.menuConfig.submenu;
        this.backButton = this.screenConfig.back_button;
        this.currentStory = LetiFramework.GameController.currentStory;
        this.games = this.currentStory.episodes;
        if(this.games) {
            this.games.sort(function (a, b) {
                return a.displayOrder - b.displayOrder;
            });
        }
        this.focusedItem = 0;
        this.menuItems = [];
        this.focusedItemScale = 1.7;
        this.menuItemWidth = this.screenConfig.menu_item_width;
        this.menuItemHeight = this.screenConfig.menu_item_height;
        this.animScale = LetiFramework.Renderer.animScale;
        this.pageComponents = [];
        this.soundObjects = [];
        this.topCompnents = [];
        this.topMenu = null;
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
        LetiFramework.Utils.loadImage(this.screenConfig.back_button.image);

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
                if (!LetiFramework.App.isPhoneGap()) {
                    this.loadAudio(cmp.interactivity.audio);
                }
            }
        }

        for (var i = 0; i < this.games.length; i++) {
            var game = this.games[i];
            this.loadEpisodeCover(game);
            this.loadEpisodeName(game);
        }

        if (!LetiFramework.App.isPhoneGap()) {
            this.loadAudio(this.screenConfig.audio);
        }

        this.soundPath = this.getSoundPath(this.screenConfig.audio);

        var settingsDropDown = this.screenConfig.settings_button.children;
        var optionsDropDown = this.screenConfig.options_button.children;
        // var shareDropDown = this.screenConfig.share_button.children;

        LetiFramework.Utils.loadImage(this.screenConfig.background);
        // LetiFramework.Utils.loadImage(this.screenConfig.badge.image);
        // LetiFramework.Utils.loadImage(this.exitDialog.background);
        LetiFramework.Utils.loadImage(this.screenConfig.settings_button.image);
        LetiFramework.Utils.loadImage(this.screenConfig.options_button.image);
        // LetiFramework.Utils.loadImage(this.screenConfig.share_button.image);
        LetiFramework.Utils.loadImage(this.screenConfig.back_button.image);
        // LetiFramework.Utils.loadImage(this.screenConfig.contact_button.image);
        LetiFramework.Utils.loadImage(optionsDropDown.info_button.image);
        LetiFramework.Utils.loadImage(optionsDropDown.exit_button.image);        
        LetiFramework.Utils.loadImage(settingsDropDown.sound_button.on_image);
        LetiFramework.Utils.loadImage(settingsDropDown.music_button.on_image);
        LetiFramework.Utils.loadImage(settingsDropDown.sound_button.off_image);
        LetiFramework.Utils.loadImage(settingsDropDown.music_button.off_image);
        LetiFramework.Utils.loadImage(settingsDropDown.edit_password_button.image);
        // LetiFramework.Utils.loadImage(shareDropDown.facebook_button.image);
        // LetiFramework.Utils.loadImage(shareDropDown.twitter_button.image);
    },
    create: function() {
        this.scene = this.game.add.group();

        this.listenSwipe(this.scrollMenuItems);

        this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY,
            LetiFramework.Utils.getImagePath(this.screenConfig.background));
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);
        this.addToScene(this.bg);

        this.addComponents();

        var settingsDropDown = this.screenConfig.settings_button.children;
        var optionsDropDown = this.screenConfig.options_button.children;
        // var shareDropDown = this.screenConfig.share_button.children;
        var settingsBtPosition = this.screenConfig.settings_button.position;
        var optionsBtPosition = this.screenConfig.options_button.position;
        // var shareBtPosition = this.screenConfig.share_button.position;
        // var backButton = this.screenConfig.back_button;

        this.backBt = this.game.add.button(this.backButton.position.x, this.backButton.position.y,
            LetiFramework.Utils.getImagePath(this.backButton.image),
            function() {
                LetiFramework.Analytics.trackEvent("SubMenu", "Button Click", "Back", 0);
                // LetiFramework.GameController.showView("Menu");
                if(window.localStorage.getItem("GameType")){
                    var gt = window.localStorage.getItem("GameType");
                    LetiFramework.GameController.bootScreen = this.backButton.next_screen;
                }
                LetiFramework.GameController.bootSequence();
            }, this, 2, 1, 0);
        this.backBt.input.useHandCursor = true;
        this.addToScene(this.backBt);

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
                    window.localStorage.removeItem('pause');
                    LetiFramework.Analytics.trackEvent("Menu", "Button Click", "Music On", 0);
                    this.musicBt.loadTexture(LetiFramework.Utils.getImagePath(settingsDropDown.music_button.on_image));
                    if(this.music){
                        this.music.paused ? this.music.resume() : this.music.play();
                    }
                } else {
                    window.localStorage.setItem('pause', 'true');
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

        this.scrollContainer = this.game.add.group();
        this.addToScene(this.scrollContainer);

        var margin = 0;

        var game = this.games[0],menuName,txt;
        if(game.displayType && game.displayType === 'generic') {

            for (var i = 0; i < this.games.length; i++) {
                game = this.games[i];
                menuItem = this.game.add.sprite(0, 0, this.getCoverImageKey(game));
                menuItem.scale.setTo(this.menuItemWidth / menuItem.width, this.menuItemHeight / menuItem.height);
                menuItem.anchor.set(0, 0.5);
                menuItem.x = margin + i * (margin + menuItem.width);
                menuItem.y = this.game.world.centerY;

                menuItemName = this.game.add.sprite(100, -150, this.getNameImageKey(game));
                menuItemName.anchor.set(0, 0);
                menuItemName.scale.setTo(0.4);
                menuItem.addChild(menuItemName);

                menuName;
                if (this.currentStory.custom_font) {
                    var txt = LetiFramework.Utils.wrapText(game.name, this.currentStory.custom_font);
                    menuName = this.game.add.bitmapText(menuItem.width / 2, 200,
                        LetiFramework.Utils.getFontPath(game.custom_font), txt, game.custom_font.font_size);
                } else {
                    menuName = this.game.add.text(menuItem.width / 2, 200, game.name, this.currentStory.text_style);
                }
                // console.log(this.currentStory.text_style);
                menuItem.addChild(menuName);
                menuName.anchor.set(0.5, 0.5);
                // if(this.currentStory.showNames){
                menuName.visible = false;
                // }

                menuItem.x = game.position.x;
                menuItem.y = game.position.y;
                menuItem.inputEnabled = true;
                menuItem.num = i;
                this.topMenu = menuItem;
                menuItem.input.useHandCursor = true;
                menuItem.events.onInputDown.add( function (src) {
                    this.focusedItem = src.num;
                    this.clickedItem = src;
                }, this);
                this.menuItems.push(menuItem);

            }


        }
        else{
            if (this.games.length > 0) {
                game = this.games[0];
                var menuItem = this.game.add.sprite(0, 0, this.getCoverImageKey(game));
                menuItem.scale.setTo(this.menuItemWidth / menuItem.width, this.menuItemHeight / menuItem.height);
                menuItem.anchor.set(0, 0.5);

                var menuItemName = this.game.add.sprite(100, -150, this.getNameImageKey(game));
                menuItemName.anchor.set(0, 0);
                menuItemName.scale.setTo(0.4);
                menuItem.addChild(menuItemName);

                this.menuItems.push(menuItem);
                this.scrollContainer.add(menuItem);

                margin = (this.game.width % (this.menuItemWidth * 3)) / 4;
                this.itemsMargin = margin;
                menuItem.x = margin;
                menuItem.y = this.game.world.centerY;

                var menuName;
                if (this.currentStory.custom_font) {
                    var txt = LetiFramework.Utils.wrapText(game.name, this.currentStory.custom_font);
                    menuName = this.game.add.bitmapText(menuItem.width / 2, 200,
                        LetiFramework.Utils.getFontPath(game.custom_font), txt, game.custom_font.font_size);
                } else {
                    menuName = this.game.add.text(menuItem.width / 2, 200, game.name, this.currentStory.text_style);
                }
                // console.log(this.currentStory.text_style);
                menuItem.addChild(menuName);
                menuName.anchor.set(0.5, 0.5);
                // if(this.currentStory.showNames){
                menuName.visible = false;
                // }
            }

            for (var i = 1; i < this.games.length; i++) {
                 game = this.games[i];
                menuItem = this.game.add.sprite(0, 0, this.getCoverImageKey(game));
                menuItem.scale.setTo(this.menuItemWidth / menuItem.width, this.menuItemHeight / menuItem.height);
                menuItem.anchor.set(0, 0.5);
                menuItem.x = margin + i * (margin + menuItem.width);
                menuItem.y = this.game.world.centerY;

                menuItemName = this.game.add.sprite(100, -150, this.getNameImageKey(game));
                menuItemName.anchor.set(0, 0);
                menuItemName.scale.setTo(0.4);
                menuItem.addChild(menuItemName);

                menuName;
                if (this.currentStory.custom_font) {
                    var txt = LetiFramework.Utils.wrapText(game.name, this.currentStory.custom_font);
                    menuName = this.game.add.bitmapText(menuItem.width / 2, 200,
                        LetiFramework.Utils.getFontPath(game.custom_font), txt, game.custom_font.font_size);
                } else {
                    menuName = this.game.add.text(menuItem.width / 2, 200, game.name, this.currentStory.text_style);
                }
                // console.log(this.currentStory.text_style);
                menuItem.addChild(menuName);
                menuName.anchor.set(0.5, 0.5);
                // if(this.currentStory.showNames){
                menuName.visible = false;
                // }

                if (menuItem.x + 0.5 * menuItem.width === this.game.world.centerX) {
                    menuItem.scale.multiply(this.focusedItemScale, this.focusedItemScale);
                    menuItem.x = this.game.world.centerX - menuItem.width * 0.5;
                    this.topMenu = menuItem;
                    this.focusedItem = i;
                }
                this.menuItems.push(menuItem);
                this.scrollContainer.add(menuItem);
            }

            if (this.menuItems.length === 1) {
                this.menuItems[0].scale.multiply(this.focusedItemScale, this.focusedItemScale);
                this.menuItems[0].x = this.game.world.centerX - menuItem.width * 0.5;
                this.scene.bringToTop(this.menuItems[0]);
            } else {
                this.focusedItem--;
                this.scrollMenuItems("right");
            }

            this.addMenuItemClickHandler();
        }

        if(this.topCompnents.length >  0){
            for(var i in this.topCompnents){
                this.scene.bringToTop(this.topCompnents[i]);
            }
        }

        if (LetiFramework.App.isPhoneGap()) {
            this.music = LetiFramework.SoundManager.getSound(this.soundPath, false);
        } else {
            if(this.screenConfig.audio && this.screenConfig.audio != ""){
                this.music = this.game.add.audio(this.getSoundPath(this.screenConfig.audio));
            }
        }

        if(this.music){
            this.soundObjects.push(this.music);
        }

        if (LetiFramework.SoundManager.soundOn) {
            if(this.music){
                this.music.play();
            }
        }
    },
    update: function() {
        // console.log(this.topMenu);
       this.game.world.bringToTop(this.topMenu);
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
                if(asset.bringToTop) this.topCompnents.push(cmp);
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
                if(asset.bringToTop) this.topCompnents.push(cmp);
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
                        LetiFramework.Analytics.trackEvent("SubMenu", "Interactivity", this.image, 0);

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
                            LetiFramework.Analytics.trackEvent("SubMenu", "Interactivity", this.asset.image, 0);

                            var animations = this.asset.interactivity.animation;
                            var audio = this.asset.interactivity.audio;
                            var toggle = this.asset.interactivity.toggle;
                            var link = this.asset.interactivity.link;
                            if (link) {
                                if (LetiFramework.App.isPhoneGap()) {
                                    window.open(link, '_system');
                                } else {
                                    window.open(link);
                                }
                            }
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
    loadEpisodeCover: function(game) {
        var key = this.getCoverImageKey(game);
        this.game.load.image(key, key);
    },
    loadEpisodeName: function(game) {
        var key = this.getNameImageKey(game);
        this.game.load.image(key, key);
    },

    getCoverImageKey: function(game) {
        var key;
        // if (LetiFramework.App.isPhoneGap()) {
        //     key = LetiFramework.FileManager.getEpisodeCoverPath(game.storyId, game.id, game.cover);
        // } else {
            key = 'assets/stories/' + game.storyId + '/episodes/' + game.id + '/cover/' + game.cover;
        // }
        return key;
    },

    getNameImageKey: function(game) {
        var key;
        // if (LetiFramework.App.isPhoneGap()) {
        //     key = LetiFramework.FileManager.getEpisodeCoverPath(game.storyId, game.id, game.name_icon);
        // } else {
            key = 'assets/stories/' + game.storyId + '/episodes/' + game.id + '/cover/' + game.name_icon;
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
                        this.topMenu = this.menuItem;
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
                return;
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
                                this.scene.bringToTop(game);
                                // clicked an episode item
                                LetiFramework.Analytics.trackEvent(
                                    "Menu", "Episode Selection", this.games[i].name, 0);
                                var unlockMessage = LetiFramework.GameController.initializeGame(this.games[i]);
                                if (unlockMessage) {
                                    alert(unlockMessage);
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
