var play = function(game) {};
var  bodies = [];
var isMoved = false;
var showText = null;
var showLevel = 0;
var increased =  true;
var blvelsArr = [];
var slot_s = [], slots = [];
var leftButton;
var rightButton;
var upButton;
var bgVolume = 0.5;

var purchasePopup = null
var nextButton = null;
var prevButton = null;

play.prototype = {
    create: create,
    update: update,
    render: render,
    onResume: onResume,
    enableButtons: enableButtons
};

function create() {
    bodies = [];
    game.physics.startSystem(Phaser.Physics.P2JS);

    game.physics.p2.gravity.y = 500;

    game.add.tileSprite(0, 0, 1280, 720, 'background');

    gray = game.add.filter('Gray');

    window.localStorage.removeItem("gameEnded");

    backgroundMusic = game.add.audio('song');
    backgroundMusic.volume = bgVolume;
    backgroundMusic.loopFull();

    // LevelText = game.add.text(0, 0,'Level:', {font: '32px Arial', fill: '#000'});
    // LevelText.text = 'Level: ' + jsonData[level].level + ' Stage: '+ (parseInt(levelCont) + 1) + ' Round ' +(parseInt(round) + 1) ;

    // collision groups
    playBoxCollisionGroup = game.physics.p2.createCollisionGroup();
    ballCollisionGroup = game.physics.p2.createCollisionGroup();

    // var downButton = game.add.button(game.width - 400, game.height + 50, 'down_button', function() {
    //     if(gs == GS_MOVE_BALL) ball.body.moveDown(200);
    // }, this, 2, 1, 0);
    // downButton.y -= downButton.height;
    // downButton.input.useHandCursor = true;
    // downButton.anchor.setTo(.5);
    // game.world.bringToTop(downButton);

    // Play box
    var playBoxBackground = game.add.sprite(90, 354, 'play_box_background');
    playBoxBackground.alpha = 0;

    var thickness = game.cache.getImage('play_box_left_top').height / 2;

    var playBoxLeftTop = game.add.sprite(238.50, 319.00 , 'play_box_left_top');
    game.physics.p2.enableBody(playBoxLeftTop, false);
    playBoxLeftTop.body.static = true;
    playBoxLeftTop.body.setCollisionGroup(playBoxCollisionGroup);
    playBoxLeftTop.body.collides([playBoxCollisionGroup, ballCollisionGroup]);
    bodies.push(playBoxLeftTop);

    var playBoxLeftLeft = game.add.sprite(89.50 , 489.50, 'play_box_left_left');
    game.physics.p2.enableBody(playBoxLeftLeft, false);
    playBoxLeftLeft.body.static = true;
    playBoxLeftLeft.body.setCollisionGroup(playBoxCollisionGroup);
    playBoxLeftLeft.body.collides([playBoxCollisionGroup, ballCollisionGroup]);
    bodies.push(playBoxLeftLeft);

    var playBoxLeftBottom = game.add.sprite(245, 654,'play_box_left_bottom');
    game.physics.p2.enableBody(playBoxLeftBottom, false);
    playBoxLeftBottom.body.static = true;
    playBoxLeftBottom.body.setCollisionGroup(playBoxCollisionGroup);
    playBoxLeftBottom.body.collides([playBoxCollisionGroup, ballCollisionGroup]);
    bodies.push(playBoxLeftBottom);

    var playBoxLeftRight = game.add.sprite(394.50 , 570,'play_box_left_right');
    game.physics.p2.enableBody(playBoxLeftRight, false);
    playBoxLeftRight.body.static = true;
    playBoxLeftRight.body.setCollisionGroup(playBoxCollisionGroup);
    playBoxLeftRight.body.collides([playBoxCollisionGroup, ballCollisionGroup]);
    bodies.push(playBoxLeftRight);

    var playBoxMiddleBottom = game.add.sprite(534.50, 496.00 , 'play_box_middle_bottom');
    game.physics.p2.enableBody(playBoxMiddleBottom, false);
    playBoxMiddleBottom.body.static = true;
    playBoxMiddleBottom.body.setCollisionGroup(playBoxCollisionGroup);
    playBoxMiddleBottom.body.collides([playBoxCollisionGroup, ballCollisionGroup]);
    bodies.push(playBoxMiddleBottom);

    var playBoxMiddleRight = game.add.sprite(668.50 ,574.00, 'play_box_left_right');
    game.physics.p2.enableBody(playBoxMiddleRight, false);
    playBoxMiddleRight.body.static = true;
    playBoxMiddleRight.body.setCollisionGroup(playBoxCollisionGroup);
    playBoxMiddleRight.body.collides([playBoxCollisionGroup, ballCollisionGroup]);
    bodies.push(playBoxMiddleRight);

    var playBoxRightBottom = game.add.sprite(823.50,653.50, 'play_box_right_bottom');
    game.physics.p2.enableBody(playBoxRightBottom, false);
    playBoxRightBottom.body.static = true;
    playBoxRightBottom.body.setCollisionGroup(playBoxCollisionGroup);
    playBoxRightBottom.body.collides([playBoxCollisionGroup, ballCollisionGroup]);
    bodies.push(playBoxRightBottom);

    var playBoxRightRight = game.add.sprite(974 , 486.5, 'play_box_right_right');
    game.physics.p2.enableBody(playBoxRightRight, false);
    playBoxRightRight.body.static = true;
    playBoxRightRight.body.setCollisionGroup(playBoxCollisionGroup);
    playBoxRightRight.body.collides([playBoxCollisionGroup, ballCollisionGroup]);
    bodies.push(playBoxRightRight);

    var playBoxRightTop = game.add.sprite(819.50,319, 'play_box_right_top');
    game.physics.p2.enableBody(playBoxRightTop, false);
    playBoxRightTop.body.static = true;
    playBoxRightTop.body.setCollisionGroup(playBoxCollisionGroup);
    playBoxRightTop.body.collides([playBoxCollisionGroup, ballCollisionGroup]);
    bodies.push(playBoxRightTop);

    // var playBoxRightLeft = game.add.sprite(playBoxRightTop.x - (game.cache.getImage('play_box_right_top').width / 2) + thickness,
    //     playBoxRightTop.y + (game.cache.getImage('play_box_right_left').height / 2) + thickness,
    //     'play_box_right_left');
    // game.physics.p2.enableBody(playBoxRightLeft, false);
    // playBoxRightLeft.body.static = true;
    // playBoxRightLeft.body.setCollisionGroup(playBoxCollisionGroup);
    // playBoxRightLeft.body.collides([playBoxCollisionGroup, ballCollisionGroup]);

    var playBoxMiddleTop = game.add.sprite(532.50, 355.50, 'play_box_middle_top');
    game.physics.p2.enableBody(playBoxMiddleTop, false);
    playBoxMiddleTop.body.static = true;
    playBoxMiddleTop.body.setCollisionGroup(playBoxCollisionGroup);
    playBoxMiddleTop.body.collides([playBoxCollisionGroup, ballCollisionGroup]);
    bodies.push(playBoxMiddleTop);

    barrierTopY = playBoxMiddleTop.y + playBoxMiddleTop.height + (thickness + 10);
    barrierBottomY = playBoxMiddleBottom.y - playBoxMiddleBottom.height - (thickness +10);

    // var playBoxMiddleLeft = game.add.sprite(playBoxMiddleTop.x - (game.cache.getImage('play_box_middle_top').width / 2) + thickness,
    //     playBoxMiddleTop.y - game.cache.getImage('play_box_middle_left').height / 2 - thickness,
    //     'play_box_middle_left');
    // game.physics.p2.enableBody(playBoxMiddleLeft, false);
    // playBoxMiddleLeft.body.static = true;
    // playBoxMiddleLeft.body.setCollisionGroup(playBoxCollisionGroup);
    // playBoxMiddleLeft.body.collides([playBoxCollisionGroup, ballCollisionGroup]);

    cursors = game.input.keyboard.createCursorKeys();

    // skip_button = game.add.text(1200, 10, "Exit", {
    //     font: "bold 30px Arial black",
    //     stroke: "#FF0000",
    //     strokeThickness: 4,
    //     align: "center",
    //     fill: '#FFFFFF'
    // });
    skip_button = game.add.sprite(1200, 10, 'homeBtn');
    skip_button.scale.setTo(0.7);
    skip_button.inputEnabled = true;
    skip_button.input.useHandCursor = true;
    skip_button.events.onInputDown.add(
        function up(item) {
            exitGame(scores);
        }, this);


    nextButton = game.add.sprite(game.width - 30, game.world.centerY, 'arrow-right.png');
    nextButton.anchor.setTo(0.5);
    nextButton.scale.setTo(0.2);
    nextButton.inputEnabled = true;
    nextButton.input.useHandCursor = true;
    nextButton.events.onInputDown.add( function () {
        round++;
        potted_balls = [];
        if (jsonData[level] && round >= jsonData[level].stages[levelCont].length) {
            round = 0;
            levelCont++;
            // leftButton.visible = true;
            rightButton.visible = true;
            upButton.visible = true;
        }
        if (jsonData[level] && levelCont >= jsonData[level].stages.length) {
            round = 0;
            levelCont = 0;
            level++;
            ShowRound(jsonData[level].level);
            // leftButton.visible = true;
            rightButton.visible = true;
            upButton.visible = true;
            
        }

        if (level < jsonData.length) {
            if (jsonData[level].level == 3 && !hasPurchased()) {
                showLevelLock ();
            } else {
                gs = GS_INIT;
                rightButton.visible = true;
                upButton.visible = true;
            }
        }
    }, this);

    prevButton = game.add.sprite(20, game.world.centerY, 'arrow-left.png');
    prevButton.anchor.setTo(0.5);
    prevButton.scale.setTo(0.2);
    prevButton.inputEnabled = true;
    prevButton.input.useHandCursor = true;
    prevButton.events.onInputDown.add( function () {
        if(level > 0) {
            potted_balls = [];
            round = 0;
            levelCont = 0;
            level--;
            ShowRound(jsonData[level].level);
            gs = GS_INIT;
        }
    }, this);     

    ShowRound(level + 1);

    // showText = game.add.text(game.world.centerX, game.world.centerY, '', {font: '30px Titan One', fill: '#222'})
    // showText.anchor.setTo(.5);
    controls();
}

