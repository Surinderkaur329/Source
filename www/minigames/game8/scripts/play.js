var play = function(game) {};

var audio_array = [];
var bouncing = false;
var shootKey;
var bgVolume = 0.5;
var purchasePopup = null
var nextButton = null;
var prevButton = null;

play.prototype = {
    create: create,
    update: update,
    render: render
};

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    backgroundMusic = game.add.audio('song');
    backgroundMusic.volume = bgVolume;
    backgroundMusic.loopFull();

    window.localStorage.removeItem("gameEnded");

    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
    shootKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    var bg = game.add.tileSprite(0, 0, 1280, 720, 'background');

    trampoline = game.add.sprite(game.world.centerX, game.world.height, 'trampoline_sprite');
    trampoline.x -= 0.5 * trampoline.width;
    trampoline.y -= trampoline.height;
    trampoline.alpha = 0;

    trampoline.inputEnabled = true;
    trampoline.input.enableDrag();
    trampoline.input.allowVerticalDrag = false;
    trampoline.animations.add('bounce_anim', [2,1,0]);
    // trampoline.events.onInputDown.add(function(){
    //     action_down = 'down';
    //     handleControl('down');
    // }, this);

    game.physics.enable(trampoline, Phaser.Physics.ARCADE);
    trampoline.body.setSize(trampoline.width, trampoline.height - 40, 0, 40);
    trampoline.body.immovable = true;

    character = game.add.sprite(game.world.centerX, trampoline.y + 30, 'jump_sprite');
    character.x -= 0.5 * character.width;
    character.y -= character.height;
    character.alpha = 0;
    character.inputEnabled = true;
    character.events.onInputDown.add(function(){
        action_down = 'down';
        speakSound('blip');
        handleControl('down');
    }, this);
    character.events.onInputUp.add(function(){ action_down = null; }, this);

    character.animations.add('normal', [0]);
    character.animations.add('jump_up', [0,1,2,3,4,5,6]);
    character.animations.add('jump_down', [7,8,9,10,11,12,13]);

    character.animations.play('normal', 1, true);

    for(var i in balloon_keys) {
        var key = balloon_keys[i];
        var shirt_sprite_key = key.replace('balloon', 'shirt_sprite');
        var shirt_spritesheet = game.add.sprite(0, 0, shirt_sprite_key);
        shirt_spritesheet.visible = false;

        shirt_spritesheet.animations.add('normal', [0]);
        shirt_spritesheet.animations.add('jump_up', [0,1,2,3,4,5,6]);
        shirt_spritesheet.animations.add('jump_down', [7,8,9,10,11,12,13]);

        shirt_spritesheets[shirt_sprite_key] = shirt_spritesheet;
    }

    game.physics.enable(character, Phaser.Physics.ARCADE);
    character.body.bounce.set(1.0);
    character.body.gravity.set(0, 180);


    // createControl(game.width - 240, game.height - 170, 'up_arrow', function(){
    //     handleControl('down');
    //     action_down = 'down';
    // });
    // createControl(10, game.height - 170, 'left_arrow', function(){
    //    if(bouncing) {
    //      action_down = 'left';
    //      handleControl('left');
    //    }
    // });
    // createControl(game.width - 110, game.height - 170, 'right_arrow', function(){
    //     if(bouncing) {
    //         action_down = 'right';
    //         handleControl('right');
    //     }
    // });

