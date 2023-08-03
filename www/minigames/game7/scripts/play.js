var play = function(game) {};

var bgVolume = 0;

play.prototype = {
    create: create,
    update: update,
    render: render,
    showLevel: showLevel,
    showRound, showRound,
    hideRound: hideRound,
    showLevelLock: showLevelLock,
    onResume: onResume,
    enableButtons: enableButtons
};

function create() {
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.restitution = 0.9;
    game.physics.p2.world.defaultContactMaterial.friction = 0.5;
    game.physics.p2.world.setGlobalStiffness(1e5);

    cursors = game.input.keyboard.createCursorKeys();
    
    window.localStorage.removeItem("gameEnded");

    pool_sprite = game.add.sprite(0, 0, '');
    pool_sprite.loadTexture('background');

    backgroundMusic = game.add.audio('song');
    backgroundMusic.loopFull();
    backgroundMusic.volume = bgVolume;

    black_ball = game.add.sprite(game.world.centerX, game.world.centerY, 'black_ball');
    black_ball.anchor.set(0.5,0.5);

    aim_rule = game.add.sprite(0, 0, 'aim_rule');
    aim_rule.scale.set(1, 0.3);
    aim_rule.anchor.setTo(0, 0.5);
    aim_rule.visible = false;

    assist_rule = game.add.sprite(550, 0, 'assist_rule');
    assist_rule.scale.set(1, 0.3);
    assist_rule.anchor.setTo(0, 0.5);
    aim_rule.addChild(assist_rule);
    assist_rule.inputEnabled = true;

    glow = game.add.sprite('', '', 'line1_glow');
    glow.animations.add('glow');
    glow.animations.play('glow', 5, true);
    glow.visible = false;

    cue_stick = game.add.sprite(0, 0, 'cue_stick');
    cue_stick.inputEnabled = true;


    pivot1 = game.add.sprite('', '', 'pivot');
    pivot1.anchor.set(0.5);
    pivot1.inputEnabled = true;

    pivot2 = game.add.sprite('', '', 'pivot');
    pivot2.anchor.set(0.5);
    pivot2.inputEnabled = true;

    piv1 = game.add.sprite('', '', 'pivot');
    piv1.anchor.set(0.5);
    piv1.inputEnabled = true;

    piv2 = game.add.sprite('', '', 'pivot');
    piv2.anchor.set(0.5);
    piv2.inputEnabled = true;

    piv3 = game.add.sprite('', '', 'pivot');
    piv3.anchor.set(0.5);
    piv3.inputEnabled = true;
    piv3.input.enableDrag(true);

    piv4 = game.add.sprite('', '', 'pivot');
    piv4.anchor.set(0.5);
    piv4.inputEnabled = true;
    piv4.input.enableDrag(true);



    //  Create collision groups for game bodies
    poolTableCollisionGroup = game.physics.p2.createCollisionGroup();
    cueStickCollisionGroup = game.physics.p2.createCollisionGroup();
//                    aimRuleCollisionGroup = game.physics.p2.createCollisionGroup();
    blackBallCollisionGroup = game.physics.p2.createCollisionGroup();
    otherBallsCollision1 = game.physics.p2.createCollisionGroup();
    otherBallsCollision2 = game.physics.p2.createCollisionGroup();
    otherBallsCollision3 = game.physics.p2.createCollisionGroup();
    otherBallsCollision4 = game.physics.p2.createCollisionGroup();
    otherBallsCollision5 = game.physics.p2.createCollisionGroup();
    otherBallsCollision6 = game.physics.p2.createCollisionGroup();
    otherBallsCollision7 = game.physics.p2.createCollisionGroup();
    otherBallsCollision8 = game.physics.p2.createCollisionGroup();
    ballPottedCollision1 = game.physics.p2.createCollisionGroup();
    ballPottedCollision2 = game.physics.p2.createCollisionGroup();
    ballPottedCollision3 = game.physics.p2.createCollisionGroup();
    ballPottedCollision4 = game.physics.p2.createCollisionGroup();

    //  Enable the physics bodies on all the sprites
    game.physics.p2.enable([cue_stick, black_ball ], false);
    // Turn on impact events
    game.physics.p2.setImpactEvents(true);

    cue_stick.body.setCollisionGroup(cueStickCollisionGroup);
    cue_stick.body.collides(blackBallCollisionGroup);
    cue_stick.body.createBodyCallback(black_ball, function() {
        if (gameState == GS_RELEASED_CUE_STICK) gameState = GS_BLACK_BALL_HIT;
    }, this);


    black_ball.body.setCircle(black_ball.width / 2);
    black_ball.body.fixedRotation = true;
    black_ball.body.damping = 0.5;
    black_ball.body.setCollisionGroup(blackBallCollisionGroup);
    black_ball.body.collides([otherBallsCollision1,otherBallsCollision2,
        otherBallsCollision3,otherBallsCollision4,otherBallsCollision5,
        otherBallsCollision6,otherBallsCollision7,otherBallsCollision8, cueStickCollisionGroup,
        poolTableCollisionGroup, ballPottedCollision1, ballPottedCollision2,
        ballPottedCollision3, ballPottedCollision4]);
//                    black_ball.body.createGroupCallback(ballPottedCollisionGroup, function(body) {
//                        /*
//                         * TODO: Return black ball back to the table,
//                         * or for now do nothing i.e this ball can't be pocketed
//                         */
//                    }, this);



    // Attach pointer events
    // ;
    game.input.onUp.add(onUpInput, this);
    game.input.onDown.add(onDownInput, this);

    this.showLevel();

    r1 = game.add.sprite(game.world.centerX + 190, game.world.centerY - 170, 'iradar1');
    r2 = game.add.sprite(game.world.centerX - 140, game.world.centerY + 15 , 'iradar2');
    r3 = game.add.sprite(game.world.centerX - 440, game.world.centerY - 185, 'iradar3');
    r4 = game.add.sprite(game.world.centerX - 130, game.world.centerY - 250, 'iradar4');
    r0 = game.add.sprite(game.world.centerX - 215, game.world.centerY - 250, 'iradar0');
    r5 = game.add.sprite(game.world.centerX + 24 , game.world.centerY - 253, 'iradar5');
    r6 = game.add.sprite(game.world.centerX + 28 , game.world.centerY + 15 , 'iradar6');
    r7 = game.add.sprite(game.world.centerX - 445, game.world.centerY + 13 , 'iradar7');
    r8 = game.add.sprite(game.world.centerX - 442, game.world.centerY - 251, 'iradar8');

    r0.inputEnabled = true;
    r1.inputEnabled = true;
    r2.inputEnabled = true;
    r3.inputEnabled = true;
    r4.inputEnabled = true;
    r5.inputEnabled = true;
    r6.inputEnabled = true;
    r7.inputEnabled = true;
    r8.inputEnabled = true;

    shoot = createControl(60, game.height - 180, 'shoot_button', function(){ speakSound('throw'); action_down = 'shoot'; });
    // createControl(100, game.height - 100, 'down_button', function(){ action_down = 'down'; });
    // createControl(0, game.height - 170, 'left_button', function(){speakSound('blip'); action_down = 'left'; });
    navigate = createControl(1120, game.height - 170, 'right_button', function(){speakSound('blip'); action_down = 'right'; });
    navigate.visible = false;
    shoot.visible = false;

    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
    var shootKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    shootKey.onDown.add(function(){
        pointer = {x: shoot.x, y: shoot.y, position: {x: shoot.x, y:shoot.y }}
        PottBall()
    }, this);
    shootKey.onUp.add(function(){
        onUpInput(pointer);
    }, this);
    

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
    skip_button.events.onInputUp.add(
        function up(item) {
            exitGame(scores);
        }, this);

    this.nextButton = game.add.sprite(game.width - 30, game.world.centerY, 'arrow-right.png');
    this.nextButton.anchor.setTo(0.5);
    this.nextButton.scale.setTo(0.2);
    this.nextButton.inputEnabled = true;
    this.nextButton.input.useHandCursor = true;
    this.nextButton.events.onInputUp.add( function () {
        if (this.levelTxt && this.levelTxt.visible) {
            this.hideRound ();
        }

        if (this.intervalTimer && this.intervalTimer.running) this.intervalTimer.stop ();

        if (this.purchasePopup && this.purchasePopup.visible) {
            return;
        }
        
        // console.log (jsonData[currentLevel+1].level.split('-')[0])
        if(jsonData[currentLevel+1].level.split('-')[0] === '1' ||
            jsonData[currentLevel+1].level.split('-')[0] === '2' ||
            hasPurchased ()){
            if(currentLevel < jsonData.length - 1) {
                currentLevel++;
                this.showLevel();
            }else{
                speakSound('Cheering');
                endAnim();
            }
        } else {
            // console.log ("game pausing")
            game.levelPaused = true;
            this.showLevelLock ();
        }
        
        // if(currentLevel < jsonData.length ){
        //     currentLevel++;
        //     showLevel();
        // }
    }, this);

    this.prevButton = game.add.sprite(20, game.world.centerY, 'arrow-left.png');
    this.prevButton.anchor.setTo(0.5);
    this.prevButton.scale.setTo(0.2);
    this.prevButton.inputEnabled = true;
    this.prevButton.input.useHandCursor = true;
    this.prevButton.events.onInputUp.add( function () {
        if (this.purchasePopup && this.purchasePopup.visible) {
            return;
        }

        if(currentLevel > 0) {
           currentLevel--;
           this.showLevel(); 
        }
        console.log (currentLevel + " - " + jsonData.length)
    }, this);    

    game.levelPaused = false;
}


