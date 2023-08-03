var play = function(game) {};

var bgVolume = 0.35;
var showLevel = 0;
var increased =  true;
var purchasePopup = null
var nextButton = null;
var prevButton = null;

play.prototype = {
    onResume: onResume,
    enableButtons: enableButtons,
    init: function() {},
    preload: function() {},
    create: function () {
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    backgroundMusic = game.add.audio('song');
    backgroundMusic.volume = bgVolume;
    backgroundMusic.loopFull();

    window.localStorage.removeItem("gameEnded");

    var background = game.add.tileSprite(0, 0, 1280, 720, 'background');

    //  platforms group contains immovable items, 'stuck' to the ground
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Create the underground and make it immovable (stops it from falling away when you jump on it).
    var ground1_y = game.world.height - game.cache.getImage('ground1').height;
    var ground1 = platforms.create(0, ground1_y, 'ground1');
    ground1.body.immovable = true;

    //  Create the top ground and make it immovable
    var ground2_y = game.world.height - game.cache.getImage('ground1').height - game.cache.getImage('ground2').height;
    var ground2 = platforms.create(0, ground2_y, 'ground2');
    ground2.body.immovable = true;

    var ground3_y = game.world.height - game.cache.getImage('ground1').height - game.cache.getImage('ground3').height;
    var ground3 = platforms.create(394, ground3_y, 'ground3');
    ground3.body.immovable = true;

    // Create basket ball post
    var basket_ball_pole_y = game.world.height - game.cache.getImage('ground1').height - game.cache.getImage('ground2').height - game.cache.getImage('basket-ball-pole').height;
    var basket_ball_pole = platforms.create(82, basket_ball_pole_y, 'basket-ball-pole');
    basket_ball_pole.body.immovable = true;

    // Create see saw pivot
    var see_saw_pivot_y = game.world.height - game.cache.getImage('ground1').height - game.cache.getImage('ground3').height - game.cache.getImage('see-saw-pivot').height
    see_saw_pivot = platforms.create(840, see_saw_pivot_y, 'see-saw-pivot');
    see_saw_pivot.body.immovable = true;

    // Create basket ball loop
    var basket_ball_loop_y = game.world.height - game.cache.getImage('ground1').height -
        game.cache.getImage('ground2').height - game.cache.getImage('basket-ball-pole').height + 40;
    basket_ball_loop = game.add.sprite(153, basket_ball_loop_y, 'basket-ball-loop');
    basket_ball_loop.animations.add('net-animation', [0, 1, 2, 3, 0]);
    game.physics.enable(basket_ball_loop, Phaser.Physics.ARCADE);
    basket_ball_loop.body.immovable = true;

    // Stari
    emitter = game.add.emitter(basket_ball_loop.x + 20 + 0.5 * basket_ball_loop.width, basket_ball_loop.y);
    emitter.makeParticles('stari');
    emitter.gravity = 200;


    createNumberGroup();
    playLevel();

    // skip_button = game.add.text(1200, 10, "Exit", {
    //     font: "bold 30px Arial black",
    //     stroke: "#FF0000",
    //     strokeThickness: 4,
    //     align: "center",
    //     fill: '#FFFFFF'
    // });
    skip_button = game.add.sprite(1205, 10, 'homeBtn');
    skip_button.scale.setTo(0.7);
    skip_button.inputEnabled = true;
    skip_button.input.useHandCursor = true;
    skip_button.events.onInputUp.add(
        function up(item) {
            console.log('ve');
            exitGame(scores);
        }, this);

    nextButton = game.add.sprite(game.width - 30, game.world.centerY, 'arrow-right.png');
    nextButton.anchor.setTo(0.5);
    nextButton.scale.setTo(0.2);
    nextButton.inputEnabled = true;
    nextButton.input.useHandCursor = true;
    nextButton.events.onInputUp.add( function () {

        if(currentLevelPos + 1 < jsonData[currentLevel].stages.length) {
            currentLevelPos2 = 0;
            currentLevelPos++;
            basketCount = 0;
            basket_ball.visible = false;
            for(i in basket_array){
                basket_array[i].destroy();
            }
            createNumberGroup();
            playLevel();
        }else if (currentLevel + 1 < jsonData.length){
            if (currentLevel + 1 == 2 && !hasPurchased ()) {
                showLevelLock ();
            } else {
                currentLevelPos2 = 0;
                currentLevelPos = 0;
                currentLevel++;
                increased = true;
                basketCount = 0;
                basket_ball.visible = false;
                for(i in basket_array){
                    basket_array[i].destroy();
                }
                createNumberGroup();
                playLevel();
            }
            
        }
    }, this);

    prevButton = game.add.sprite(20, game.world.centerY, 'arrow-left.png');
    prevButton.anchor.setTo(0.5);
    prevButton.scale.setTo(0.2);
    prevButton.inputEnabled = true;
    prevButton.input.useHandCursor = true;
    prevButton.events.onInputUp.add( function () {
        if(currentLevelPos > 0) {
            currentLevelPos2 = 0;
            currentLevelPos--;
            basketCount = 0;
            basket_ball.visible = false;
            for(i in basket_array){
                basket_array[i].destroy();
            }
            createNumberGroup();
            playLevel();
        }else if (currentLevel > 0){
            currentLevelPos2 = 0;
            currentLevelPos = 0;
            currentLevel--;
            increased = true;
            basketCount = 0;
            basket_ball.visible = false;
            for(i in basket_array){
                basket_array[i].destroy();
            }
            createNumberGroup();
            playLevel();
        }
    }, this);    
},
    update: function () {
    if (gameState == GS_GAME_STARTUP) {
        basket_ball.alpha = 0;
        for (var i in answerBoxes) answerBoxes[i].alpha = 0;
        basket_ball.body.rotation = see_saw_bar.body.rotation = 15;
        for (var i in answer_slot) answer_slot[i].body.rotation = 15;
        for (var i in seeSawBoxes) seeSawBoxes[i].body.rotation = 15;
    } else if (gameState == GS_BALL_INIT_FALL_INIT) {
        target_pos_y = basket_ball.body.y;
        basket_ball.body.gravity.y = target_pos_y;
        basket_ball.body.y = 0;
        basket_ball.alpha = 1;
        gameState = GS_BALL_INIT_FALL;
        if(increased){
            showLevel++;
            ShowRound();
            increased = false;
        }
    } else if (gameState == GS_BALL_INIT_FALL) {
        if (basket_ball.body.y >= target_pos_y) {
            basket_ball.body.gravity.y = 0;
            basket_ball.body.velocity.y = 0;
            basket_ball.body.y = target_pos_y;
            see_saw_bar.body.angularVelocity = -150;
            gameState = GS_BALL_INIT_LEFT_SWING_DOWN;
        }
    } else if (gameState == GS_BALL_INIT_LEFT_SWING_DOWN) {
        basket_ball.body.rotation = see_saw_bar.body.rotation;
        for (var i in answer_slot) answer_slot[i].body.rotation = see_saw_bar.body.rotation;
        for (var i in seeSawBoxes) seeSawBoxes[i].body.rotation = see_saw_bar.body.rotation;
        if (see_saw_bar.body.rotation <= -15) {
            ballFired = false;
            ballOnSeeSaw = true;
            launchBall = false;
            see_saw_bar.body.angularVelocity = 0;
            speakSound('blip');
            game.time.events.add(100, hintAnimation);
            gameState = GS_ANS_OPTIONS_INIT;
        }
    } else if (gameState == GS_SWING_BACK) {

        basket_ball.body.rotation = see_saw_bar.body.rotation;
        for (var i in answer_slot) answer_slot[i].body.rotation = see_saw_bar.body.rotation;
        for (var i in seeSawBoxes) seeSawBoxes[i].body.rotation = see_saw_bar.body.rotation;
        if (see_saw_bar.body.rotation <= -15) {
            see_saw_bar.body.angularVelocity = 0;
            for (var i in overlappedBoxes) {
                overlappedBoxes[i].alpha = 0;
                overlappedBoxes[i].key = overlappedBoxes[i].origKey;
            }
            for (var i in selectedBoxes) {
                var sb = selectedBoxes[i];
                sb.visible = true;
                game.add.tween(sb).from({
                    x: answer_slot[i].body.x,
                    y: answer_slot[i].body.y
                }, 250, Phaser.Easing.Linear.None, true);
                speakSound('blip');
            }
            for (var i in answer_slot) answer_slot[i].visible = true;
            selected_box = null;
            overlappedBoxes = [];
            selectedBoxes = [];
            gameState = GS_ANS_OPTIONS_INIT;
        }
    } else if (gameState == GS_ANS_OPTIONS_INIT) {
        if (boxOnDrag != null) {
            game.physics.arcade.overlap(missingBox, boxOnDrag, function(missingBox) {
                var x_dist = Math.abs(boxOnDrag.body.x - missingBox.body.x);
                var y_dist = Math.abs(boxOnDrag.body.y - missingBox.body.y);
                if (x_dist < 20 && y_dist < 100) {
                    if (overlappedBoxes.indexOf(missingBox) > -1) return;
                    ++answeredCount;
                    overlapBox = missingBox;
                    overlapBox.origKey = missingBox.key;
                    if(boxOnDrag.key && boxOnDrag.key.split('box'))
                        speakSound(boxOnDrag.key.split('box')[1]);
                    overlappedBoxes.push(overlapBox);
                    gameState = GS_ANS_SET;
                } else {
                    boxOnDrag.body.rotation = see_saw_bar.body.rotation;
                }
            });
        }
    } else if (gameState == GS_ANS_SET) {
        // Rotate and position the answer that has been set
        overlapBox.loadTexture(boxOnDrag.key);
        overlapBox.alpha = 1;
        boxOnDrag.visible = false;
        for (var i in answer_slot) {
            if (answer_slot[i].missingNo == overlapBox.missingNo) {
                answer_slot[i].visible = false;
                break;
            }
        }
        selected_box = boxOnDrag;
        selectedBoxes.push(selected_box);
        if (answeredCount == missingBox.length) {
            see_saw_bar.body.angularVelocity = 50;
            gameState = GS_TOSS_BALL;
        } else {
            gameState = GS_ANS_OPTIONS_INIT;
        }
    } else if (gameState == GS_TOSS_BALL) {
        if (see_saw_bar.body.rotation >= 14) {
            if (ballOnSeeSaw) {
                var correct = true;
                for (var i in selectedBoxes) {
                    if (overlappedBoxes[i].origKey != selectedBoxes[i].key) {
                        correct = false;
                        break;
                    }
                }
                if (correct) {
                    
                    launchBall = true;
                } else {
                    answeredCount = 0;
                    see_saw_bar.body.angularVelocity = -30;
                    speakSound('incorrect');
                    gameState = GS_SWING_BACK;
                    return;
                }
            }
        }

        if (!ballFired && ballOnSeeSaw) {
            see_saw_bar.body.angularVelocity = 50;
        } else {
            see_saw_bar.body.angularVelocity = 0;
        }

        if (launchBall) {

            fireBall();
            ballOnSeeSaw = false;
            launchBall = false;
            basketCount++;
        }

        if (!ballFired) {
            basket_ball.body.rotation = see_saw_bar.body.rotation;
        } else {
            basket_ball.body.angularVelocity = -80;
        }

        for (var i in seeSawBoxes) seeSawBoxes[i].body.rotation = see_saw_bar.body.rotation;

        if (game.world.height - basket_ball.body.y <= basket_ball.height) {
            var endX = game.world.width - 5 - basketCount * (2 + basket_ball.width);
            if (basket_ball.body.x < endX) {
                basket_ball.body.velocity.x = 400;
                basket_ball.body.angularVelocity = 250;
            } else {
                basket_ball.body.velocity.x = 0;
                basket_ball.body.angularVelocity = 0;
                basket_ball.body.x = endX;
                gameState = GS_STOP;
                game.time.events.add(1000, nextLevel);
            }
        }

        if (ballFired && basket_ball.body.velocity.y > 0 &&
            basket_ball.body.y + basket_ball.height >= basket_ball_loop.body.y + 70) {
            basket_ball_loop.animations.play('net-animation', 4, false);

            basket_ball.body.angularVelocity = basket_ball.body.velocity.x = 0;
            emitter.start(true, 3000, null, 10);
        }
    }
}
};