//                    listenTrampolineSwipe();

    gameState = GS_INIT;
    //rounds
    ShowRound();
    target_balloons = jsonData[currentLevel].target_balloons;

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

    nextButton = game.add.sprite(game.width - 30, game.world.centerY, 'arrow-right.png');
    nextButton.anchor.setTo(0.5);
    nextButton.scale.setTo(0.2);
    nextButton.inputEnabled = true;
    nextButton.input.useHandCursor = true;
    nextButton.events.onInputUp.add( function () {
        console.log (jsonData[currentLevel].level)
        console.log (hasPurchased())
        if(currentLevel < jsonData.length - 1){
            if (jsonData[currentLevel].level >= 3.1 &&
                !hasPurchased()) {
                // console.log ("lock")
                showLevelLock ();
            } else {
                ++currentLevel;
                target_balloons = jsonData[currentLevel].target_balloons;
                if(jsonData[currentLevel].level.split('.')[1] === '1'){
                    ShowRound();
                    pattern_count = 0;
                    game.time.events.add(100, function() {
                        showLevel();
                    }, this);
                }else{
                    game.time.events.add(100, function() {
                        showLevel();
                    }, this);
                }    
            }
        }
    }, this);

    prevButton = game.add.sprite(20, game.world.centerY, 'arrow-left.png');
    prevButton.anchor.setTo(0.5);
    prevButton.scale.setTo(0.2);
    prevButton.inputEnabled = true;
    prevButton.input.useHandCursor = true;
    prevButton.events.onInputUp.add( function () {
        if(currentLevel > 0) {
            --currentLevel;
            target_balloons = jsonData[currentLevel].target_balloons;
            if(jsonData[currentLevel].level.split('.')[1] === '1'){
                ShowRound();
                pattern_count = 0;
                game.time.events.add(100, function() {
                    showLevel();
                }, this);
            }else{
                game.time.events.add(100, function() {
                    showLevel();
                }, this);
            }
        }
    }, this);     
}

function update() {
    // console.log('bouncing ' + bouncing);
    
    if(!bouncing) {
        trampoline.input.allowHorizontalDrag = false;
    } else {
        trampoline.input.allowHorizontalDrag = true;
    }

    if(trampoline.input.isDragged){
        if(trampoline.body.x < -50){
            trampoline.body.x = -50;
        }
        if(trampoline.body.x > 597){
            trampoline.body.x = 597;
        }
    }
    if(trampoline.body.x < -50){
        trampoline.body.x = -50;
    }
    if(trampoline.body.x > 597){
        trampoline.body.x = 597;
    }

    game.physics.arcade.collide(trampoline, character, handleBounceCollision);

    character.body.x = trampoline.body.x + 0.5 * (trampoline.width - character.width);

    switch(gameState) {
        case GS_NONE:
            break;
        case GS_INIT:
            fadeInTrampoline();
            gameState = GS_NONE;
            break;
        case GS_GAMEPLAY:
            game.physics.arcade.collide(balloons, character, handleBalloonBurstCollision);

            if((shootKey.isDown || cursors.up.isDown) && !TargetAquired) {
                bounceHigher = true;
                bouncing = false;
                cursorDownTime = new Date().getTime();
            }
            else if(cursors.left.isDown && trampoline.body.x > -50 && bouncing) {
                if(checkNormalBouncePosition()){
                    trampoline.body.velocity.x = character.body.velocity.x = -300;
                }else{
                    trampoline.body.velocity.x = character.body.velocity.x = -30;
                }
            }
            else if(cursors.right.isDown && trampoline.body.x < game.width - trampoline.width + 50 && bouncing) {
                if(checkNormalBouncePosition()){
                    trampoline.body.velocity.x = character.body.velocity.x = 300;
                }else{
                    trampoline.body.velocity.x = character.body.velocity.x = 30;
                }
            }
            else {
                trampoline.body.velocity.x = character.body.velocity.x = 0;
            }

            if(cursors.left.isDown && bouncing){
                if(trampoline.body.x < -50){
                    trampoline.body.x = -50;
                }
            }
            if (cursors.right.isDown && bouncing){
                if(trampoline.body.x > 597){
                    trampoline.body.x = 597;
                }
            }
            if(action_down) {
                handleControl(action_down);
            }
            if(character.shirt) {
                character.shirt.x = character.x;// + shirt_location.x;
                character.shirt.y = character.y;// + shirt_location.y;
            }
            if(character.shorts) {
                character.shorts.x = character.x + short_location.x;
                character.shorts.y = character.y + short_location.y;
            }

            if(character.shoes) {
                character.shoes.x = character.x + shoe_location.x;
                character.shoes.y = character.y + shoe_location.y;
            }

            if(!isNormalBouncePosition && !character.downAnim && character.body.velocity.y > 0) {
                character.animations.play('jump_down', 9, false);
                if(character.shirt) {
                    character.shirt.animations.play('jump_down', 9, false);
                    character.shirt.animations.currentFrame = character.animations.currentFrame;
                    character.shirt.visible = true;
                    game.world.bringToTop(character.shirt);
                }
                character.downAnim = true;
            } else if(!isNormalBouncePosition && !character.upAnim && character.body.velocity.y < 0) {
                character.animations.play('jump_up', 9, false);
                if(character.shirt) {
                    character.shirt.animations.play('jump_up', 9, false);
                    character.shirt.animations.currentFrame = character.animations.currentFrame;
                    character.shirt.visible = true;
                    game.world.bringToTop(character.shirt);
                }
                character.upAnim = true;
            }
            for(var i in balloons) {
                var balloonData = balloons[i];
                if(balloonData.position !== undefined){
                    if(balloonData.target){
                        if(balloonData.position.y < -100 && bouncing){
                            TargetAquired = true;
                            popagain = true;
                            bounceHigher = false;
                            cursorDownTime = 3000;
                            target_balloons = jsonData[currentLevel].target_balloons;
                            showLevel();
                            cancelBounce();
                        }
                    }
                }
            }
            break;
    }
}

