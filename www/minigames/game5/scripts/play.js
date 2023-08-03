var play = function(game) {};

var bgVolume = 0.5;

var purchasePopup = null;
var nextButton = null;
var prevButton = null;
var leftButton = null;
var rightButton = null;
var downButton = null;
var upButton = null;

play.prototype = {
    create: create,
    update: update,
    render: render,
    onResume: onResume,
    enableButtons: enableButtons
};

function create() {

    //initialize nos array
    nos = jsonData[level].balls;

    //  Enable p2 physics
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.startSystem(Phaser.Physics.ARCADE);

    backgroundMusic = game.add.audio('song');
    backgroundMusic.volume = bgVolume;
    backgroundMusic.loopFull();

    window.localStorage.removeItem("gameEnded");

    FIRE_TRUCK_OFFSET_Y = (game.cache.getImage('fire_truck').height / 2) + 5;
    WATER_CANNON_OFFSET_Y = FIRE_TRUCK_OFFSET_Y - 10;
    CANNON_SHOT_OFFSET_X = WATER_CANNON_OFFSET_X + game.cache.getImage('water_cannon').width;

    game.add.tileSprite(0, 0, 1280, 720, 'background');

    retry = game.add.sprite(game.world.centerX -110, game.world.centerY - 110, 'retry');
    retry.inputEnabled = true;
    retry.events.onInputDown.add(tryAgain, this);
    retry.visible = false;

    fb_ = game.add.sprite(20, game.world.height, 'fireball');
    //initialize life line

    loading1 = game.add.sprite(game.world.centerX + 370, game.world.centerY -320, 'loading1');
    loading1.anchor.set(0.5, 0.5);
    loading2 = game.add.sprite(-253, -16, 'loading2');
    loading1.addChild(loading2);
    // loading2.anchor.setTo(1);
    cropRect = new Phaser.Rectangle(0, 0, 0, loading2.height);
    Life_line(505);
    loading1.visible = false;

    //rounds
    ShowRound();

    // Ammo count HUD
    // var ammo = game.add.sprite(10, 20, 'cannon_shot');
    // //ammo.scale.set(2);
    // ammo_count_label = game.add.text(ammo.x + ammo.width + 20, ammo.y + 0.5 * ammo.height, ammo_count + '',
    //     {font: "bold 30px Arial black", align: "center", fill: '#000000'});
    // ammo_count_label.anchor.setTo(0.5);

    //  platforms group contains immovable items, 'stuck' to the ground
    platforms = game.add.group();
    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Create the underground and make it immovable (stops it from falling away when you jump on it).
    // var ground1_y = game.world.height - game.cache.getImage('ground1').height;
    ground1 = game.add.sprite(0 , game.world.height -100, 'ground1'); // platforms.create(0, ground1_y, 'ground1');

    var ground3_y = game.world.height - game.cache.getImage('ground1').height - game.cache.getImage('ground3').height;
    ground3 = game.add.sprite(0 , game.world.height -108, 'ground3'); //  platforms.create(0, ground3_y, 'ground3');


    cannon_shot = game.add.sprite(HS_3_POSITION.x + WATER_CANNON_OFFSET_X, 0, 'cannon_shot');
    game.physics.p2.enable(cannon_shot);
    cannon_shot.body.clearCollision(true, true);
    cannon_shot.anchor.setTo(1.0, 0.5);
    cannon_shot.pivot.x = -game.cache.getImage('water_cannon').width;

    // Create fire truck
    water_cannon = game.add.sprite(HS_3_POSITION.x + WATER_CANNON_OFFSET_X, HS_3_POSITION.y - WATER_CANNON_OFFSET_Y, 'water_cannon');
    game.physics.p2.enable(water_cannon);
    water_cannon.body.clearCollision(true, true);
    water_cannon.anchor.setTo(0.0, 0.5);
    water_cannon.body.angle = -20;

    fire_truck = game.add.sprite(HS_3_POSITION.x, HS_3_POSITION.y - FIRE_TRUCK_OFFSET_Y, 'fire_truck');
    fire_truck.inputEnabled = true;
    fire_truck.events.onInputDown.add(onShotFired, this);
    game.physics.p2.enable(fire_truck);
    fire_truck.body.clearCollision(true, true);

    // Create hydraulic scissor
    hs_1 = game.add.sprite(HS_1_POSITION.x, HS_1_POSITION.y, 'metal_texture');
    game.physics.p2.enable(hs_1);
    hs_1.body.clearCollision(true, true);

    hs_2 = game.add.sprite(HS_1_POSITION.x, HS_1_POSITION.y, 'metal_texture');
    game.physics.p2.enable(hs_2);
    hs_2.body.clearCollision(true, true);

    hs_3 = game.add.sprite(HS_3_POSITION.x, HS_3_POSITION.y, 'metal_texture');
    game.physics.p2.enable(hs_3);
    hs_3.body.clearCollision(true, true);

    hs_4 = game.add.sprite(HS_3_POSITION.x, HS_3_POSITION.y, 'metal_texture');
    game.physics.p2.enable(hs_4);
    hs_4.body.clearCollision(true, true);

    hl_landing = game.add.sprite(HS_3_POSITION.x, HS_3_POSITION.y, 'metal_texture_corner');
    game.physics.p2.enable(hl_landing);
    hl_landing.body.clearCollision(true, true);

    hl_bottom = game.add.sprite(HS_1_POSITION.x, HS_1_POSITION.y, 'metal_texture_corner');
    game.physics.p2.enable(hl_bottom);
    hl_bottom.body.clearCollision(true, true);

    // Create helper point
    POINT_POSITION = { x: HS_1_POSITION.x + (game.cache.getImage('metal_texture').width / 2), y: HS_1_POSITION.y };
    p1 = new Phaser.Point(POINT_POSITION.x, POINT_POSITION.y);

    // Initialize keyboard input
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
    var shootKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    shootKey.onDown.add(onShotFired, this);


    //bullets score
//            bullets = jsonData[level].bullets;
//            bulletsText = game.add.text(game.world.centerX + 330, game.world.centerY -240,'Bullet(s):', {font: '32px Arial', fill: '#fff'});
//            bulletsText.text = 'Bullet(s): ' + bullets;

    // Initialize hydraulic scissor angle
    hs_1_angle = hs_1.body.angle;

    fireballs = [];
    fireLocation = [];
    count__++;
    if(count__ > 3){
        count__ = 1;
        y_pos = 0;
    }
    yPos = yPos3[y_pos3];
    game.time.events.add(2000, function() {
        speakSound(jsonData[level].audio);
        spawnFireBall(offset);
    }, this);
    // y_pos3++;
    // if(y_pos3 > 2){
    //     y_pos3 = 0;
    // }
    // create_placeholders();

    upButton = createControl(game.width - 240, game.height - 240, 1280, 120, 0xc4c4c4, 0, 'up_button', function(){ speakSound('blip');action_down = 'up'; });
    downButton = createControl(game.width - 240, game.height - 100, 120, 120, 0xc4c4c4, 0, 'down_button', function(){ speakSound('blip');action_down = 'down'; });
    leftButton = createControl(0, game.height - 165, 120, 480, 0xc4c4c4, 0, 'left_button', function(){ speakSound('blip');action_down = 'left'; });
    rightButton = createControl(game.width - 100, game.height - 165, 120, 480, 0xc4c4c4, 0, 'right_button', function(){ speakSound('blip');action_down = 'right'; });

    // skip_button = game.add.text(1200, 0, "Exit", {
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
        if(level < jsonData.length){
            if(level < 10){
                level = 10;
            }else if(level < 21){
                level = 21;
            }else if(level < 32){
                level = 32;
            }else if(level < 43){
                level = 43;
            }
            
            if (jsonData[level].level == 3.1 && !hasPurchased()) {
                level = 10;
                showLevelLock ();
            } else {
                hit = 0;
                retryNumber = 0;
                hit_count = 0;
                startLife = 505;
                Life_line(startLife);
                
                if(jsonData[level].level.split('.')[1] === '1'){
                    game.time.events.add(2000, function() {
                        fb_arr.forEach(function (value) {
                            value.visible = false;
                        });
                        fired_nums = [];
                    },this);
                    ShowRound();
                }
                game.time.events.add(100, function() {
                    recreateFireballs();
                },this);
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
            if(level > 43){
                level = 43;
            }else if(level > 32){
                level = 32;
            }else if(level > 21){
                level = 21;
            }else if(level > 10){
                level = 10;
            }else{
                level = 0;
            }
            hit = 0;
            retryNumber = 0;
            hit_count = 0;
            startLife = 505;
            Life_line(startLife);
            if(jsonData[level].level.split('.')[1] === '1'){
                game.time.events.add(2000, function() {
                    fb_arr.forEach(function (value) {
                        value.visible = false;
                    });
                    fired_nums = [];
                },this);
                ShowRound();
            }
            if(emitters){
                emitters.destroy();
            }
            game.time.events.add(100, function() {
                recreateFireballs();
            },this);
        }
    }, this);     
}