function IAPprice()
{

alert(JSON.stringify(window.store));

   store.verbosity = store.INFO;
     store.register({
       id:    'week_id',
       alias: 'my_consumable1',
       type:   store.CONSUMABLE
     });


     store.order('my_consumable1');



}

function showLevelLock () {


//$("#container").css("display","block");

   // if (this.purchasePopup == null) {
        //this.purchasePopup = new PurchasePopup (game);
    //}

   // this.enableButtons (false);

   // this.purchasePopup.show ();
   // game.stage.addChild (this.purchasePopup);



}

function hasPurchased () {
    var token = window.localStorage.getItem("purchaseToken");
    
    return token != null;
}

function createControl(x, y, action, callback) {
    var g = game.add.sprite(x, y, action);
    g.inputEnabled = true;
    g.input.useHandCursor = true;
    g.events.onInputDown.add(callback, this);
    g.events.onInputUp.add(function() { action_down = null; }, this);
    if(isPhoneGap){
        g.scale.setTo(1.3);
        if (action === 'shoot_button') {
            g.x = x - 25;
        }
    }
    return g;
}

function handleControl(action) {
    switch(action) {
        case 'key_up':
            cue_stick_num = 1;
            positionCueStick((cue_stick_angles[cue_stick_num][0] * Math.PI) / cue_stick_angles[cue_stick_num][1]);
            break;
        case 'key_down':
            cue_stick_num = 3;
            positionCueStick((cue_stick_angles[cue_stick_num][0] * Math.PI) / cue_stick_angles[cue_stick_num][1]);
            break;
        case 'key_right':
            cue_stick_num = 2;
            positionCueStick((cue_stick_angles[cue_stick_num][0] * Math.PI) / cue_stick_angles[cue_stick_num][1]);
            break;
        case 'key_left':
            cue_stick_num = 0;
            positionCueStick((cue_stick_angles[cue_stick_num][0] * Math.PI) / cue_stick_angles[cue_stick_num][1]);
            break;
        case 'right':
            cue_stick_num--;
            if(cue_stick_num < 0)cue_stick_num = 3;
            positionCueStick((cue_stick_angles[cue_stick_num][0] * Math.PI) / cue_stick_angles[cue_stick_num][1]);
            break;
        case 'left':
            cue_stick_num++;
            if(cue_stick_num > 3)cue_stick_num = 0;
            positionCueStick((cue_stick_angles[cue_stick_num][0] * Math.PI) / cue_stick_angles[cue_stick_num][1]);
            break;
        case 'shoot':
            PottBall();
            break;
    }
}