function render() {
    if(DEBUGGING) {
        game.debug.spriteInfo(character, 32, 132);
        game.debug.text("Character velocity: " + character.body.velocity.y, 32, 300);
        game.debug.text("Normal Bounce: " + checkNormalBouncePosition(), 32, 320);
        if(action_down) game.debug.text("Action is down", 32, 360);
    }
}

function handleControl(action) {
    if(gameState == GS_GAMEPLAY) {
        switch(action) {
            case 'left':
                if(trampoline.body.x > -50) {
                    trampoline.body.velocity.x = character.body.velocity.x = -300;
                }
                break;
            case 'right':
                if(trampoline.body.x < game.width - trampoline.width + 50) {
                    trampoline.body.velocity.x = character.body.velocity.x = 300;
                }
                break;
            case 'down':
                bounceHigher = true;
                bouncing = false;
                cursorDownTime = new Date().getTime();
                break;
            default:
                break;
        }
    }
}

function createControl(x, y, action, callback) {
    var g = game.add.sprite(x, y, action);
    g.inputEnabled = true;
    g.input.useHandCursor = true;
    g.events.onInputDown.add(callback, this);
    g.events.onInputUp.add(function() { action_down = null; }, this);
}

function fadeInTrampoline() {
    game.time.events.add(50, function() {
        trampoline.alpha += 0.1;
        if(trampoline.alpha < 1) {
            fadeInTrampoline();
        } else {
            game.time.events.add(2000, function() {
                popUpBalloons();
                audioSound = shuffleArray(audio_array)[0];
                speakSound(audioSound);
                fadeInCharacter();
            },this);
        }
    }, this);
}

function fadeInCharacter() {
    game.time.events.add(50, function() {
        character.alpha += 0.1;
        if(character.alpha < 1) {
            fadeInCharacter();
        } else {
            showHint(targetBalloon);
            gameState = GS_GAMEPLAY;
        }
    }, this);
}

function fadeInBalloon(balloon) {
    game.time.events.add(50, function() {
        balloon.alpha += 0.1;
        if(balloon.alpha < 1) {
            fadeInBalloon(balloon);
        }
    }, this);
}

function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
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

function checkNormalBouncePosition() {
    return isNormalBouncePosition;
}