function createControl(x, y, width, height, color, alpha, action, callback) {
    var g = game.add.sprite(x, y, action);
    g.inputEnabled = true;
    g.input.useHandCursor = true;
    g.events.onInputDown.add(callback, this);
    g.events.onInputUp.add(function() { action_down = null; }, this);


    if(action === 'down_button'){down_button = g}
    if(action === 'left_button'){left_button = g}
    if(action === 'up_button'){up_button = g}
    if(action === 'right_button'){right_button = g}

    return g;
}

function handleControl(action) {
    switch(action) {
        case 'left':
            if (water_cannon.body.angle > -WC_ANGLE_UPPER_LIMIT) {
                water_cannon.body.angle -= ROTATE_DELTA;
            }
            break;
        case 'right':
            if (water_cannon.body.angle < -WC_ANGLE_LOWER_LIMIT) {
                water_cannon.body.angle += ROTATE_DELTA;
            }
            break;
        case 'up':
            if (hs_1.body.angle > -HS_ANGLE_UPPER_LIMIT) {
                hs_3.body.angle = hs_1.body.angle -= ROTATE_DELTA;
                hs_4.body.angle = hs_2.body.angle += ROTATE_DELTA;
            }
            break;
        case 'down':
            if (hs_1.body.angle < -HS_ANGLE_LOWER_LIMIT) {
                hs_3.body.angle = hs_1.body.angle += ROTATE_DELTA;
                hs_4.body.angle = hs_2.body.angle -= ROTATE_DELTA;
            }
            break;
    }
}

