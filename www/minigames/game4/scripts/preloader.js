
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
        game.load.audio('song', '../../assets/sound/Music/Game_1.mp3');
        game.load.audio('Cheering', '../../assets/sound/Cheering.mp3');
        game.load.audio('TaDa', '../../assets/sound/SoundEffects/TaDa.mp3');
        game.load.audio('blip', '../../assets/sound/SoundEffects/blip.wav');
        game.load.audio('expand', '../../assets/sound/SoundEffects/expand.mp3');
        game.load.audio('reverse_resume', '../../assets/sound/SoundEffects/reverse_resume.wav');
        game.load.audio('lose', '../../assets/sound/SoundEffects/lose.mp3');
        game.load.audio('incorrect', '../../assets/sound/SoundEffects/incorrect.mp3');
        game.load.audio('seefa_merge_1', '../../assets/sound/SoundEffects/seefa_merge_1.mp3');
        game.load.audio('seefa_merge_4', '../../assets/sound/SoundEffects/seefa_merge_4.mp3');

        game.load.image('homeBtn', '../../assets/img/home.png');
        game.load.image('arrow-right.png', '../../assets/img/arrow-right.png');
        game.load.image('arrow-left.png', '../../assets/img/arrow-left.png');

        game.load.image('level', 'assets/images/level.png');

        // Numbers
        for (var i = 1; i < 21; i++) {
            game.load.image('num' + i, 'assets/images/' + i + '.png');
            game.load.image('num_' + i, 'assets/images/' + i + '_g.png');
        }
        for(var i = 0; i <= 30; i++) {
            game.load.audio(i, '../../assets/sound/numbers/' + i + '.mp3');
        }

        // Equation
        game.load.image('plus', 'assets/images/plus.png');
        game.load.image('equals', 'assets/images/equals.png');
        game.load.image('answer_mark', 'assets/images/answer_mark.png');

        // Play box
        game.load.image('play_box_background', 'assets/images/play_box_background.png');
        game.load.image('play_box_left_top', 'assets/images/play_box_left_top.png');
        game.load.image('play_box_left_left', 'assets/images/play_box_left_left.png');
        game.load.image('play_box_left_bottom', 'assets/images/play_box_left_bottom.png');
        game.load.image('play_box_left_right', 'assets/images/play_box_left_right.png');
        game.load.image('play_box_middle_bottom', 'assets/images/play_box_middle_bottom.png');
        game.load.image('play_box_middle_right', 'assets/images/play_box_middle_right.png');
        game.load.image('play_box_right_bottom', 'assets/images/play_box_right_bottom.png');
        game.load.image('play_box_right_right', 'assets/images/play_box_right_right.png');
        game.load.image('play_box_right_right', 'assets/images/play_box_right_right.png');
        game.load.image('play_box_right_top', 'assets/images/play_box_right_top.png');
        game.load.image('play_box_right_left', 'assets/images/play_box_right_left.png');
        game.load.image('play_box_middle_top', 'assets/images/play_box_middle_top.png');
        game.load.image('play_box_middle_left', 'assets/images/play_box_middle_left.png');

        // balls
        game.load.image('ball_red', 'assets/images/red_ball.png');
        game.load.image('ball_yellow', 'assets/images/yellow_ball.png');
        game.load.image('ball_green', 'assets/images/green_ball.png');

        // Nav Buttons
        game.load.image('up_button', 'assets/images/up_button.png');
        game.load.image('down_button', 'assets/images/down_button.png');
        game.load.image('left_button', 'assets/images/left_button.png');
        game.load.image('right_button', 'assets/images/right_button.png');

        // Filters
        game.load.script('gray', 'scripts/gray.js');

        // Stari
        game.load.image('stari', 'assets/images/stari.png');
        game.load.image('red_stari', 'assets/images/red_stari.png');

        //barrier
        game.load.image('barrier1', 'assets/images/barrier1.png');

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