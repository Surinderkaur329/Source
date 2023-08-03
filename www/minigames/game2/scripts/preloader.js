
var Preloader = function(game) {};

var background = null;
var preloadBar1 = null;
var preloadBar2 = null;

var ready = false;

Preloader.prototype = {

    preload: function() {

        if(!ready){
            background = this.add.sprite(0, 0, 'preloaderBackground');
            preloadBar1 = this.add.sprite(160, 1100, 'preloaderBar1');
            preloadBar2 = this.add.sprite(160, 1100, 'preloaderBar2');
            preloadBar1.scale.setTo(1.5);
            preloadBar2.scale.setTo(1.5);

            game.load.setPreloadSprite(preloadBar1);
        }

        // Background
        game.load.image('background', 'assets/images/background.png');
        game.load.image('plank1', 'assets/images/plank1.png');
        game.load.image('banner', 'assets/images/banner.png');

        game.load.image('level', 'assets/images/level.png');

        game.load.image('stari', 'assets/images/stari.png');
        game.load.image('red_stari', 'assets/images/red_stari.png');

        game.load.audio('Cheering', '../../assets/sound/Cheering.mp3');
        game.load.audio('song', '../../assets/sound/Music/Game_1.mp3');
        game.load.audio('TaDa', '../../assets/sound/SoundEffects/TaDa.mp3');
        game.load.audio('blip', '../../assets/sound/SoundEffects/blip.wav');
        game.load.audio('expand', '../../assets/sound/SoundEffects/expand.mp3');

        game.load.image('homeBtn', '../../assets/img/home.png');
        game.load.image('arrow-right.png', '../../assets/img/arrow-right.png');
        game.load.image('arrow-left.png', '../../assets/img/arrow-left.png');

        // controls
        game.load.image('left_arrow', 'assets/images/left_button.png');
        game.load.image('right_arrow', 'assets/images/right_button.png');
        game.load.image('up_arrow', 'assets/images/up_button.png');
        game.load.image('down_arrow', 'assets/images/down_button.png');

        var cL = 0;
        while( cL < jsonData.length) {
            var lD = jsonData[cL];
            for(var j in lD.main_image) {
                var image = lD.main_image[j].image;
                game.load.image(image, 'assets/images/' + image);
            }

            for(var i in lD.slot_items) {
                var item = lD.slot_items[i];
                game.load.image(item.image, 'assets/images/' + item.image);
                game.load.audio(item.sound, 'assets/sounds/' + item.sound);
            }
            cL++;
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
        preloadBar1.cropEnabled = false;
        ready = true;

        game.state.start('play');
    }
};