function PottBall() {
    if(gameState === GS_BLACK_BALL_HIT) return;
    if(pointer === undefined) return;
    shoot.visible = false;
    navigate.visible = false;
    var bodies = game.physics.p2.hitTest(pointer.position, [black_ball].concat(other_balls));
    if(bodies.length) {
        switch(bodies[0].parent.sprite.key) {
            case 'black_ball':
                black_ball.oldPos = { x: black_ball.body.x, y: black_ball.body.y };
                cue_stick.oldPos = { x: cue_stick.body.x, y: cue_stick.body.y };
                gameState = GS_MOVE_CUE_STICK;
                break;
        }
    } else {
        downPointer = {x: pointer.x, y: pointer.y};
        black_ball.oldPos = { x: black_ball.body.x, y: black_ball.body.y };
        cue_stick.oldPos = { x: cue_stick.body.x, y: cue_stick.body.y };
        gameState = GS_PULL_BACK_CUE_STICK;
    }
}

function onDownInput(p) {
    pointer = p;
    // if(gameState === GS_BLACK_BALL_HIT) return;
    // var bodies = game.physics.p2.hitTest(pointer.position, [black_ball].concat(other_balls));
    //  console.log(pointer);
    // if(bodies.length) {
    //     switch(bodies[0].parent.sprite.key) {
    //         case 'black_ball':
    //             black_ball.oldPos = { x: black_ball.body.x, y: black_ball.body.y };
    //             cue_stick.oldPos = { x: cue_stick.body.x, y: cue_stick.body.y };
    //             gameState = GS_MOVE_CUE_STICK;
    //             break;
    //     }
    // } else {
    //     downPointer = {x: pointer.x, y: pointer.y};
    //     black_ball.oldPos = { x: black_ball.body.x, y: black_ball.body.y };
    //     cue_stick.oldPos = { x: cue_stick.body.x, y: cue_stick.body.y };
    //     gameState = GS_PULL_BACK_CUE_STICK;
    // }
}

