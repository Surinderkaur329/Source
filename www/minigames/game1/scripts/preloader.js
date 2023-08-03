
var Preloader = function(game) {};

var background = null;
var preloadBar = null;

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
        preloadImage('background.png');
        preloadImage('ball_.png');

        game.load.audio('pop', '../../assets/sound/SoundEffects/seefa_pop.mp3');
        game.load.audio('blip', '../../assets/sound/SoundEffects/blip.wav');
        game.load.audio('Cheering', '../../assets/sound/Cheering.mp3');
        game.load.audio('song', '../../assets/sound/Music/Game_1.mp3');
        game.load.audio('TaDa', '../../assets/sound/SoundEffects/TaDa.mp3');
        game.load.audio('expand', '../../assets/sound/SoundEffects/expand.mp3');
        game.load.audio('incorrect', '../../assets/sound/SoundEffects/incorrect.mp3');
        game.load.audio('seefa_merge_1', '../../assets/sound/SoundEffects/seefa_merge_1.mp3');
        game.load.audio('seefa_merge_4', '../../assets/sound/SoundEffects/seefa_merge_4.mp3');

        for(var i = 0; i <= 30; i++) {
            game.load.audio(i, '../../assets/sound/numbers/' + i + '.mp3');
        }

        game.load.image('homeBtn', '../../assets/img/home.png');
        game.load.image('arrow-right.png', '../../assets/img/arrow-right.png');
        game.load.image('arrow-left.png', '../../assets/img/arrow-left.png');


        // Planks/Walls
        var count = 1;
        while (count <= 11) {
            preloadImage('plank' + count + '.png');
            count++;
        }
        // balls
        count = 1;
        while (count <= 10) {
            preloadImage('ball' + count + '.png');
            count++;
        }
        // Arrow
        preloadImage('green_arrow.png');
        // Nav Buttons
        preloadImage('up_button.png');
        preloadImage('down_button.png');
        preloadImage('left_button.png');
        preloadImage('right_button.png');
        preloadImage('up_button_t.png');
        preloadImage('down_button_t.png');
        preloadImage('left_button_t.png');
        preloadImage('right_button_t.png');

        // Gears
        preloadImage('gear01.png');
        preloadImage('gear02.png');
        preloadImage('gear1.png');
        preloadImage('gear2.png');
        preloadImage('gear3.png');
        game.load.image('level', 'assets/images/level.png');

        //ball_5
        for(var i = 1; i <= 5; i++) {
            preloadImage('ball_'+ i +'.png');
        }

        // Hammer
        preloadImage('hammer.png');

        // Number boxes
        for(var i = 0; i <= 15; i++) {
            preloadImage('bar_'+ i +'.png');
            preloadImage('bar_0'+ i +'.png');
            preloadImage(i + '.png');
            preloadImage(i + '_g.png');
            preloadImage('r_tri_'+ i +'.png');
            preloadImage('tri_'+ i +'.png');
            preloadImage('r_tri_0'+ i +'.png');
            preloadImage('tri_0'+ i +'.png');
        }

        // Stari
        preloadImage('stari.png');
        preloadImage('red_stari.png');

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
        game.physics.startSystem(Phaser.Physics.P2JS);

        game.physics.p2.gravity.y = 100;
        game.physics.p2.restitution = 0.3;
        game.physics.p2.setImpactEvents(true);

        cursors = game.input.keyboard.createCursorKeys();

        game.state.start('play');
    }
};