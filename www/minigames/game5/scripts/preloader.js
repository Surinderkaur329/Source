
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

        game.load.image('background', 'assets/images/background.jpg');

        // Nav Buttons
        game.load.image('up_button', 'assets/images/up_button.png');
        game.load.image('down_button', 'assets/images/down_button.png');
        game.load.image('left_button', 'assets/images/left_button.png');
        game.load.image('right_button', 'assets/images/right_button.png');

        // Ground
        game.load.image('ground1', 'assets/images/ground1.png');
        game.load.image('ground3', 'assets/images/ground3.png');

        // Hydraulic scissor
        game.load.image('metal_texture', 'assets/images/metal_texture.png');
        game.load.image('metal_texture_corner', 'assets/images/metal_texture_corner.jpg');

        // Fireball
        game.load.image('fireball', 'assets/images/fireball1.png');
        game.load.image('fireball_placeholder', 'assets/images/fireball_placeholder.png');
        game.load.spritesheet('fireball2', 'assets/images/fireball2.png', 47, 152);
        game.load.spritesheet('fireball_target', 'assets/images/fireball_target.png', 47, 152);

        // Fire truck
        game.load.image('fire_truck', 'assets/images/fire_truck.png');
        game.load.image('water_cannon', 'assets/images/water_cannon.png');

        // Water cannon shot
        game.load.image('cannon_shot', 'assets/images/cannon_shot.png');
        game.load.image('level', 'assets/images/level.png');

        // Balloons + Ball
        game.load.image('balloon1', 'assets/images/balloon1.png');
        game.load.image('balloon2', 'assets/images/balloon2.png');
        game.load.image('balloon3', 'assets/images/balloon3.png');
        game.load.image('balloon4', 'assets/images/balloon4.png');
        game.load.image('balloon5', 'assets/images/balloon5.png');
        game.load.image('ball5', 'assets/images/ball5.png');
        game.load.image('loading1', 'assets/images/loading1.png');
        game.load.image('loading2', 'assets/images/loading2.png');
        // speak button
        // game.load.image('speaking-icon', 'assets/images/speaking-icon.png');

        game.load.audio('song', '../../assets/sound/Music/Game_1.mp3');
        game.load.audio('Cheering', '../../assets/sound/Cheering.mp3');
        game.load.audio('TaDa', '../../assets/sound/SoundEffects/TaDa.mp3');
        game.load.audio('blip', '../../assets/sound/SoundEffects/blip.wav');
        game.load.audio('expand', '../../assets/sound/SoundEffects/expand.mp3');
        game.load.audio('reverse_resume', '../../assets/sound/SoundEffects/reverse_resume.wav');
        game.load.audio('lose', '../../assets/sound/SoundEffects/lose.mp3');
        game.load.audio('seefa_merge_1', '../../assets/sound/SoundEffects/seefa_merge_1.mp3');
        game.load.audio('gem', '../../assets/sound/SoundEffects/spawn_gem_32.wav');

        game.load.image('homeBtn', '../../assets/img/home.png');
        game.load.image('arrow-right.png', '../../assets/img/arrow-right.png');
        game.load.image('arrow-left.png', '../../assets/img/arrow-left.png');

        //sounds
        for(var i=1; i <= 30; i++)
            game.load.audio(i, 'assets/sound/' + i + '.mp3');
        game.load.audio('no', 'assets/sound/no.wav');
        //game.load.audio('three', 'assets/sound/three.mp3');

        // Stari
        game.load.image('stari', 'assets/images/stari.png');
        game.load.image('red_stari', 'assets/images/red_stari.png');

        //retry
        game.load.image('retry', 'assets/images/retry.png');
        //wrong
        game.load.image('wrong', 'assets/images/wrong.png');

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