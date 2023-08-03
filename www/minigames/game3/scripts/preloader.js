
var Preloader = function(game) {};

var background = null;
var preloadBar1 = null;
var preloadBar2 = null;

var ready = false;

Preloader.prototype = {

    preload: function() {

        background = this.add.sprite(0, 0, 'preloaderBackground');
        background.scale.setTo(0.69);
        preloadBar2 = this.add.sprite(0, 0, 'preloaderBar2');
        preloadBar1 = this.add.sprite(0, 0, 'preloaderBar1');
        preloadBar1.x = this.game.world.centerX - 200;
        preloadBar2.x = this.game.world.centerX - 200;
        preloadBar1.y = this.game.world.centerY + 200;
        preloadBar2.y = this.game.world.centerY + 200;
        preloadBar1.scale.setTo(1.5);
        preloadBar2.scale.setTo(1.5);
        game.load.setPreloadSprite(preloadBar1);

        game.load.image('background', 'assets/images/background1.png');

        // Ground
        game.load.image('ground1', 'assets/images/ground1.png');
        game.load.image('ground2', 'assets/images/ground2.png');
        game.load.image('ground3', 'assets/images/ground3.png');

        // Baskball pole
        game.load.image('basket-ball-pole', 'assets/images/basket-ball-pole.png');
        game.load.spritesheet('basket-ball-loop', 'assets/images/basket-ball-loop.png', 198, 120);

        // See saw
        game.load.image('see-saw-bar', 'assets/images/see-saw-bar.png');
        game.load.image('see-saw-pivot', 'assets/images/see-saw-pivot.png');

        // Stari
        game.load.image('stari', 'assets/images/stari.png');
        game.load.image('red_stari', 'assets/images/red_stari.png');

        game.load.audio('Cheering', '../../assets/sound/Cheering.mp3');
        game.load.audio('song', '../../assets/sound/Music/Game_3.mp3');
        game.load.audio('TaDa', '../../assets/sound/SoundEffects/TaDa.mp3');
        game.load.audio('blip', '../../assets/sound/SoundEffects/blip.wav');
        game.load.audio('expand', '../../assets/sound/SoundEffects/expand.mp3');
        game.load.audio('reverse_resume', '../../assets/sound/SoundEffects/reverse_resume.wav');
        game.load.audio('lose', '../../assets/sound/SoundEffects/lose.mp3');
        game.load.audio('incorrect', '../../assets/sound/SoundEffects/incorrect.mp3');

        game.load.image('level', 'assets/images/level.png');
        game.load.image('homeBtn', '../../assets/img/home.png');
        game.load.image('arrow-right.png', '../../assets/img/arrow-right.png');
        game.load.image('arrow-left.png', '../../assets/img/arrow-left.png');

        // Interactive items
        game.load.image('basket-ball', 'assets/images/basket-ball.png');
        game.load.image('answer-slot', 'assets/images/answer-slot.png');

        for(var i = 0; i <= 30; i++) {
            game.load.audio(i, '../../assets/sound/numbers/' + i + '.mp3');
        }

        for(var i = 0; i <= 20; i++) {
            // Interactive boxes
            game.load.image('box' + i, 'assets/images/box' + i + '.png');
            // Number boxes
            game.load.image(i + '.png', 'assets/images/' + i + '.png');
            game.load.image(i + '_g.png', 'assets/images/' + i + '_g.png');
        }

        var extGameData = stores.get("extGameData");
        if (extGameData) {
            returnUrl = extGameData.returnUrl;
            stores.remove("extGameData");
        }

        // Purchase popup
        game.load.image('purchase', '../../assets/img/purchase.png');
        game.load.image('purchaseContainer', '../../assets/img/purchase_container.png');
        game.load.image('back', '../../assets/img/back.png');

        jQuery.getJSON("../../config/purchase.json", function(data) {
            game.purchaseConfig = data;
        }).error(function() {
            alert("Error fetching purchase config!");
        });
    
        jQuery.getJSON("../../config/screens.json", function(data) {
            game.screensConfig = data.purchase;
        }).error(function() {
            alert("Error fetching screens config!");
        });

    },
    create: function() {

        preloadBar1.cropEnabled = false;

        ready = true;

        game.state.start('play');
        
    }
};