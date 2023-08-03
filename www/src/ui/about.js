var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.about = function(game) {}

LetiFramework.Ui.about.prototype = {
    init: function() {
        LetiFramework.Analytics.trackPage("About");
        this.currentUser = LetiFramework.GameController.currentUser;
        this.screenConfig = LetiFramework.GameController.screensConfig.about;
    },
    preload: function() {
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
    },
    create: function() {
        this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 
            LetiFramework.Utils.getImagePath(this.screenConfig.background));
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

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
            LetiFramework.Analytics.trackEvent("About", "Button Click", "Home", 0);
            LetiFramework.Renderer.render("Menu");
        }, this, 2, 1, 0);
        this.homeBt.input.useHandCursor = true;

        if (LetiFramework.App.isPhoneGap()) {
            this.music = LetiFramework.SoundManager.getSound(this.soundPath, false);
        } else {
            if(this.screenConfig.audio && this.screenConfig.audio != ""){
                this.music = this.game.add.audio(this.getSoundPath(this.screenConfig.audio));
            }
        }

        if (LetiFramework.SoundManager.soundOn) {
            if(this.music){
                this.music.play();
            }
        }
    },
    shutdown: function() {
        if(this.music){
            this.music.destroy();
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
    }
}