function exitGame(score) {
    if (returnUrl) {
        var gameResult = {score: score};
        stores.set("extGameResult", gameResult);
        window.location.replace(returnUrl);
    }
}

function onDragStart(sprite, pointer) {
    boxOnDrag = sprite;
    boxesOnDrag.push(sprite);
    // sprite.input.useHandCursor = true;
}

function onDragStop(sprite, pointer) {
    speakSound('blip');
    if(boxesOnDrag.length > 1) {
        for (var b in boxesOnDrag) {
            boxesOnDrag[b].rotation = 0;
            boxesOnDrag[b].x = boxesOnDrag[b].original_pos.x;
            boxesOnDrag[b].y = boxesOnDrag[b].original_pos.y;
            boxesOnDrag[b] = null;
        }
        boxesOnDrag = [];
        boxOnDrag = null;
    } else {
        boxOnDrag.rotation = 0;
        boxOnDrag.x =boxOnDrag.original_pos.x;
        boxOnDrag.y = boxOnDrag.original_pos.y;
        boxOnDrag = null;
    }
}

function hintAnimation() {
    for (var i in answer_slot) {
        game.add.tween(answer_slot[i]).to({
            alpha: 1
        }, 900, Phaser.Easing.Linear.None, true, 300 * answerBoxes.length, -1, true);
    }

    for (var i in answerBoxes) {
        answerBoxes[i].alpha = 1;
        game.add.tween(answerBoxes[i].scale).to({
            x: 1.1,
            y: 1.1
        }, 300, Phaser.Easing.Linear.None, true, i * 300, -1, true);
    }
}

