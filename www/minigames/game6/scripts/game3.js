var Game3_ = function(game) {};

Game3_.prototype = {
    create: function() {
          
        game.add.sprite(0, 0,'background');

        music.loopFull();

        menu = displaButton(game.world.centerX + 420,  game.world.height- 700,
            .6, "menu", function () {
                game.state.start('Menu');
            }
        );

        rightBtn = displaButton(game.width - 50, game.world.centerY,
            0.2,  'arrow-right.png', function () {
                if(level < jsonData.length) {
                    console.log (jsonData[level].level)
                    if (jsonData[level].level >= 3.1 && !hasPurchased()) {
                        // console.log ("lock")
                        showLevelLock ();
                    } else {
                        level++;
                        newGame();

                        game.state.start('Game3_');

    
                    }
                    if (interval && interval.running) interval.stop ();
                
                }
            }
        , true);

        leftBtn = displaButton(20, game.world.centerY,
            .2, 'arrow-left.png', function () {
                if(level > 0) {
                    level--;
                    newGame();
                    game.state.start('Game3_');

                    if (interval && interval.running) interval.stop ();

                    if (purchasePopup && purchasePopup.visible) purchasePopup.hide ();
                }
            }
        , true);

        // wheel;
        wheel = game.add.sprite( game.world.centerX,  game.world.centerY,  "wheel");
        wheel.anchor.setTo(0.5);

        var innerWheel = game.add.sprite( (wheel.x / 100) - 6, (wheel.y / 100) - 8, "innerWheel");
        innerWheel.anchor.setTo(0.5);
        wheel.addChild(innerWheel);

        displayParts('3', 0, { font: "100px Arial", fill:'transparent', stroke:'#000000', strokeThickness:1 , align: "center"});
        game.time.events.add(1000, function() {
            startGame2();
        }, this);
    }
};

function hasPurchased () {
    var token = window.localStorage.getItem("purchaseToken");
    
    return token != null;
}