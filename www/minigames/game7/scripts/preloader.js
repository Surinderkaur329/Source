
var Preloader = function(game) {};

var background = null;
var preloadBar1 = null;
var preloadBar2 = null;
var colors = [
    'blue', 'red', 'green', 'yellow', 'orange',
    'purple', 'pink', 'violet', 'brown', 'gray',
]

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
        game.load.image('background', 'assets/images/background1.png');

        // Cue stick
        game.load.image('cue_stick', 'assets/images/cue_stick.png');

        var extGameData = stores.get("extGameData");
        if (extGameData) {
            returnUrl = extGameData.returnUrl;
            stores.remove("extGameData");
        }

        // Nav Buttons
        game.load.image('shoot_button', 'assets/images/shoot_button.png');
        // game.load.image('down_button', 'assets/images/down_button.png');
        game.load.image('left_button', 'assets/images/left_button.png');
        game.load.image('right_button', 'assets/images/right_button.png');

        game.load.audio('song', '../../assets/sound/Music/Game_4.mp3');
        game.load.audio('Cheering', '../../assets/sound/Cheering.mp3');
        game.load.audio('TaDa', '../../assets/sound/SoundEffects/TaDa.mp3');
        game.load.audio('blip', '../../assets/sound/SoundEffects/blip.wav');
        game.load.audio('seefa_pop', '../../assets/sound/SoundEffects/seefa_pop.mp3');
        game.load.audio('expand', '../../assets/sound/SoundEffects/expand.mp3');
        game.load.audio('reverse_resume', '../../assets/sound/SoundEffects/reverse_resume.wav');
        game.load.audio('gem', '../../assets/sound/SoundEffects/ex_pt1.wav');
        game.load.audio('throw', '../../assets/sound/SoundEffects/throw.wav');

        game.load.image('homeBtn', '../../assets/img/home.png');
        game.load.image('arrow-right.png', '../../assets/img/arrow-right.png');
        game.load.image('arrow-left.png', '../../assets/img/arrow-left.png');
        game.load.image('level', 'assets/images/level.png');

        // Balls
        game.load.image('black_ball', 'assets/images/black_ball.png');

        game.load.image('white_ball', 'assets/images/white_ball.png');

        for(var i = 0; i < colorArray.length; i++) {
            game.load.image('ball_' + colorArray[i], 'assets/images/ball_' + colorArray[i] + '.png');
            //Blank image for building pool table collision borders
            game.load.image('blank_'+  colorArray[i], 'assets/images/blank_'+  colorArray[i] +'.png');
            //color Demarcations
            game.load.image('line1_'+  colorArray[i], 'assets/images/line1_'+  colorArray[i] +'.png');
        }

        for(var i = 0; i < colors.length; i++) {
            game.load.audio(colors[i], 'assets/sound/' + colors[i] + '.mp3');
            //console.log(colors[i] + '.mp3');
        }

        for(var i = 0; i < 10; i++){
            game.load.image('iradar' + i, 'assets/images/iradar' + i + '.png');
        }
        game.load.image('h_light', 'assets/images/h_light.png');
        game.load.image('pivot', 'assets/images/pivot.png');

        game.load.spritesheet('line1_glow', 'assets/images/line1_glow.png', 104, 60);

        // Blank image for building pool table collision borders
        game.load.image('blank', 'assets/images/blank.png');

        // Aim rule
        game.load.image('aim_rule', 'assets/images/aim_rule.png');
        game.load.image('assist_rule', 'assets/images/assist_rule.png');

        //status
        game.load.image('wrong', 'assets/images/wrong.png');
        game.load.audio('wronghole', 'assets/sound/wronghole.mp3');
        game.load.audio('yeah', 'assets/sound/yeah.mp3');

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


        game.state.start('play');
    }
};