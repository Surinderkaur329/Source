var play = function(game) {};
var NUM = 0;
var plank_5;
var LAST_BALL = false;
var MOVED_BALL  = null;
var MOVEDBALL  = null;
var MOVED_BALL2  = null;
var ALL_MOVED_BALL  = [];
var MOVE_TO_NEXT_GAME = true;
var COLLISIONS = [];
var start = true;
var trials = 0;
var moved = false;
var left, up, right, down;
var other_balls = [];
var leftTween, upTween, rightTween, downTween;

var bgVolume = 0.5;
var scores = 100;
var skip_button;
var returnUrl;
var showLevel = 0;

var purchasePopup = null
var nextButton = null;
var prevButton = null;
var leftButton = null;
var rightButton = null;
var downButton = null;
var upButton = null;

function exitGame(score) {
    if (returnUrl) {
        var gameResult = {score: score};
        stores.set("extGameResult", gameResult);
        window.location.replace(returnUrl);
    }
}

play.prototype = {
    // current moving ball
    currentBall: 0,
    // Balls moved
    moved: 0,
    // balls
    balls: [],
    planks : [],
    // Obstacles
    obstacles: [],
    //nav buttons
    leftButton: null,
    rightButton: null,
    upButton: null,
    // direction arrows
    arrowOut: null,
    arrowIn: null,
    // Number group
    numberGroup: null,
    // If animate
    animateItems: false,
    // Barrier block
    barrierBlock: null,
    onResume: onResume,
    enableButtons: enableButtons,

    init: function() {
        this.balls = [];
        this.planks = [];
        this.obstacles = [];
        this.currentBall = 0;
        this.moved = 0;
        this.animateItems = false;
    },
    preload: function() {
        game.load.physics('physicsData', 'assets/json/sprites1.json');

        var extGameData = stores.get("extGameData");
        if (extGameData) {
            returnUrl = extGameData.returnUrl;
            stores.remove("extGameData");
        }

    },
    create: function() {
        // Background
        addImage(0, 0, 'background.png');

        backgroundMusic = game.add.audio('song');
        backgroundMusic.volume = bgVolume;
        backgroundMusic.loopFull();

        window.localStorage.removeItem("gameEnded");

        // Left and right docks
        var plank = addImage(144.50, 430.50, 'plank1.png');
        game.physics.p2.enable(plank);
        plank.body.static = true;
        this.planks.push(plank);

        plank = addImage(21.5, 363, 'plank2.png');
        game.physics.p2.enable(plank);
        plank.body.static = true;
        this.planks.push(plank);

        plank = addImage(640, 696.50, 'plank3.png');
        game.physics.p2.enable(plank);
        plank.body.static = true;
        this.planks.push(plank);

        plank = addImage(78.50 , 683.50, 'plank4.png');
        game.physics.p2.enable(plank);
        plank.body.static = true;
        this.planks.push(plank);

        plank_5 = addImage(1194.50 , 681.50, 'plank5.png');
        game.physics.p2.enable(plank_5);
        plank_5.body.static = true;
        this.planks.push(plank);

        plank = addImage(1257, 366.00, 'plank6.png');
        game.physics.p2.enable(plank);
        plank.body.static = true;
        this.planks.push(plank);

        plank = addImage(1137, 430.50, 'plank7.png');
        game.physics.p2.enable(plank);
        plank.body.static = true;
        this.planks.push(plank);

        plank = addImage(1183.50, 54, 'plank8.png');
        game.physics.p2.enable(plank);
        plank.body.static = true;
        this.planks.push(plank);

        plank = addImage(640, 25, 'plank9.png');
        game.physics.p2.enable(plank);
        plank.body.static = true;
        this.planks.push(plank);

        plank = addImage(93.50, 55.50, 'plank10.png');
        game.physics.p2.enable(plank);
        plank.body.static = true;
        this.planks.push(plank);


        // LevelText = game.add.text(game.world.centerX + 450, 0,'Level:', {font: '32px Arial', fill: '#000'});
        // LevelText.text = 'Level: ' + levelsJson[level].ShowedLevel;
        // LevelText.visible = false;



        levelData = levelsJson[level];
        NUM = levelData.balls;

        // Barrier block
        // this.barrierBlock = addImage(-241, 212, 'plank2.png');
        // this.barrierBlock.alpha = 0;
        // game.physics.p2.enable(this.barrierBlock);
        // this.barrierBlock.body.setZeroVelocity();
        // this.barrierBlock.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;

        // Direction arrows
        this.arrowOut = addImage(135, 95, 'green_arrow.png');
        game.add.tween(this.arrowOut).to({
            x: 165
        }, 750, Phaser.Easing.Linear.None, true, 0, -1, true);

        this.arrowIn = addImage(990, 95, 'green_arrow.png');
        game.add.tween(this.arrowIn).to({
            x: 1020
        }, 750, Phaser.Easing.Linear.None, true, 0, -1, true);
        this.arrowIn.visible = false;

        for (var i = 0; i < NUM; i++) {
            this.balls.push(addImage(78.50, 80 + i * 120, 'ball' + (i + 1) + '.png'));
            game.physics.p2.enable(this.balls[i]);
            this.balls[i].body.setCircle(this.balls[i].width / 2);
            game.time.events.add(1500, function() {
                speakSound('seefa_merge_1');
            },this);
            if(NUM > 1){
                game.time.events.add(2000, function() {
                    speakSound('seefa_merge_4');
                },this);
            }
        }
        // Balls
        if(levelsJson[level].other_balls && levelsJson[level].other_balls > 0){
            var b2 = addImage(78.50, 620, 'ball_.png');
            game.physics.p2.enable(b2);
            b2.body.damping = .6;
            other_balls.push(b2);
             var b = addImage(29, 570, 'ball_'+levelsJson[level].other_balls+'.png');
            b.scale.setTo(1.4);
            other_balls.push(b);
            if(NUM > 0 && NUM < 3){
                segame.time.events.add(1500, function() {
                    speakSound('seefa_merge_1');
                },this);
            }
            if(NUM > 1 && NUM < 3){
                game.time.events.add(2000, function() {
                    speakSound('seefa_merge_4');
                },this);
            }
            if(NUM > 3){
                game.time.events.add(1500, function() {
                    speakSound('seefa_merge_4');
                },this);
            }
        }

        // Obstacles

        for (var i in levelData.items) {
            var obData = levelData.items[i];
            var ob = addImage(obData.position.x, obData.position.y, obData.image);
            ob.data = obData;
            game.physics.p2.enable(ob,false);
            if(obData.child === true){
                ob.body.clearShapes();
                ob.body.loadPolygon('physicsData', obData.name);
                // poly = new Phaser.Polygon();
                // poly.setTo([ new Phaser.Point(68, 95), new Phaser.Point(5, 10),new Phaser.Point(22, 0), new Phaser.Point(83, 80)]);
                // graphics = game.add.graphics(obData.position.x, obData.position.y);
                // graphics.beginFill(0xFF33ff);
                // graphics.drawPolygon(poly.points);
                // graphics.endFill();
                //
            }
            this.obstacles.push(ob);
            switch (obData.type) {
                case 'gear':
                    ob.body.static = true;
                    break;
                case 'barrier':
                    if (obData.up_down_motion) {
                        ob.body.setZeroVelocity();
                        ob.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
                        ob.body.fixedRotation = true;
                    }else if (obData.left_right_motion) {
                        ob.body.setZeroVelocity();
                        ob.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
                        ob.body.fixedRotation = true;
                    } else {
                        ob.body.static = true;
                    }
                    break;
                case 'pendulum':
                    if (obData.anchor.x) ob.anchor.x = obData.anchor.x;
                    if (obData.anchor.y) ob.anchor.y = obData.anchor.y;
                    ob.body.setRectangle(obData.rect.w, obData.rect.h, obData.rect.x, obData.rect.y);
                    ob.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
                    ob.body.angle = obData.swing_motion.angle;
                    break;
            }
            if (obData.destroy_on_collision === true) {
                COLLISIONS.push(ob);
                for (var i in this.balls) {
                    this.balls[i].body.createBodyCallback(ob, function(ball) {
                        if(levelsJson[level].level > 11){
                            speakSound('pop');
                            ball.sprite.visible = false;
                            ball.destroy();
                            this.currentBall++;
                            // console.log(this.currentBall,NUM);
                            moved = true;
                            if (this.currentBall === NUM) {
                                if(levelsJson[level].total_balls > 5 && levelsJson[level].level !== 13 &&  start === true){
                                    NUM = NUM + levelsJson[level].other_balls;

                                    // console.log(ALL_MOVED_BALL);

                                    if(this.moved > 0) {
                                        start = false;
                                        if ((this.moved + levelsJson[level].other_balls) > 6) {
                                            var movedBalls = this.moved;
                                            for(var ball in ALL_MOVED_BALL){
                                                ALL_MOVED_BALL[ball].body.damping = 1;
                                                game.add.tween(ALL_MOVED_BALL[ball].body).to({
                                                    y: 624
                                                }, 750, Phaser.Easing.Linear.None, true);
                                            }
                                            game.time.events.add(700, function() {
                                                for(var ball in ALL_MOVED_BALL){
                                                    ALL_MOVED_BALL[ball].kill()
                                                }
                                                var b = addImage(1200, 624, 'ball_'+movedBalls+'.png');
                                                b.scale.setTo(1.4);
                                                speakSound('seefa_merge_4');
                                                game.physics.p2.enable(b);
                                                b.body.setCircle(b.width / 2);
                                                game.time.events.add(3000, function() {
                                                    b.kill();
                                                    var b2 = addImage(1200, 624, 'ball_.png');
                                                    game.physics.p2.enable(b2);
                                                    b2.body.damping = .6;
                                                    addImage(1156, 567, 'ball_'+movedBalls+'.png').scale.setTo(1.4);
                                                    speakSound('seefa_merge_4');
                                                },this)
                                            },this);
                                        }
                                    }else {
                                        start = false;
                                    }

                                    var bb = [];
                                    var _x,_y;
                                    if(other_balls){
                                        other_balls.forEach(function (value) {
                                            _x = value.x;
                                            _y = value.y;
                                        });
                                    }
                                    for (var i = 0; i < levelsJson[level].other_balls; i++) {
                                        bb.push(addImage(78.50, _y + i, 'ball' + (i + 1) + '.png'));
                                        game.physics.p2.enable(bb[i]);
                                        bb[i].body.damping = 1;
                                        bb[i].body.setCircle(bb[i].width / 2);
                                        if(COLLISIONS.length > 0){
                                            for(var c in COLLISIONS){
                                                bb[i].body.createBodyCallback(COLLISIONS[c], function(ball) {
                                                    ball.sprite.visible = false;
                                                    speakSound('pop');
                                                    ball.destroy();
                                                    this.currentBall++;
                                                    if (this.currentBall === NUM) {
                                                        if(levelsJson[level].total_balls <= 5 || levelsJson[level].level === 13 || levelsJson[level].level === 7 || start === false){
                                                            if((this.moved < NUM) && trials < 2){
                                                                trials++;
                                                                NUM = levelsJson[level].balls;
                                                                start = true;
                                                                ALL_MOVED_BALL  = [];
                                                                COLLISIONS = [];
                                                                LAST_BALL = false;
                                                                MOVED_BALL  = null;
                                                                MOVED_BALL2  = null;
                                                                game.time.events.add(1000, function() {
                                                                    backgroundMusic.pause();
                                                                    game.state.start('play');
                                                                },this);
                                                            }else{
                                                                displayNums(this.moved,this.numberGroup,levelData);
                                                            }
                                                        }
                                                    }
                                                }, this);
                                            }
                                        }
                                    }
                                    setTimeout(function () {
                                        // for(var i in bb){
                                        //     bb[i].body.damping = 0.7;
                                        //     if(levelsJson[level].level > 11){
                                        //         bb[i].body.damping = 0.5;
                                        //     }
                                        // }
                                    },500);
                                    other_balls.forEach(function (value) {
                                        value.destroy();
                                    });
                                    this.balls = this.balls.concat(bb);

                                }
                                else{
                                    if((this.moved < NUM) && trials < 2){
                                        trials++;
                                        // console.log('trials', trials);
                                        NUM = levelsJson[level].balls;
                                        ALL_MOVED_BALL  = [];
                                        COLLISIONS = [];
                                        LAST_BALL = false;
                                        MOVED_BALL  = null;
                                        MOVED_BALL2  = null;
                                        start = true;
                                        game.time.events.add(1000, function() {
                                            backgroundMusic.pause();
                                            game.state.start('play');
                                        },this);
                                    }else{
                                        displayNums(this.moved,this.numberGroup,levelData);
                                    }
                                }
                            }
                        }
                    }, this);
                }
            }else{
                for (var i in this.balls) {
                    this.balls[i].body.createBodyCallback(ob, function(ball) {
                        speakSound('blip');
                    });
                }
            }

            // for (var i in this.balls) {
            //     for (var j in this.planks) {
            //         this.balls[i].body.createBodyCallback(this.planks[j], function (ball) {
            //              speakSound('blip');
            //         });
            //     }
            // }
        }

        // Nav Buttons
        this.leftButton = addButton(150, 600, 'left_button.png', '', this);
        this.leftButton.input.useHandCursor = true;
        game.physics.p2.enable(this.leftButton);
        this.leftButton.anchor.setTo(0.5, 0.5);
        left = this.leftButton;
        leftTween = game.add.tween(left.scale).to({
            x: 1.15, y: 1.15
        }, 1500, Phaser.Easing.Linear.None, true, 0, -1, true);
        leftButton = this.leftButton;

        this.upButton = addButton(1140, 487, 'up_button.png', '', this);
        this.upButton.input.useHandCursor = true;
        this.upButton.anchor.setTo(0.5, 0.5);
        game.physics.p2.enable(this.upButton);
        up = this.upButton;
        game.time.events.add(500, function() {
           upTween = game.add.tween(up.scale).to({
                x: 1.15, y: 1.15
            }, 1500, Phaser.Easing.Linear.None, true, 0, -1, true);
        },this);
        upButton = this.upButton;

        this.rightButton = addButton(1140, 600, 'right_button.png', '', this);
        this.rightButton.input.useHandCursor = true;
        this.rightButton.anchor.setTo(0.5, 0.5);
        game.physics.p2.enable(this.rightButton);
        right = this.rightButton;
        game.time.events.add(1000, function() {
           rightTween = game.add.tween(right.scale).to({
                x: 1.15, y: 1.15
            }, 1500, Phaser.Easing.Linear.None, true, 0, -1, true);
        },this);
        rightButton = this.rightButton;

        // this.downButton = addButton(150, 714, 'down_button.png', '', this);
        // this.downButton.y -= this.downButton.height;
        // this.downButton.input.useHandCursor = true;
        // this.downButton.anchor.setTo(0.5, 0.5);
        // down = this.downButton;
        // setTimeout(function () {
        //    downTween = game.add.tween(down.scale).to({
        //         x: 1.15, y: 1.15
        //     }, 1500, Phaser.Easing.Linear.None, true, 0, -1, true);
        // },1500);


        this.numberGroup = game.add.group();
        this.numberGroup.width = 546;
        this.numberGroup.height = 370;
        this.numberGroup.scale.setTo(0.8);
        this.numberGroup.x = 379;
        this.numberGroup.y = 285;

        var g = getGraphics(0.8, 0x000000, 0, 0, 546, 190);
        this.numberGroup.add(g);

        this.numberGroup.visible = false;

        // Game collision border

        gs = GS_INIT;
        if(level === 0 || level === 6 || level === 12){
            showLevel++;
            ShowRound();
        }

        // skip_button = game.add.text(1200, 10, "Exit", {
        //     font: "bold 30px Arial black",
        //     stroke: "#FF0000",
        //     strokeThickness: 4,
        //     align: "center",
        //     fill: '#FFFFFF'
        // });
        skip_button = game.add.sprite(1205, 5, 'homeBtn');
        skip_button.scale.setTo(0.7);
        skip_button.inputEnabled = true;
        skip_button.input.useHandCursor = true;
        skip_button.events.onInputUp.add(
            function up(item) {
                exitGame(scores);
            }, this);

        move_ = true;
        setInterval(function () {
            move_ = true;
        }, 1000);

        nextButton = game.add.sprite(game.width - 50, game.world.centerY, 'arrow-right.png');
        nextButton.anchor.setTo(0.5);
        nextButton.scale.setTo(0.2);
        nextButton.inputEnabled = true;
        nextButton.input.useHandCursor = true;
        nextButton.events.onInputUp.add( function () {
            if(level < levelsJson.length - 1) {

                if (levelsJson[level].level + 1 >= 12 && !hasPurchased ()) {
                    // console.log ("lock")
                    showLevelLock ();
                } else {
                    start = true;
                    ALL_MOVED_BALL  = [];
                    COLLISIONS = [];
                    LAST_BALL = false;
                    MOVED_BALL  = null;
                    MOVED_BALL2  = null;
                    trials = 0;
                    level++;
                    NUM = levelsJson[level].balls;
                    backgroundMusic.pause();
                    game.state.start('play');
                    gs = GS_GAME_OVER;
                }
            }
        }, this);

        prevButton = game.add.sprite(20, game.world.centerY, 'arrow-left.png');
        prevButton.anchor.setTo(0.5);
        prevButton.scale.setTo(0.2);
        prevButton.inputEnabled = true;
        prevButton.input.useHandCursor = true;
        prevButton.events.onInputUp.add( function () {
            if(level > 0) {
               start = true;
               ALL_MOVED_BALL  = [];
               COLLISIONS = [];
               LAST_BALL = false;
               MOVED_BALL  = null;
               MOVED_BALL2  = null;
               trials = 0;
               level--;
               console.log(levelsJson.length, level); 
               NUM = levelsJson[level].balls;
               backgroundMusic.pause();
               game.state.start('play');
               gs = GS_GAME_OVER;
            }
        }, this);
  
    },
    update: function() {
        if(levelsJson[level].level > 1){
            this.arrowOut.visible = false;
        }
        switch (gs) {
            case GS_NONE:
                break;
            case GS_INIT:
                gs = GS_PLAY;
                break;
            case GS_PLAY:
                if (this.animateItems) {
                    for (var i in this.obstacles) {
                        var ob = this.obstacles[i];
                        switch (ob.data.type) {
                            case 'gear':
                                ob.body.angle += ob.data.speed;
                                break;
                            case 'barrier':
                                if (ob.data.up_down_motion) {
                                    if (ob.body.velocity.y === 0) ob.body.velocity.y = ob.data.up_down_motion.speed;
                                    if (ob.body.y >= ob.data.up_down_motion.y_bottom) {
                                        ob.body.moveUp(ob.data.up_down_motion.speed);
                                    } else if (ob.body.y <= ob.data.up_down_motion.y_top) {
                                        ob.body.moveDown(ob.data.up_down_motion.speed);
                                    }
                                }else if (ob.data.left_right_motion) {
                                    if (ob.body.velocity.x === 0) ob.body.velocity.x = ob.data.left_right_motion.speed;
                                    if (ob.body.x >= ob.data.left_right_motion.x_right) {
                                        ob.body.moveLeft(ob.data.left_right_motion.speed);
                                    }else if (ob.body.x <= ob.data.left_right_motion.x_left) {
                                        ob.body.moveRight(ob.data.left_right_motion.speed);
                                    }
                                }
                                break;
                            case 'pendulum':
                                if (ob.body.angle <= -ob.data.angles.left) {
                                    ob.body.rotateRight(ob.data.swing_motion.speed);
                                } else if (ob.body.angle >= ob.data.angles.right) {
                                    ob.body.rotateLeft(ob.data.swing_motion.speed);
                                }
                                break;
                        }
                    }
                }

                if (this.currentBall === 0 && this.balls[this.currentBall].body.x > 200) {
                    this.animateItems = true;
                    if(levelsJson[level].level === 1){
                        this.arrowIn.visible = true;
                    }
                    this.arrowOut.visible = false;
                    upTween.pause();
                    // downTween.pause();
                    leftTween.pause();
                    rightTween.pause();

                } else if (this.moved > 0) {
                    this.arrowIn.visible = false;
                }

                // if(this.balls[this.currentBall].body.x > 300) {
                //     this.barrierBlock.body.x = 186;
                // }

                game.world.bringToTop(this.upButton);
                game.world.bringToTop(this.leftButton);
                game.world.bringToTop(this.rightButton);

                //SPEED UP BALL WHEN IT IS IN THE RIGHT CONTAINER
                if(this.balls[this.currentBall] && 
                    this.balls[this.currentBall].body.x > 1180) {
                        MOVEDBALL = this.balls[this.currentBall];
                    // this.balls[this.currentBall].body.velocity.y = 500;
                }
                if(MOVEDBALL && MOVEDBALL.body && MOVEDBALL.body.velocity){
                    MOVEDBALL.body.velocity.y = 500;
                }          

                if (this.currentBall < NUM) {

                    up.events.onInputDown.add(function () {
                        StartMovement('up');
                    },this);
                    // down.events.onInputDown.add(function () {
                    //     StartMovement('down');
                    // },this);
                    left.events.onInputDown.add(function () {
                        StartMovement('left');
                    },this);
                    right.events.onInputDown.add(function () {
                        StartMovement('right');
                    },this);

                    up.events.onInputUp.add( StopMovement, this);
                    // down.events.onInputUp.add( StopMovement, this);
                    left.events.onInputUp.add( StopMovement, this);
                    right.events.onInputUp.add( StopMovement, this);

                    if (cursors.up.isDown) {
                        this.balls[this.currentBall].body.damping = 0.7;
                        if(levelsJson[level].level > 11){
                            this.balls[this.currentBall].body.damping = 0.5;
                        }
                        this.balls[this.currentBall].body.velocity.y = -120;
                    }
                    // else if (cursors.down.isDown) {
                    //     this.balls[this.currentBall].body.velocity.y = 120;
                    // }
                    else if (cursors.left.isDown) {
                        this.balls[this.currentBall].body.velocity.x = -120;
                    } else if (cursors.right.isDown) {
                        this.balls[this.currentBall].body.velocity.x = 120;
                    }
                    //

                    LAST_BALL = (NUM - this.currentBall) === 1;
                    if(LAST_BALL){
                        MOVE_TO_NEXT_GAME = true;
                        var last_ball_potted = plank_5.overlap(this.balls[this.currentBall]);
                        if(levelsJson[level].level !== 1){
                            if(MOVED_BALL){
                                last_ball_potted = MOVED_BALL.overlap(this.balls[this.currentBall]);
                            }
                        }
                    }
                    if(plank_5.overlap(this.balls[this.currentBall]) || (MOVED_BALL && plank_5.overlap(MOVED_BALL))){
                        if(moved){
                            speakSound('blip');
                            moved = false;
                        }
                    }
                    if(MOVED_BALL && MOVED_BALL2 && MOVED_BALL.overlap(MOVED_BALL2)) {
                        if(moved){
                            game.time.events.add(100, function() {
                                speakSound('seefa_merge_1');
                            }, this);
                            moved = false;
                        }
                    }

                    if ((!LAST_BALL && this.balls[this.currentBall].body.x > 1180) || 
                    (LAST_BALL && this.balls[this.currentBall].body.x > 1180 && last_ball_potted)) {
                        speakSound('expand');
                        game.time.events.add(1500, function() {
                            MOVE_TO_NEXT_GAME = true;
                        }, this);
                        MOVED_BALL2 = MOVED_BALL;
                        MOVED_BALL = this.balls[this.currentBall];


                        ALL_MOVED_BALL.push(this.balls[this.currentBall]);
                        if(MOVE_TO_NEXT_GAME){
                            this.moved++;
                            this.currentBall++;
                            // console.log(this.currentBall,NUM);
                            moved = true;
                            if (this.currentBall === NUM) {
                                if(levelsJson[level].total_balls > 5 && levelsJson[level].level !== 7 && levelsJson[level].level !== 13 && start === true){
                                    NUM = NUM + levelsJson[level].other_balls;

                                    //
                                    start = false;
                                    if((this.moved + levelsJson[level].other_balls) > 6){
                                        for(var ball in ALL_MOVED_BALL){
                                            ALL_MOVED_BALL[ball].body.damping = 1;
                                            game.add.tween(ALL_MOVED_BALL[ball].body).to({
                                                y: 624
                                            }, 750, Phaser.Easing.Linear.None, true);
                                            // this.balls[ball].body.y = 624;
                                        }
                                        game.time.events.add(700, function() {
                                            for(var ball in ALL_MOVED_BALL){
                                                ALL_MOVED_BALL[ball].kill()
                                            }
                                            var b = addImage(1200, 624, 'ball_'+movedBalls+'.png');
                                            b.scale.setTo(1.4);
                                            game.physics.p2.enable(b);
                                            speakSound('seefa_merge_4');
                                            b.body.setCircle(b.width / 2);
                                            game.time.events.add(3000, function() {
                                                b.kill();
                                                var b2 = addImage(1200, 624, 'ball_.png');
                                                game.physics.p2.enable(b2);
                                                b2.body.damping = .6;
                                                addImage(1156, 567, 'ball_'+movedBalls+'.png').scale.setTo(1.4);
                                                speakSound('seefa_merge_4');
                                            },this)    
                                        }, this);
                                        
                                    }


                                    //
                                    var bb = [];
                                    var _x,_y;
                                    other_balls.forEach(function (value) {
                                        _x = value.x;
                                        _y = value.y;
                                    });
                                    for (var i = 0; i < levelsJson[level].other_balls; i++) {
                                        bb.push(addImage(78.50, _y + i, 'ball' + (i + 1) + '.png'));
                                        game.physics.p2.enable(bb[i]);
                                        bb[i].body.damping = 1;
                                        bb[i].body.setCircle(bb[i].width / 2);

                                        if(levelsJson[level].level > 11){
                                            if(COLLISIONS.length > 0){
                                                for(var c in COLLISIONS){
                                                    bb[i].body.createBodyCallback(COLLISIONS[c], function(ball) {
                                                        ball.sprite.visible = false;
                                                        speakSound('pop');
                                                        ball.destroy();
                                                        this.currentBall++;
                                                        if (this.currentBall === NUM) {
                                                            if(levelsJson[level].total_balls <= 5 || levelsJson[level].level === 13 || levelsJson[level].level === 7 || start === false){
                                                                if((this.moved < NUM) && trials < 2){
                                                                    trials++;
                                                                    NUM = levelsJson[level].balls;
                                                                    ALL_MOVED_BALL  = [];
                                                                    COLLISIONS = [];
                                                                    LAST_BALL = false;
                                                                    MOVED_BALL  = null;
                                                                    MOVED_BALL2  = null;
                                                                    start = true;
                                                                    game.time.events.add(1000, function() {
                                                                        backgroundMusic.pause();
                                                                        game.state.start('play');
                                                                    },this);
                                                                }else{
                                                                    displayNums(this.moved,this.numberGroup,levelData);
                                                                }
                                                            }
                                                        }
                                                    }, this);
                                                }
                                            }
                                            // bb[i].body.createBodyCallback(ob, function(ball) {
                                            //     ball.sprite.destroy();
                                            //     this.currentBall++;
                                            //
                                            // }, this);
                                        }
                                    }
                                    setTimeout(function () {
                                        // for(var i in bb){
                                        //     bb[i].body.damping = 0.7;
                                        //     if(levelsJson[level].level > 11){
                                        //         bb[i].body.damping = 0.5;
                                        //     }
                                        // }
                                    },500);
                                    this.balls = this.balls.concat(bb);
                                    other_balls.forEach(function (value) {
                                        value.destroy();
                                    });
                                    var movedBalls = this.moved;

                                } else{
                                    if((this.moved < NUM) && trials < 2){
                                        trials++;
                                        NUM = levelsJson[level].balls;
                                        start = true;
                                        ALL_MOVED_BALL  = [];
                                        COLLISIONS = [];
                                        LAST_BALL = false;
                                        MOVED_BALL  = null;
                                        MOVED_BALL2  = null;
                                        game.time.events.add(1000, function() {
                                            backgroundMusic.pause();
                                            game.state.start('play');
                                        },this);
                                    }else{
                                        displayNums(this.moved,this.numberGroup,levelData);
                                    }
                                }
                            }
                        }
                    }


                }
                break;
            case GS_GAME_OVER:
                for (var i in this.balls) {
                    // game.add.tween(this.balls[i].scale).to({
                    //     x: 0.9,
                    //     y: 0.9
                    // }, 750, Phaser.Easing.Linear.None, true, 0, -1, true);
                }
                this.leftButton.visible = this.upButton.visible = this.rightButton.visible;
                for (var i in this.obstacles) {
                    var ob = this.obstacles[i];
                    switch (ob.data.type) {
                        case 'barrier':
                            if (ob.data.up_down_motion || ob.data.left_right_motion) ob.body.setZeroVelocity();
                            break;
                        case 'pendulum':
                            ob.body.setZeroRotation();
                            break;
                    }
                }
                var self = this;
                 game.time.events.add(1000, function() {
                    self.numberGroup.visible = true;
                 }, this);
                gs = GS_NONE;
                break;
            case GS_DESTROY:
                break;
        }

    },
    render: function() {

    }
};

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