function fireBall() {
    console.log('AA: ' + basket_ball.pivot.x + ' - ' + basket_ball.pivot.y + ' - ' + see_saw_bar.body.x + ' - ' + see_saw_bar.body.y);
    speakSound('reverse_resume');
    game.time.events.add(800, function() {
        speakSound('TaDa');
    },this);
    // Set initial velocity and re-enable gravity
    basket_ball.body.velocity.x = -480;
    basket_ball.body.velocity.y = -750;
    basket_ball.body.gravity.y = 2000;
    basket_ball.body.x -= basket_ball.pivot.x;
    basket_ball.body.y -= basket_ball.pivot.y + basket_ball.height;
    basket_ball.pivot.x = 0;
    basket_ball.pivot.y = 0;
    basket_array.push(basket_ball);
    ballFired = true;
}

function nextLevel() {
    if (currentLevelPos2 + 1 < jsonData[currentLevel].stages[currentLevelPos].length) {
        currentLevelPos2++;
        playLevel();
    } else {
        numberGroup.visible = true;
        game.world.bringToTop(numberGroup);
        for(var i in answerBoxes) {
            answerBoxes[i].visible = false;
        }
    }


//                    if (currentLevelPos2 + 1 < jsonData[currentLevel].stages[currentLevelPos].length) {
//                        currentLevelPos2++;
//                    } else if(currentLevelPos + 1 < jsonData[currentLevel].length) {
//                        currentLevelPos++;
//                        currentLevelPos2 = 0;
//                    }else {
//                        currentLevel++;
//                        currentLevelPos = 0;
//                    }
//
//                    if (currentLevel < jsonData.length) {
//                        playLevel();
//                    } else {
//                        // Game over
//                        numberGroup.visible = true;
//                        game.world.bringToTop(numberGroup);
//                        for(var i in answerBoxes) {
//                            answerBoxes[i].visible = false;
//                        }
//                    }
}