function onDragStart(sprite, pointer) {
    levelGroup.bringToTop(sprite);
}

function onDragStop(sprite, pointer) {
    if (gs == GS_MULTICHOICE_SELECT && answerSlotRect.contains(sprite.x, sprite.y) &&
        sprite.num == levelData.operand1 + levelData.operand2) {
        endRound(sprite);
    } else {
        game.add.tween(sprite).to({
            x: sprite.origPos.x,
            y: sprite.origPos.y
        }, 250, Phaser.Easing.Linear.None, true);
    }
}

function slotClicked(sprite, pointer) {
    if(gs == GS_MULTICHOICE_SELECT) {
        speakSound('blip');
        if (slotSelected.sprite && slotSelected.sprite == sprite) {
            slotSelected.sprite.x = slotSelected.slotX;
            slotSelected.sprite.y = slotSelected.slotY;
            slotSelected.sprite = null;
        } else {
            if (slotSelected.sprite) {
                slotSelected.sprite.x = slotSelected.slotX;
                slotSelected.sprite.y = slotSelected.slotY;
            }

            slotSelected.sprite = sprite;
            slotSelected.slotX = slotSelected.sprite.origPos.x;
            slotSelected.slotY = slotSelected.sprite.origPos.y;
            slotSelected.sprite.x = answerSlotRect.x + 0.5 * answerSlotRect.width;
            slotSelected.sprite.y = answerSlotRect.y + 0.5 * answerSlotRect.height;

            if(sprite.num === levelData.operand1 + levelData.operand2) {
                // setTimeout(function () {
                // speakSound('TaDa');
                // },800);
                endRound(sprite);
            } else {
                game.time.events.add(1500, function() {
                    game.add.tween(sprite).to({
                        x: sprite.origPos.x,
                        y: sprite.origPos.y
                    }, 250, Phaser.Easing.Linear.None, true);
                    speakSound('incorrect');
                }, this);
            }
        }
    }
}

