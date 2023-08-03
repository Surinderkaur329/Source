var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.timeline = function(game) {}

LetiFramework.Ui.timeline.prototype = {
    init: function() {
        LetiFramework.Analytics.trackPage("Timeline");

        this.screenConfig = LetiFramework.GameController.screensConfig.timeline;
        this.hud = LetiFramework.GameController.screensConfig.hud;
        this.animScale = LetiFramework.Renderer.animScale;
        this.currentStorySound = LetiFramework.GameController.currentStorySound;
        this.currentStoryData = LetiFramework.GameController.currentStoryData;
        this.currentUser = LetiFramework.GameController.currentUser;
        this.currentGame = LetiFramework.GameController.currentGame;
        this.currentGamePage = LetiFramework.GameController.currentGamePage;
        this.currentGamePageData = LetiFramework.GameController.currentGamePageData;
        this.badge = this.currentGamePageData.badge;
        this.pageComponents = [];
        this.soundObjects = [];
        this.timeLines = [];
        this.timeLineIndex = 0;
        this.pageSprites = {};
        var cmps = this.currentGamePageData.components;
        if (cmps) {
            if(cmps.constructor === Array) {
                for(var i in cmps) {
                    var cmp = cmps[i];
                    this.pageComponents = this.pageComponents.concat(
                        LetiFramework.GameController.currentStoryComponents[cmp]);
                }
            } else {
                this.pageComponents = LetiFramework.GameController.currentStoryComponents[cmps];
            }
        }
        this.universalComponents = LetiFramework.GameController.currentStoryComponents.universal_components || [];

        if (this.currentGamePageData.points) {
            var rs = LetiFramework.Db.readByKeysAndValues("scores", ["user_id", "game_id", "activity"], [this.currentUser.id, this.currentGame.id, this.currentGamePage]);

            if (rs.length == 0) {
                this.currentUser.points += this.currentGamePageData.points;
                LetiFramework.Db.update("users", this.currentUser);

                var log = {
                    "story": this.currentGame.name,
                    "page": this.currentGamePage,
                    "points": this.currentGamePageData.points
                };
                LetiFramework.Analytics.trackEvent("Timeline", "Points Score", log, 0);

                var userScore = new LetiFramework.DbEntities.Scores(this.currentUser.id, this.currentGame.id,
                    this.currentGamePage, this.currentGamePageData.points, this.currentGamePageData.points, true);
                LetiFramework.Db.create("scores", userScore);
            }
        }

        var apr = this.currentStoryData.attribute_page_redirection;
        for (var attr in apr) {
            var attrScore = this.currentUser.player_attributes[attr];
            for (var i in apr[attr]) {
                var tl = apr[attr][i];
                if (tl.score <= attrScore) {
                    for(var j in tl.pages) {
                        tl.pages[j].attribute = attr;
                        tl.pages[j].score = tl.score;
                    }
                    this.timeLines = this.timeLines.concat(tl.pages);
                }
            }
        }
    },
    preload: function() {
        var bgImage;
        if (this.currentGamePageData.background_if) {
            var pg = this.currentGamePageData.background_if.page;
            var rs = LetiFramework.Db.readByKeysAndValues(
                "user_game_play", ["user_id", "game_id", "game_step"], [this.currentUser.id, this.currentGame.id, pg]);
            if (rs.length > 0) {
                var selection = rs[rs.length - 1].selection[0];
                bgImage = this.currentGamePageData.background_if[selection];
            }
        } else {
            bgImage = this.currentGamePageData.background;
        }

        this.bgKey = this.getAssetPath(bgImage);

        if (this.hud.visible) {
            var badges = LetiFramework.Db.readByKeysAndValues("badges", ["user_id", "episode_id"], [this.currentUser.id, this.currentGame.id]);
            if (badges.length > 0) {
                this.currentBadge = badges[badges.length - 1];
            }
        }

        this.awardBadge();
        this.preloadSprites();

        if (!LetiFramework.App.isPhoneGap() && LetiFramework.GameController.bootConfig.web_version) return;

        this.loadImageFile(bgImage);
        this.loadImageFile(this.currentGamePageData.nav_next);
        this.loadImageFile(this.currentGamePageData.nav_prev);

        for (var i in this.timeLines) {
            var tl = this.timeLines[i];
            if (tl.image) {
                this.loadImageFile(tl.image);
            }
        }

        var optionsBt = this.screenConfig.options_button;
        var nextBt = this.screenConfig.next_button;
        var prevBt = this.screenConfig.prev_button;
        var optionsDropDown = optionsBt.children;
        var optionsHomeBt = optionsDropDown.home_button;
        var optionsSoundBt = optionsDropDown.sound_button;
        var optionsMusicBt = optionsDropDown.music_button;
        var prevPageBtConfig = this.currentGamePageData.prev_page_button;
        var nextPageBtConfig = this.currentGamePageData.next_page_button;

        LetiFramework.Utils.loadImage('close.png');
        LetiFramework.Utils.loadImage(optionsHomeBt.image);
        LetiFramework.Utils.loadImage(optionsSoundBt.on_image);
        LetiFramework.Utils.loadImage(optionsSoundBt.off_image);
        LetiFramework.Utils.loadImage(optionsMusicBt.on_image);
        LetiFramework.Utils.loadImage(optionsMusicBt.off_image);
        LetiFramework.Utils.loadImage(optionsBt.image);
        LetiFramework.Utils.loadImage(nextBt.image);
        LetiFramework.Utils.loadImage(prevBt.image);
        if (nextPageBtConfig && nextPageBtConfig.image) {
            this.loadImageFile(nextPageBtConfig.image);
        }
        if (prevPageBtConfig && prevPageBtConfig.image) {
            this.loadImageFile(prevPageBtConfig.image);
        }

        if (this.currentGamePageData.text_custom_font) {
            LetiFramework.Utils.loadAssetFont(this.currentGamePageData.text_custom_font);
        }

        var components = this.universalComponents.concat(this.pageComponents);
        for (var i = 0; i < components.length; i++) {
            var cmp = components[i];
            if (cmp.image) {
                if (cmp.type == 'spritesheet') {
                    this.loadSpriteSheetFile(cmp.image, cmp.frame_width, cmp.frame_height);
                } else {
                    this.loadImageFile(cmp.image);
                }
            } else if (cmp.type == 'text' && cmp.custom_font) {
                LetiFramework.Utils.loadAssetFont(cmp.custom_font);
            }

            if (cmp.interactivity && cmp.interactivity.audio) {
                if (!LetiFramework.App.isPhoneGap()) {
                    this.loadAudio(cmp.interactivity.audio);
                }
            }
        }

        var componentsOverride = this.currentGamePageData.components_override;
        for (var k in componentsOverride) {
            var cmp = componentsOverride[k];
            if (cmp.type == "image") {
                this.loadImageFile(cmp.image);
            } else if (cmp.type == "spritesheet") {
                var frame_width = cmp.frame_width;
                var frame_height = cmp.frame_height;
                if (frame_width == undefined || frame_height == undefined) {
                    for (var j in this.pageComponents) {
                        var pageCmp = this.pageComponents[j];
                        if (pageCmp.name == k) {
                            frame_width = frame_width || pageCmp.frame_width;
                            frame_height = frame_height || pageCmp.frame_height;
                        }
                    }
                }
                this.loadSpriteSheetFile(cmp.image, frame_width, frame_height);
            }
        }

        var progressComponent = LetiFramework.GameController.currentStoryComponents.progress_component;
        if (progressComponent && this.currentGamePageData.progress_component) {
            this.loadImageFile(progressComponent.progress_image.image);
            if (progressComponent.background && progressComponent.background.type == "image") {
                this.loadImageFile(progressComponent.background.image);
            }
        }

        var pas = this.currentStoryData.player_attributes;
        for (var i in pas) {
            var pa = pas[i];
            var attributeProgress = pa.progress;
            if (attributeProgress) {
                this.loadImageFile(attributeProgress.progress_image.image);
                if (attributeProgress.background.type == "image") {
                    this.loadImageFile(attributeProgress.background.image);
                }
            }
        }

        if (this.showBadge) {
            var badgeStyle = LetiFramework.GameController.screensConfig.badge_dialog_styles[this.badge.style];

            this.loadBadgeFile(this.badge.image);
            LetiFramework.Utils.loadImage(badgeStyle.background);

            if (badgeStyle.title.type == "image") {
                LetiFramework.Utils.loadImage(badgeStyle.title.image);
            }

            if (badgeStyle.close_button.type == "image") {
                LetiFramework.Utils.loadImage(badgeStyle.close_button.image);
            }
        }

        if (this.hud.visible && this.currentBadge) {
            this.loadBadgeFile(this.currentBadge.badge_image);
        }

        if (!LetiFramework.App.isPhoneGap()) {
            this.loadAudio(this.currentGamePageData.audio);

            if (this.currentStoryData.audio && this.currentStorySound == null) {
                this.loadAudio(this.currentStoryData.audio);
            }
        }

        this.bgSoundPath = this.getSoundPath(this.currentGamePageData.audio);
    },
    create: function() {
        this.scene = this.game.add.group();

        this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.bgKey);
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

        this.scene.add(this.bg);

        this.addComponents();

        this.enableDrag();

        var optionsBt = this.screenConfig.options_button;
        var optionsDropDown = optionsBt.children;
        var optionsHomeBt = optionsDropDown.home_button;
        var optionsSoundBt = optionsDropDown.sound_button;
        var optionsMusicBt = optionsDropDown.music_button;
        var optionsBtPosition = this.screenConfig.options_button.position;

        this.homeBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y,
            LetiFramework.Utils.getImagePath(optionsDropDown.home_button.image),
            function() {
                if (this.currentGamePageData.home_button_disabled != true) {
                    LetiFramework.Analytics.trackEvent("Timeline", "Button Click", "Home", 0);
                    LetiFramework.Renderer.render("Menu");
                }
            }, this, 2, 1, 0);
        this.homeBt.input.useHandCursor = true;
        this.homeBt.alpha = 0;

        this.soundBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y,
            LetiFramework.Utils.getImagePath(LetiFramework.SoundManager.narrationOn ? optionsSoundBt.on_image : optionsSoundBt.off_image),
            function() {
                LetiFramework.SoundManager.narrationOn = !LetiFramework.SoundManager.narrationOn;
                if (LetiFramework.SoundManager.narrationOn) {
                    LetiFramework.Analytics.trackEvent("Timeline", "Button Click", "Sound On", 0);
                    this.soundBt.loadTexture(
                        LetiFramework.Utils.getImagePath(this.screenConfig.options_button.children.sound_button.on_image));
                } else {
                    LetiFramework.Analytics.trackEvent("Timeline", "Button Click", "Sound Off", 0);
                    this.soundBt.loadTexture(
                        LetiFramework.Utils.getImagePath(this.screenConfig.options_button.children.sound_button.off_image));
                }
            }, this, 2, 1, 0);
        this.soundBt.input.useHandCursor = true;
        this.soundBt.alpha = 0;

        this.musicBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y,
            LetiFramework.Utils.getImagePath(LetiFramework.SoundManager.soundOn ? optionsMusicBt.on_image : optionsMusicBt.off_image),
            function() {
                LetiFramework.SoundManager.soundOn = !LetiFramework.SoundManager.soundOn;
                if (LetiFramework.SoundManager.soundOn) {
                    LetiFramework.Analytics.trackEvent("Timeline", "Button Click", "Music On", 0);
                    this.musicBt.loadTexture(
                        LetiFramework.Utils.getImagePath(this.screenConfig.options_button.children.music_button.on_image));
                    this.bgSound.paused ? this.bgSound.resume() : this.bgSound.play();
                    this.currentStorySound && (this.currentStorySound.paused ?
                        this.currentStorySound.resume() : this.currentStorySound.play());
                } else {
                    LetiFramework.Analytics.trackEvent("Timeline", "Button Click", "Music Off", 0);
                    this.musicBt.loadTexture(
                        LetiFramework.Utils.getImagePath(this.screenConfig.options_button.children.music_button.off_image));
                    this.bgSound.pause();
                    this.currentStorySound && this.currentStorySound.pause();
                }
            }, this, 2, 1, 0);
        this.musicBt.input.useHandCursor = true;
        this.musicBt.alpha = 0;

        this.optionsBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y,
            LetiFramework.Utils.getImagePath(optionsBt.image),
            function() {
                LetiFramework.Analytics.trackEvent("Timeline", "Button Click", "Options", 0);

                var homeTween = this.game.add.tween(this.homeBt);
                var soundTween = this.game.add.tween(this.soundBt);
                var musicTween = this.game.add.tween(this.musicBt);

                if (this.soundBt.alpha == 1) {
                    var optionsBtPosition = {
                        y: this.screenConfig.options_button.position.y
                    };

                    homeTween.to(optionsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(
                        function() {
                            this.homeBt.alpha = 0;
                        }, this);
                    soundTween.to(optionsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(
                        function() {
                            this.soundBt.alpha = 0;
                        }, this);
                    musicTween.to(optionsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(
                        function() {
                            this.musicBt.alpha = 0;
                        }, this);
                } else {
                    this.homeBt.alpha = 1;
                    this.soundBt.alpha = 1;
                    this.musicBt.alpha = 1;

                    var optionsDropDown = this.screenConfig.options_button.children;
                    var homePos = {
                        y: optionsDropDown.home_button.position.y
                    };
                    var soundPos = {
                        y: optionsDropDown.sound_button.position.y
                    };
                    var musicPos = {
                        y: optionsDropDown.music_button.position.y
                    };

                    homeTween.to(homePos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
                    soundTween.to(soundPos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
                    musicTween.to(musicPos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
                }
            }, this, 2, 1, 0);
        this.optionsBt.input.useHandCursor = true;

        var prevBtPosition = this.screenConfig.prev_button.position;
        this.prevBt = this.game.add.button(prevBtPosition.x, prevBtPosition.y,
            LetiFramework.Utils.getImagePath(this.screenConfig.prev_button.image),
            function() {
                LetiFramework.Analytics.trackEvent("Timeline", "Button Click", "Previous Page", 0);
                LetiFramework.GameController.previousPage();
            }, this, 2, 1, 0);
        this.prevBt.input.useHandCursor = true;
        this.prevBt.visible = false;

        if (this.currentGamePageData.transition.transition_type == "auto") {
            setTimeout(function() {
                    LetiFramework.GameController.nextPage();
                },
                this.currentGamePageData.transition.duration);
        } else {
            var nextBtPosition = this.screenConfig.next_button.position;
            this.nextBt = this.game.add.button(nextBtPosition.x, nextBtPosition.y,
                LetiFramework.Utils.getImagePath(this.screenConfig.next_button.image),
                function() {
                    LetiFramework.Analytics.trackEvent("Timeline", "Button Click", "Next Page", 0);
                    LetiFramework.GameController.nextPage();
                }, this, 2, 1, 0);
            this.nextBt.input.useHandCursor = true;
        }

        this.customizePageNavigationButtons();

        if (LetiFramework.App.isPhoneGap()) {
            this.bgSound = LetiFramework.SoundManager.getSound(this.bgSoundPath, false);
        } else {
            this.bgSound = this.game.add.audio(this.getSoundPath(this.currentGamePageData.audio));
        }

        var currentStoryData = LetiFramework.GameController.currentStoryData;
        if (currentStoryData.audio && this.currentStorySound == null && !this.currentGamePageData.pause_story_audio) {
            var soundKey = this.getSoundPath(currentStoryData.audio);
            if (LetiFramework.App.isPhoneGap()) {
                this.currentStorySound = LetiFramework.SoundManager.getSound(soundKey, true);
            } else {
                this.currentStorySound = this.game.add.audio(soundKey, 1, true);
            }
            LetiFramework.GameController.currentStorySound = this.currentStorySound;
            if (LetiFramework.SoundManager.soundOn) {
                this.currentStorySound.play();
            }
        }

        this.soundObjects.push(this.bgSound);

        if (LetiFramework.SoundManager.soundOn) {
            this.bgSound.play();
        }

        if (this.currentGamePageData.background_pan) {
            this.game.add.tween(this.bg.scale).to({
                x: this.bg.scale.x + 0.2,
                y: this.bg.scale.y + 0.2
            }, 3000 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(
                function() {
                    this.game.add.tween(this.bg).to({
                        x: this.bg.x + 50
                    }, 3000 * this.animScale, Phaser.Easing.Linear.None, true, 0, 0, true).onComplete.add(
                        function() {
                            this.game.add.tween(this.bg.scale).to({
                                x: this.bg.scale.x - 0.2,
                                y: this.bg.scale.y - 0.2
                            }, 3500 * this.animScale, Phaser.Easing.Linear.None, true)
                        }, this)
                }, this);
        }

        if (this.hud.visible && !this.currentGamePageData.hide_hud) {
            this.hudGroup = this.game.add.group();
            this.hudGroup.x = this.hud.position.x;
            this.hudGroup.y = this.hud.position.y;
            this.hudGroup.width = this.hud.width;
            this.hudGroup.height = this.hud.height;

            var scoreLabel;
            if (this.hud.label_custom_font) {
                var cf = this.hud.label_custom_font;
                scoreLabel = this.game.add.bitmapText(0, 0, LetiFramework.Utils.getAssetFontPath(cf), "Score:", cf.font_size);
            } else {
                scoreLabel = this.game.add.text(0, 0, "Score:", this.hud.label_style);
            }

            var scoreText;
            if (this.hud.text_custom_font) {
                var cf = this.hud.text_custom_font;
                scoreText = this.game.add.bitmapText(scoreLabel.width + 10, 0, LetiFramework.Utils.getAssetFontPath(cf), "" + this.currentUser.points, cf.font_size);
            } else {
                scoreText = this.game.add.text(scoreLabel.width + 10, 0, "" + this.currentUser.points, this.hud.text_style);
            }

            this.hudGroup.add(scoreLabel);
            this.hudGroup.add(scoreText);

            var xPos = scoreText.x + scoreText.width + 20;

            if (this.currentBadge) {
                var badgeLabel;
                if (this.hud.label_custom_font) {
                    var cf = this.hud.label_custom_font;
                    badgeLabel = this.game.add.bitmapText(scoreText.x + scoreText.width + 20, 0,
                        LetiFramework.Utils.getAssetFontPath(cf), "Current Badge:", cf.font_size);
                } else {
                    badgeLabel = this.game.add.text(scoreText.x + scoreText.width + 20, 0, "Current Badge:", this.hud.label_style);
                }

                var badge = this.game.add.sprite(badgeLabel.x + badgeLabel.width + 10, 0, this.getBadgePath(this.currentBadge.badge_image));
                badge.scale.setTo(48 / badge.width, 48 / badge.height);

                this.hudGroup.add(badgeLabel);
                this.hudGroup.add(badge);

                xPos = badge.x + badge.width + 20;
            }

            var pas = this.currentStoryData.player_attributes;
            if (pas) {
                for (var i in pas) {
                    var pa = pas[i];
                    var attrLabel;
                    if (this.hud.label_custom_font) {
                        var cf = this.hud.label_custom_font;
                        attrLabel = this.game.add.bitmapText(xPos, 0, LetiFramework.Utils.getAssetFontPath(cf), pa.name + ":", cf.font_size);
                    } else {
                        attrLabel = this.game.add.text(xPos, 0, pa.name + ":", this.hud.label_style);
                    }

                    this.hudGroup.add(attrLabel);

                    var progressComponent = pa.progress;
                    if (progressComponent) {
                        var progressComponentBg = progressComponent.background;
                        var progressImage = progressComponent.progress_image;
                        var maxValue = progressComponent.max_value;
                        var showValue = progressComponent.show_value;

                        var x = attrLabel.x + attrLabel.width + 10;
                        var y = (attrLabel.height - progressImage.height) / 2;
                        var pcBg;

                        y = (attrLabel.height - progressComponentBg.height) / 2;
                        if (progressComponentBg.type == "image") {
                            pcBg = this.game.add.sprite(x, y, this.getAssetPath(progressComponentBg.image));
                            pcBg.scale.setTo(progressComponentBg.width / pcBg.width, progressComponentBg.height / pcBg.height);
                            this.hudGroup.add(pcBg);
                        } else if (progressComponentBg.type == "shape") {
                            pcBg = this.game.add.graphics(x, y);
                            pcBg.beginFill(progressComponentBg.color, 1);
                            pcBg.alpha = progressComponentBg.alpha;
                            if (progressComponentBg.shape == "round_rect") {
                                pcBg.drawRoundedRect(0, 0, progressComponentBg.width, progressComponentBg.height, progressComponentBg.radius);
                            } else if (progressComponentBg.shape == "rect") {
                                pcBg.drawRect(0, 0, progressComponentBg.width, progressComponentBg.height);
                            }
                            pcBg.endFill();
                            this.hudGroup.add(pcBg);
                        }

                        x += (pcBg.width - progressImage.width) / 2;
                        y += (pcBg.height - progressImage.height) / 2;

                        var pc = this.game.add.sprite(x, y, this.getAssetPath(progressImage.image));
                        pc.scale.setTo(progressImage.width / pc.width, progressImage.height / pc.height);
                        pc.alpha = progressImage.alpha;
                        this.hudGroup.add(pc);

                        //  A mask is a Graphics object
                        var mask = this.game.add.graphics(0, 0);
                        this.hudGroup.add(mask);

                        //  Shapes drawn to the Graphics object must be filled.
                        mask.beginFill(0xffffff);

                        var pcValue = (this.currentUser.player_attributes[pa.id] / maxValue) * progressImage.width;

                        //  Here we'll draw a shape for the progress
                        mask.drawRect(x, y, pcValue, progressImage.height);

                        //  And apply it to the Sprite
                        pc.mask = mask;

                        if (showValue) {
                            var val = this.currentUser.player_attributes[pa.id];
                            if(progressComponent.percentage_value) {
                                val = Math.round(val / maxValue * 100);
                                val = val > 100 ? 100 : val;
                                val += "%";
                            }

                            var attrText;
                            if (progressComponent.text_custom_font) {
                                var cf = progressComponent.text_custom_font;
                                attrText = this.game.add.bitmapText(pcBg.x + 0.5 * pcBg.width, pcBg.y + 0.5 * pcBg.height, LetiFramework.Utils.getAssetFontPath(cf), val + "", cf.font_size);
                            } else {
                                attrText = this.game.add.text(pcBg.x + 0.5 * pcBg.width, pcBg.y + 0.5 * pcBg.height, val + "", progressComponent.text_style);
                            }
                            attrText.anchor.set(0.5);

                            this.hudGroup.add(attrText);
                        }

                        xPos = x + pcBg.width + 10;
                    } else {
                        var attrText;
                        if (this.hud.text_custom_font) {
                            var cf = this.hud.text_custom_font;
                            attrText = this.game.add.bitmapText(attrLabel.x + attrLabel.width + 10, 0, LetiFramework.Utils.getAssetFontPath(cf), "" + this.currentUser.player_attributes[pa.id], cf.font_size);
                        } else {
                            attrText = this.game.add.text(attrLabel.x + attrLabel.width + 10, 0, "" + this.currentUser.player_attributes[pa.id], this.hud.text_style);
                        }

                        this.hudGroup.add(attrText);

                        xPos = attrText.x + attrText.width + 20;
                    }
                }
            }

            this.scene.add(this.hudGroup);
        }

        var progressComponent = LetiFramework.GameController.currentStoryComponents.progress_component;
        if (progressComponent && this.currentGamePageData.progress_component) {
            var progressComponentBg = progressComponent.background;
            var progressImage = progressComponent.progress_image;
            var progressPages = progressComponent.progress_pages;

            if (progressComponentBg) {
                if (progressComponentBg.type == "image") {
                    var pcBg = this.game.add.sprite(progressComponentBg.position.x, progressComponentBg.position.y,
                        this.getAssetPath(progressComponentBg.image));
                    pcBg.scale.setTo(progressComponentBg.width / pcBg.width, progressComponentBg.height / pcBg.height);
                    this.scene.add(pcBg);
                } else if (progressComponentBg.type == "shape") {
                    var pcBg = this.game.add.graphics(progressComponentBg.position.x, progressComponentBg.position.y);
                    pcBg.beginFill(progressComponentBg.color, 1);
                    pcBg.alpha = progressComponentBg.alpha;
                    if (progressComponentBg.shape == "round_rect") {
                        pcBg.drawRoundedRect(0, 0, progressComponentBg.width, progressComponentBg.height, progressComponentBg.radius);
                    } else if (progressComponentBg.shape == "rect") {
                        pcBg.drawRect(0, 0, progressComponentBg.width, progressComponentBg.height);
                    }
                    pcBg.endFill();
                    this.scene.add(pcBg);
                }
            }

            var pc = this.game.add.sprite(progressImage.position.x, progressImage.position.y,
                this.getAssetPath(progressImage.image));
            pc.scale.setTo(progressImage.width / pc.width, progressImage.height / pc.height);
            pc.alpha = progressImage.alpha;
            this.scene.add(pc);

            //  A mask is a Graphics object
            var mask = this.game.add.graphics(0, 0);
            this.scene.add(mask);

            //  Shapes drawn to the Graphics object must be filled.
            mask.beginFill(0xffffff);

            var pcValue = 0;

            for (var i = progressPages.length - 1; i >= 0; i--) {
                var pg = progressPages[i];

                var currentUserLoc = LetiFramework.GameController.currentUserGameLocation;
                if (currentUserLoc.play_history.indexOf(pg) > -1) {
                    pcValue = (i + 1) / progressPages.length;
                    break;
                }
            }

            //  Here we'll draw a shape for the progress
            mask.drawRect(progressImage.position.x, progressImage.position.y,
                pcValue * progressImage.width + progressComponent.initial_value, progressImage.height);

            //  And apply it to the Sprite
            pc.mask = mask;
        }

        this.showTimeLine();

        this.nav_next = this.game.add.button(this.game.world.width - 20, this.game.world.centerY,
            this.getAssetPath(this.currentGamePageData.nav_next),
            function() {
                this.nextTimeLine();
            }, this, 2, 1, 0);
        this.nav_next.anchor.setTo(0, 0.5);
        this.nav_next.x -= this.nav_next.width;
        this.nav_next.input.useHandCursor = true;
        this.nav_next.visible = this.timeLines.length > 1;

        this.nav_prev = this.game.add.button(20, this.game.world.centerY,
            this.getAssetPath(this.currentGamePageData.nav_prev),
            function() {
                this.prevTimeLine();                
            }, this, 2, 1, 0);
        this.nav_prev.anchor.setTo(0, 0.5);
        this.nav_prev.input.useHandCursor = true;
        this.nav_prev.visible = false;

        if (this.showBadge) {
            this.badgeDialog = new LetiFramework.Ui.BadgeDialog(this.game, this.badge);
            this.badgeDialog.show();
        }

    },
    showTimeLine: function() {
        if(this.timeLineIndex >= this.timeLines.length) return;
        
        if (this.timeLineImage) {
            this.timeLineImage.destroy();
        }

        if (this.timeLineTitle) {
            this.timeLineTitle.destroy();
        }

        var tl = this.timeLines[this.timeLineIndex];
        if (tl.image) {
            this.timeLineImage = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.getAssetPath(tl.image));
            this.timeLineImage.scale.set(0.5);
            this.timeLineImage.x -= 0.5 * this.timeLineImage.width;
            this.timeLineImage.y -= 0.5 * this.timeLineImage.height;
            this.timeLineImage.inputEnabled = true;
            this.timeLineImage.input.useHandCursor = true
            this.timeLineImage.events.onInputDown.add(this.sceneSelectHandler, this);
        }

        var titleY = tl.image ? this.timeLineImage.y + this.timeLineImage.height + 50 : this.game.world.centerY;
        if (this.currentGamePageData.text_custom_font) {
            var cf = this.currentGamePageData.text_custom_font;
            this.timeLineTitle = this.game.add.bitmapText(this.game.world.centerX, titleY,
                LetiFramework.Utils.getAssetFontPath(cf), tl.scene, cf.font_size);
        } else {
            this.timeLineTitle = this.game.add.text(this.game.world.centerX, titleY, tl.scene, this.currentGamePageData.text_style);
        }
        this.timeLineTitle.anchor.setTo(0.5);
        this.timeLineTitle.inputEnabled = true;
        this.timeLineTitle.input.useHandCursor = true
        this.timeLineTitle.events.onInputDown.add(this.sceneSelectHandler, this);
    },
    nextTimeLine: function() {
        if (this.timeLineIndex < this.timeLines.length - 1) {
            this.timeLineIndex++;
            this.nav_next.visible = this.timeLineIndex < this.timeLines.length - 1;
            this.nav_prev.visible = true;
            this.showTimeLine();
        }        
    },
    prevTimeLine: function() {
        if (this.timeLineIndex > 0) {
            this.timeLineIndex--;
            this.nav_prev.visible = this.timeLineIndex > 0;
            this.nav_next.visible = true;
            this.showTimeLine();
        }        
    },
    sceneSelectHandler: function() {
        var tl = this.timeLines[this.timeLineIndex];

        this.currentUser.player_attributes[tl.attribute] -= tl.score;
        LetiFramework.Db.update("users", this.currentUser);

        LetiFramework.GameController.nextGamePage = tl.page;
        LetiFramework.GameController.nextGamePageDataOverride = tl.page_override;
        LetiFramework.GameController.nextPage();
    },
    customizePageNavigationButtons: function() {
        var prevPageBtConfig = this.currentGamePageData.prev_page_button;
        if (prevPageBtConfig && prevPageBtConfig.enabled) {
            this.prevBt.visible = true;
            if (prevPageBtConfig.image) {
                this.prevBt.loadTexture(this.getAssetPath(prevPageBtConfig.image));
            }
            if (prevPageBtConfig.position) {
                this.prevBt.position.x = prevPageBtConfig.position.x;
                this.prevBt.position.y = prevPageBtConfig.position.y;
            }
        }

        var nextPageBtConfig = this.currentGamePageData.next_page_button;
        if (nextPageBtConfig && this.nextBt) {
            if (nextPageBtConfig.enabled == false) this.nextBt.visible = false;
            if (nextPageBtConfig.image) {
                this.nextBt.loadTexture(this.getAssetPath(nextPageBtConfig.image));
            }
            if (nextPageBtConfig.position) {
                this.nextBt.position.x = nextPageBtConfig.position.x;
                this.nextBt.position.y = nextPageBtConfig.position.y;
            }
        }
    },
    addComponents: function() {
        var components = this.pageComponents.concat(this.universalComponents);
        for (var i = 0; i < components.length; i++) {
            var asset = components[i];

            var componentsOverride = this.currentGamePageData.components_override;
            if (asset.name && componentsOverride && componentsOverride[asset.name]) {
                if (componentsOverride[asset.name].hidden == true) continue;
                var assetOverride = {};
                for (var k in asset) {
                    assetOverride[k] = asset[k];
                }
                for (var k in componentsOverride[asset.name]) {
                    if (k == "animation") {
                        var val = componentsOverride[asset.name][k];
                        if (typeof val === 'string') {
                            assetOverride[k] = LetiFramework.GameController.currentStoryComponents[val];
                        } else {
                            assetOverride[k] = val;
                        }
                    } else {
                        assetOverride[k] = componentsOverride[asset.name][k];
                    }
                }
                asset = assetOverride;
            }

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
                this.scene.add(cmp);
            } else if (asset.type == "text") {
                if (asset.custom_font) {
                    var txt = LetiFramework.Utils.wrapText(asset.text, asset.custom_font);
                    cmp = this.game.add.bitmapText(position.x, position.y,
                        LetiFramework.Utils.getAssetFontPath(asset.custom_font), txt, asset.custom_font.font_size);
                } else {
                    cmp = this.game.add.text(
                        position.x, position.y, asset.text, asset.style);
                }
                this.scene.add(cmp);
            } else if (asset.type == "image") {
                cmp = this.game.add.sprite(position.x, position.y, this.getAssetPath(asset.image));
                if (asset.hidden) cmp.visible = false;
                this.pageSprites[asset.image] = cmp;
                if (asset.width && asset.height) {
                    cmp.scale.setTo(asset.width / cmp.width, asset.height / cmp.height);
                }
                this.scene.add(cmp);
            } else if (asset.type == "spritesheet") {
                cmp = this.game.add.sprite(position.x, position.y, this.getAssetPath(asset.image));
                if (asset.hidden) cmp.visible = false;
                this.pageSprites[asset.image] = cmp;
                cmp.scale.setTo(asset.width / asset.frame_width, asset.height / asset.frame_height);
                this.scene.add(cmp);

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
                        var _this = LetiFramework.Renderer.currentState();
                        var log = {
                            "story": _this.currentGame.name,
                            "page": _this.currentGamePage,
                            "asset": this.name || this.image
                        };
                        LetiFramework.Analytics.trackEvent("Timeline", "Interactivity", log, 0);

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

            if (cmp && asset.link) {
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

            if (animations && cmp) {
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

            if (interactivity && cmp) {
                if (interactivity.action == "click") {
                    cmp.inputEnabled = true;
                    cmp.input.useHandCursor = true;
                    cmp.events.onInputDown.add(function(src) {
                        var _this = LetiFramework.Renderer.currentState();
                        var log = {
                            "story": _this.currentGame.name,
                            "page": _this.currentGamePage,
                            "asset": this.asset.name || this.asset.image
                        };
                        LetiFramework.Analytics.trackEvent("Timeline", "Interactivity", log, 0);

                        if(this.asset.interactivity.timeline) {
                            if(LetiFramework.GameController.timelinemap) {
                                LetiFramework.GameController.timelinemap.hide();
                            } else {
                                LetiFramework.GameController.timelinemap = new LetiFramework.Ui.timelinemap(_this.game);
                                LetiFramework.GameController.timelinemap.show();
                            }                           
                        }

                        var animations = this.asset.interactivity.animation;
                        var audio = this.asset.interactivity.audio;
                        var toggle = this.asset.interactivity.toggle;
                        var nav = this.asset.interactivity.navigate;
                        var nav_to = this.asset.interactivity.navigate_to_page;
                        var nav_screen = this.asset.interactivity.screen;

                        if(nav_screen) {
                            LetiFramework.Renderer.render(nav_screen);
                            return;
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
                        if (nav) {
                            LetiFramework.GameController.nextPage();
                        } else if (nav_to) {
                            LetiFramework.GameController.nextGamePage = nav_to;
                            LetiFramework.GameController.nextPage();
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
        } // end for i
    },
    enableDrag: function() {
        if (LetiFramework.GameController.debugging) {
            //  Make them all input enabled
            this.scene.setAll('inputEnabled', true);

            //  And allow them all to be dragged
            this.scene.callAll('input.enableDrag', 'input');

            // Add same drag handler to all 
            this.scene.callAll('events.onDragStop.add', 'events.onDragStop', this.onDragStop);
        }
    },
    onDragStop: function(cmp, pointer) {
        var pos = {
            x: cmp.x,
            y: cmp.y
        };
        if (this.x && this.y) {
            pos.x = this.x + cmp.x;
            pos.y = this.y + cmp.y;
        }
        alert("x = " + Math.round(pos.x) + "\ny = " + Math.round(pos.y));
    },
    shutdown: function() {
        this.scene.destroy();
        for (var i = 0; i < this.soundObjects.length; i++) {
            this.soundObjects[i].destroy();
        }
    },
    pause: function() {
        if (LetiFramework.SoundManager.soundOn) {
            this.bgSound.pause();
            if (this.currentStorySound) {
                this.currentStorySound.pause();
            }
        }
    },
    resume: function() {
        if (LetiFramework.SoundManager.soundOn) {
            this.bgSound.paused ? this.bgSound.resume() : this.bgSound.play();
            if (this.currentStorySound) {
                this.currentStorySound.paused ? this.currentStorySound.resume() : this.currentStorySound.play();
            }
        }
    },
    getAssetPath: function(name) {
        return LetiFramework.Utils.removeDotPath('assets/stories/' + this.currentGame.storyId + '/episodes/' +
            this.currentGame.id + '/content/assets/' + this.currentGamePage + '/' + name);
    },
    getBadgePath: function(name) {
        return LetiFramework.Utils.removeDotPath('assets/stories/' + this.currentGame.storyId + '/episodes/' +
            this.currentGame.id + '/content/badges/' + name);
    },
    getSoundPath: function(name) {
        if (LetiFramework.App.isPhoneGap()) {
            return LetiFramework.FileManager.getEpisodeSoundFilePath(
                this.currentGame.storyId, this.currentGame.id, name);
        }
        return 'assets/stories/' + this.currentGame.storyId + '/episodes/' + this.currentGame.id + '/content/sound/' + name;
    },
    loadAudio: function(name) {
        if(name){
            var key = this.getSoundPath(name);
            this.game.load.audio(key, key);
        }
    },
    loadImageFile: function(fileName) {
        var key = this.getAssetPath(fileName);
        if (LetiFramework.App.isPhoneGap()) {
            var url = LetiFramework.FileManager.getEpisodeAssetFilePath(
                this.currentGame.storyId, this.currentGame.id, this.currentGamePage + '/' + fileName);
            this.game.load.image(key, url);
        } else {
            this.game.load.image(key, key);
        }
        return key;
    },
    loadSpriteSheetFile: function(fileName, frameWidth, frameHeight) {
        var key = this.getAssetPath(fileName);
        if (LetiFramework.App.isPhoneGap()) {
            var url = LetiFramework.FileManager.getEpisodeAssetFilePath(
                this.currentGame.storyId, this.currentGame.id, this.currentGamePage + '/' + fileName);
            this.game.load.spritesheet(key, url, frameWidth, frameHeight);
        } else {
            this.game.load.spritesheet(key, key, frameWidth, frameHeight);
        }
        return key;
    },
    loadBadgeFile: function(fileName) {
        var key = this.getBadgePath(fileName);
        if (LetiFramework.App.isPhoneGap()) {
            var url = LetiFramework.FileManager.getEpisodeBadgeFilePath(
                this.currentGame.storyId, this.currentGame.id, fileName);
            this.game.load.image(key, url);
        } else {
            this.game.load.image(key, key);
        }
        return key;
    },
    awardBadge: function() {
        if (this.badge) {
            var alreadyEarnedBadge = LetiFramework.Db.readByKeysAndValues("badges", ["user_id", "badge_id", "story_id", "episode_id"], [this.currentUser.id, this.badge.id, this.currentGame.storyId, this.currentGame.id]).length > 0;

            var awardBadge = this.badge.metric == "visit" ||
                (this.badge.metric == "points" && this.currentUser.points >= this.badge.value);

            if (!alreadyEarnedBadge && awardBadge) {
                var rs = jsonsql.query("select * from LetiFramework.GameController.currentStoryBadges where (id==" +
                    this.badge.id + ")", LetiFramework.GameController.currentStoryBadges);

                if (rs.length > 0) {
                    var badge = rs[0];
                    this.badge.image = badge.image;
                    this.badge.text = badge.text;
                    this.badge.message = badge.message;

                    var model = new LetiFramework.DbEntities.Badge(this.currentUser.id, badge.id,
                        this.currentGame.storyId, this.currentGame.id,
                        badge.image, badge.text, badge.action, badge.message);
                    LetiFramework.Db.create("badges", model);

                    LetiFramework.Analytics.trackEvent("Narration", "Badge Earned", {
                        "story": this.currentGame.name,
                        "page": this.currentGamePage,
                        "badge": badge
                    }, 0);

                    this.showBadge = true;
                }
            }
        }
    },
    preloadSprites: function() {
        var components = this.universalComponents.concat(this.pageComponents);
        for (var i = 0; i < components.length; i++) {
            var cmp = components[i];
            if (cmp.image && cmp.type == 'spritesheet') {
                this.loadSpriteSheetFile(cmp.image, cmp.frame_width, cmp.frame_height);
            }
        }

        var componentsOverride = this.currentGamePageData.components_override;
        for (var k in componentsOverride) {
            var cmp = componentsOverride[k];
            if (cmp.type == "spritesheet") {
                var frame_width = cmp.frame_width;
                var frame_height = cmp.frame_height;
                if (frame_width == undefined || frame_height == undefined) {
                    for (var j in this.pageComponents) {
                        var pageCmp = this.pageComponents[j];
                        if (pageCmp.name == k) {
                            frame_width = frame_width || pageCmp.frame_width;
                            frame_height = frame_height || pageCmp.frame_height;
                        }
                    }
                }
                this.loadSpriteSheetFile(cmp.image, frame_width, frame_height);
            }
        }
    }
}