function showLevel() {
    pocketed = 0;
    cue_stick_num = 0;
    blankArr = [];
    pottedNumber = [];
    for(var i in original_positions) {
        original_positions[i].ball.destroy();
    }
    other_balls = [];
    // Re-position black ball
    black_ball.body.setZeroVelocity();
    black_ball.body.x = game.world.centerX - 12;
    black_ball.body.y = game.world.centerY - 15;

    // Position cue stick behind black ball
    positionCueStick((cue_stick_angles[cue_stick_num][0] * Math.PI) / cue_stick_angles[cue_stick_num][1]); // angle (in radians) of black ball to the point of positioning cue stick

    var otherBallsPositions = jsonData[currentLevel].ball_positions;
    colorArr = jsonData[currentLevel].colors;

    for(i = 0; i < jsonData[currentLevel].port.length; i++){
        // if($.inArray(colorArr[i],blankArr) === -1){
            blankArr.push(jsonData[currentLevel].port[i]);
        // }
    }
    var sa = _shuffle(colorArray);
    if(blankArr.length < 4){
        for(var j in sa){
            if($.inArray(sa[j],blankArr) === -1 && blankArr.length < 4){
                blankArr.push(sa[j]);
            }
        }
    }
    for(var i = 0; i < otherBallsPositions.length; i++) {
        var other_ball = game.add.sprite(otherBallsPositions[i][0], otherBallsPositions[i][1], 'ball_' + colorArr[i]);
        other_balls.push(other_ball);
        original_positions.push({ball:other_ball,positions:otherBallsPositions[i],number:i});
    }

    game.physics.p2.enable(other_balls, false);

    addCollisionBorders(colorArr);
    AddPotHoleColors(blankArr);

    if (this.intervalTimer && this.intervalTimer.running) this.intervalTimer.stop ();
    this.intervalTimer = game.time.create(false);
    this.intervalTimer.loop (Phaser.Timer.SECOND * 5, function () {
        if (game.levelPaused) return;

        blankArr = _shuffle(blankArr);
        AddPotHoleColors(blankArr);
    }, this);
    this.intervalTimer.start ();

    var bArr = [{name:ballPottedCollision1,value:blank1},{name:ballPottedCollision2,value:blank2},
        {name:ballPottedCollision3,value:blank3},{name:ballPottedCollision4,value:blank4}];

    for(var m = 0; m < other_balls.length; m++) {
        var other_ball = other_balls[m];
        other_ball.body.setCircle(other_ball.width / 2);
        other_ball.body.fixedRotation = true;
        other_ball.body.damping = 0.5;
        other_ball.body.collides([otherBallsCollision1,otherBallsCollision2,otherBallsCollision3,
            otherBallsCollision4,otherBallsCollision5,otherBallsCollision6,otherBallsCollision7,
            otherBallsCollision8, blackBallCollisionGroup, poolTableCollisionGroup, ballPottedCollision1,
            ballPottedCollision2, ballPottedCollision3, ballPottedCollision4]);

        if(m === 0){
            other_ball.body.setCollisionGroup(otherBallsCollision1);
            other_ball1 = other_ball;
            bArr.forEach(function (item1) {other_ball1.body.createGroupCallback(item1.name, function(body){ballPottedCollision(other_ball1,body,item1.value,0)},this);});
        }else if(m === 1){
            other_ball.body.setCollisionGroup(otherBallsCollision2);
            other_ball2 = other_ball;
            bArr.forEach(function (item1) {other_ball2.body.createGroupCallback(item1.name, function(body){ballPottedCollision(other_ball2,body,item1.value,1)},this);});
        }else if(m === 2){
            other_ball.body.setCollisionGroup(otherBallsCollision3);
            other_ball3 = other_ball;
            bArr.forEach(function (item1) {other_ball3.body.createGroupCallback(item1.name, function(body){ballPottedCollision(other_ball3,body,item1.value,2)},this);});
        }else if(m === 3){
            other_ball.body.setCollisionGroup(otherBallsCollision4);
            other_ball4 = other_ball;
            bArr.forEach(function (item1) {other_ball4.body.createGroupCallback(item1.name, function(body){ballPottedCollision(other_ball4,body,item1.value,3)},this);});
        }else if(m === 4){
            other_ball.body.setCollisionGroup(otherBallsCollision5);
            other_ball5 = other_ball;
            bArr.forEach(function (item1) {other_ball5.body.createGroupCallback(item1.name, function(body){ballPottedCollision(other_ball5,body,item1.value,4)},this);});
        }else if(m === 5){
            other_ball.body.setCollisionGroup(otherBallsCollision6);
            other_ball6 = other_ball;
            bArr.forEach(function (item1) {other_ball6.body.createGroupCallback(item1.name, function(body){ballPottedCollision(other_ball6,body,item1.value,5)},this);});
        }else if(m === 6){
            other_ball.body.setCollisionGroup(otherBallsCollision7);
            other_ball7 = other_ball;
            bArr.forEach(function (item1) {other_ball7.body.createGroupCallback(item1.name, function(body){ballPottedCollision(other_ball7,body,item1.value,6)},this);});
        }else if(m === 7){
            other_ball.body.setCollisionGroup(otherBallsCollision8);
            other_ball8 = other_ball;
            bArr.forEach(function (item1) {other_ball8.body.createGroupCallback(item1.name, function(body){ballPottedCollision(other_ball8,body,item1.value,7)},this);});
        }
    }
    bArr.forEach(function (item1) {black_ball.body.createGroupCallback(item1.name, function(body){ballPottedCollision(black_ball,body,item1.value,7)},this);});


    // Transferring pocketed ball, to pocketed balls pouch
    var xpos,ypos;
    function ballPottedCollision(ob,body,blnk,v) {
        speakSound('throw');
        xpos = body.x;ypos = body.y;
        //console.log(blnk,blankArr[v]);
        if (this.boardTimer && this.boardTimer.running) this.boardTimer.stop();
        if (this.levelTimer && this.levelTimer.running) this.levelTimer.stop();

        if(blnk === blankArr[v]){
            speakSound(blnk);
            body.x = 719;
            body.y = 647;
            pottedNumber.push(v);
            pocketed++;
            other_balls.splice(other_balls.indexOf(ob), 1);

            this.boardTimer = game.time.create(false);
            this.boardTimer.add (Phaser.Timer.SECOND * 3, resetBoard, this);
            this.boardTimer.start ();
            
            if(pocketed === jsonData[currentLevel].balls) {
                this.levelTimer = game.time.create(false);
                this.levelTimer.add (Phaser.Timer.SECOND * 5, nextLevel, this);
                this.boardTimer.start ();
            }
        }else{
            No(body);
            body.x = 719;body.y = 647;

            this.boardTimer = game.time.create(false);
            this.boardTimer.add (Phaser.Timer.SECOND * 2, resetBoard, this);
            this.boardTimer.start ();
        }
    }
    game.world.bringToTop(cue_stick);

    if(jsonData[currentLevel].level.split('-')[1] === '1'){
        this.showRound();
    } else {
        shoot.visible = true;
        navigate.visible = true;
    }
}