function update() {
    if(isGameOver) return;
//            if(jsonData[level]){
//                if(jsonData[level].level.split('.')[0] === '1'){
//                    x_pos = shuffleArray(x_pos);
//                }
//            }
    if(action_down) {
           handleControl(action_down);
    }


    if (cursors.up.isDown && hs_1.body.angle > -HS_ANGLE_UPPER_LIMIT) {
        hs_3.body.angle = hs_1.body.angle -= ROTATE_DELTA;
        hs_4.body.angle = hs_2.body.angle += ROTATE_DELTA;
    } else if (cursors.down.isDown && hs_1.body.angle < -HS_ANGLE_LOWER_LIMIT) {
        hs_3.body.angle = hs_1.body.angle += ROTATE_DELTA;
        hs_4.body.angle = hs_2.body.angle -= ROTATE_DELTA;
    }

    if (cursors.left.isDown && water_cannon.body.angle > -WC_ANGLE_UPPER_LIMIT) {
        water_cannon.body.angle -= ROTATE_DELTA;
    } else if (cursors.right.isDown && water_cannon.body.angle < -WC_ANGLE_LOWER_LIMIT) {
        water_cannon.body.angle += ROTATE_DELTA;
    }

    if(hs_1.body.angle < -HS_ANGLE_UPPER_LIMIT) {
        hs_3.body.angle = hs_1.body.angle = -HS_ANGLE_UPPER_LIMIT;
        hs_4.body.angle = hs_2.body.angle = HS_ANGLE_UPPER_LIMIT;
    }
    if(hs_1.body.angle > -HS_ANGLE_LOWER_LIMIT) {
        hs_3.body.angle = hs_1.body.angle = -HS_ANGLE_LOWER_LIMIT;
        hs_4.body.angle = hs_2.body.angle = HS_ANGLE_LOWER_LIMIT;
    }
    if(water_cannon.body.angle < -WC_ANGLE_UPPER_LIMIT) {
        water_cannon.body.angle = -WC_ANGLE_UPPER_LIMIT;
    }
    if(water_cannon.body.angle > -WC_ANGLE_LOWER_LIMIT) {
        water_cannon.body.angle = -WC_ANGLE_LOWER_LIMIT;
    }

    // var y_bottom_right = p1.y;
    p1.set(POINT_POSITION.x, POINT_POSITION.y);
    p1.rotate(HS_1_POSITION.x, POINT_POSITION.y, hs_1_angle, true);
    var height_delta = p1.y - POINT_POSITION.y;
    hs_2.body.y = hs_1.body.y = HS_1_POSITION.y + height_delta;
    hs_4.body.y = hs_3.body.y = HS_3_POSITION.y + (height_delta * 3);
    hl_landing.body.y = HS_3_POSITION.y + (height_delta * 4);
    fire_truck.body.y = hl_landing.body.y - FIRE_TRUCK_OFFSET_Y;
    water_cannon.body.y = fire_truck.body.y - WATER_CANNON_OFFSET_Y;

    cannon_shot.body.y = water_cannon.body.y;
    cannon_shot.body.angle = water_cannon.body.angle;
    HitTarget = false;
    game.physics.arcade.overlap(fireballs, cannon_shots, function(fb, cannon_shot) {
        cannon_shot.destroy();
        if(fb.no === jsonData[level].hit_number) {
            HitTarget = true;
            speakSound('gem');
            fired_nums.push(jsonData[level].hit_number);
            destroyFireball(fb);
            game.time.events.add(500, function() {
                speakSound('seefa_merge_1');
                makeFireballCounter();
            },this);
            hit++;
            if(hit === jsonData[level].hit_count) {                
                if(level + 1 < jsonData.length){
                    if (jsonData[level + 1].level == 3.1 && !hasPurchased()) {
                        showLevelLock ();
                    } else {
                        level++;
                        hit = 0;
                        retryNumber = 0;
                        hit_count = 0;
                        startLife = 505;
                        Life_line(startLife);
                        // create_placeholders(
    //                            bullets = jsonData[level].bullets;
    //                            bulletsText.text = 'Bullet(s): ' + bullets;
                        if(jsonData[level].level.split('.')[1] === '1'){
                            game.time.events.add(2000, function() {
                                fb_arr.forEach(function (value) {
                                    value.visible = false;
                                });
                                fired_nums = [];
                            },this);
                            ShowRound();
                        }
                    }
                }
            }else{
                startLife = startLife + reduceLife;
                if(startLife > 505){startLife = 505 }
                Life_line(startLife);
            }
            if(level < jsonData.length){
                game.time.events.add(1000, function() {
                    recreateFireballs();
                },this);
            }
            else {
                DestroyBall();
            }
        }else{
            No(fb);
            // if(jsonData[level].level.split('.')[0] === '3'
            //     || jsonData[level].level.split('.')[0] === '4'
            //     || jsonData[level].level.split('.')[0] === '5'){
            //     if(jQuery.inArray(fb,wrongBall) !== -1){
            //         fb.destroy();
            //         fb.fbNo.destroy();
            //     }else{
            //         wrongBall.push(fb);
            //         No(fb);
            //     }
            // }else{
            //     No(fb);
            // }
        }
    });

    var recreate = fireballs.length > 0;

    for(var i in fireballs) {
        if(fireballs[i].body !== null){
            if(fireballs[i].body.y < game.world.height - 100) {
                recreate = false;
                break;
            }
        }
    }

    if(recreate) {
        //     dropping++;
        //     if(dropping > 2){
        //         if(jsonData[level].level.split('.')[0] === '1'){
        //             level = 0;
        //         }else if(jsonData[level].level.split('.')[0] === '2'){
        //             level = 10;
        //         }else if(jsonData[level].level.split('.')[0] === '3'){
        //             level = 21;
        //         }else if(jsonData[level].level.split('.')[0] === '4'){
        //             level = 32;
        //         }else if(jsonData[level].level.split('.')[0] === '5'){
        //             level = 43;
        //         }else{
        //             level = 54;
        //         }
        //         ShowRound();
        //         LevelText.text = 'Level: ' + jsonData[level].level.split('.')[0] + ' Round:' + jsonData[level].level.split('.')[1];
        //     }
        if(jsonData[level] === undefined){
            if(endGame){
                endAnim();
                endGame = false;
            }
        }else{
            recreateFireballs();
        }
    }


    game.time.events.add(3, function() {
        wrong_arr.forEach(function (value) {
            value.visible = false;
        });
    },this);
}