function controls () {
    // Nav Buttons
    // leftButton = game.add.sprite(50, game.height - 50, 'left_button');
    // leftButton.anchor.setTo(0.5);
    // leftButton.inputEnabled = true;
    // leftButton.input.useHandCursor = true;
    // leftButton.events.onInputDown.add( function () {
    //     speakSound('blip');
    //     showText.text = 'left';
    //     if(gs == GS_MOVE_BALL) ball.body.moveLeft(200);
    // }, this);

    upButton = game.add.sprite(50, game.height - 50, 'up_button');
    upButton.anchor.setTo(0.5);
    upButton.inputEnabled = true;
    upButton.input.useHandCursor = true;
    upButton.events.onInputDown.add( function () {
        speakSound('blip');
        // showText.text = 'up';
        if(gs == GS_MOVE_BALL) ball.body.moveUp(450);
    }, this);

    rightButton = game.add.sprite(game.width - 50, game.height - 50, 'right_button');
    rightButton.anchor.setTo(0.5);
    rightButton.inputEnabled = true;
    rightButton.input.useHandCursor = true;
    rightButton.events.onInputDown.add( function () {
        speakSound('blip');
        // showText.text = 'right';
        if(gs == GS_MOVE_BALL) ball.body.moveRight(200);
    }, this);
}