function speakSound(x) {
   game.add.audio(x).play();
}

function nextLevel() {
    if(jsonData[currentLevel+1].level.split('-')[0] === '1' ||
        jsonData[currentLevel+1].level.split('-')[0] === '2' ||
        hasPurchased ()){
        if(currentLevel < jsonData.length - 1) {
            currentLevel++;
            showLevel();
        }else{
            speakSound('Cheering');
            endAnim();
        }
    } else {
        // console.log ("game pausing")
        game.levelPaused = true;
        this.showLevelLock ();
    }
}

function onUpInput(pointer) {
    switch(gameState) {
        case GS_MOVE_CUE_STICK:
            gameState = GS_NONE;
            break;
        case GS_PULL_BACK_CUE_STICK:
            gameState = GS_RELEASE_CUE_STICK;
            break;
    }
}

var p = new Phaser.Point();
function update() {

    switch(gameState) {
        case GS_NONE:
            black_ball.body.setZeroVelocity();
            break;
        case GS_MOVE_CUE_STICK:
            black_ball.body.x = game.input.x;
            black_ball.body.y = game.input.y;
            // black_ball.anchor.set(0.5,0.5);
//                            drag.visible = false;
//                             cue_stick.body.x = cue_stick.oldPos.x + (black_ball.body.x - black_ball.oldPos.x);
//                             cue_stick.body.y = cue_stick.oldPos.y + (black_ball.body.y - black_ball.oldPos.y);
            break;
        case GS_PULL_BACK_CUE_STICK:
            var dx = game.input.x - downPointer.x;
            var dy = game.input.y - downPointer.y;
//                            drag.visible = false;
            var ds = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            var angle = Math.atan2(game.input.y - black_ball.body.y, game.input.x - black_ball.body.x);

            // cue_stick.body.x = black_ball.body.x + (ds + cue_stick.distance) * Math.cos(angle);
            // cue_stick.body.y = black_ball.body.y + (ds + cue_stick.distance) * Math.sin(angle);
            // Rotate cue stick to point ball, otherwise it's pointing away from ball
            // cue_stick.body.rotation = Math.atan2(black_ball.body.y - cue_stick.body.y,
            //     black_ball.body.x - cue_stick.body.x);

//
//                             var newX = cue_stick.oldPos.x + (game.input.x - downPointer.x);
//                             var newY = cue_stick.oldPos.y + (game.input.y - downPointer.y);
//                             var newD = Math.sqrt(Math.pow(newX - black_ball.body.x, 2) + Math.pow(newY - black_ball.body.y, 2));
//                             if(newD > cue_stick.distance) {
//                                 cue_stick.body.x = newX;
//                                 cue_stick.body.y = newY;
//                                 cue_stick.body.rotation = Math.atan2(black_ball.body.y - cue_stick.body.y, black_ball.body.x - cue_stick.body.x);
//                             }  else {
//                                 var angle = Math.atan2(game.input.y - black_ball.body.y, game.input.x - black_ball.body.x);
//                                 positionCueStick(angle);
//                             }

            aim_rule.x = cue_stick.body.x;
            aim_rule.y = cue_stick.body.y;
            aim_rule.rotation = cue_stick.body.rotation;
            aim_rule.visible = true;

            var bArr1 = [{name:r1,value:blank1},{name:r2,value:blank2},
                {name:r3,value:blank3},{name:r4,value:blank4}];
            for(var m = 0; m < other_balls.length; m++) {
                var other_ball = other_balls[m];
                if(m === 0){
                    ball1 = other_ball;
                    bArr1.forEach(function (item) {
                        if(item.name.overlap(ball1)){
                            colide(item.value,0,ball1)
                        }
                    });
                    if(assist_rule.overlap(ball1)){
                        colide1(0,ball1)
                    }
                }else if(m === 1){
                    ball2 = other_ball;
                    bArr1.forEach(function (item) {
                        if(item.name.overlap(ball2)){
                            colide(item.value,1,ball2)
                        }
                    });
                    if(assist_rule.overlap(ball2)){
                        colide1(1,ball2)
                    }
                }else if(m === 2){
                    ball3 = other_ball;
                    bArr1.forEach(function (item) {
                        if(item.name.overlap(ball3)){
                            colide(item.value,2,ball3)
                        }
                    });
                    if(assist_rule.overlap(ball3)){
                        colide1(2,ball3)
                    }
                }else if(m === 3){
                    ball4 = other_ball;
                    bArr1.forEach(function (item) {
                        if(item.name.overlap(ball4)){
                            colide(item.value,3,ball4)
                        }
                    });
                    if(assist_rule.overlap(ball4)){
                        colide1(3,ball4)
                    }
                }else if(m === 4){
                    ball5 = other_ball;
                    bArr1.forEach(function (item) {
                        if(item.name.overlap(ball5)){
                            colide(item.value,4,ball5)
                        }
                    });
                    if(assist_rule.overlap(ball5)){
                        colide1(4,ball5)
                    }
                }else if(m === 5){
                    ball6 = other_ball;
                    bArr1.forEach(function (item) {
                        if(item.name.overlap(ball6)){
                            colide(item.value,5,ball6)
                        }
                    });
                    if(assist_rule.overlap(ball6)){
                        colide1(5,ball6)
                    }
                }else if(m === 6){
                    ball7 = other_ball;
                    bArr1.forEach(function (item) {
                        if(item.name.overlap(ball7)){
                            colide(item.value,6,ball7)
                        }
                    });
                    if(assist_rule.overlap(ball7)){
                        colide1(6,ball7)
                    }
                }else if(m === 7){
                    ball8 = other_ball;
                    bArr1.forEach(function (item) {
                        if(item.name.overlap(ball8)){
                            colide(item.value,7,ball8)
                        }
                    });
                    if(assist_rule.overlap(ball8)){
                        colide1(7,ball8)
                    }
                }
            }


            break;
        case GS_RELEASE_CUE_STICK:
            aim_rule.visible = false;
//                            drag.visible = false;
            var x_vector = (black_ball.body.x - cue_stick.body.x) * 5;
            var y_vector = (black_ball.body.y - cue_stick.body.y) * 5;
            cue_stick.body.velocity.x = x_vector;
            cue_stick.body.velocity.y = y_vector;
            gameState = GS_RELEASED_CUE_STICK;
            break;
        case GS_BLACK_BALL_HIT:
//                            drag.visible = false;
            if(hit){
                POS.forEach(function (ite) {
                    ite.visible = false;
                });
                hit = false;
            }
            glow.visible =false;
            cue_stick.body.setZeroVelocity();
            cue_stick.body.setZeroRotation();
            cue_stick.body.x = -1280;
            for(var i in other_balls) stopBallOnThreshVelocity(other_balls[i]);
            if(stopBallOnThreshVelocity(black_ball)) {
                // var angle = Math.atan2(black_ball.body.y - game.world.centerY, black_ball.body.x - game.world.centerX);
                resetBoard();
            }
            break;
    }

    if(!r0.overlap(black_ball)
        && !r1.overlap(black_ball)
        && !r2.overlap(black_ball)
        && !r3.overlap(black_ball)
        && !r4.overlap(black_ball)){
    }

    if(action_down) {
        handleControl(action_down);
    }

    game.input.keyboard.onUpCallback = function (e) {
        if(navigate.visible){
            switch (e.key){
                case 'ArrowUp':
                    action_down = 'key_up'
                break;
                case 'ArrowDown':
                    action_down = 'key_down'
                break;
                case 'ArrowRight':
                    action_down = 'key_right'
                break;
                case 'ArrowLeft':
                    action_down = 'key_left'
                break;
                default:
            }
            if(action_down){
                handleControl(action_down);
            }
        }
    };

    if(cursors.down.isUp || cursors.right.isUp || cursors.up.isUp || cursors.left.isUp){
        action_down = null;
    }

}

