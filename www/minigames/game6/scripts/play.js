var Play = function(game) {};

Play.prototype = {
    
    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
    }
    
};