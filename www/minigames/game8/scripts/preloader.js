
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

        // Trampoline
        game.load.image('trampoline', 'assets/images/trampoline.png');

        // Character
        game.load.image('character', 'assets/images/character.png');


        var extGameData = stores.get("extGameData");
        if (extGameData) {
            returnUrl = extGameData.returnUrl;
            stores.remove("extGameData");
        }

        // controls
        game.load.image('left_arrow', 'assets/images/left_arrow.png');
        game.load.image('right_arrow', 'assets/images/right_arrow.png');
        game.load.image('up_arrow', 'assets/images/up_arrow.png');
        game.load.image('level', 'assets/images/level.png');

        game.load.audio('song', '../../assets/sound/Music/Game_4.mp3');
        game.load.audio('Cheering', '../../assets/sound/Cheering.mp3');
        game.load.audio('TaDa', '../../assets/sound/SoundEffects/TaDa.mp3');
        game.load.audio('blip', '../../assets/sound/SoundEffects/blip.wav');
        game.load.audio('seefa_pop', '../../assets/sound/SoundEffects/seefa_pop.mp3');
        game.load.audio('expand', '../../assets/sound/SoundEffects/expand.mp3');
        game.load.audio('reverse_resume', '../../assets/sound/SoundEffects/reverse_resume.wav');
        game.load.audio('throw', '../../assets/sound/SoundEffects/throw.wav');

        game.load.image('homeBtn', '../../assets/img/home.png');
        game.load.image('arrow-right.png', '../../assets/img/arrow-right.png');
        game.load.image('arrow-left.png', '../../assets/img/arrow-left.png');

        game.load.spritesheet('jump_sprite', 'assets/images/jump_sprite.png', 200, 200);

        game.load.spritesheet('trampoline_sprite', 'assets/images/trampoline_sprite.png', 749, 174);

        //sounds
        game.load.audio('black', 'assets/sound/black.mp3');
        game.load.audio('blue', 'assets/sound/blue.mp3');
        game.load.audio('brown', 'assets/sound/brown.mp3');
        game.load.audio('chartreuse', 'assets/sound/chartreuse.mp3');
        game.load.audio('cyan', 'assets/sound/cyan.mp3');
        game.load.audio('gold', 'assets/sound/gold.mp3');
        game.load.audio('green', 'assets/sound/green.mp3');
        game.load.audio('grey', 'assets/sound/grey.mp3');
        game.load.audio('magenta', 'assets/sound/magenta.mp3');
        game.load.audio('orange', 'assets/sound/orange.mp3');
        game.load.audio('pink', 'assets/sound/pink.mp3');
        game.load.audio('purple', 'assets/sound/purple.mp3');
        game.load.audio('red', 'assets/sound/red.mp3');
        game.load.audio('teal', 'assets/sound/teal.mp3');
        game.load.audio('vermillion', 'assets/sound/vermillion.mp3');
        game.load.audio('violet', 'assets/sound/violet.mp3');
        game.load.audio('welldone', 'assets/sound/welldone.mp3');
        game.load.audio('white', 'assets/sound/white.mp3');
        game.load.audio('wrong', 'assets/sound/wrong.mp3');
        game.load.audio('yeah', 'assets/sound/yeah.mp3');
        game.load.audio('yellow', 'assets/sound/yellow.mp3');
        game.load.audio('popcork', '../../assets/sound/SoundEffects/popcork.wav');

        // Stari
        game.load.image('stari', 'assets/images/stari.png');
        game.load.image('red_stari', 'assets/images/red_stari.png');

        // Load Balloons, Shirts, Shorts and Shoes
        game.load.image('cyan_balloon', 'assets/images/cyan_balloon.png');
        game.load.image('gold_balloon', 'assets/images/gold_balloon.png');
        game.load.image('chartreuse_balloon', 'assets/images/chartreuse_balloon.png');
        game.load.image('magenta_balloon', 'assets/images/magenta_balloon.png');
        game.load.image('vermillion_balloon', 'assets/images/vermillion_balloon.png');

        for(var i in balloon_keys) {
            var key = balloon_keys[i];
            var shirt_key = key.replace('balloon', 'shirt');
            var shirt_sprite_key = key.replace('balloon', 'shirt_sprite');
            var short_key = key.replace('balloon', 'short');
            var shoe_key = key.replace('balloon', 'shoe');
            game.load.image(key, 'assets/images/' + key + '.png');
            game.load.image(shirt_key, 'assets/images/' + shirt_key + '.png');
            game.load.image(short_key, 'assets/images/' + short_key + '.png');
            game.load.image(shoe_key, 'assets/images/' + shoe_key + '.png');

            game.load.spritesheet(shirt_sprite_key, 'assets/images/' + shirt_sprite_key + '.png', 200, 200);
        }
        //wrong
        game.load.image('wrong1', 'assets/images/wrong.png');

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