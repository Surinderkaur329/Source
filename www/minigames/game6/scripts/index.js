// ------------------------ 1. GLOBAL VARIABLES ----------------------------- //

window.PhaserGlobal = { disableWebAudio: true };

var arrayVal = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
var arrayVal2 = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

var letterPosition = 0;
var lettersClicked = [];
var partsClicked = [];

var _letters = null;

var letters = null;
var correctLetters = null;
var parts = [];
var monoParts = [];
var texts = [];
var animals = [];
var alphabets = [];
var isCorrect = false;

var instructionsBg = null;
var instructionsBtn = null;
var interval  = null;

var purchasePopup = null

var positions = [
    {x: -638, y: -416 },
    {x: -298, y: -416 },
    {x: -281, y: -72 },
    {x: -427, y: -3 },
    {x: -742, y: -71 },
];
var textPositions = [
    {x: -50, y: 30 },
    {x: -70, y: 20 },
    {x: 20, y: -20 },
    {x: -90, y: 100 },
    {x: -40, y: -20 },
];

// global assets
var menu = null;
var leftBtn = null;
var rightBtn = null;

var game1 = null;
var game2 = null;
var game3 = null;
var wheel = null;
var music = null;

var scores = 100;
var skip_button;
var returnUrl;
var creeking = null;

var blipSound = null;
var currentSound = null;

var bg = null;


function start(data) {
    jsonData = data.jsonData;
    game = new Phaser.Game(1280, 720, Phaser.CANVAS, '');
    game.state.add("Boot", Boot);
    game.state.add("Preloader", Preloader);
    game.state.add("Menu", Menu);
    game.state.add("Game1_", Game1_);
    game.state.add("Game2_", Game2_);
    game.state.add("Game3_", Game3_);
    game.state.start('Boot');
}

function isPhoneGap() {
    return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/);
}

function displaButton (x, y, scale, action, callback, anchor) {
    var btn = game.add.sprite(x, y, action);
    btn.scale.setTo(scale);
    if(anchor) {
        btn.anchor.setTo(.5);
    }
    btn.inputEnabled = true;
    btn.input.useHandCursor = true;
    btn.events.onInputDown.add(callback, this);
    return btn;
}

function newGame () {
    letterPosition = 0;
    lettersClicked = [];
    partsClicked = [];
    letters = jsonData[level].letters;
    correctLetters = jsonData[level].correct_letters;
    for(c in correctLetters) {
        lettersClicked.push(correctLetters[c]);
    }
    parts  =
    texts  =
    animals  =
    monoParts =
    alphabets  = [];

    if(instructionsBg){
        instructionsBg.alpha = 0;
        instructionsBtn.visible = false;
    }

    if (interval && interval.running) interval.stop ();
}

function showInstructions (text, _game){
    instructionsBg = getGraphics(0.8, 0x000000, 400, 200, 500, 290);
    var g = game.add.text(10, 10,'',
    {
        "font": "23pt Titan One",
        "fill": "white",
        "align": "left",
        "wordWrap": true,
        "wordWrapWidth": 480
    });
    g.text = text;
    instructionsBg.addChild(g);

    instructionsBtn = displaButton(810, 400,.7, 'next', 
         function () {
            instructionsBg.alpha = 0;
            instructionsBtn.visible = false;
            game.state.start(_game);
         }
    );
}

function startGame (type) {
    if(type === '1') {
        monoParts = [];
        parts = [];
        var i= 0;
        while(i < 2){
            displayParts(type, i, { font: "100px Arial", fill: "#000000", align: "center"});
            i++;
        }
        startGame1();
    } else {
        displayParts(type, 0, { font: "100px Arial", fill:'transparent', stroke:'#000000', strokeThickness:1 , align: "center"});
        if(type === '2') { 
           startGame2();
        } else {
           startGame3();
        }
    }
}

function startGame1() {
    lettersClicked = shuffleArray(lettersClicked);
    speakSound(lettersClicked[0]);
    var highlighted = -1;
    var isHighlighted = false;
    interval = game.time.create(false);
    interval.loop (Phaser.Timer.SECOND * 2, function () {
        if(isHighlighted) {
            parts[highlighted].visible = true;
            monoParts[highlighted].visible = false;
            isHighlighted = false;
            highlighted - 1;
        }
        for (var i = 0; i < 5; i++) {
            monoParts[i].tint = 0xffffff;
        }
        monoParts[letterPosition].tint = 0xff0000;
        if(partsClicked.length > 0 && partsClicked.indexOf(letterPosition) !== -1) {
            highlighted = letterPosition;
            isHighlighted = true;
            parts[letterPosition].visible = false;
            monoParts[letterPosition].visible = true;
            monoParts[letterPosition].tint = 0xff0000;
        }
        letterPosition++;
        if(letterPosition === 5) letterPosition = 0;
    }, this);
    interval.start ();

    if(creeking == null){
        creeking = game.add.audio('seefa_pick');
    }
}

function startGame2 () {
    lettersClicked = shuffleArray(lettersClicked);
    alphabets.push(lettersClicked[0]);
    speakSound(lettersClicked[0]);

    var g = getGraphics(0, 0x000000, 0, 0, 100, 100);
    g.visible = false;
    bg = game.add.sprite(wheel.x , wheel.y, g.generateTexture());

    bg.anchor.setTo(0.5);
    bg.inputEnabled = true;
    bg.input.enableDrag();

    var text = game.add.text(0, 0, lettersClicked[0], 
        { font: "100px Arial",  fill:'#000000' , align: "center"});
    bg.addChild(text);  
    text.anchor.setTo(0.5);  

    bg.events.onDragStop.add(function () {
        onDragStop(bg, wheel.x , wheel.y, 'Game2_');
    }, this);
    alphabets.push(text);

    if(creeking == null){
        creeking = game.add.audio('seefa_pick');
    }
}