function displayNums(moved,numberGroup,levelData) {
    game.time.events.add(1000, function() {
        // speakSound('expand');
        start = true;
        ALL_MOVED_BALL  = [];
        COLLISIONS = [];
        LAST_BALL = false;
        MOVED_BALL  = null;
        MOVED_BALL2  = null;
        trials = 0;

        if (levelsJson[level].level + 1 >= 12 && !hasPurchased ()) {
            showLevelLock ();
        } else {
            if (levelsJson[level].type === 'sub'){
                // console.log('level: ' + level);
                level++;
                
                NUM = levelsJson[level].balls;
                backgroundMusic.pause();
                game.state.start('play');
            }
            else if(levelsJson[level].type === 'main'){
                var nums = shuffleArray([0,1,2,3,4,5,6,7,8,9,10]);
                var nArr = [moved];
                var wa = 0;
                for(var i = 0; i < nums.length; i++){
                    if(wa < 2){
                        if(nums[i] !== moved){
                            nArr.push(nums[i]);
                            wa = wa + 1;
                        }
                    }
                }
                var NewArr = [""];
                if(levelsJson[level].level > 11){
                    NewArr =  NewArr.concat(shuffleArray(nArr));
                }else{
                    NewArr = levelsJson[level].numbers;
                }
                var x = 10,y = 10;
                for (var i in NewArr) {
                    var button = addButton(x, y, NewArr[i] + '.png', function(button) {
                        ShowBtn(button,moved,numberGroup,levelData);
                    }, this);
                    button.input.useHandCursor = true;
                    button.tag = NewArr[i];
    
                    x = 10 + (i > 3 ? i - 3 : i) * 180;
                    if (i === 3) {
                        x = 10;
                        y = 20 + button.height;
                    }
    
                    numberGroup.add(button);
                }
            }
        }

        
        gs = GS_GAME_OVER;
    },this)
}

