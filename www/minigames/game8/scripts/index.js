// ------------------------ 1. GLOBAL VARIABLES ----------------------------- //
// Game variables
var DEBUGGING = false;

current_edit_cloth_type = 0; // 0 - shirt, 1 - short, 2 - shoe
balloons = [];
balloons.keys = [];
balloon_keys = ['black_balloon','blue_balloon', 'brown_balloon','green_balloon', 'grey_balloon',  'orange_balloon', 'pink_balloon',
    'purple_balloon','red_balloon','yellow_balloon','white_balloon'];
shirt_location = {x: 22, y: 40};
shirt_spritesheets = {};
short_location = {x: 33, y: 101};
shoe_location = {x: 31, y: 170};
cursorDownTime = 0;
bounceHigher = false;
TargetAquired = false;
popagain = false;

var currentLevel = 0;
var CLOTH_TYPE_SHIRT = 0;
var CLOTH_TYPE_SHORT = 1;
var CLOTH_TYPE_SHOE = 2;

var GS_NONE = 0;
var GS_INIT = 1;
var GS_GAMEPLAY = 2;
var gameState = GS_NONE;
var targetBalloon = null;
var audioSound = null;
var isNormalBouncePosition = true;
var clickedTrampoline = false;
var action_down = null;

var jsonData = null;
var game = null;
var x_pos = [250, 450, 650, 850, 950];
var pattern_count = 0;
var ballLocation = [];

var LevelText,lvls,blvels,LevelTxt,wrong = false,wrong1,target_balloons;

var scores = 100;
var skip_button;
var returnUrl;
function exitGame(score) {
    if (returnUrl) {
        var gameResult = {score: score};
        stores.set("extGameResult", gameResult);
        window.location.replace(returnUrl);
    }
}

var x = location.href;

var sp =x.split('?level=');
if(sp[1] && sp[1].split("&") !== undefined){
    sp = sp[1].split("&")[0];
}
if(sp !== "" && sp !== undefined && sp !== null){
    if(sp > 0 && sp < 70){
        level = parseInt(sp);
        if(level === 1){
            currentLevel = 0
        }else if(level === 2){
            currentLevel = 13
        }else if(level === 3){
            currentLevel = 20
        }else if(level === 4){
            currentLevel = 25
        }else if(level === 5){
            currentLevel = 32
        }else{
            currentLevel = 0
        }
    }else{
        currentLevel = 0;
    }
}else {
    currentLevel = 0;
}

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



