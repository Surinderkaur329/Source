var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.storyTitle = function(game) {};

LetiFramework.Ui.storyTitle.prototype = {
    init: function() {
        LetiFramework.Analytics.trackPage("Title");
        LetiFramework.GameController.fetchGameSteps();

        LetiFramework.GameController.gameStarted = false;
        this.screenConfig = LetiFramework.GameController.screensConfig.title;
        this.playDialog = this.screenConfig.playDialog;
        this.confirmDialog = this.screenConfig.confirmDialog;
        this.newGameButton = this.playDialog.new_button;
        this.resumeGameButton = this.playDialog.resume_button;
        this.closePlayDialogButton = this.playDialog.close_button;
        this.currentUser = LetiFramework.GameController.currentUser;
        this.currentGame = LetiFramework.GameController.currentGame;
        this.downloadAvailable = this.currentGame.available;
        this.contentAvailable = false;

        this.menuItemWidth = this.screenConfig.menu_item_width;
        this.menuItemHeight = this.screenConfig.menu_item_height;
        this.animScale = LetiFramework.Renderer.animScale;
        this.pageComponents = [];
        this.soundObjects = [];
        this.topCompnents = [];
        this.topMenu = null;
        this.pageSprites = {};
        if (LetiFramework.GameController.screensConfig && this.screenConfig.components) {
            this.pageComponents = this.screenConfig.components;
        }

        // if (LetiFramework.GameController.currentStorySound) {
        //     LetiFramework.GameController.currentStorySound.destroy();
        //     LetiFramework.GameController.currentStorySound = null;
        // }
    },
    preload: function() {

        if(!LetiFramework.App.isPhoneGap() && LetiFramework.GameController.bootConfig.web_version) return;
        // LetiFramework.Utils.loadImage(this.screenConfig.background);
        LetiFramework.Utils.loadImage(this.playDialog.background);
        LetiFramework.Utils.loadImage(this.confirmDialog.background);
        LetiFramework.Utils.loadImage(this.screenConfig.home_button.image);
        LetiFramework.Utils.loadImage(this.screenConfig.previous_button.image);
        LetiFramework.Utils.loadImage(this.screenConfig.delete_button.image);
        this.loadEpisodeCover(this.currentGame);
        this.loadEpisodeCover_ICON(this.currentGame);

        if (this.newGameButton.type == "image") {
            LetiFramework.Utils.loadImage(this.newGameButton.image);
        }

        if (this.resumeGameButton.type == "image") {
            LetiFramework.Utils.loadImage(this.resumeGameButton.image);
        }

        if (this.closePlayDialogButton.type == "image") {
            LetiFramework.Utils.loadImage(this.closePlayDialogButton.image);
        }

        if(this.confirmDialog.yes_button.type == "image") {
            LetiFramework.Utils.loadImage(this.confirmDialog.yes_button.image);
        }

        if(this.confirmDialog.no_button.type == "image") {
            LetiFramework.Utils.loadImage(this.confirmDialog.no_button.image);
        }

        if(this.screenConfig.read_button.type == "image_button") {
            LetiFramework.Utils.loadImage(this.screenConfig.read_button.image_button.read.image);
            LetiFramework.Utils.loadImage(this.screenConfig.read_button.image_button.download.image);
        }

        if (!LetiFramework.App.isPhoneGap()) {
            this.loadAudio(this.screenConfig.audio);
        }
        this.bgSoundPath = this.getSoundPath(this.screenConfig.audio);

        if (this.screenConfig.title.custom_font) {
            LetiFramework.Utils.loadFont(this.screenConfig.title.custom_font);
        }

        if (this.screenConfig.content.custom_font) {
            LetiFramework.Utils.loadFont(this.screenConfig.content.custom_font);
        }

        if (this.screenConfig.progress.text.custom_font) {
            LetiFramework.Utils.loadFont(this.screenConfig.progress.text.custom_font);
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
        this.createModals();
        // this.readStory();

        this.scene = this.game.add.group();

        // this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY,
        //     LetiFramework.Utils.getImagePath(this.screenConfig.background));
        // this.bg.anchor.set(0.5);
        // this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

        var titleArea = this.screenConfig.title;
        var contentArea = this.screenConfig.content;

        var panel1Width = contentArea.background.width;
        var panel1Height = contentArea.background.height;

        var panel1 = this.game.add.graphics(this.game.world.centerX - 0.5 * panel1Width, this.game.world.centerY - 0.5 * panel1Height);
        panel1.beginFill(contentArea.background.color, 1);
        panel1.alpha = contentArea.background.alpha;
        panel1.drawRoundedRect(0, 0, panel1Width, panel1Height, 20);
        panel1.endFill();

        var panel2Width = titleArea.background.width;
        var panel2Height = titleArea.background.height;

        var panel2 = this.game.add.graphics(this.game.world.centerX - 0.5 * panel2Width, panel1.y - panel2Height / 2);
        panel2.beginFill(titleArea.background.color, 1);
        panel2.alpha = titleArea.background.alpha;
        panel2.drawRoundedRect(0, 0, panel2Width, panel2Height, 20);
        panel2.endFill();

        var title;
        if (titleArea.custom_font) {
            var cf = titleArea.custom_font;
            title = this.game.add.bitmapText(this.game.world.centerX, panel2Height / 2 + panel2.y, 
                LetiFramework.Utils.getFontPath(cf),
                LetiFramework.Utils.wrapText(this.currentGame.name, cf), cf.font_size);
        } else {
            title = this.game.add.text(this.game.world.centerX, panel2Height / 2 + panel2.y, this.currentGame.name,
                titleArea.text_style);
        }
        title.anchor.set(0, 0.5);
        title.x = this.screenConfig.name.position_x;
        title.y = this.screenConfig.name.position_y;
        title.alpha = this.screenConfig.name.alpha;


        if (contentArea.custom_font) {
            var cf = contentArea.custom_font;
            var infoText = this.game.add.bitmapText(this.game.world.centerX + 0.25 * panel1Width, panel1Height * 0.20 + panel1.y,
                LetiFramework.Utils.getFontPath(cf), LetiFramework.Utils.wrapText(this.currentGame.description, cf), cf.font_size);
            infoText.anchor.set(0.5, 0);
        } else {
            var style = contentArea.text_style;
            style.wordWrap = true;
            style.wordWrapWidth = panel1Width / 2 - 20;
            var infoText = this.game.add.text(this.game.world.centerX + 0.25 * panel1Width, panel1Height * 0.20 + panel1.y,
                this.currentGame.description, style);
            infoText.anchor.set(0.5, 0);
            infoText.lineSpacing = 10;
        }
        infoText.x = this.screenConfig.description.position_x;
        infoText.y = this.screenConfig.description.position_y;
        infoText.alpha = this.screenConfig.description.alpha;

        this.storyCover = this.game.add.sprite(this.game.world.centerX, 0, this.getCoverImageKey(this.currentGame));
        this.storyCover.scale.setTo(0.6);
        this.storyCover.anchor.set(0.5);
        // this.storyCover.x = this.screenConfig.cover.position_x;
        this.storyCover.y = this.screenConfig.cover.position_y;
        this.storyCover.alpha = this.screenConfig.cover.alpha;

        this.storyNameIcon = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.getCoverImageName(this.currentGame));
        this.storyNameIcon.scale.setTo(.5);
        this.storyNameIcon.anchor.set(0.5,0.5);
        this.storyNameIcon.y = this.screenConfig.name_icon.position_y;
        // this.storyNameIcon.alpha = this.screenConfig.name_icon.alpha;

        var readBt = this.screenConfig.read_button;
        if(readBt.type == "image_button") {
            var pos = readBt.image_button.read.position;
            var w = readBt.image_button.read.width;
            var h = readBt.image_button.read.height;
            this.readBt = this.game.add.button(this.game.world.centerX, this.game.world.centerY, LetiFramework.Utils.getImagePath(readBt.image_button.read.image),
                function(){
                    this.handleReadBt();
                }, this, 2, 1, 0);
            this.readBt.input.useHandCursor = true;
            console.log(this.readBt);
            this.readBt.scale.setTo(w / this.readBt.width, h / this.readBt.height);

            pos = readBt.image_button.download.position;
            w = readBt.image_button.download.width;
            h = readBt.image_button.download.height;
            this.downloadBt = this.game.add.button(pos.x, pos.y, LetiFramework.Utils.getImagePath(readBt.image_button.download.image),
                function(){
                    this.handleReadBt();
                }, this, 2, 1, 0);
            this.downloadBt.input.useHandCursor = true;
            this.downloadBt.scale.setTo(w / this.downloadBt.width, h / this.downloadBt.height);
            this.downloadBt.visible = true;
        } else {
            this.readBt = new LetiFramework.Ui.Button(this.game, this.game.world.centerX -380,
                this.game.world.centerY + 200, 200, 50,
                this.screenConfig.read_button.text.read, readBt.text_style, readBt.button_style,
                function() {
                    this.handleReadBt();
                }, this);
            
        }   
        this.readBt.x = this.screenConfig.play.position_y;
        this.readBt.y = this.screenConfig.play.position_y;     

        if (LetiFramework.App.isPhoneGap() && !LetiFramework.GameController.bootConfig.local_content) {
            this.hideReadBt();
            var episodeDataFile = LetiFramework.FileManager.getEpisodeDataFilePath(
                this.currentGame.storyId, this.currentGame.id);
            var self = this;
            window.resolveLocalFileSystemURI(episodeDataFile,
                function() {
                    self.contentAvailable = true;
                    self.showReadBt();
                    self.deleteBt.visible = true;
                },
                function() {
                    self.hideReadBt();
                    self.showDownloadBt();                   
                });
        }

        this.addComponents();

        var homeBt = this.screenConfig.home_button;
        this.homeBt = this.game.add.button(homeBt.position.x, homeBt.position.y, 
            LetiFramework.Utils.getImagePath(this.screenConfig.home_button.image),
            function() {
                window.localStorage.setItem('stories','false');
                console.log("home button");
                if (this.downloadingStory) {
                    this.downloadFileTransfer.abort();
                }
                LetiFramework.Analytics.trackEvent("Title", "Button Click", "Home", 0);
                if (LetiFramework.GameController.games.length > 1) {
                    LetiFramework.Renderer.render("SubMenu");
                } else {
                    LetiFramework.Renderer.render("Menu");
                }
            }, this, 2, 1, 0);
        this.homeBt.scale.setTo(homeBt.width / this.homeBt.width, homeBt.height / this.homeBt.height);
        this.homeBt.input.useHandCursor = true;

        var previousBt = this.screenConfig.previous_button;
        this.previousBt = this.game.add.button(previousBt.position.x, previousBt.position.y,
            LetiFramework.Utils.getImagePath(this.screenConfig.previous_button.image),
            function() {
                window.localStorage.setItem('stories','false');
                if (this.downloadingStory) {
                    this.downloadFileTransfer.abort();
                }
                LetiFramework.Analytics.trackEvent("Title", "Button Click", "Previous", 0);
                LetiFramework.Renderer.render("SubMenu");
            }, this, 2, 1, 0);
        this.previousBt.scale.setTo(previousBt.width / this.previousBt.width, previousBt.height / this.previousBt.height);
        this.previousBt.input.useHandCursor = true;

        var deleteBt = this.screenConfig.delete_button;
        this.deleteBt = this.game.add.button(deleteBt.position.x, deleteBt.position.y, 
            LetiFramework.Utils.getImagePath(this.screenConfig.delete_button.image),
            function() {
                LetiFramework.Analytics.trackEvent("Title", "Delete", this.currentGame.name, 0);
                this.modals.showModal('deleteContentModal');
            }, this, 2, 1, 0);
        this.deleteBt.scale.setTo(deleteBt.width / this.deleteBt.width, deleteBt.height / this.deleteBt.height);
        this.deleteBt.input.useHandCursor = true;
        this.deleteBt.visible = false;

        var progressBar = this.screenConfig.progress.bar;
        this.preloadBar = this.game.add.graphics(progressBar.position.x, progressBar.position.y);
        this.preloadBar.lineStyle(progressBar.height, progressBar.color, progressBar.alpha);
        this.preloadBar.moveTo(0, 0);
        this.preloadBar.lineTo(progressBar.width, 0);
        this.preloadBar.scale.x = 0; // set the bar to the beginning position

        var progressText = this.screenConfig.progress.text;
        if (progressText.custom_font) {
            var cf = progressText.custom_font;
            this.preloadText = this.game.add.bitmapText(progressText.position.x, progressText.position.y,
                LetiFramework.Utils.getFontPath(cf), "Downloading Content...", cf.font_size);
        } else {
            this.preloadText = this.game.add.text(progressText.position.x, progressText.position.y,
                "Downloading Content...", progressText.style);
        }

        this.preloadText.anchor.set(0.5);
        this.preloadText.visible = false;

        if (LetiFramework.App.isPhoneGap()) {
            this.bgSound = LetiFramework.SoundManager.getSound(this.bgSoundPath, false);
        } else {
            this.bgSound = this.game.add.audio(this.getSoundPath(this.screenConfig.audio));
        }

        if (LetiFramework.SoundManager.soundOn) {
            this.bgSound.play();
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
                        LetiFramework.Analytics.trackEvent("Title", "Interactivity", this.image, 0);

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
                            console.log(tween);
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
            }else{}
        } // end for i
    },
    addToScene: function(item) {
        this.scene.add(item);
    },
    readStory: function() {
        LetiFramework.Analytics.trackEvent("Title", "Read", this.currentGame.name, 0);
        // if (LetiFramework.GameController.currentUserGameLocation == null) {
            LetiFramework.Analytics.trackEvent("Title", "Started", this.currentGame.name, 0);
            LetiFramework.GameController.fetchGameSteps();
        // } else {
        //     this.modals.showModal("playGameModal");
        // }
    },
    showReadBt: function() {
        if(this.readBt.show) {
            this.readBt.setText(this.screenConfig.read_button.text.read);
            this.readBt.show();
        }
        else {
            this.readBt.visible = true;
        }
    },
    hideReadBt: function() {
        if(this.readBt.hide) this.readBt.hide();
        else this.readBt.visible = false;
    },
    showDownloadBt: function() {
        if(this.readBt.show) {
            this.readBt.setText(this.screenConfig.read_button.text.download);
            this.readBt.show();
        } else {
            this.downloadBt.visible = true;
        }
    },
    hideDownloadBt: function() {
        if(this.readBt.hide) {
            this.readBt.hide();
        } else {
            this.downloadBt.visible = false;
        }
    },
    handleReadBt: function() {
        if (this.downloadAvailable) {
            if (LetiFramework.App.isPhoneGap() && !LetiFramework.GameController.bootConfig.local_content) {
                if (this.contentAvailable) {
                    this.readStory();
                } else {
                    this.downloadEpisode();
                }
            } else {
                this.readStory();
            }
        } else {
            alert("Not yet available!");
        }
    },
    downloadEpisode: function() {
        this.hideDownloadBt();
        this.downloadingStory = true;
        this.preloadText.visible = true;
        this.preloadText.style = this.screenConfig.progress.text.style;
        var self = this;

        var serverUrl = LetiFramework.NetworkManager.getEpisodeContentURL(this.currentGame.id);
        var localUrl = LetiFramework.FileManager.getEpisodeDirPath(
            this.currentGame.storyId, this.currentGame.id) + "content.zip";
        this.downloadFileTransfer = LetiFramework.NetworkManager.downloadFile(
            serverUrl, localUrl,
            function() {
                self.homeBt.visible = false;
                self.unzipDownload();
                self.downloadingStory = false;
            },
            function() {
                self.preloadText.text = "Download failed! Error downloading content.";
                self.preloadText.style = self.screenConfig.progress.text.err_style;
                self.preloadBar.scale.x = 0;
                self.showDownloadBt();
                self.downloadingStory = false;
            },
            function(progressEvent) {
                var perc = Math.floor(progressEvent.loaded / progressEvent.total * 50);
                self.preloadText.text = "Downloading Content... " + perc + "%";
                self.preloadBar.scale.x = perc * 0.01;
            });
    },
    unzipDownload: function() {
        var episodeDirPath = LetiFramework.FileManager.getEpisodeDirPath(
            this.currentGame.storyId, this.currentGame.id);
        var src = episodeDirPath + "content.zip";
        var dest = episodeDirPath;
        self = this;
        zip.unzip(
            src, dest,
            function(code) {
                if (code == 0) {
                    self.preloadText.visible = false;
                    self.preloadBar.scale.x = 0;                    
                    self.contentAvailable = true;
                    self.showReadBt();
                    self.homeBt.visible = true;
                    self.deleteBt.visible = true;
                    LetiFramework.FileManager.deleteFile(src);
                } else {
                    self.preloadText.text = "Download failed! Error downloading content.";
                    self.preloadText.style = self.screenConfig.progress.text.err_style;
                    self.preloadBar.scale.x = 0;
                    self.showDownloadBt();
                    self.homeBt.visible = true;
                    LetiFramework.FileManager.deleteFile(src);
                    LetiFramework.FileManager.deleteDir(episodeDirPath + "content/");
                }
            },
            function(progressEvent) {
                var perc = Math.floor(progressEvent.loaded / progressEvent.total * 50) + 50;
                self.preloadText.text = "Downloading Content... " + perc + "%";
                self.preloadBar.scale.x = perc * 0.01;
            });
    },
    loadEpisodeCover: function(game) {
        var key = this.getCoverImageKey(game);
        this.game.load.image(key, key);
    },
    loadEpisodeCover_ICON: function(game) {
        var key = this.getCoverImageName(game);
        this.game.load.image(key, key);
    },
    getCoverImageKey: function(game) {
        if (LetiFramework.App.isPhoneGap()) {
            return LetiFramework.FileManager.getEpisodeCoverPath(game.storyId, game.id, game.cover);
        } else {
            return 'assets/stories/' + game.storyId + '/episodes/' + game.id + '/cover/' + game.cover;
        }
    },
    getCoverImageName: function(game) {
        if (LetiFramework.App.isPhoneGap()) {
            return LetiFramework.FileManager.getEpisodeCoverPath(game.storyId, game.id, game.name_icon);
        } else {
            return 'assets/stories/' + game.storyId + '/episodes/' + game.id + '/cover/' + game.name_icon;
        }
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
    shutdown: function() {
        this.scene.destroy();
        this.readBt.destroy();
        if(this.downloadBt) this.downloadBt.destroy();
        this.bgSound.destroy();
    },
    createModals: function() {
        this.modals = new gameModal(this.game);

        var self = this;

        var newGameBt = this.createDialogButton(this.newGameButton);
        newGameBt.callback = function() {
            LetiFramework.Analytics.trackEvent("Title", "Begin", self.currentGame.name, 0);
            self.modals.hideModal("playGameModal");
            LetiFramework.GameController.fetchGameSteps();
        }

        var resumeGameBt = this.createDialogButton(this.resumeGameButton);
        resumeGameBt.callback = function() {
            LetiFramework.Analytics.trackEvent("Title", "Resume", self.currentGame.name, 0);
            self.modals.hideModal("playGameModal");
            LetiFramework.GameController.resume = true;
            LetiFramework.GameController.fetchGameSteps();
        }

        var closeBt = this.createDialogButton(this.closePlayDialogButton);
        closeBt.callback = function() {
            self.modals.hideModal("playGameModal");
        }

        //// Exit Game modal ////
        this.modals.createModal({
            type: "playGameModal",
            includeBackground: true,
            modalCloseOnInput: true,
            itemsArr: [{
                    type: "image",
                    content: LetiFramework.Utils.getImagePath(this.playDialog.background),
                    offsetY: this.playDialog.offsetY,
                    offsetX: this.playDialog.offsetX,
                    contentScale: this.playDialog.bg_scale
                },
                resumeGameBt,
                newGameBt,
                closeBt
            ]
        });

        var confirmMsgConfig = this.confirmDialog.confirm_message;
        confirmMsgConfig.type = "text";
        var confirmMessageTitle = this.createDialogButton(confirmMsgConfig);

        var yesBt = this.createDialogButton(this.confirmDialog.yes_button);
        yesBt.callback = function() {
            self.modals.hideModal("deleteContentModal");
            LetiFramework.Analytics.trackEvent("Title", "Confirm Delete", self.currentGame.name, 0);
            LetiFramework.FileManager.deleteDir(
                LetiFramework.FileManager.getEpisodeDirContentPath(
                    self.currentGame.storyId, self.currentGame.id),
                function() {
                    self.contentAvailable = false;
                    self.hideReadBt();
                    self.showDownloadBt();
                    self.deleteBt.visible = false;
                });
        }

        var noBt = this.createDialogButton(this.confirmDialog.no_button);
        noBt.callback = function() {
            LetiFramework.Analytics.trackEvent("Title", "Abort Delete", self.currentGame.name, 0);
            self.modals.hideModal("deleteContentModal");
        }

        //// Confirm Delete modal ////
        this.modals.createModal({
            type: "deleteContentModal",
            includeBackground: true,
            modalCloseOnInput: true,
            itemsArr: [{
                    type: "image",
                    content: LetiFramework.Utils.getImagePath(this.confirmDialog.background),
                    offsetY: this.confirmDialog.offsetY,
                    offsetX: this.confirmDialog.offsetX,
                    contentScale: this.confirmDialog.bg_scale
                },
                confirmMessageTitle,
                yesBt,
                noBt
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
    }
}