function endRound(sprite) {

    speakSound(sprite.num);

    for (var i in slots) {
        slots[i].visible = false;
    }
    sprite.visible = true;
    
    game.tweens.removeAll();

    sprite.x = answerSlotRect.x + 0.5 * answerSlotRect.width;
    sprite.y = answerSlotRect.y + 0.5 * answerSlotRect.height;
    sprite.inputEnabled = false;

    game.add.tween(sprite).to({y: sprite.y - 20}, 500, Phaser.Easing.Linear.None, true, 0, -1, true);

    var stari = game.add.emitter(sprite.x, sprite.y);
    stari.width = sprite.width;
    stari.makeParticles('stari');
    stari.gravity = 5;
    levelGroup.add(stari);

    var red_stari = game.add.emitter(sprite.x, sprite.y);
    red_stari.width = sprite.width;
    red_stari.makeParticles('red_stari');
    red_stari.gravity = 5;
    levelGroup.add(red_stari);

    stari.start(false, 1000, 100);
    red_stari.start(false, 1000, 100);
    game.time.events.add(3000, nextLevel);
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

function nextLevel() {
    round++;
    if (round >= jsonData[level].stages[levelCont].length) {
        round = 0;
        levelCont++;
        // leftButton.visible = true;
        rightButton.visible = true;
        upButton.visible = true;
    }
    if (levelCont >= jsonData[level].stages.length) {
        round = 0;
        levelCont = 0;
        level++;

        if (jsonData[level].level == 3 && !hasPurchased()) {
            showLevelLock ();
            return;
        }
       
        // leftButton.visible = true;
        rightButton.visible = true;
        upButton.visible = true;
        ShowRound(jsonData[level].level);
    }
    if (level < jsonData.length) {
        gs = GS_INIT;
        // leftButton.visible = true;
        rightButton.visible = true;
        upButton.visible = true;
    } else {
        levelGroup.destroy();
        // speakSound('Cheering');
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
}

function initLevel() {
    levelData = jsonData[level].stages[levelCont][round];
    // LevelText.text = 'Level: ' + jsonData[level].level + ' Stage: '+ (parseInt(levelCont) + 1) + ' Round ' +(parseInt(round) + 1) ;


    if (levelGroup) levelGroup.destroy();
    levelGroup = game.add.group();

    var choices = levelData.multi_choices;
    var choice1 = 'num' + choices[0];
    var choice_1 = 'num_' + choices[0];
    var choice2 = 'num' + choices[1];
    var choice_2 = 'num_' + choices[1];
    var choice3 = 'num' + choices[2];
    var choice_3 = 'num_' + choices[2];


    // multiple choice answer slots
    var x = SLOT_X + 0.5 * SLOT_W;
    var y = SLOT1_Y + 0.5 * SLOT_H;
    slot1 = game.add.sprite(x, y, choice1);
    slot_1 = game.add.sprite(x, y, choice_1);

    y = SLOT2_Y + 0.5 * SLOT_H;
    slot2 = game.add.sprite(x, y, choice2);
    slot_2 = game.add.sprite(x, y, choice_2);

    y = SLOT3_Y + 0.5 * SLOT_H;
    slot3 = game.add.sprite(x, y, choice3);
    slot_3 = game.add.sprite(x, y, choice_3);

    // y = SLOT4_Y + 0.5 * SLOT_H;
    // slot4 = game.add.sprite(x, y, choice4);

    slots = [slot1, slot2, slot3];
    slot_s = [slot_1, slot_2, slot_3];
    for (var i in slot_s) {
        var slot = slot_s[i];
        slot.num = choices[i];
        slot.origPos = {
            x: slot.x,
            y: slot.y
        };
        slot.anchor.set(0.5);
        slot.scale.setTo(0.7);
        slot.inputEnabled = true;
        slot.input.useHandCursor = true;
    }

    for (var i in slots) {
        var slot = slots[i];
        slot.num = choices[i];
        slot.origPos = {
            x: slot.x,
            y: slot.y
        };
        slot.anchor.set(0.5);
        slot.scale.setTo(0.7);
        slot.inputEnabled = true;
        slot.events.onInputDown.add(slotClicked, this);
        slot.input.useHandCursor = true;
        slot.visible = false;
    }

    levelGroup.add(slot_1);
    levelGroup.add(slot1);
    levelGroup.add(slot_2);
    levelGroup.add(slot2);
    levelGroup.add(slot_3);
    levelGroup.add(slot3);
    // levelGroup.add(slot4);

    // operands and operator
    var operand1 = game.add.sprite(OPERAND1_X, OPERAND1_Y, 'num' + levelData.operand1);
    operand1.anchor.setTo(0.5);
    var operatorPlus = game.add.sprite(OPERATOR_PLUS_X, OPERATOR_PLUS_Y, 'plus');
    operatorPlus.anchor.setTo(0.5);
    var operand2 = game.add.sprite(OPERAND2_X, OPERAND2_Y, 'num' + levelData.operand2);
    operand2.anchor.setTo(0.5);
    var equals = game.add.sprite(EQUALS_X, EQUALS_Y, 'equals');
    equals.anchor.setTo(0.5);
    var answerMark = game.add.sprite(ANSWER_MARK_X, ANSWER_MARK_Y, 'answer_mark');
    answerMark.anchor.setTo(0.5);
    answerSlotRect = new Phaser.Rectangle(ANSWER_MARK_X - 70, ANSWER_MARK_Y - 70, answerMark.width, 140);

    levelGroup.add(operand1);
    levelGroup.add(operatorPlus);
    levelGroup.add(operand2);
    levelGroup.add(equals);
    levelGroup.add(answerMark);

    // barriers
    barriers = [];
    for(var i in levelData.barriers) {
        var barrier = levelData.barriers[i];
        var barrierBody = game.add.sprite(barrier.x, barrier.y, barrier.image);
        barrierBody.origX = barrier.x;
        game.physics.p2.enableBody(barrierBody, false);
        barrierBody.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
        barrierBody.body.setCollisionGroup(playBoxCollisionGroup);
        barrierBody.body.collides([playBoxCollisionGroup, ballCollisionGroup]);
        levelGroup.add(barrierBody);
        barriers.push(barrierBody);
    }

    // balls
    balls = [];
    ballsIndex = levelData.operand1 - 1;

    var ball_colors;
    if(jsonData[level].level > 3){
        var b_arr = shuffleArray(['ball_green', 'ball_yellow', 'ball_red']);
        ball_colors = [b_arr[0]];
    }else{
        ball_colors = ['ball_red'];
    }

    var m1 = 0,j1 = 0;
    for (var i = 0; i < levelData.operand1; i++) {
        m1++;
        if(i === 5 || i === 10){ m1 = 1; j1++}
        var n = i % ball_colors.length;
        var l_ball = game.add.sprite(70, 544, ball_colors[n]);
        l_ball.x += m1 * (l_ball.width + 2);
        l_ball.y = 610 - j1 * 110;
        balls.push(l_ball);
    }

    var m = 0,j = 0;
    for (var i = 0; i < levelData.operand2; i++) {
        m++;
        if(i === 5 || i === 10){ m = 1; j++}
        var n = (i + levelData.operand1) % ball_colors.length;
        var r_ball = game.add.sprite(650, 610, ball_colors[n]);
        r_ball.x += m * (r_ball.width + 2) - 5;
        r_ball.y = 610 - j * 110;
        potted_balls.push(r_ball);
        balls.push(r_ball);
    }
    end_balls = levelData.operand2;

    for (var i in balls) {
        game.physics.p2.enableBody(balls[i], false);
        balls[i].body.setCircle(balls[i].width / 2);
        balls[i].body.setCollisionGroup(ballCollisionGroup);
        balls[i].body.collides([ballCollisionGroup, playBoxCollisionGroup]);
        game.time.events.add(500, function() {
            speakSound('seefa_merge_1');
        });
        // if(balls[i].x > 700){
        //     balls[i].body.damping = 1;
        // }
        levelGroup.add(balls[i]);
    }

    ball = balls[ballsIndex];
}

function update() {
    game.world.bringToTop(upButton);
    //game.world.bringToTop(leftButton);
    game.world.bringToTop(rightButton);
    switch (gs) {
        case GS_NONE:
            break;
        case GS_INIT:
            initLevel();
            gs = GS_MOVE_BALL;
            break;
        case GS_MOVE_BALL:
            for(var i in barriers) {
                var barrier = barriers[i];
                if (barrier.body.velocity.y === 0) barrier.body.velocity.y = 40;
                if (barrier.body.y >= barrierBottomY) {
                    barrier.body.moveUp(40);
                } else if (barrier.body.y <= barrierTopY) {
                    barrier.body.moveDown(40);
                }
                //
                if(barrier.overlap(ball)){
                    if(isMoved){
                        isMoved = false;
                        speakSound('blip');
                    }
                }
            }

            // setTimeout(function (){speak = true;},1000);

            for(i in bodies){
                if(bodies[i].overlap(ball)){
                    if(isMoved){
                        isMoved = false;
                        speakSound('blip');
                    }
                }
            }

            if (cursors.left.isDown) {
                cursors.left.down = true;
                ball.body.moveLeft(200);
            } else if (cursors.right.isDown) {
                cursors.right.down = true;
                ball.body.moveRight(200);
            }

            if (cursors.up.isDown) {
                cursors.up.down = true;
                ball.body.moveUp(200);
            } else if (cursors.down.isDown) {
                cursors.down.down = true;
                ball.body.moveDown(200);
            }

            if(cursors.up.down){
                if(cursors.up.isUp){
                    isMoved = true;
                    cursors.up.down = false;
                }
            }

            if(cursors.up.down){
                if(cursors.up.isUp){
                    isMoved = true;
                    cursors.up.down = false;
                }
            }

            if(cursors.left.down){
                if(cursors.left.isUp){
                    isMoved = true;
                    cursors.left.down = false;
                }
            }

            if(cursors.right.down){
                if(cursors.right.isUp){
                    isMoved = true;
                    cursors.right.down = false;
                }
            }

            if (ball.x > 700) {
                MOVED_BALL = ball;
                // var y_pos;
                // ball.body.velocity.x = 0;
                // ball.body.velocity.y = 0;\

                // y_pos = position_y[0];
                // if(end_balls > 4){y_pos = position_y[1]}
                // if(end_balls > 9){y_pos = position_y[2]}
                // game.add.tween(ball.body).to({x: positions[end_balls], y: y_pos}, 1000, Phaser.Easing.Linear.None, true);
                end_balls++;
                // if(end_balls > 5){
                //     setTimeout(function () {
                //         console.log('fff',ball.y);
                //          if(ball.y < 530){
                //              ball.body.damping = 1;
                //              ball.body.y = 550;
                //              setTimeout(function () {
                //                  ball.body.damping = .1;
                //              },1000)
                //          }
                //     },2000);
                // }else if(end_balls > 10){
                //     setTimeout(function () {
                //         console.log('ffd',ball.y);
                //         // if(ball.y < 530){
                //         //     ball.body.damping = 1;
                //         //     ball.body.y = 550;
                //         //     setTimeout(function () {
                //         //         ball.body.damping = .1;
                //         //     },1000)
                //         // }
                //     },2000);
                // }else{
                //     setTimeout(function () {
                //         if(ball.y < 580){
                //             ball.body.damping = 1;
                //             ball.body.y = 605;
                //             setTimeout(function () {
                //                 ball.body.damping = .1;
                //             },1000)
                //         }
                //     },2000);
                // }
                // console.log(ball.y,ball.body.y);
                // potted_balls.push(ball);
                // potted_balls.push('ff');
                speakSound('expand');
                isMoved = true;
                if(potted_balls.length > 0) {
                    potted_balls.forEach(function (value) {
                        if(MOVED_BALL.overlap(value)){
                            // console.log('dddd');
                            if(isMoved){
                                speakSound('seefa_merge_1');
                                isMoved = false;
                            }
                        }else{
                            game.time.events.add(600, function() {
                                speakSound('seefa_merge_1');
                            });
                        }
                    });
                }
                potted_balls.push(MOVED_BALL);
                // console.log(potted_balls);
                // console.log(potted_balls);
                if (--ballsIndex >= 0) {
                    ball = balls[ballsIndex];
                    ball.body.moveUp(200);
                } else {
                    potted_balls = [];
                    for(var i in barriers) barriers[i].body.velocity.y = 0;

                    slot_1.inputEnabled = true;
                    slot_2.inputEnabled = true;
                    slot_3.inputEnabled = true;
                    // slot4.inputEnabled = true;

                    var slots = [slot1, slot2, slot3];
                    var slot_s = [slot_1, slot_2, slot_3];
                    for (var i in slot_s) {
                        slot_s[i].visible = false;
                    }
                    for (var i in slots) {
                        slots[i].visible = true;
                    }
                    for (var i in slots) {
                        game.add.tween(slots[i].scale).to({
                            x: 0.65,
                            y: 0.65 
                        }, 250, Phaser.Easing.Linear.None, true, 0, -1, true);
                    }
                    // leftButton.visible = false;
                    rightButton.visible = false;
                    upButton.visible = false;
                    gs = GS_MULTICHOICE_SELECT;
                }
            }
            break;
        case GS_MULTICHOICE_SELECT:
            break;
    }
}

function render() {
    // Debug info
    // game.debug.spriteInfo(ball, 32, 32);
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

var ShowRound = function (num) {
    blvels = game.add.sprite(game.world.centerX, game.world.centerY, 'level');
    blvels.anchor.set(0.5);
    LevelTxt = game.add.text(-70, -30,'Level:', {font: '50px Titan One', fill: '#fff'});
    LevelTxt.text = 'Level ' + num;
    blvels.addChild(LevelTxt);
    blvelsArr.push(blvels);
    blvelsArr.push(LevelTxt);
    game.time.events.add(3000, function() {
        blvels.visible = false;
        LevelTxt.visible = false;
        for(var bl in blvelsArr){
            blvelsArr[bl].visible = false;
        }
    });
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

    level = level - 1;
    levelCont = jsonData[level].stages.length - 1;
    round = jsonData[level].stages[levelCont].length - 1;

    gs = GS_INIT;
    rightButton.visible = true;
    upButton.visible = true;

    ShowRound(jsonData[level].level);
}

function enableButtons (bool) {
    prevButton.inputEnabled = bool;
    nextButton.inputEnabled = bool;
    rightButton.inputEnabled = bool;
    upButton.inputEnabled = bool;
} 

function hasPurchased () {
    var token = window.localStorage.getItem("purchaseToken");
    
    return token != null;
}