function resetBoard() {
    var n = [0,1,2,3];
    for(var k in n){
        for(var l in pottedNumber){
            if(pottedNumber[l] === n[k]){
                n.splice(n.indexOf(n[k]), 1)
            }
        }
    }
    black_ball.body.x = game.world.centerX - 12;
    black_ball.body.y = game.world.centerY - 15;
    positionCueStick((cue_stick_angles[cue_stick_num][0] * Math.PI) / cue_stick_angles[cue_stick_num][1]);
    if(pocketed !== jsonData[currentLevel].balls) {
        shoot.visible = true;
        navigate.visible = true;
    }
    blankArr = _shuffle(blankArr);
    AddPotHoleColors(blankArr);
    
    if (this.intervalTimer && this.intervalTimer.running) this.intervalTimer.stop ();
    this.intervalTimer = game.time.create(false);
    this.intervalTimer.loop (Phaser.Timer.SECOND * 5, function () {
        if (game.levelPaused) return;
        
        blankArr = _shuffle(blankArr);
        AddPotHoleColors(blankArr);
    }, this);
    this.intervalTimer.start ();

    for(var i in other_balls){
        for(var j in original_positions){
            if(original_positions[j].ball === other_balls[i]){
                other_balls[i].body.x = original_positions[j].positions[0];
                other_balls[i].body.y = original_positions[j].positions[1];
            }
        }
    }
    gameState = GS_NONE;
}