function ShowBtn(button,moved,numberGroup,levelData) {
    if (moved === button.tag) {
        speakSound(moved.toString()); //'TaDa'
        game.add.tween(button).to({
            y: button.y - 10
        }, 500, Phaser.Easing.Quadratic.Out, true, 0, -1, true);

        var stari = game.add.emitter(button.x + 0.5 * button.width, button.y + 0.5 * button.height);
        stari.width = button.width;
        stari.makeParticles('stari.png');
        stari.gravity = 5;
        stari.setScale(1);
        numberGroup.add(stari);

        var red_stari = game.add.emitter(button.x + 0.5 * button.width, button.y + 0.5 * button.height);
        red_stari.width = button.width;
        red_stari.makeParticles('red_stari.png');
        red_stari.gravity = 5;
        red_stari.setScale(1);
        numberGroup.add(red_stari);

        stari.start(false, 1000, 100);
        red_stari.start(false, 1000, 100);

        game.time.events.add(4000, function() {
            numberGroup.visible = false;
            console.log('level: ' + level);
            level++;
            
            if (level < levelsJson.length) {
                NUM = levelData.balls;
                backgroundMusic.pause();
                game.state.start('play');
            } else {
                getGraphics(0.2, 0x000000, 0, 0, 1280, 720);
                speakSound('Cheering');
                var staris = ['stari.png', 'red_stari.png'];
                window.localStorage.setItem("gameEnded", "true");
                var emitters = [];
                for (var i in staris) {
                    var emitter = game.add.emitter(game.world.centerX, 200, 200);
                    //	This emitter will have a width of 800px, so a particle can emit from anywhere in the range emitter.x += emitter.width / 2
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

                //	false means don't explode all the sprites at once, but instead release at a rate of one particle per 100ms
                //	The 5000 value is the lifespan of each particle before it's killed
                for (var i in emitters) emitters[i].start(false, 5000, 100);
            }
        }, this);
    } else {
        speakSound('incorrect');
        button.loadTexture(button.tag + '_g.png');
    }
}

function StartMovement(type) {
    if(!move_) return;
    upTween.pause();
    // downTween.pause();
    leftTween.pause();
    rightTween.pause();
    if(type === 'up'){
        // if(!isPhoneGap()){
            game.add.tween(up.scale).to( { x: 1.3,y:1.3}, 100, "Linear", true);
        // }
        console.log('up')
        cursors.up.isDown = true;
    }
    // else if (type === 'down'){
    //     game.add.tween(down.scale).to( { x: 1.3,y:1.3}, 100, "Linear", true);
    //     cursors.down.isDown = true;
    // }
    else if (type === 'right'){
        // if(!isPhoneGap()){
          game.add.tween(right.scale).to( { x: 1.3,y:1.3}, 100, "Linear", true);
        // }
        cursors.right.isDown = true;
    }else if (type === 'left'){
        // if(!isPhoneGap()){
           game.add.tween(left.scale).to( { x: 1.3,y:1.3}, 100, "Linear", true);
        // }
        
        cursors.left.isDown = true;
    }
    move_ = false;
}

function StopMovement(btn) {
    upTween.resume();
    leftTween.resume();
    rightTween.resume();
    // downTween.resume();
    cursors.up.isDown = cursors.left.isDown = cursors.right.isDown = false;
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
    },100);
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

    start = true;
    ALL_MOVED_BALL  = [];
    COLLISIONS = [];
    LAST_BALL = false;
    MOVED_BALL  = null;
    MOVED_BALL2  = null;
    trials = 0;
    NUM = levelsJson[level].balls;
    backgroundMusic.pause();
    game.state.start('play');
    gs = GS_GAME_OVER;
}

function enableButtons (bool) {
    prevButton.inputEnabled = bool;
    nextButton.inputEnabled = bool;
    rightButton.inputEnabled = bool;
    leftButton.inputEnabled = bool;
    upButton.inputEnabled = bool;
} 

function hasPurchased () {
    var token = window.localStorage.getItem("purchaseToken");
    
    return token != null;
}