function handleBalloonBurstCollision(balloon, character) {
    // console.log(balloon.balloonData.audio, audioSound);
    if(balloon.balloonData.target && balloon.balloonData.audio === audioSound){
        speakSound('seefa_pop');
        TargetAquired = true;
        bounceHigher = false;
        cursorDownTime = 3000;
        balloon.kill();
        balloon.string.destroy();

        if(character.shirt) character.shirt.visible = false;
        character.shirt = shirt_spritesheets[balloon.key.replace('balloon', 'shirt_sprite')];

        if(current_edit_cloth_type == CLOTH_TYPE_SHOE) current_edit_cloth_type = CLOTH_TYPE_SHIRT;
        else current_edit_cloth_type++;

        target_balloons = target_balloons - 1;
        if(target_balloons === 0){
            character.body.bounce.set(0);
            character.body.velocity.y = -60;
            character.animations.play('normal', 1, true);
            var idx = balloons.keys.indexOf(balloon.key);
            balloons.splice(idx, 1);
            for(var i = 0; i < balloons.length; i++) {
                balloons[i].kill();
                balloons[i].string.destroy();
            }
            nextLevel();
        }else{
            var bal;
            if(target_balloons === 1){bal = 'balloon';}else{bal = 'balloons';}
            showHint(target_balloons +' '+bal+' more');
            audio_array.splice(audio_array.indexOf(audioSound), 1);
            speakSound(audio_array[0]);
            game.time.events.add(2000, function() {
                TargetAquired = false;
            },this)
            
        }
    }else if(balloon.balloonData.target && balloon.balloonData.audio !== audioSound) {
        TargetAquired = true;
        bounceHigher = false;
        cursorDownTime = 3000;
        speakSound('seefa_pop');
        target_balloons = target_balloons - 1;
        balloon.string.destroy();
        balloon.kill();
        wrong1 = game.add.sprite(balloon.x, balloon.y, 'wrong1');
        game.time.events.add(1000, function() {
            wrong1.visible = false;
        },this);

        if(character.shirt) character.shirt.visible = false;
        character.shirt = shirt_spritesheets[balloon.key.replace('balloon', 'shirt_sprite')];

        if(current_edit_cloth_type === CLOTH_TYPE_SHOE) current_edit_cloth_type = CLOTH_TYPE_SHIRT;
        else current_edit_cloth_type++;

        if(target_balloons === 0){
            character.body.velocity.y = -60;
            character.body.bounce.set(0);
            character.animations.play('normal', 1, true);
            var idx = balloons.keys.indexOf(balloon.key);
            balloons.splice(idx, 1);
            for(var i = 0; i < balloons.length; i++) {
                balloons[i].kill();
                balloons[i].string.destroy();
            }
            nextLevel();
        }else{
            speakSound('wrong');
            character.body.velocity.y = -60;
            character.body.bounce.set(0);
            character.animations.play('normal', 1, true);
            var idx = balloons.keys.indexOf(balloon.key);
            balloons.splice(idx, 1);
            for(var i = 0; i < balloons.length; i++) {
                balloons[i].kill();
                balloons[i].string.destroy();
            }
            target_balloons = jsonData[currentLevel].target_balloons;
            game.time.events.add(4000, function() {
                showLevel();
            }, this);
        }
    }else{
        speakSound('seefa_pop');
        balloon.string.destroy();
        balloon.kill();
        No(balloon);
    }
}

function nextLevel() {
    audio_array = [];
    if(currentLevel < jsonData.length - 1) {
        speakSound('yeah');
        
        if (jsonData[currentLevel].level >= 3.1 && !hasPurchased()) {
            // console.log ("lock")
            showLevelLock ();
        } else {
            ++currentLevel;
            target_balloons = jsonData[currentLevel].target_balloons;
            if(jsonData[currentLevel].level.split('.')[1] === '1'){
                ShowRound();
                pattern_count = 0;
                game.time.events.add(4000, function() {
                    showLevel();
                }, this);
            }else{
                game.time.events.add(4000, function() {
                    showLevel();
                }, this);
            }
        }
    }else{
        character.visible = false;
        trampoline.visible = false;
        for(var i = 0; i < balloons.length; i++) {
            balloons[i].kill();
            balloons[i].string.destroy();
        }
        endAnim();
        speakSound('welldone');
    }
}

function showLevel() {
    character.body.bounce.set(1.0);
    if(popagain){
        showHint(targetBalloon);
        audioSound = shuffleArray(audio_array)[0];
        speakSound(audioSound);
        popUpBalloons();
        // pattern_count++;
        // if(pattern_count > 2) pattern_count = 0;
        popagain = false;
    }else{
        popUpBalloons();
        // pattern_count++;
        // if(pattern_count > 2) pattern_count = 0;
        audioSound = shuffleArray(audio_array)[0];
        showHint(targetBalloon);
        speakSound(audioSound);
    }
}