function recreateFireballs() {
    if(isGameOver) return;
    for (var i in fireballs) {
        (function(fb) {
            game.add.tween(fb).to({
                alpha: 0
            }, 750, Phaser.Easing.Linear.None, true).onComplete.add(function() {
                fb.destroy();
                fb.fbNo.destroy();
            }, this);
        })(fireballs[i]);
    }
    ballLocation = [];
    fireballs = [];
    count__++;
    if(count__ > 3){
        count__ = 1;
        y_pos = 0;
    }
    yPos = yPos3[y_pos3];
    game.time.events.add(3000, function() {
        spawnFireBall(offset);
        speakSound(jsonData[level].audio);
    }, this);
    y_pos3++;
    if(y_pos3 > 2){
        y_pos3 = 0;
    }
    // if(HitTarget == false){
    //     startLife = startLife - reduceLife;
    //     if(startLife > 1){
    //         Life_line(startLife);
    //     }else{
    //         isGameOver = true;
    //         DestroyBall();
    //         tryAgain();
    //     }
    // }
}

function makeFireballCounter() {
    for(var i = 0; i < fired_nums.length; i++){
        fb_ = game.add.sprite(20, game.world.height, 'fireball');
        fb_.x +=  (i ) * fb_.width;
        // fb_.scale.setTo(0.6);
        fb_.y -= fb_.height + 10;
        var fbNo = game.add.text(fb_.width - 38, fb_.height - 55, fired_nums[i] + '',
            {
                font: "bold 20px Arial black",
                align: "center",
                fill: "#000000",
                stroke: "#FEFF49",
                strokeThickness: 5
            });
        fbNo.scale.setTo(1.6);
        fbNo.anchor.setTo(0.5,0,5);
        fb_.addChild(fbNo);
        fb_arr.push(fb_);
        game.world.bringToTop(fb_);
        game.world.bringToTop(left_button);
        game.world.bringToTop(right_button);
        game.world.bringToTop(down_button);
        game.world.bringToTop(up_button);
    }
}