function startGame3() {

    lettersClicked = shuffleArray(lettersClicked);
    animals.push(lettersClicked[0]);
    speakSound('animal_'+lettersClicked[0]);

    var action = "sletter_" + lettersClicked[0];

    if(jsonData[level].type === "capital"){
        action = "letter_" + lettersClicked[0];
    }

    var animal = game.add.sprite(wheel.x , wheel.y, action);
    animal.anchor.setTo(0.5, 0.5);
    animal.inputEnabled = true;
    animal.input.enableDrag();
    animal.events.onDragStop.add(function () {
        onDragStop(animal, wheel.x , wheel.y, 'Game3_');
    }, this);
    animals.push(animal);

    if(creeking == null){
        creeking = game.add.audio('seefa_pick');
    }
}

function displayParts (_game, i, style) {

    letters.forEach(function (item, index) {

        var name = "part" + Math.floor(index + 1);
        var _parts = parts;

        if(_game === '1' && i === 1) {
            name = "part" + Math.floor(index + 1) + '_mono';
            _parts = monoParts;
        }
    
        var part = game.add.sprite(
            game.world.centerX + positions[index].x, 
            game.world.centerY  + positions[index].y, 
        name); 
    
        var text = game.add.text( 0, 0, item, style); 
        text.anchor.set(1);
        part.addChild(text); 
        text.inputEnabled = true;

        part.anchor.setTo(1);    
        part.inputEnabled = true;
        
        if(_game == '1') {
            part.input.useHandCursor = true;
            part.events.onInputUp.add(function () {
                partClicked(index);
            }, this);
        }
        
        _parts.push(part);
        texts.push(text);
        wheel.addChild(part);
        text.x = Math.floor(_parts[0].x - (_parts[0].width / 4) + textPositions[index].x);
        text.y = Math.floor(_parts[0].y - (_parts[0].height / 4) + textPositions[index].y);
    });
}

function partClicked (index) {
    // blipSound.play();
    game.time.events.add(50, function() {
        speakSound('pop');
    }, this);
    
    var letter = letters[letterPosition - 1];
    if(letters[letterPosition - 1] === undefined){
        letter = letters[letters.length - 1]
    }

    if ((lettersClicked[0] === letters[index]) &&
        (lettersClicked[0] === letter)) {

        if (interval && interval.running) interval.stop ();

        monoParts[index].visible = false;
        parts[index].visible = true;
        lettersClicked.splice(0, 1);

        partsClicked.push(index);

        if(lettersClicked.length === 0) {
            spinWheel('Game1_');
        } else {
            game.time.events.add(Phaser.Timer.SECOND * 1, startGame1, this);
        }
    }
}

function spinWheel (_game) {
    speakSound('expand');
    game.time.events.add(Phaser.Timer.SECOND * 1, function () {
        creeking.loopFull();
        var spinTween = game.add.tween(wheel).to({
            angle: 360 * 3
        }, 2000, Phaser.Easing.Quadratic.Out, true);
        spinTween.onComplete.add(function () {
            creeking.stop();
            level++;
            if (level >= jsonData.length) {
                endAnim();
            } else {
                console.log (jsonData[level].level)
                if (jsonData[level].level >= 3.1) {
                    // console.log ("lock")
                    showLevelLock ();
                } else {
                    newGame();
                    game.state.start(_game);
                }
            }
        }, this);
    }, this);
}

function exitGame (score) {
    var gameResult = {score: score};
    stores.set("extGameResult", gameResult);
    window.location.replace(returnUrl);
}

function onDragStop (item, x, y, _game) {
    isCorrect = false;
    for(var i = 0; i < texts.length; i++) {
        if (item.overlap(texts[i]) && lettersClicked[0] === texts[i].text) {
            item.visible = false;
            isCorrect = true;
            texts[i].addColor("#000000", 0);
            lettersClicked.splice(0, 1);
            if(lettersClicked.length === 0) {
                spinWheel(_game);
            } else {
                speakSound('ex_pt1');
                game.time.events.add(Phaser.Timer.SECOND, function() {
                    if(_game === 'Game2_') {
                        startGame2();
                    }
                    if(_game === 'Game3_') {
                        startGame3();
                    }
                }, this);
            }
        } else {
            if(i === 9){
                console.log(isCorrect, i);
                if(!isCorrect){
                    speakSound('incorrect');
                }
            }
            item.x = x;
            item.y = y;
        }
        if(i === 9) break;
    }
}

function loadAudios () {
    blipSound = game.add.audio('blip');
}

function speakSound (action) {
    console.log(action);
    if (currentSound && currentSound.isPlaying) currentSound.stop();
    currentSound = game.add.audio(action).play();
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
    speakSound('Cheering');
    getGraphics(0.2, 0x000000, 0, 0, 1280, 720);
    var staris = ['stari', 'red_stari'];
    var emitters = [];
    window.localStorage.setItem("gameEnded", "true");
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


jQuery.getJSON("assets/json/data.json", function(data) {
    start(data);
}).error(function() {
    alert("Error reading data.json!");
});

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
    // if (instructionsBtn) instructionsBtn.inputEnabled = bool;
    if (bg) bg.inputEnabled = bool;
    if (menu) menu.inputEnabled = bool;
    if (leftBtn) leftBtn.inputEnabled = bool;
    if (rightBtn) rightBtn.inputEnabled = bool;

    for (var i = 0; i < animals.length; i++) {
        animals[i].inputEnabled = bool;
    }

    for (var i = 0; i < texts.length; i++) {
        texts[i].inputEnabled = bool;
    }

    for (var i = 0; i < parts.length; i++) {
        parts[i].inputEnabled = bool;
    }
} 