function speakSound(x) {
    game.add.audio(x).play();
}

function showHint(x) {
    // var hint = game.add.text(game.world.centerX, game.world.centerY - 100, x,
    //     {font: "bold 80px Comic Sans MS", align: "center", fill: x});
    // hint.anchor.setTo(0.5);
    //
    // game.add.tween(hint).to({y: 20}, 3000, Phaser.Easing.Quadratic.Out, true).onComplete.add(function(){
    //     hint.destroy();
    // }, this);
}

function cancelBounce() {
    isNormalBouncePosition = true;
    character.body.velocity.y = -60;
    character.animations.play('normal', 1, true);
    if(character.shirt) {
        character.shirt.visible = true;
        character.shirt.animations.play('normal', 1, true);
    }
}

function handleBounceCollision() {
    // Do Bounce animation
    // 1. Stop character movement,
    // 2. Animate trampoline depression & character down movement
    // 3. Animate trampoline back up and character up movement
    // 4. Return character bounce up movement
    // character.body.gravity.set(0,0);
    
    //
    // console.log('bounce');
    bouncing = true;
    trampoline.animations.play('bounce_anim', 10, false);

    if(new Date().getTime() - cursorDownTime > 2000) {
        isNormalBouncePosition = true;
        character.body.velocity.y = -60;
        character.animations.play('normal', 1, true);
        if(character.shirt) {
            character.shirt.visible = true;
            character.shirt.animations.play('normal', 1, true);
        }
    } else if(bounceHigher) {
        // console.log('bounchighr')
;        character.upAnim = character.downAnim = false;
        isNormalBouncePosition = false;
        bounceHigher = false;
        if(character.body.velocity.y > -300) character.body.velocity.y += -100;
    }
}

function getGraphics(a, c, x, y, w, h, r) {
    var g = game.add.graphics(x, y);
    g.beginFill(c, a);
    if (r) {
        g.drawRoundedRect(0, 0, w, h, r);
    } else {
        g.drawRect(0, 0, w, h);
    }
    g.endFill();
    return g;
}

function popUpBalloons() {
    // console.log('pattern',pattern_count);
    audio_array = [];
    for(var i = 0; i < balloons.length; i++) {
        balloons[i].kill();
        balloons[i].string.destroy();
    }
    balloons = [];
    balloons.keys = [];
    ballLocation = [];

    var balloonsData = jsonData[currentLevel].balloons;

    for(var i in balloonsData) {
        var balloonData = balloonsData[i];
        var key = balloonData.name + '_balloon';

        var x;
        function x__pos() {
            var p;
            x_pos = shuffleArray(x_pos);
            p = x_pos[balloons.length];
            if(jQuery.inArray(p,ballLocation) !== -1){
                p = x_pos[balloons.length - 1];
                if(jQuery.inArray(p,ballLocation) !== -1){
                    p = x_pos[balloons.length - 2];
                    if(jQuery.inArray(p,ballLocation) !== -1){
                        p = x_pos[balloons.length - 3];
                        if(jQuery.inArray(p,ballLocation) !== -1){
                            p = x_pos[balloons.length - 4];
                            return p;
                        }else{
                            ballLocation.push(p);
                            return p;
                        }
                    }else{
                        ballLocation.push(p);
                        return p;
                    }
                }else{
                    ballLocation.push(p);
                    return p;
                }
            }else{
                ballLocation.push(p);
                return p;
            }
        }
        x = balloonData.position.x[pattern_count];
        var y = balloonData.position.y;
        var balloon = game.add.sprite(x, y, key);
        balloon.balloonData = balloonData;
        balloon.alpha = 0;
        balloon.target = balloonData.target;
        balloon.key = key;
        balloon.string = getGraphics(1, 0x000000, balloon.x - 3 + 0.5 * balloon.width, 0, 1, balloon.y + 2);

        balloons.push(balloon);
        balloons.keys.push(key);

        fadeInBalloon(balloon);
        game.physics.enable(balloon, Phaser.Physics.ARCADE);
        if(balloonData.target) {
            targetBalloon = balloonData.name;
            audio_array.push(balloonData.audio);

            if(balloonData.fly_away) {
                balloon.string.destroy();
                balloon.body.gravity.set(0, balloonData.gravity);
            }
        }
    }

    game.world.bringToTop(character);
    if(character.shirt) game.world.bringToTop(character.shirt);
    if(character.shoes) game.world.bringToTop(character.shoes);
    if(character.shorts) game.world.bringToTop(character.shorts);
    TargetAquired = false;

    pattern_count++;
    if(pattern_count > 2) pattern_count = 0;
}

