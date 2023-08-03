// ------------------------ 1. GLOBAL VARIABLES ----------------------------- //
var jsonData = null;
var game = null;

var scores = 100;
var speak = false;
var skip_button;
var returnUrl;

// Equation
var OPERAND1_X = 205.50,
    OPERAND1_Y = 187;
var OPERATOR_PLUS_X = 378.50,
    OPERATOR_PLUS_Y = 189.50;
var OPERAND2_X = 544.50,
    OPERAND2_Y = 187;
var EQUALS_X =705 ,
    EQUALS_Y = 189.50;

// Answer choice slots
var SLOT_W = 193,
    SLOT_H = 121;
var SLOT_X = 1056,
    SLOT1_Y = 93,
    SLOT2_Y = 300,
    SLOT3_Y = 508;
// SLOT4_Y = 558;

var ANSWER_MARK_X = 863.50,
    ANSWER_MARK_Y = 187;
var cursors;
var ball = null,
    balls = [],
    ballsIndex = 0;
var slot1 = null,
    slot2 = null,
    slot3 = null;
var slot_1 = null,
    slot_2 = null,
    slot_3 = null;

// slot4 = null;
//
// current level parent container
var levelGroup = null;
var level = 0;
var levelCont = 0;
var round = 0;
var levelData = null;
var last_position_x = null;
var position_y = [610,550,490];
var last_position_num = null;
var positions = [710,770,830,890,940, 700,760,820,880,930, 700,760,820,880,930];
var potted_balls = [];
var MOVED_BALL = null;

var end_balls = null;


var x = location.href;

var sp =x.split('?level=');
if(sp[1] && sp[1].split("&") !== undefined){
    sp = sp[1].split("&")[0];
}
var st =x.split('&stage=');
if(st[1] && st[1].split("&")){
    st = st[1].split("&")[0];
}
var rn =x.split('&round=');
if(sp !== "" && sp !== undefined && sp !== null){
    if(sp > 0 && sp < 6){
        level = sp - 1;
    }else{
        level = 0;
    }
}else {
    level = 0;
}
if(st !== "" && st !== undefined && st !== null){
    if(st > 0 && st < 3){
        levelCont = st - 1;
    }else{
        levelCont = 0;
    }
}else {
    levelCont = 0;
}

if(rn[1] !== "" && rn[1] !== undefined && rn[1] !== null){
    if(rn[1] > 0 && rn[1] < 10){
        round = rn[1] - 1;
    }else{
        round = 0;
    }
}else {
    round = 0;
}


// gray filter
var gray = null;

//collision groups
var playBoxCollisionGroup;
var ballCollisionGroup;

//answer slot rect
var answerSlotRect = null;

//barriers
var barriers = null;

var barrierTopY = 0;
var barrierBottomY = 0;

var slotSelected = {
    sprite: null,
    slotX: 0,
    slotY: 0
};
var result = null;

var GS_NONE = 0;
var GS_INIT = 1;
var GS_MOVE_BALL = 2;
var GS_MULTICHOICE_SELECT = 3;
var gs = GS_INIT;

function exitGame(score) {
    if (returnUrl) {
        var gameResult = {score: score};
        stores.set("extGameResult", gameResult);
        window.location.replace(returnUrl);
    }
}

function isPhoneGap() {
    return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/);
}

jQuery.getJSON("assets/json/data.json", function(data) {
    jsonData = data;
    game = new Phaser.Game(1280, 720, Phaser.WEBGL, '');
    game.state.add("boot", boot);
    game.state.add("Preloader", Preloader);
    game.state.add("play", play);
    game.state.start('boot');
}).error(function() {
    alert("Error reading data.json!");
});


