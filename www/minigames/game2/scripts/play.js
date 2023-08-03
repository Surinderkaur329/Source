var play = function(game) {};
var up_clicked = true;
var stage = 1;
var plank1,plank2,banner;
var plankleft = false;
var plankright = false;
var hidden_shapes = [];
var angles = [0,30,60,90,120,150,180,210,240,270,300,330];
var current_angle = 0;
var square_arr = [0,30,60,90,120,150,180,210,240,270,300,330];
var triangle_arr = [0,30,60,90,120,150,180,210,240,270,300,330];
var rectangle_arr = [0,30,60,90,120,150,180,210,240,270,300,330];

var bgVolume = 0.5;
var scores = 100;
var skip_button;
var returnUrl;
var showLevel = 0;
var nextButton = null;
var prevButton = null;
var purchasePopup = null;
var dock = null;

function exitGame(score) {
    if (returnUrl) {
        var gameResult = {score: score};
        stores.set("extGameResult", gameResult);
        window.location.replace(returnUrl);
    }
}

play.prototype = {
    init: function() {
        current_angle = 0;
        stage = 1;
        up_clicked = true;
        plankleft = false;
        plankright = false;
        hidden_shapes = [];
        angles = [0,30,60,90,120,150,180,210,240,270,300,330];
        current_angle = 0;
        levelData = jsonData[currentLevel];
        step = levelData.step;
        stepInterval = levelData.step_interval;
        solved = 0;
    },
    preload: function() {
        var extGameData = stores.get("extGameData");
        if (extGameData) {
            returnUrl = extGameData.returnUrl;
            stores.remove("extGameData");
        }
    },
    create: function() {
        game.add.tileSprite(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT , 'background');

        backgroundMusic = game.add.audio('song');
        backgroundMusic.volume = bgVolume;
        backgroundMusic.loopFull();

        window.localStorage.removeItem("gameEnded");


        plank1 = game.add.sprite(20, 640, 'plank1');
        plank2 = game.add.sprite(700.50, 640, 'plank1');
        banner = game.add.sprite(359.50, 171.50, 'banner');
        banner.inputEnabled = true;
        plank1.inputEnabled = true;
        plank2.inputEnabled = true;
        // game.physics.enable(plank1, Phaser.Physics.ARCADE);
        // game.physics.enable(plank2, Phaser.Physics.ARCADE);
        banner.anchor.setTo(0.5, 0.5);
        plank1.anchor.setTo(0.5, 0.5);
        plank2.anchor.setTo(0.5, 0.5);

        mainGroup = game.add.group();
        mainGroup.x = -SCREEN_WIDTH;

        slotItemsGroup = game.add.group();
        slotItemsGroup.alpha = 0;

        for(var i in levelData.main_image) {
            var imageObj = levelData.main_image[i];
            var sprite = game.add.sprite(imageObj.position.x, imageObj.position.y, imageObj.image);
            sprite.anchor.setTo(0.5, 0.5);
            mainGroup.add(sprite);

            emitterX = sprite.x;
            emitterY = sprite.y;
        }

        dock = game.add.graphics();
        dock.beginFill(levelData.dock.color, levelData.dock.alpha);
        dock.drawRect(levelData.dock.position.x, levelData.dock.position.y, levelData.dock.width, levelData.dock.height);
        dock.endFill();
        dock.inputEnabled = true;

        slotItemsGroup.add(dock);
        var m = 0;
        for(var i in levelData.slot_items) {
            var item = levelData.slot_items[i];

            // var hint = game.add.sprite(item.end_position.x, item.end_position.y, item.image.replace('.', '_right.'));
            // hint.anchor.setTo(0.5, 0.5);
            // hint.visible = false;
            // hint.alpha = 0.4;
            // hint.idx = hints.length;
            // hints.push(hint);
            // slotItemsGroup.add(hint);
            var sprite = game.add.sprite(item.begin_position.x, item.begin_position.y, item.image);
            if(!item.silo){
                m++;
                spArr.push(sprite);
                if(levelData.slot_items.length > 4){
                    if(m > 4){
                        hidden_shapes.push(sprite);
                    }
                }
            }
            sprite.anchor.setTo(0.5, 0.5);
            sprite.item = item;
            sprite.angle = item.begin_rotation;
            sprite.inputEnabled = true;
            sprite.input.useHandCursor = true;
            if(item.active !== false){
                sprite.events.onInputDown.add(function(sprite) {
                    ItemName = item.sound.split(".")[0];
                    if(!currentPiece) {
                        currentPiece = sprite;
                        if(levelData.level !== 10){
                            slotItemsGroup.bringToTop(currentPiece);
                        }
                        spArr.forEach(function (it) {
                            it.tween.pause();
                            it.scale.set(1);
                        });
                        speakSound('blip');
                        // if(isPhoneGap()) {
                        //     new SoundObject('assets/sounds/' + sprite.item.sound, false).play();
                        // }
                        // else {
                        game.add.audio(sprite.item.sound).play();
                        // }

                        gameState = GS_DROP_START;
                    }else {
                          if(!currentPiece.overlap(banner) && currentPiece.item.disable_rotation !== true){
                              current_angle = current_angle + 1;
                              if(current_angle > angles.length - 1){
                                  current_angle = 0;
                              }
                              currentPiece.angle = angles[current_angle];
                          }
                    }
                }, this);
            } else {
                sprite.events.onInputDown.add(function(sprite) {
                    game.add.audio('blip').play();
                }, this);
            }
            slotItemsGroup.add(sprite);
            // if(item.silo){
            //     slotItemsGroup.bringToTop(sprite);
            // }
            // hint.sprite = sprite;
            // sprite.hint = hint;

            // if(!item.silo){
                var t = game.add.tween(sprite.scale);
                t.from({x:0.9,y:0.9}, 500, Phaser.Easing.Quadratic.Out, true, 0, -1, true);
                sprite.tween = t;
            // }
            if(item.silo){
                sprite.tween.pause();
                sprite.scale.set(1);
            }

        }
        for(var i in hidden_shapes) {
            hidden_shapes[i].visible = false;
        }

        cursors = game.input.keyboard.createCursorKeys();
        stariArr = [];
        shapeAddedArr = [];
        for(var i = 0; i < levelData.num; i++){
            // Stari
            stari = game.add.emitter(emitterX, emitterY);
            stari.makeParticles('stari');
            stari.gravity = 200;

            // Red Stari
            redStari = game.add.emitter(emitterX, emitterY);
            redStari.makeParticles('red_stari');
            redStari.gravity = 200;
            stariArr.push({stari:stari,redStari:redStari})

        }

        // Nav Buttons
        leftButton =  game.add.sprite(50, 1230,'left_arrow');
        leftButton.inputEnabled = true;
        leftButton.input.useHandCursor = true;
        leftButton.anchor.setTo(0.5, 0.5);
        
        leftTween = game.add.tween(leftButton.scale).to({
            x: 1.15, y: 1.15
        }, 1500, Phaser.Easing.Linear.None, true, 0, -1, true);
        leftTween.pause();
        
        leftButton.events.onInputDown.add(function () {speakSound('blip');handleControl('left');}, this);
        // rightTween = createControl(rightButton,rightTween,670,1230,500,'right','right_arrow');
        rightButton =  game.add.sprite(670, 1230,'right_arrow');
        rightButton.inputEnabled = true;
        rightButton.input.useHandCursor = true;
        rightButton.anchor.setTo(0.5, 0.5);
        game.time.events.add(500, function() {
            rightTween = game.add.tween(rightButton.scale).to({
                x: 1.15, y: 1.15
            }, 1500, Phaser.Easing.Linear.None, true, 0, -1, true);
            rightTween.pause();
        }, this);
        rightButton.events.onInputDown.add(function () {speakSound('blip');handleControl('right');}, this);
        // downTween = createControl(downButton,downTween,356,1230,1000,'down','down_arrow');
        downButton =  game.add.sprite(356, 1230,'down_arrow');
        downButton.inputEnabled = true;
        downButton.input.useHandCursor = true;
        downButton.anchor.setTo(0.5, 0.5);
        game.time.events.add(1000, function() {
            downTween = game.add.tween(downButton.scale).to({
                x: 1.15, y: 1.15
            }, 1500, Phaser.Easing.Linear.None, true, 0, -1, true);
            downTween.pause();
        },this);
        downButton.events.onInputDown.add(function () {speakSound('blip');handleControl('down');}, this);
        downButton.events.onInputUp.add( StopMovement, this);
        leftButton.events.onInputUp.add( StopMovement, this);
        rightButton.events.onInputUp.add( StopMovement, this);

        gameState = GS_INIT;

        if(currentLevel === 0 || currentLevel === 4 || currentLevel === 7 || currentLevel === 9){
            if(currentLevel === 0){
                showLevel = 1;
            } else if(currentLevel === 4){
                showLevel = 2;
            }else if(currentLevel === 7){
                showLevel = 3;
            } else {
               showLevel = 4; 
            }
            ShowRound();
        }

        skip_button = game.add.sprite(game.world.centerX + 288, 5, 'homeBtn');
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
            if(currentLevel < jsonData.length) {
                if (jsonData[currentLevel].level >= 7 && !hasPurchased ()) {
                    // console.log ("lock")
                    showLevelLock ();
                } else {
                    currentLevel++;
                    backgroundMusic.stop();
                    game.state.start('Preloader');
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
               currentLevel--;
               backgroundMusic.stop();
               game.state.start('Preloader');
            }
        }, this);


    },
    update: function() {
        switch(gameState) {
            case GS_NONE:
                for(var i in hints) hints[i].visible = false;
                if(solved === levelData.num) {
                    stariArr.forEach(function (item) {
                        item.stari.start(true, 3000, null, 100);
                        item.redStari.start(true, 3000, null, 100);
                    });
                }
                break;
            case GS_INIT:
                game.add.tween(mainGroup).to({x:0}, 1000, Phaser.Easing.Linear.None, true).onComplete.add(function(){
                    game.add.tween(slotItemsGroup).to({alpha:1}, 1500, Phaser.Easing.Linear.None, true, 500);
                });
                gameState = GS_NONE;
                break;
            case GS_DROP_START:
                dropItem();
                gameState = GS_DROPPING;
                break;
            case GS_DROPPING:
                if(!cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown){
                    leftTween.resume();
                    rightTween.resume();
                    downTween.resume();
                }
                if (cursors.up.isDown && currentPiece.item.disable_rotation !== true && !currentPiece.overlap(banner)) {
                    if(up_clicked){
                        current_angle = current_angle + 1;
                        if(current_angle > angles.length - 1){
                            current_angle = 0;
                        }
                        currentPiece.angle = angles[current_angle];
                        // speakSound('blip');
                        up_clicked = false;
                    }
                    game.time.events.add(100, function() {
                        up_clicked = true;
                    },this);
                } else if (cursors.left.isDown && !currentPiece.overlap(banner)) {
                    if(!plankleft){
                        // speakSound('blip');
                        currentPiece.x -= 1;
                    }
                    if(currentPiece.overlap(plank1)){
                        plankleft = true;
                        currentPiece.x = currentPiece.x;
                    }else{
                        plankleft = false;
                    }
                } else if (cursors.right.isDown && !currentPiece.overlap(banner)) {
                    if(!plankright){
                        // speakSound('blip');
                        currentPiece.x += 1;
                    }
                    if(currentPiece.overlap(plank2)){
                        plankright = true;
                        currentPiece.x = currentPiece.x;
                    }else{
                        plankright = false;
                    }
                }else if (cursors.down.isDown) {
                    // speakSound('blip');
                    step = levelData.step + levelData.step * 2;
                    GS_DROP_START = true;
                }
//                    if(isDownKey === true){
//                        dropItem();
//                        isDownKey = false;
//                    }
                checkBounds();
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

function speakSound(x) {
    game.add.audio(x).play();
}

function createControl(Button,Tween,x,y,time,name,action) {
    Button =  game.add.sprite(x, y,action);
    Button.inputEnabled = true;
    Button.input.useHandCursor = true;
    Button.anchor.setTo(0.5, 0.5);
    game.time.events.add(time, function() {
        Tween = game.add.tween(Button.scale).to({
            x: 1.15, y: 1.15
        }, 1500, Phaser.Easing.Linear.None, true, 0, -1, true);
        Tween.pause();
    }, this);
    Button.events.onInputDown.add(function () {handleControl(name);}, this);
    return Tween;
}

function handleControl(action) {
    if(currentPiece) {
        downTween.pause();
        leftTween.pause();
        rightTween.pause();
        switch(action) {
            case 'left':
                game.add.tween(leftButton.scale).to( { x: 1.3,y:1.3}, 100, "Linear", true);
                cursors.left.isDown = true;
                // if(!plankleft){
                //     currentPiece.x -= 14;
                // }
                // if(currentPiece.overlap(plank1)){
                //     plankleft = true;
                //     currentPiece.x = currentPiece.x;
                // }else{
                //     plankleft = false;
                // }
                 break;
            case 'right':
                game.add.tween(rightButton.scale).to( { x: 1.3,y:1.3}, 100, "Linear", true);
                cursors.right.isDown = true;
                // if(!plankright){
                //     currentPiece.x += 14;
                // }
                // if(currentPiece.overlap(plank2)){
                //     plankright = true;
                //     currentPiece.x = currentPiece.x;
                // }else{
                //     plankright = false;
                // }
                break;
            case 'up':
                //                        game.add.tween(upButton.scale).to( { x: 1.3,y:1.3}, 100, "Linear", true);
//                        if(currentPiece.item.disable_rotation) return;
//                        currentPiece.angle -= 10;
                break;
            case 'down':
                game.add.tween(downButton.scale).to( { x: 1.3,y:1.3}, 100, "Linear", true);
                cursors.down.isDown = true;
                // step = levelData.step + levelData.step  * 2;
//                        GS_DROP_START = true;
                break;
        }

        checkBounds();
    }
}

function dropItem() {
    step = levelData.step;
    game.time.events.add(stepInterval, function() {
        if (gameState === GS_DROPPING) {
            currentPiece.y += (window.innerHeight  * step);
           // currentPiece.y += 1;

            if (currentPiece.y > game.world.height) {
                gameState = GS_NONE;
                currentPiece.x = currentPiece.item.begin_position.x;
                currentPiece.y = currentPiece.item.begin_position.y;
                currentPiece.angle = currentPiece.item.begin_rotation;
                spArr.forEach(function (it) {
                    it.tween.resume();
                });
                leftTween.pause();
                rightTween.pause();
                downTween.pause();
                currentPiece = null;
            } else {
                dropItem();
            }
        }

    }, this);
}

function checkBounds() {
    // Check screen bounds
    var halfCurrentPieceWidth = 0.5 * currentPiece.width;
    if(currentPiece.x + halfCurrentPieceWidth > SCREEN_WIDTH) {
        currentPiece.x = SCREEN_WIDTH - halfCurrentPieceWidth;
    } else if(currentPiece.x - halfCurrentPieceWidth < 0) {
        currentPiece.x = halfCurrentPieceWidth;
    }

    // Check if puzzle piece is close enough to it's target. If so, snap it into place and choose next piece to be moved.
    for(var i in currentPiece.item.end_position){
        if(currentPiece === null) return;
        var endPos = currentPiece.item.end_position[i];
        var endRotation = currentPiece.item.end_rotation;
        if(currentPiece.y > currentPiece.item.end_position[i].y){
            step = levelData.step * 10;
            GS_DROP_START = true;
        }
        if(Math.abs(currentPiece.x - endPos.x) < XY_THRESHHOLDS &&
            Math.abs(currentPiece.y - endPos.y) < XY_THRESHHOLDS &&
            Math.abs(currentPiece.angle - endRotation) < ANGLE_THRESHHOLD
            ||
            (currentPiece.item.sound === 'square.mp3' && (Math.abs(currentPiece.angle - endRotation) === 90 ||
                Math.abs(currentPiece.angle - endRotation) === 180 || Math.abs(currentPiece.angle - endRotation) === 270)
                && Math.abs(currentPiece.x - endPos.x) < XY_THRESHHOLDS && Math.abs(currentPiece.y - endPos.y) < XY_THRESHHOLDS)
            ||
            (currentPiece.item.sound === 'triangle.mp3' && (Math.abs(currentPiece.angle - endRotation) === 60 ||
                Math.abs(currentPiece.angle - endRotation) === 120 || Math.abs(currentPiece.angle - endRotation) === 90  || Math.abs(currentPiece.angle - endRotation) === 180)
                && Math.abs(currentPiece.x - endPos.x) < XY_THRESHHOLDS && Math.abs(currentPiece.y - endPos.y) < XY_THRESHHOLDS)
            || //0, 60, 120, 180, 240, 300, 360
            (currentPiece.item.sound === 'rectangle.mp3' && Math.abs(currentPiece.angle - endRotation) === 180
                && Math.abs(currentPiece.x - endPos.x) < XY_THRESHHOLDS && Math.abs(currentPiece.y - endPos.y) < XY_THRESHHOLDS)
        ) {
            if(currentPiece.item.image === "game3a/triangle3.png" && endPos.position === 7){

                if(Math.abs(currentPiece.angle - endRotation) === 90){
                    currentPiece.angle = -90;
                    currentPiece.x = endPos.x;
                    currentPiece.y = endPos.y;
                    portted();
                }
            }else if(currentPiece.item.image === "game3a/triangle4.png" && endPos.position === 3){
                if(Math.abs(currentPiece.angle - endRotation) === 90){
                    currentPiece.angle = 90;
                    currentPiece.x = endPos.x;
                    currentPiece.y = endPos.y;
                    portted();
                }
            }else if(currentPiece.item.image === "game4a/triangle.png" && endPos.position === 3){
                if((Math.abs(currentPiece.angle - endRotation) === 60 || Math.abs(currentPiece.angle - endRotation) === 180)){
                    currentPiece.angle = 180;
                    currentPiece.x = endPos.x;
                    currentPiece.y = endPos.y;
                    portted();
                }
            }else if(currentPiece.item.image === "game4a/triangle2.png" && endPos.position === 1){
                if((Math.abs(currentPiece.angle - endRotation) === 60 || Math.abs(currentPiece.angle - endRotation) === 180)){
                    currentPiece.angle = 180;
                    currentPiece.x = endPos.x;
                    currentPiece.y = endPos.y;
                    portted();
                }
            }else{
                currentPiece.x = endPos.x;
                currentPiece.y = endPos.y;
                currentPiece.angle = endRotation;
                portted();
            }
            function portted(){
                stariArr.forEach(function (item,index,arr) {
                    if(solved === index){
                        item.stari.x = currentPiece.x;
                        item.redStari.x = currentPiece.x;
                        item.stari.y = currentPiece.y;
                        item.redStari.y = currentPiece.y;
                    }
                });
                shapeAddedArr.push(currentPiece);
                spArr.splice(spArr.indexOf(currentPiece), 1);
                leftTween.pause();
                rightTween.pause();
                downTween.pause();
                // currentPiece.hint.destroy();
                hints.splice(hints.indexOf(currentPiece.hint), 1);
                gameState = GS_NONE;
                for(var i in levelData.slot_items) {
                    var item = levelData.slot_items[i];
                    for(var j = 0; j < item.end_position.length; j++){
                        if(item.end_position[j].position === endPos.position){
                            item.end_position.splice(item.end_position.indexOf(item.end_position[j]), 1)
                        }
                    }
                }
                currentPiece = null;
                speakSound('expand');
                solved++;
                if((solved === 4 || solved === 8 || solved === 12) && hidden_shapes.length > 0){
                    for(var m = 0; m < hidden_shapes.length; m++) {
                        if(m > 4) return;
                        hidden_shapes[m].visible = true;
                    }
                    for(var m = 0; m < hidden_shapes.length; m++) {
                        if(m > 4) return;
                        hidden_shapes.splice(hidden_shapes.indexOf(hidden_shapes[m]), 1)
                    }
                }
                if (solved === levelData.num) {
                    speakSound('TaDa');

                    if (jsonData[currentLevel+1].level >= 7 && !hasPurchased()) {
                        // console.log ("lock")
                        showLevelLock ();
                    } else {
                        game.time.events.add(5000, nextLevel);
                    }
                } else {
                    spArr.forEach(function (it) {
                        it.tween.resume();
                    });
                }
            }
        } else {
//                for(var i in hints) {
//                    var boundsA = currentPiece.getBounds();
//                    var boundsB = hints[i].getBounds();
//                    var showHint = Phaser.Rectangle.intersects(boundsA, boundsB);
//                    hints[i].visible = showHint;
//                    if (showHint) {
//                        hints[i].loadTexture(hints[i].sprite.key.replace(
//                            '.', hints[i].sprite == currentPiece ? '_right.' : '_wrong.'));
//                    }
//                }
        }
    }
}

function render() {
    // if(DEBUGGING && currentPiece) {
    //     // Debug info
    //     game.debug.spriteInfo(currentPiece, 32, 132);
    //
    //     game.debug.text('thresh: ' + JSON.stringify({
    //         x: Math.abs(currentPiece.x - currentPiece.item.end_position.x),
    //         y: Math.abs(currentPiece.y - currentPiece.item.end_position.y),
    //         angle: Math.abs(currentPiece.angle - currentPiece.item.end_rotation)
    //     }), 32, 282);
    // }
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
    currentLevel++;
    console.log (jsonData[currentLevel].level)
    if(currentLevel < jsonData.length) {
        backgroundMusic.stop();
        game.state.start('Preloader');
        // game.state.start('main');
        // game.state.start('play');
        // var state = 'level' + currentLevel;

        // game.state.add(state, {
        //     init: init,
        //     preload: preload,
        //     create: create,
        //     update: update,
        //     render: render
        // });
        // game.state.start(state);
    } else {
        speakSound('Cheering');
        stari.destroy();
        redStari.destroy();

        getGraphics(0.2, 0x000000, 0, 0, 720, 1280);

        var staris = ['stari', 'red_stari'];
        var emitters = [];
        window.localStorage.setItem("gameEnded", "true");
        for (var i in staris) {
            var emitter = game.add.emitter(game.world.centerX, 500, 500);
            //  This emitter will have a width of 800px, so a particle can emit from anywhere in the range emitter.x += emitter.width / 2
            emitter.width = 720;
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

function StopMovement() {
    leftTween.resume();
    rightTween.resume();
    downTween.resume();
    cursors.up.isDown = cursors.left.isDown = cursors.right.isDown = cursors.down.isDown = false;
}

var ShowRound = function () {
    blvels = game.add.sprite(game.world.centerX, game.world.centerY, 'level');
    blvels.anchor.set(0.5);
    LevelTxt = game.add.text(-70, -30,'Level:', {font: '50px Titan One', fill: '#fff'});
    LevelTxt.text = 'Level ' + showLevel;
    blvels.addChild(LevelTxt); 
    game.time.events.add(3000, function () {
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

function hasPurchased () {
    var token = window.localStorage.getItem("purchaseToken");

    return token != null;
}

function enableButtons (bool) {
    rightButton.inputEnabled = bool;
    leftButton.inputEnabled = bool;
    downButton.inputEnabled = bool;
    prevButton.inputEnabled = bool;
    nextButton.inputEnabled = bool;
    skip_button.inputEnabled = bool;
    banner.inputEnabled = bool;
    plank1.inputEnabled = bool;
    plank2.inputEnabled = bool;

    for (var i = 0; i < slotItemsGroup.children.length; i++) {
        slotItemsGroup.getChildAt(i).inputEnabled = bool;
    }
} 