function playLevel() {
    answeredCount = 0;
    createSeeSaw();
    createBasketBall();
    createSeeSawBoxes();
    createAnswerBoxes();

    game.world.bringToTop(basket_ball_loop);

    gameState = GS_GAME_STARTUP;

    game.time.events.add(1000, function() {
        gameState = GS_BALL_INIT_FALL_INIT;
    }, this);
}

function createSeeSaw() {
    // Create see-saw bar abit differently
    if (see_saw_bar) see_saw_bar.destroy();
    see_saw_bar = platforms.create(910, 450, 'see-saw-bar');
    see_saw_bar.anchor.setTo(0.5, 0.5);
    see_saw_bar.body.immovable = true;
    see_saw_bar_y_body_offset = see_saw_bar.height / 3;

    platforms.bringToTop(see_saw_pivot);
}

function createBasketBall() {
    //if(basket_ball) basket_ball.destroy();
    basket_ball = game.add.sprite(see_saw_bar.body.x, see_saw_bar.body.y - 20, 'basket-ball');
    basket_ball.anchor.setTo(0.5, 0.5);
    game.physics.enable(basket_ball, Phaser.Physics.ARCADE);
    basket_ball.body.bounce.y = 0;
    basket_ball.body.collideWorldBounds = true;
    basket_ball.pivot.x = (see_saw_bar.width - basket_ball.width) * 0.5;
    basket_ball.pivot.y = basket_ball.height / 2 - see_saw_bar_y_body_offset;
}