function colide(blnk,v,b) {
    // if(blnk === colorArr[v]){
    //     hl = game.add.sprite(b.body.x - 50, b.body.y - 50, 'h_light');
    //     if($.inArray(hl,POS) === -1){
    //         POS.push(hl);
    //     }
    //     hit = true;
    // }
}

function colide1(v,ball) {
    if(colorArr[v] === blank1){
        glow.x = 1133.50;
        glow.y = 288;
        glow.angle = 90;
    }
    if(colorArr[v] === blank2){
        glow.x = 682;
        glow.y = 621;
        glow.angle = 180;
    }
    if(colorArr[v] === blank3){
        glow.x = 141;
        glow.y = 389.50;
        glow.angle = 270;
    }
    if(colorArr[v] === blank4){
        glow.x = 576;
        glow.y = 51;
        glow.angle = 0;
    }
    // glow.visible = true;
    game.world.bringToTop(glow);
}

function render() {
    game.debug.geom(line1, '#ff0000');
    game.debug.geom(line2, '#00ff00');
    game.debug.geom(p, '#0000ff');
    game.debug.geom(reflection, '#000000');
    debug();
}

function positionCueStick(angle) {
    cue_stick.distance = 0.5 * (cue_stick.width + black_ball.width) + 20;
    cue_stick.body.x = black_ball.body.x + cue_stick.distance * Math.cos(angle);
    cue_stick.body.y = black_ball.body.y + cue_stick.distance * Math.sin(angle);
    // Rotate cue stick to point ball, otherwise it's pointing away from ball
    cue_stick.body.rotation = Math.atan2(black_ball.body.y - cue_stick.body.y, black_ball.body.x - cue_stick.body.x);
}

function stopBallOnThreshVelocity(ball) {
    var stopped = Math.round(ball.body.velocity.x) === 0 && Math.round(ball.body.velocity.y) === 0;
    stopped && ball.body.setZeroVelocity();
    return stopped;
}

function debug() {
    if(DEBUGGING) {
        game.debug.spriteInfo(black_ball, 20, 20);
        game.debug.text('velocity: ' + JSON.stringify({
            black_ball: {
                x: Math.round(black_ball.body.velocity.x),
                y: Math.round(black_ball.body.velocity.y)
            }
        }), 900, 20);
        for (var i in other_balls) {
            var ball = other_balls[i];
            var obj = {};
            obj[ball.key] = {
                x: Math.round(ball.body.velocity.x),
                y: Math.round(ball.body.velocity.y)
            };
            game.debug.text('velocity: ' + JSON.stringify(obj), 900, 70 + (50 * i));
        }
    }
}

function addPocketBallContainerBorders() {
    // Pocketed ball container border
    borders.push(game.add.sprite(712, 692, 'blank'));
    var idx = borders.length - 1;
    borders[idx].scale.set(374 / borders[idx].width, 30 / borders[idx].height);

    borders.push(game.add.sprite(712, 613, 'blank'));
    idx = borders.length - 1;
    borders[idx].scale.set(374 / borders[idx].width, 30 / borders[idx].height);

    borders.push(game.add.sprite(686, 613, 'blank'));
    idx = borders.length - 1;
    borders[idx].scale.set(30 / borders[idx].width, 103 / borders[idx].height);

    borders.push(game.add.sprite(1072, 613, 'blank'));
    idx = borders.length - 1;
    borders[idx].scale.set(30 / borders[idx].width, 103 / borders[idx].height);
}

