// ------------------------ 1. GLOBAL VARIABLES ----------------------------- //
var emitter;
var platforms = null;
var see_saw_bar = null;
var see_saw_pivot = null;
var basket_ball = null;
var basket_ball_loop = null;
var answer_slot = null;
var see_saw_bar_y_body_offset = 0;
var selected_box = null;


var isLeftSwingDown = true;
var launchBall = false;
var ballOnSeeSaw = true;
var ballFired = false;
var target_pos_y = 0;
var boxOnDrag = null;
var boxesOnDrag = []; 

// Game states
var GS_GAME_STARTUP = 1;
var GS_BALL_INIT_FALL_INIT = 2;
var GS_BALL_INIT_FALL = 3;
var GS_BALL_INIT_LEFT_SWING_DOWN = 4;
var GS_ANS_OPTIONS_INIT = 5;
var GS_ANS_SET = 6;
var GS_TOSS_BALL = 7;
var GS_SWING_BACK = 8;
var GS_STOP = 9;
var gameState = GS_GAME_STARTUP;

var currentLevel = 0;
var currentLevelPos = 0;
var currentLevelPos2 = 0;
var seeSawBoxes = [];
var answerBoxes = [];
var basket_array = [];
var missingBox = null;
var overlapBox = null;
var answeredCount = 0;
var selectedBoxes;
var overlappedBoxes;
var animScale = 3 / 8;

var jsonData = null;
var game = null;
var basketCount = 0;
var sublevel = ['A','B','C','D','E','F','G','H'];

var numberGroup = null;

var x = location.href;

var sp =x.split('?level=');

if(sp[1] !== "" && sp[1] !== undefined && sp[1] !== null){
    if(sp[1] > 0 && sp[1] < 7){
        currentLevel = sp[1] - 1;
    }else{
        currentLevel = 0;
    }
}else{
    currentLevel = 0;
}

var scores = 100;
var skip_button;
var returnUrl;

function isPhoneGap() {
    return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/);
}

jQuery.getJSON("assets/json/data.json", function(data) {
    startGame(data);
}).error(function() {
    alert("Error reading data.json!");
});

function startGame(data) {
    jsonData = data.jsonData;
    game = new Phaser.Game(1280, 720, Phaser.CANVAS, '');
    game.state.add("boot", boot);
    game.state.add("Preloader", Preloader);
    game.state.add("play", play);
    game.state.start('boot');
}

