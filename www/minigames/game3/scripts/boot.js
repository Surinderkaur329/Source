var boot = function(game) {};

boot.prototype = {

    init: function() {
        // Adjust screen
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.setScreenSize(true);
   },

    preload: function() {
        //preloader
        game.load.image('preloaderBackground', 'assets/images/splash.png');
        game.load.image('preloaderBar1', 'assets/images/bar2.png');
        game.load.image('preloaderBar2', 'assets/images/bar1.png');
    },

    create: function() {
        game.state.start('Preloader');
    }
};