function createSeeSawBoxes() {
    for (var i in seeSawBoxes) {
        seeSawBoxes[i].destroy();
    }
    seeSawBoxes = [];
    overlappedBoxes = [];
    var sequence = jsonData[currentLevel].stages[currentLevelPos][currentLevelPos2].sequence;
    console.log(jsonData[currentLevel].stages.length,currentLevelPos,currentLevelPos2);
    var missingNo = jsonData[currentLevel].stages[currentLevelPos][currentLevelPos2].missing_no;
    if (missingBox) {
        for (var i in missingBox) missingBox[i].destroy();
    }
    missingBox = [];
    for (var i = 0; i < sequence.length; i++) {
        var box = game.add.sprite(see_saw_bar.body.x, see_saw_bar.body.y - 20, 'box' + sequence[i]);
        box.anchor.setTo(0.5, 0.5);
        game.physics.enable(box, Phaser.Physics.ARCADE);
        box.pivot.x = 0.5 * (box.width - see_saw_bar.width) + (sequence.length - 1 - i) * box.width;
        box.pivot.y = box.height * 0.5 - see_saw_bar_y_body_offset;
        seeSawBoxes.push(box);

        if (missingNo.indexOf(sequence[i]) > -1) {
            box.alpha = 0;
            box.missingNo = sequence[i];
            missingBox.push(box);
        }
    }

    if (answer_slot) {
        for (var i in answer_slot) answer_slot[i].destroy();
    }
    answer_slot = [];
    for (var i in missingBox) {
        var slot = game.add.sprite(missingBox[i].x, missingBox[i].y, 'answer-slot');
        slot.missingNo = missingBox[i].missingNo;
        slot.anchor.setTo(0.5);
        game.physics.enable(slot, Phaser.Physics.ARCADE);
        slot.pivot.x = missingBox[i].pivot.x;
        slot.pivot.y = missingBox[i].pivot.y;
        slot.alpha = 0;
        answer_slot.push(slot);
    }
}

