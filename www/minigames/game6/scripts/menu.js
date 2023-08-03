var Menu = function(game) {};

var bgVolume = 0.5;

Menu.prototype = {
    create: function() {
        level = 0;
        game.add.sprite(0, 0,'background');

        music = this.add.audio('song');
        music.volume = bgVolume;
        music.loopFull();

        // game 1 button
        game1 = displaButton( game.world.centerX - 380,  game.world.centerY - 60, 
            1, "game1", function () {
                newGame();
                showInstructions('Follow the voice instructions and tap on the alphabet letter announced when the red colour lands on the letter.', 'Game1_');
            }
        );

        // game 2 button
        game2 = displaButton( game.world.centerX - 100, game.world.centerY - 60, 
            1, "game2", function () {
                newGame();
                showInstructions('Move the alphabet letter in the middle to match the drawing/outline of the letter on the outer circle.', 'Game2_');
            }
        );

        // game 3 button
        game3 = displaButton( game.world.centerX + 180,  game.world.centerY - 60, 
             1, "game3", function () {
                newGame();
                showInstructions('Move the animals in the middle to match the alphabet letter announced on the outer circle. \nUse your mouse or fingers to move the letters and animals.', 'Game3_');
            }
        );

        displaButton(10, 10, .7, 'homeBtn', 
             function () {
                exitGame(scores);
             }
        );
    }
};