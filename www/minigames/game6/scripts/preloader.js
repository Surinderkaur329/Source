
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

        // Background
        game.load.image('background', 'assets/images/background.png');
        game.load.image('wheel', 'assets/images/wheel1.png');
        game.load.image('innerWheel', 'assets/images/inner-wheel.png');
        game.load.image('speaker', 'assets/images/speaking-icon.png');
        game.load.image('menu', 'assets/images/menu.png');
 
        game.load.audio('song', '../../assets/sound/Music/Game_1.mp3');
        game.load.audio('Cheering', '../../assets/sound/Cheering.mp3');
        game.load.audio('TaDa', '../../assets/sound/SoundEffects/TaDa.mp3');
        game.load.audio('pop', '../../assets/sound/SoundEffects/seefa_enter_1.mp3');
        game.load.audio('blip', 'assets/sound/blip.mp3');
        game.load.audio('expand', '../../assets/sound/SoundEffects/expand.mp3');
        game.load.audio('reverse_resume', '../../assets/sound/SoundEffects/reverse_resume.wav');
        game.load.audio('lose', '../../assets/sound/SoundEffects/lose.mp3');
        game.load.audio('seefa_pick', '../../assets/sound/SoundEffects/seefa_pick.mp3');
        game.load.audio('creeking', '../../assets/sound/SoundEffects/creeking.wav');
        game.load.audio('ex_pt1', '../../assets/sound/SoundEffects/ex_pt1.wav');
        game.load.audio('incorrect', '../../assets/sound/SoundEffects/incorrect.mp3');

        game.load.image('homeBtn', '../../assets/img/home.png');
        game.load.image('next', '../../assets/img/next.png');
        game.load.image('arrow-right.png', '../../assets/img/arrow-right.png');
        game.load.image('arrow-left.png', '../../assets/img/arrow-left.png');

        var extGameData = stores.get("extGameData");
        if (extGameData) {
            returnUrl = extGameData.returnUrl;
            stores.remove("extGameData");
        }

        for(var k = 1; k < 4; k++){
            game.load.image('game' + k, 'assets/images/game' + k + '.png');
        }
        for(var j = 1; j < 6; j++){
            game.load.image('part' + j, 'assets/images/part' + j + '.png');
            game.load.image('part' + j + '_blink', 'assets/images/part' + j + '_blink.png');
            game.load.image('part' + j + '_mono', 'assets/images/part' + j + '_mono.png');
        }
        for(var i = 0; i < arrayVal.length; i++){
            game.load.audio(arrayVal[i], 'assets/sound/' + arrayVal[i] + '.mp3');
            game.load.audio(arrayVal2[i], 'assets/sound/' + arrayVal[i] + '.mp3');
            game.load.audio('animal_' + arrayVal[i], 'assets/sound/animals/' + arrayVal[i] + '.mp3');
            game.load.image('letter_' + arrayVal[i], 'assets/images/' + arrayVal[i] + '.png');
            game.load.image('sletter_' + arrayVal2[i], 'assets/images/small/' + arrayVal2[i] + '.png');
        }

        // Stari
        game.load.image('stari', 'assets/images/stari.png');
        game.load.image('red_stari', 'assets/images/red_stari.png');

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
        game.state.start('Menu');
    }
};