function createAnswerBoxes() {
    for (var i in answerBoxes) {
        answerBoxes[i].destroy();
    }
    answerBoxes = [];
    selectedBoxes = [];

    var answerOptions = jsonData[currentLevel].stages[currentLevelPos][currentLevelPos2].answer_options;
    var startX = 0.7 * game.world.width;
    for (var i = 0; i < answerOptions.length; i++) {
        box = game.add.sprite(startX, 15, 'box' + answerOptions[i]);
        box.x += i * (box.width + 25);
        box.y = 20 + 0.5 * box.height + 2;
        box.original_pos = {
            x: box.x,
            y: box.y
        };
        box.scale.setTo(1.3);
        box.anchor.setTo(0.5, 0.5);
        game.physics.enable(box, Phaser.Physics.ARCADE);
        box.inputEnabled = true;
        box.input.useHandCursor = true;
        // box.events.onInputOver.add(function(){
        //     game.canvas.style.cursor = "move";
        //     // sprite.input.useHandCursor = true;
        // }, this);
        // box.events.onInputOut.add(function(){
        //     game.canvas.style.cursor = "default";
        // }, this);
        box.input.enableDrag(true);
        box.events.onDragStart.add(onDragStart, this);
        box.events.onDragStop.add(onDragStop, this);
        answerBoxes.push(box);
    }
}

function createNumberGroup() {
    numberGroup = game.add.group();
    numberGroup.width = 910;
    numberGroup.height = 370;
    numberGroup.x = 185;
    numberGroup.y = 175;
    var isClicked = false; 

    numberGroup.add(getGraphics(0.2, 0x000000, -185, -175, 1280, 720));

    var g = getGraphics(0.8, 0x000000, 200, 0, 546, 370);
    numberGroup.add(g);

    var x = 210,
        y = 10;
    var num_arr =  [""].concat(shuffleArray( jsonData[currentLevel].board[currentLevelPos]));
    for (var i in num_arr) {
        console.log(num_arr,num_arr[i]);
        var button = game.add.button(x, y, num_arr[i] + '.png', function(button) {
            if(isClicked) return; 
            console.log(basketCount,  parseInt(button.tag));
            if (basketCount === parseInt(button.tag)) {
                isClicked = true;
                speakSound('expand');
                speakSound(basketCount);
                var tween = game.add.tween(button).to({
                    y: button.y - 10
                }, 500, Phaser.Easing.Quadratic.Out, true, 0, -1, true);
                var stari = game.add.emitter(button.x + 0.5 * button.width, button.y + 0.5 * button.height);
                stari.width = button.width;
                stari.makeParticles('stari');
                stari.gravity = 5;
                stari.setScale(1);
                numberGroup.add(stari);

                var red_stari = game.add.emitter(button.x + 0.5 * button.width,
                    button.y + 0.5 * button.height);
                red_stari.width = button.width;
                red_stari.makeParticles('red_stari');
                red_stari.gravity = 5;
                red_stari.setScale(1);
                numberGroup.add(red_stari);

                stari.start(false, 1000, 100);
                red_stari.start(false, 1000, 100);
                game.time.events.add(4000, function() {
                    numberGroup.visible = false;
                    if(currentLevelPos + 1 < jsonData[currentLevel].stages.length) {
                        currentLevelPos2 = 0;
                        currentLevelPos++;
                        basketCount = 0;
                        for(i in basket_array){
                            basket_array[i].destroy();
                        }
                        numberGroup.remove(stari);
                        numberGroup.remove(red_stari);
                        tween.pause();
                        createNumberGroup();
                        playLevel();
                    }else if (currentLevel + 1 <jsonData.length){
                        if (currentLevel + 1 == 2 && !hasPurchased ()) {
                            showLevelLock ();
                        } else {
                            currentLevelPos2 = 0;
                            currentLevelPos = 0;
                            currentLevel++;
                            increased = true;
                            basketCount = 0;
                            for(i in basket_array){
                                basket_array[i].destroy();
                            }
                            numberGroup.remove(stari);
                            numberGroup.remove(red_stari);
                            tween.pause();
                            createNumberGroup();
                            playLevel();
                        }
                    }else {
                        speakSound('Cheering');
                        getGraphics(0.2, 0x000000, 0, 0, 1280, 720);
                        var staris = ['stari', 'red_stari'];
                        window.localStorage.setItem("gameEnded", "true");
                        var emitters = [];
                        for (var i in staris) {
                            var emitter = game.add.emitter(game.world.centerX, 200, 200);
                            //  This emitter will have a width of 800px, so a particle can emit from anywhere in the range emitter.x += emitter.width / 2
                            emitter.width = 1280;
                            emitter.makeParticles(staris[i]);
                            emitter.minParticleSpeed.set(0, 300);
                            emitter.maxParticleSpeed.set(0, 400);
                            emitter.setRotation(0, 0);
                            emitter.setAlpha(1, 1);
                            emitter.setScale(1, 1, 1, 1);
                            emitter.gravity = -190;
                            emitters.push(emitter);
                        }

                        //  false means don't explode all the sprites at once, but instead release at a rate of one particle per 100ms
                        //  The 5000 value is the lifespan of each particle before it's killed
                        for (var i in emitters) emitters[i].start(false, 5000, 100);
                    }
                }, this);
            } else {
                speakSound('lose');
                button.loadTexture(button.tag + '_g.png');
            }
        }, this, 2, 1, 0);
        button.input.useHandCursor = true;
        button.tag = num_arr[i];

        x = 210 + (i > 5 ? i - 5 : i) * 180;
        if (i === 5) {
            x = 10;
            y = 20 + button.height;
        }

        numberGroup.add(button);
    }

    numberGroup.visible = false;
}

