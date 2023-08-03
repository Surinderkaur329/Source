var main = function(game) {};

main.prototype = {

    init: function() {},

    preload: function() {

    },

    create: function() {
        game.load.image('background', 'assets/images/background.png');

        game.state.start('play');
    }
};