function trampolineSwipe(direction) {
    // console.log('swipe', bouncing);
    if(bouncing) {
        if(direction === 'left' && trampoline.body.x > -50) {
            trampoline.body.velocity.x = character.body.velocity.x = -3700;
            if(trampoline.body.x > 597){
                trampoline.body.x = 597;
            }
        } else if(direction === 'right' && trampoline.body.x < game.width - trampoline.width + 50) {
            trampoline.body.velocity.x = character.body.velocity.x = 3700;
        }
    }
}

function listenTrampolineSwipe() {
    if(!bouncing) return;
    // console.log('swipe', bouncing);
    var eventDuration;
    var startPoint = {};
    var endPoint = {};
    var direction;
    var minimum = {
        duration: 30,
        distance: 100
    }

    game.input.onDown.add(function(pointer) {
        startPoint.x = pointer.clientX;
        startPoint.y = pointer.clientY;
    }, this);

    game.input.onUp.add(function(pointer) {
        direction = '';
        eventDuration = game.input.activePointer.duration;

        endPoint.x = pointer.clientX;
        endPoint.y = pointer.clientY;

        var dx = Math.abs(endPoint.x - startPoint.x);
        var dy = Math.abs(endPoint.y - startPoint.y);

        var actionSwipe = dx > minimum.distance || dy > minimum.distance;

        if (eventDuration > minimum.duration && actionSwipe && clickedTrampoline) {
            clickedTrampoline = false;

            // Check direction
            if (endPoint.x - startPoint.x > minimum.distance) {
                direction = 'right';
            } else if (startPoint.x - endPoint.x > minimum.distance) {
                direction = 'left';
            } else if (endPoint.y - startPoint.y > minimum.distance) {
                bouncing = false;
                direction = 'bottom';
            } else if (startPoint.y - endPoint.y > minimum.distance) {
                bouncing = false;
                direction = 'top';
            }

            if (direction) {
                trampolineSwipe(direction);
            }
        }
    }, this);
}

var ShowRound = function () {
    blvels = game.add.sprite(game.world.centerX, game.world.centerY, 'level');
    blvels.anchor.set(0.5);
    LevelTxt = game.add.text(-70, -30,'Level:', {font: '50px Titan One', fill: '#fff'});
    LevelTxt.text = 'Level ' + jsonData[currentLevel].level.split('.')[0];
    blvels.addChild(LevelTxt);
    game.time.events.add(2200, function() {
        blvels.visible = false;
        LevelTxt.visible = false;
    }, this);
};

function No(fb){
    wrong1 = game.add.sprite(fb.x, fb.y, 'wrong1');
    game.time.events.add(1000, function() {
        wrong1.visible = false;
    },this);
    speakSound('wrong');
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

function showLevelLock () {
    if (purchasePopup == null) {
        purchasePopup = new PurchasePopup (game);
    }

    enableButtons (false);

    purchasePopup.show ();
    game.stage.addChild (purchasePopup);
}

function hasPurchased () {
    var token = window.localStorage.getItem("purchaseToken");

    return token != null;
}

function enableButtons (bool) {
    character.inputEnabled = bool;
    trampoline.inputEnabled = bool;
    prevButton.inputEnabled = bool;
    nextButton.inputEnabled = bool;
} 