function getGraphics(a, c, x, y, w, h, r, cb, ctx) {
    var g = game.add.graphics(x, y);
    g.beginFill(c, a);
    if (r) {
        g.drawRoundedRect(0, 0, w, h, r);
    } else {
        g.drawRect(0, 0, w, h);
    }
    g.endFill();
    if (cb) {
        g.inputEnabled = true;
        g.input.input.useHandCursor = true;
        g.events.onInputDown.add(cb, ctx);
    }
    return g;
}

function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function speakSound(x) {
    game.add.audio(x).play();
}

var ShowRound = function () {
    blvels = game.add.sprite(game.world.centerX, game.world.centerY, 'level');
    blvels.anchor.set(0.5);
    LevelTxt = game.add.text(-70, -30,'Level:', {font: '50px Titan One', fill: '#fff'});
    LevelTxt.text = 'Level ' + showLevel;
    blvels.addChild(LevelTxt);
    game.time.events.add(3000, function() {
        blvels.visible = false;
        LevelTxt.visible = false;
    },this);
};

function showLevelLock () {
    if (purchasePopup == null) {
        purchasePopup = new PurchasePopup (game);
    }

    enableButtons (false);

    purchasePopup.show ();
    game.stage.addChild (purchasePopup);
}

function onResume () {
    this.enableButtons (true);

    basketCount = 0;
    basket_ball.visible = false;
    for(i in basket_array){
        basket_array[i].destroy();
    }
    createNumberGroup();
    playLevel();
}

function enableButtons (bool) {
    prevButton.inputEnabled = bool;
    nextButton.inputEnabled = bool;

    for (var i in answerBoxes) {
        answerBoxes[i].inputEnabled = bool;
    }
} 

function hasPurchased () {
    var token = window.localStorage.getItem("purchaseToken");
    
    return token != null;
}