function addCollisionBorders(bl) {
    for(var i in borders) {
        borders[i].destroy();
    }
    borders = [];
    // Pool table collision borders
    borders.push(game.add.sprite(135, 40, 'blank'));
    borders[0].scale.set(453 / borders[0].width, 69 / borders[0].height);

    borders.push(game.add.sprite(135, 562, 'blank'));
    borders[1].scale.set(453 / borders[1].width, 69 / borders[1].height);

    borders.push(game.add.sprite(128, 57, 'blank'));
    borders[2].scale.set(69 / borders[2].width, 238 / borders[2].height);

    borders.push(game.add.sprite(128, 382, 'blank'));
    borders[3].scale.set(69 / borders[3].width, 238 / borders[3].height);

    borders.push(game.add.sprite(1074, 57, 'blank'));
    borders[4].scale.set(66 / borders[4].width, 238 / borders[4].height);

    borders.push(game.add.sprite(1074, 382, 'blank'));
    borders[5].scale.set(66 / borders[5].width, 238 / borders[5].height);

    borders.push(game.add.sprite(674, 562, 'blank'));
    borders[6].scale.set(453 / borders[6].width, 69 / borders[6].height);

    borders.push(game.add.sprite(674, 40, 'blank'));
    borders[7].scale.set(453 / borders[7].width, 69 / borders[7].height);

    // Pocketed ball container border
    for(var i = 0; i < bl.length; i++){
        if(i === 0){
            blank1 = bl[i];
            borders.push(game.add.sprite(1086, 300, 'blank'));
            borders[8].scale.set(125 / borders[8].width, 78 / borders[8].height);
            // game.add.sprite(1133.50, 288, 'line1_'+bl[i]).angle = 90
        }else if(i === 1){
            blank2 = bl[i];
            borders.push(game.add.sprite(593, 575, 'blank'));
            borders[9].scale.set(78 / borders[9].width, 125 / borders[9].height);
            // game.add.sprite(682, 621, 'line1_'+bl[i]).angle = 180
        }else if(i === 2){
            blank3 = bl[i];
            borders.push(game.add.sprite(59, 300, 'blank'));
            borders[10].scale.set(125 / borders[10].width, 78 / borders[10].height);
            // game.add.sprite(141, 389.50, 'line1_'+bl[i]).angle = 270;
        }else if(i === 3){
            blank4 = bl[i];
            borders.push(game.add.sprite(593, -27, 'blank'));
            borders[11].scale.set(78 / borders[11].width, 125 / borders[11].height);
            // game.add.sprite(576, 51, 'line1_'+bl[i]);
        }
    }
    // Pocketed ball container border
    addPocketBallContainerBorders();

    for(var i in borders) {
        borders[i].x += borders[i].width * 0.5;
        borders[i].y += borders[i].height * 0.5;
    }

    game.physics.p2.enable(borders, false);
    for(var i in borders) {
        borders[i].body.static = true;
        if(i <= 7){
            borders[i].body.setCollisionGroup(poolTableCollisionGroup);
        }else if(i > 7 && i < borders.length - 7){
            borders[i].body.setCollisionGroup(ballPottedCollision1);
        }else if(i > 8 && i < borders.length - 6){
            borders[i].body.setCollisionGroup(ballPottedCollision2);
        }else if(i > 9 && i < borders.length - 5){
            borders[i].body.setCollisionGroup(ballPottedCollision3);
        }else if(i > 10 && i < borders.length - 4){
            borders[i].body.setCollisionGroup(ballPottedCollision4);
        }else if(i > 11 && i < borders.length){
            borders[i].body.setCollisionGroup(poolTableCollisionGroup);
        }
        borders[i].body.collides([blackBallCollisionGroup, otherBallsCollision1,
            otherBallsCollision2,otherBallsCollision3,otherBallsCollision4,otherBallsCollision5,
            otherBallsCollision6,otherBallsCollision7,otherBallsCollision8]);
    }

}

function AddPotHoleColors(bl) {
    // speakSound('gem');
    if(blanks.length > 0){
        for(var j in blanks){
            blanks[j].visible = false;
        }
        blanks = [];
    }
    for(var i = 0; i < bl.length; i++){
        if(i === 0){
            var line_1 = game.add.sprite(1133.50, 288, 'line1_'+bl[i]).angle = 90;
            blanks.push(line_1);
        }else if(i === 1){
            var line_2 = game.add.sprite(682, 621, 'line1_'+bl[i]).angle = 180;
            blanks.push(line_2);
        }else if(i === 2){
            var line_3 = game.add.sprite(141, 389.50, 'line1_'+bl[i]).angle = 270;
            blanks.push(line_3);
        }else if(i === 3){
            var line_4 = game.add.sprite(576, 51, 'line1_'+bl[i]);
            blanks.push(line_4);
        }
        game.world.bringToTop(cue_stick);
    }
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

function _shuffle(array) {
    var results = [];
    if (_num > opts.length - 1) {
        _num = 0;
    }
    var n = opts[_num];
    for(var j = 0; j < n.length; j++){
        results.push(array[n[j]])
    }
    _num++;
    return results;
}

function No(fb){
    wrong = game.add.sprite(fb.x, fb.y, 'wrong');
    
    if (this.wrongTimer && this.wrongTimer.running) this.wrongTimer.stop ();
    
    this.wrongTimer = game.time.create(false);
    this.wrongTimer.add (Phaser.Timer.SECOND, function () {
        wrong.visible = false;
    }, this);
    this.wrongTimer.start ();
    speakSound('wronghole');
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

function endAnim() {
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

function showRound () {
    count__ = 0;
    y_pos = 0;
    this.blvels = game.add.sprite(game.world.centerX, game.world.centerY, 'level');
    this.blvels.anchor.set(0.5);
    
    this.levelTxt = game.add.text(-70, -30,'Level:', {font: '50px Titan One', fill: '#fff'});
    this.levelTxt.text = 'Level ' + jsonData[currentLevel].level.split('-')[0];
    this.blvels.addChild(this.levelTxt);
    
    this.roundTimer = game.time.create(false);
    this.roundTimer.add (Phaser.Timer.SECOND * 3, this.hideRound, this);
    this.roundTimer.start ();
};

function hideRound () {
    this.blvels.visible = false;
    this.levelTxt.visible = false;
    navigate.visible = true;
    shoot.visible = true;
}

function onResume () {
    this.enableButtons (true);
}

function enableButtons (bool) {
    this.prevButton.inputEnabled = bool;
    this.nextButton.inputEnabled = bool;
    shoot.inputEnabled = bool;
    navigate.inputEnabled = bool;
}