var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.contact = function(game) {}

LetiFramework.Ui.contact.prototype = {
    init: function() {
        LetiFramework.Analytics.trackPage("Contact");
        this.currentUser = LetiFramework.GameController.currentUser;
        this.screenConfig = LetiFramework.GameController.screensConfig.contact;
        this.animScale = LetiFramework.Renderer.animScale;
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
        if(!LetiFramework.App.isPhoneGap() && LetiFramework.GameController.bootConfig.web_version) return;

        LetiFramework.Utils.loadImage(this.screenConfig.background);
        LetiFramework.Utils.loadImage(this.screenConfig.home_button.image);
        if (!LetiFramework.App.isPhoneGap()) {
            this.loadAudio(this.screenConfig.audio);
        }
        this.soundPath = this.getSoundPath(this.screenConfig.audio);

        if (this.screenConfig.title.custom_font) {
            LetiFramework.Utils.loadFont(this.screenConfig.title.custom_font);
        }

        if (this.screenConfig.content.custom_font) {
            LetiFramework.Utils.loadFont(this.screenConfig.content.custom_font);
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
                if (!LetiFramework.App.isPhoneGap()) {
                    this.loadAudio(cmp.interactivity.audio);
                }
            }
        }
    },
    create: function() {
        this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 
            LetiFramework.Utils.getImagePath(this.screenConfig.background));
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

        this.addComponents();

        var titleArea = this.screenConfig.title;
        var contentArea = this.screenConfig.content;

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

        var customFont = titleArea.custom_font;
        if (customFont) {
            var text = LetiFramework.Utils.wrapText(titleArea.text, customFont);
            var title = this.game.add.bitmapText(this.game.world.centerX, panel2Height / 2 + panel2.y,
                LetiFramework.Utils.getFontPath(customFont), text, customFont.font_size);
            title.anchor.set(0.5);
        } else {
            var title = this.game.add.text(this.game.world.centerX, panel2Height / 2 + panel2.y,
                titleArea.text, titleArea.text_style);
            title.anchor.set(0.5);
        }

        customFont = contentArea.custom_font;
        if (customFont) {
            var text = LetiFramework.Utils.wrapText(contentArea.text, customFont);
            var infoText = this.game.add.bitmapText(this.game.world.centerX, 20 + panel1.y, 
                LetiFramework.Utils.getFontPath(customFont), text, customFont.font_size);
            infoText.anchor.set(0.5, 0);
        } else {
            var infoText = this.game.add.text(this.game.world.centerX, 20 + panel1.y, contentArea.text, contentArea.text_style);
            infoText.anchor.set(0.5, 0);
            infoText.lineSpacing = 10;
        }

        var homeBtPosition = this.screenConfig.home_button.position;
        this.homeBt = this.game.add.button(homeBtPosition.x, homeBtPosition.y, 
            LetiFramework.Utils.getImagePath(this.screenConfig.home_button.image), function() {
            LetiFramework.Analytics.trackEvent("Contact", "Button Click", "Home", 0);
            LetiFramework.Renderer.render("Menu");
        }, this, 2, 1, 0);
        this.homeBt.input.useHandCursor = true;

        if (LetiFramework.App.isPhoneGap()) {
            this.music = LetiFramework.SoundManager.getSound(this.soundPath, false);
        } else {
            this.music = this.game.add.audio(this.getSoundPath(this.screenConfig.audio));
        }

        if (LetiFramework.SoundManager.soundOn) {
            this.music.play();
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
                    cmp = this.game.add.text(
                        position.x, position.y, asset.text, asset.style);
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
                        var _this = LetiFramework.Renderer.currentState();
                        LetiFramework.Analytics.trackEvent(_this.pageName, "Interactivity", this.image, 0);

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
                            LetiFramework.Analytics.trackEvent(_this.pageName, "Interactivity", this.asset.image, 0);

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
    shutdown: function() {
        this.music.destroy();
        for (var i = 0; i < this.soundObjects.length; i++) {
            this.soundObjects[i].destroy();
        }
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