function speakSound(x) {
    // console.log(x);
    game.add.audio(x).play();
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

function spawnFireBall(offsy) {
    
    wrongBall = [];
    offsy = offsy + 152;
    if(isGameOver) return;
    if(fireballs.length >=  jsonData[level].ball_limit) return;

    var fb,x,y;
    var no;
    if(jsonData[level].level.split('.')[0] === '4' || jsonData[level].level.split('.')[0] === '5'){
        if(y_pos3 === 0){
            nos =  jsonData[level].balls1;
            no = nos[fireballs.length];
        }else if(y_pos3 === 1){
            nos =  jsonData[level].balls2;
            no = nos[fireballs.length];
        }else{
            nos =  jsonData[level].balls3;
            no = nos[fireballs.length];
        }
        yPos = yPos3[y_pos3];

        // nos = jsonData[level].balls[y_pos3]
        // var no = nos[fireballs.length];
    }else{
        nos =  jsonData[level].balls;
        no = nos[fireballs.length];
        yPos = jsonData[level].y_pos;
    }
    retry.visible = false;
//                x = x__pos();
    if(jsonData[level].level.split('.')[0] === '1'){
        x = x_pos[spwan];
        spwan++;
        if(spwan === 3) spwan = 0;
        y = yPos[y_pos];
    }else if(jsonData[level].level.split('.')[0] === '2' || jsonData[level].level.split('.')[0] === '3'){
        if(count__ === 1) {
            if(spwan2 > 1) spwan2 = 0;
            x = x_pos[spwan2];
            spwan2++;
            if(y_pos > 1) y_pos = 0;
            y = yPos[y_pos];
            y_pos++;
        }else if (count__ === 2){
            x = x_pos[1];
            if(y_pos > 1) y_pos = 0;
            y = yPos[y_pos];
            y_pos++;
        }else{
            if(spwan2 > 2 || spwan2 === 0) spwan2 = 1;
            x = x_pos[spwan2];
            spwan2++;
            if(y_pos > 1) y_pos = 0;
            y = yPos[y_pos];
            y_pos++;
        }

    }else{
        if(spwan3 > 2 ) spwan3 = 0;
        x = x_pos[spwan3];
        spwan3++;
        if(y_pos > 2) y_pos = 0;
        y = yPos[y_pos];
        y_pos++;
    }
    // else{
    //     x = x_pos[spwan5];
    //     spwan5++;
    //     if(spwan5 === 5) spwan5 = 0;
    //     if(y_pos > 4) y_pos = 0;
    //     y = yPos[y_pos];
    //     y_pos++;
    // }
//                y = Math.floor((Math.random() * 300) + 100) + offsy;
    fb = game.add.sprite(x, -y, 'fireball2');

    if(no === jsonData[level].hit_number){
        fb = game.add.sprite(x, -y, 'fireball_target');
        no = jsonData[level].hit_number;
    }
//                var scaleDiff = Math.abs(jsonData[level].fireball_size.max - jsonData[level].fireball_size.min);
//                var scale = Math.random() * scaleDiff + jsonData[level].fireball_size.min;

    fb.animations.add('flame');
    fb.animations.play('flame', 5, true);
    fb.scale.setTo(0.8);

    var fbNo = game.add.text(fb.x + 0.5 * fb.width, fb.y + fb.height + 5, '' + no,
        {
            font: "bold 25px Arial black",
            align: "center",
            fill: "#000000",
            stroke: "#FEFF49",
            strokeThickness: 5
        });
//                fbNo.scale.setTo(scale);
    fbNo.x -= 0.5 * fbNo.width;
    fbNo.y -= fbNo.height;

    fb.fbNo = fbNo;
    fb.idx = fireballs.length;
    fb.no = no;

    game.physics.arcade.enable(fb);
    game.physics.arcade.enable(fbNo);
    var speedDiff = Math.abs(jsonData[level].fireball_speed.max - jsonData[level].fireball_speed.min);
    var g = Math.floor(speedDiff + jsonData[level].fireball_speed.min);
    var speedDiff1 = Math.abs(jsonData[level].fireball_speed.max - jsonData[level].fireball_speed.min);
    var g1 = Math.floor((Math.random() * speedDiff1) + jsonData[level].fireball_speed.min + 40);
    fbNo.body.velocity.y = fb.body.velocity.y = g;
//                if(no == jsonData[level].hit_number && jsonData[level].level.split('.')[0] !== '1'){
//                    fbNo.body.velocity.y = fb.body.velocity.y = g1;
//                }else{
//                    fbNo.body.velocity.y = fb.body.velocity.y = g;
//                }

    fireballs.push(fb);

    if(fireballs.length < nos.length) {
        spawnFireBall(offset);
    }else{
        game.world.bringToTop(ground1);
        game.world.bringToTop(ground3);
        fb_arr.forEach(function (value) {
            game.world.bringToTop(value);
        });
        game.world.bringToTop(left_button);
        game.world.bringToTop(right_button);
        game.world.bringToTop(down_button);
        game.world.bringToTop(up_button);
    }
//            }, Math.floor((Math.random() * 1500) + 1)); 
}

function onShotFired() {
    speakSound('blip');
    dropping = 0;
    // if(bullets > 0){
    //     bullets = bullets - 1;
    //     bulletsText.text = 'Bullet(s): ' + bullets;
    // }else{
    //     isGameOver = true;
    //     DestroyBall();
    //     retry = game.add.sprite(game.world.centerX -110, game.world.centerY - 110, 'retry');
    //     retry.inputEnabled = true;
    //     retry.events.onInputDown.add(tryAgain, this);
    //     return;
    // }
    // startLife = startLife - reduceLife2;
    // if(startLife > 1){
    //     Life_line(startLife);
    // }else{
    //     isGameOver = true;
    //     retry.visible = true;
    //     DestroyBall();
    // }
    // Water cannon shot
    cannon_shot_1 = game.add.sprite(0, 0, 'cannon_shot');
    game.physics.arcade.enable(cannon_shot_1);
    cannon_shot_1.anchor.setTo(1.0, 0.5);
    cannon_shot_1.angle = cannon_shot.angle;
    game.physics.arcade.velocityFromAngle(cannon_shot_1.angle, 700, cannon_shot_1.body.velocity);

    var pv = new Phaser.Point(cannon_shot_1.body.velocity.x, cannon_shot_1.body.velocity.y);
    pv = pv.normalize();
    pv = pv.multiply(game.cache.getImage('water_cannon').width, game.cache.getImage('water_cannon').width);

    cannon_shot_1.x = cannon_shot.x + pv.x;
    cannon_shot_1.y = cannon_shot.y + pv.y;

    cannon_shot_1.body.gravity.y = 300;
    cannon_shot_1.body.angularVelocity = 20;

    cannon_shots.push(cannon_shot_1);

    game.world.bringToTop(water_cannon);
    //}
}

function destroyFireball(fb) {
    fb.destroy();
    fb.fbNo.destroy();
    fireballs.splice(fb.idx, 1);
}

function endAnim() {
    speakSound('Cheering');
    getGraphics(0.2, 0x000000, 0, 0, 1280, 720);
    var staris = ['stari', 'red_stari'];
    window.localStorage.setItem("gameEnded", "true");
    emitters = [];
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

wrong_arr = [];
function No(fb){
    wrong = game.add.sprite(fb.x, fb.y, 'wrong');
    wrong_arr.push(wrong);
    game.time.events.add(1000, function() {
        wrong.visible = false;
    },this);
    speakSound('no');
}

function Life_line(x){

    cropRect.width = x;
    // var tween = game.add.tween(cropRect).to( { width: x }, 1000, Phaser.Easing.Quadratic.Out, false, 0, 1000, true);
    loading2.crop(cropRect);
    // tween.start();
    // bmd = game.add.bitmapData(318, 40);
    // bmd.ctx.beginPath();
    // bmd.ctx.rect(0, 0, 330, 80);
    // bmd.ctx.fillStyle = '#00685e';
    // bmd.ctx.fill();
    //
    // bglife = game.add.sprite(game.world.centerX + 460, game.world.centerY -320, bmd);
    // bglife.anchor.set(0.5);
    //
    // bmd = game.add.bitmapData(x, 30);
    // bmd.ctx.beginPath();
    // bmd.ctx.rect(0, 0, 300, 80);
    // bmd.ctx.fillStyle = '#00f910';
    // bmd.ctx.fill();
    //
    // widthLife = new Phaser.Rectangle(0, 0, bmd.width, bmd.height);
    // totalLife = bmd.width;
    // life = game.add.sprite(game.world.centerX + 460 - bglife.width/2 + 10, game.world.centerY -320, bmd);
    // life.anchor.y = 0.5;
    // life.cropEnabled = true;
    // life.crop(widthLife);
}

var ShowRound = function () {
    count__ = 0;
    y_pos = 0;
    var blvels = game.add.sprite(game.world.centerX, game.world.centerY, 'level');
    blvels.anchor.set(0.5);
    var LevelTxt = game.add.text(-70, -30,'Level:', {font: '50px Titan One', fill: '#fff'});
    LevelTxt.text = 'Level ' + jsonData[level].level.split('.')[0];
    blvels.addChild(LevelTxt);
    game.time.events.add(3000, function() {
        blvels.visible = false;
        LevelTxt.visible = false;
    },this);
};

function tryAgain() {
    retryNumber++;
    if(retryNumber > 2){
        if(jsonData[level].level.split('.')[0] === '1'){
            level = 0;
        }else if(jsonData[level].level.split('.')[0] === '2'){
            level = 10;
        }else if(jsonData[level].level.split('.')[0] === '3'){
            level = 21;
        }else if(jsonData[level].level.split('.')[0] === '4'){
            level = 32;
        }else if(jsonData[level].level.split('.')[0] === '5'){
            level = 43;
        }else{
            level = 54;
        }
        ShowRound();
    }
    retry.visible = false;
    startLife = 505;
    Life_line(startLife);
    hit = 0;
    hit_count = 0;
    // create_placeholders();
    isGameOver = false;
    fireballs = [];
    ballLocation = [];
    count__++;
    if(count__ > 3){
        count__ = 1;
        y_pos = 0;
    }
    yPos = yPos3[y_pos3];
    game.time.events.add(3000, function() {
        speakSound(jsonData[level].audio);
        spawnFireBall(offset);
    }, this);
    y_pos3++;
    if(y_pos3 > 2){
        y_pos3 = 0;
    }
    bullets = jsonData[level].bullets;
}

function DestroyBall() {
    for(var i in fireballs) {
        fireballs[i].destroy();
        fireballs[i].fbNo.destroy();
    }
    fireballs = [];
    if(!isGameOver){
        endAnim();
    }
}

function render() {
    hs_1_angle = hs_1.body.angle;

    // Debug info
    // game.context.fillStyle = 'rgb(255,0,0)';
    // game.context.fillRect(p1.x, p1.y, 4, 4);

    // game.debug.spriteInfo(balloon5, 32, 32);
    // game.debug.spriteInfo(balloon1, 432, 32);
    // game.debug.spriteInfo(cannon_shot_1, 832, 32);
}


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

    hit = 0;
    retryNumber = 0;
    hit_count = 0;
    startLife = 505;
    Life_line(startLife);
    
    if(jsonData[level].level.split('.')[1] === '1'){
        game.time.events.add(2000, function() {
            fb_arr.forEach(function (value) {
                value.visible = false;
            });
            fired_nums = [];
        },this);
        ShowRound();
    }
    game.time.events.add(100, function() {
        recreateFireballs();
    },this);
}

function enableButtons (bool) {
    prevButton.inputEnabled = bool;
    nextButton.inputEnabled = bool;
    rightButton.inputEnabled = bool;
    leftButton.inputEnabled = bool;
    upButton.inputEnabled = bool;
    fire_truck.inputEnabled = bool;
} 

function hasPurchased () {
    var token = window.localStorage.getItem("purchaseToken");
    
    return token != null;
}