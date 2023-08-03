// ------------------------ 1. GLOBAL VARIABLES ----------------------------- //
var SCREEN_WIDTH = 720;
var SCREEN_HEIGHT = 1280;
var XY_THRESHHOLDS = 50, ANGLE_THRESHHOLD = 15;
var SQUARE_ANGLES = [0, 90, 180, 270, 360];
var DEBUGGING = false;
var isDownKey = false;

var GS_NONE = 0;
var GS_INIT = 1;
var GS_DROP_START = 2;
var GS_DROPPING = 3;
var gameState = GS_NONE;

var cursors = null;
var currentPiece = null;
var currentLevel = 0;
var step = 1;
var stepInterval = 0;

var jsonData = null;
var levelData = null;
var ItemName = null;

var mainGroup = null;
var slotItemsGroup = null;
var dock = null;
var hints = [];
var stari;
var redStari;
var solved = 0;
var emitterX = 0, emitterY = 0;
var spArr = [],leftButton,rightButton,upButton,downButton,stariArr = [],shapeAddedArr = [];
var leftTween,rightTween,upTween,downTween;

// Current game level
var level;

var x = location.href;

var sp =x.split('?level=');

if(sp[1] !== "" && sp[1] !== undefined && sp[1] !== null){
    if(sp[1] > 0 && sp[1] < 11){
        currentLevel = sp[1] - 1;
    }else{
        currentLevel = 0;
    }
}else{
    currentLevel = 0;
}

function isPhoneGap() {
    return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/);
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

jQuery.getJSON("assets/json/data.json", function(data) {
    jsonData = data.jsonData;
    game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.CANVAS, '');
    game.state.add("boot", boot);
    game.state.add("Preloader", Preloader);
    game.state.add("main", main);
    game.state.add("play", play);
    game.state.start('boot');
}).error(function() {
    alert("Error reading data.json!");
});
