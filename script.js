var context = canvas.getContext("2d");
var shape = new Object();

//DATA SETS
var ghosts = {};
var coin = {};
var board;
var teleports = [];
var highscores = [];
var keysDown = [];

//INTERVAL
var time_elapsed;    
var interval;

// GAME SETTING
var _boardSize = 16;
const STANDARTSIZE = 9.166666666666667; //Keep canvas ratio fixed
var start_time;
var pac_color;
var score;
var health;
var hasTeleported = false;
var foodColor; // = "#ffeb59"; //Yellowish
var foodColor15; // = "#ff5e5e"; //Redish
var foodColor25; // = "#55f6fc"; //Cyan
const wallColor = "#3c2683"; //Dark-Blue
var ghostDifficulty = 0.5; //Higher = easier
var _Difficulty;
var lastKeyPressed = 4; //Facing right at the begining
var prevKey = lastKeyPressed;
var maxScore;
var food_remain;
var totalFood;
var minimumTime;
var amountOfGhosts;
var _isDead = false;

/* Board Values Map
    0 - Empty
    1.0-1.2 - Food
    2 - Pacman
    3 - Running Point
    4 - Wall
    5-8 - Ghosts
    9-10 - Teleports
    11 - Freeze Ghosts for 5 seconds
*/

//Pacman visualisation mapping by direction(right left up down)
var pacmanDirection = {
    '1': {
        'arc': 42.5,
        'x': 10,
        'y': 15
    },
    '2': {
        'arc': -42.5,
        'x': 10,
        'y': -10
    },
    '3': {
        'arc': 84.8,
        'x': 10,
        'y': -12
    },
    '4': {
        'arc': 0,
        'x': 5,
        'y': -15
    }
};

//Containers
var Welcome = $("#Welcome");
var Register = $("#Register");
var Login = $("#Login");
var About = $("#About");
var Game = $("#Game");
var _audio = $("#backgroundAudio")[0];
var _hitSound = $("#hitSound")[0];
var _winSound = $("#winSound")[0];
var _looseSound = $("#looseSound")[0];

var users = [{
    'username': 'a',
    'password': 'a',
    'first': 'ab',
    'last': 'bc',
    'email': 'ab@cd.ef',
    'date': '12.12.1999'
}];

var _formValidation;
var validateFormTemplate = {
    'username': false,
    'password': false,
    'first': false,
    'last': false,
    'email': false,
};

//Hard coded in-game user
var _ingameUser = {
    'username': 'a',
    'password': 'a',
    'first': 'ab',
    'last': 'bc',
    'email': 'ab@cd.ef',
    'date': '12.12.1999'
};

Start();

//Website Loaded
function Start() {
    // showContainer("Game");
    showContainer("Welcome");

    $( "#dialog-setting" ).hide();
    $( "#dialog-scores" ).hide();
}

// Containers and listeners
$("ul.nav>li>a, #welcomeContent>button").click(e => {
    e.preventDefault();

    var selectedContainer = e.target.text || e.target.innerHTML.split("</span> ")[1];
    showContainer(selectedContainer);
});

function showContainer(container){
    if(container != "About"){
        hideAllContainers();
        
        try{
            $("#"+container).show();
        }catch(e) {}
    }

    if(container == "Register"){
        clearForm("regForm");
        _formValidation = newFormValidation();
        setFormDates();
        $("#form_username").focus();
        // $("#regForm>.btn").prop('disabled',true);
    }else if(container == "Login"){
        clearForm("logForm");        
        $("#loginMsg").hide();
        $("#log_username").focus();
    }else if(container == "About"){
        $( "#dialog-message" ).dialog({
            modal: true,
            buttons: {
                Ok: function() {
                $( this ).dialog( "close" );
                }
            }
        });

        $(".ui-dialog-titlebar-close").hide();
        $(".ui-dialog-buttonset>button").addClass("btn");
        $(".ui-dialog-buttonset>button").addClass("btn-danger");
        $(".ui-dialog-buttonset>button").text("Close");
    }else if(container == "Game"){
        $("#5pnt").hide();
        $("#15pnt").hide();
        $("#25pnt").hide();
        
        $(document).ready(()=>{
            showSetting();
        });
    }
    
}

function showSetting(){
    clearInterval(interval);
    $( "#dialog-setting" ).dialog({
        modal: true,
        buttons: {
            Ok: function() {
                //Save Data
                totalFood = $("#ballNum").val();
                minimumTime = $("#minSecs").val();
                amountOfGhosts = $("#ghostNum").val();
                foodColor = $("#5col").val();
                foodColor15 = $("#15col").val();
                foodColor25 = $("#25col").val();

                if(totalFood > 90 || totalFood < 50 || minimumTime < 60 || amountOfGhosts < 1 || amountOfGhosts > 3)
                    return;

                $("#5pnt").css('color',foodColor);
                $("#5pnt").show();
                $("#15pnt").css('color',foodColor15);
                $("#15pnt").show();
                $("#25pnt").css('color',foodColor25);
                $("#25pnt").show();
                
                $( this ).dialog( "close" );

                _audio.load();
                initBoard();            
            }
        }
    });

    $(".ui-dialog-titlebar-close").hide();
    $(".ui-dialog-buttonset>button").addClass("btn");
    $(".ui-dialog-buttonset>button").addClass("btn-danger");
    $(".ui-dialog-buttonset>button").text("Save");
}

function showHighscores(){
    let table = $( "#dialog-scores>table>tbody");

    var sortedList;
    
    if(highscores.length <= 1)
        sortedList = highscores;
    else{
        sortedList = highscores.sort(function(a,b){
            if(a.score < b.score) return true;
            else if(a.score == b.score) return a.time > b.time;
        });
    }

    table.html('');
    for (let i = 0; i < sortedList.length; i++) {
        table.append($("<tr>").html(`<td>${sortedList[i].name}</td>
                                    <td>${sortedList[i].score}</td>
                                    <td>${sortedList[i].time}</td>
        `));
    }

    $( "#dialog-scores" ).dialog({
        modal: true,
        buttons: {
            Ok: function() {
                $( this ).dialog( "close" );
            }
        }
    });

    $(".ui-dialog-titlebar-close").hide();
    $(".ui-dialog-buttonset>button").addClass("btn");
    $(".ui-dialog-buttonset>button").addClass("btn-danger");
    $(".ui-dialog-buttonset>button").text("Close");
}

function hideAllContainers(){
    Welcome.hide();
    Game.hide();
    Login.hide();
    Register.hide();
    About.hide();
}

//////////////////////////////////////////////////////////////////////////////////

// Register Form validation
function setFormDates(){
    let days = $("#formDays");
    for (let i = 1; i <= 31; i++) {
        let option = `<option value="${i}">${i}</option>`;
        days.append($(option));
    }

    let month = $("#formMonth");
    for (let i = 1; i <= 12; i++) {
        let option = `<option value="${i}">${i}</option>`;
        month.append($(option));
    }

    let year = $("#formYears");
    for (let i = 2018; i >= 1900; i--) {
        let option = `<option value="${i}">${i}</option>`;
        year.append($(option));
    }
}

function newFormValidation(){
    return JSON.parse(JSON.stringify(validateFormTemplate));
}

function formHasErr(form, prop){
    _formValidation[prop] = false;
    $(form).addClass('formErr');
    $(form).removeClass('formOK');
}

function formIsOK(form, prop){
    _formValidation[prop] = true;
    $(form).removeClass('formErr');
    $(form).addClass('formOK');

    let formIsDone = true;
    Object.entries(_formValidation).forEach((p)=>{
        if(p[1] == false)
            formIsDone = formIsDone && false;
    });

    return formIsDone;
    // $("#regForm>.btn").prop('disabled',!formIsDone);
}

function checkPassword(form){
    var pass = $("#form_password").val().toString().trim();

    if(pass.length == 0 && _formValidation.password == false)
        return;

    var regex = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/;
    if(pass.length < 8 || !regex.test(pass)){
        formHasErr(form,'password');
    }else{
        formIsOK(form,'password');
    }
}

function checkUsername(form){
    var user = $("#form_username").val().toString().trim();

    if(user.length == 0 && _formValidation.username == false)
        return;

    if(user.length <= 1 || usernameFound(user)){
        formHasErr(form,'username');
    }else{
        formIsOK(form,'username');
    }
}

function usernameFound(username){
    let filteredUser = users.filter(function(user){
        return user.username == username;
    });

    if(filteredUser.length == 0)
        return false;
    
    return true;
}

function checkFirst(form){
    var first = $("#form_first").val().toString().trim();

    if(first.length == 0 && _formValidation.first == false)
        return;

    if(!first.match(/^[A-Za-z]+$/)){
        formHasErr(form,'first');
    }else{
        formIsOK(form,'first');
    }
}

function checkLast(form){
    var last = $("#form_last").val().toString().trim();

    if(last.length == 0 && _formValidation.last == false)
        return;
        
    if(!last.match(/^[A-Za-z]+$/)){
        formHasErr(form,'last');
    }else{
        formIsOK(form,'last');
    }
}

function checkMail(form){
    var mail = $("#form_email").val().toString().trim();

    if(mail.length == 0 && _formValidation.email == false)
        return;

    if(!validateEmail(mail)){
        formHasErr(form,'email');
    }else{
        formIsOK(form,'email');
    }
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function submitForm(){

    checkUsername($("#form_username"));
    checkPassword($("#form_password"));
    checkFirst($("#form_first"));
    checkLast($("#form_last"));
    checkMail($("#form_email"));

    if(formIsOK()){

        setTimeout(()=>{
            var pass = $("#form_password").val().toString().trim();
            var first = $("#form_first").val().toString().trim();
            var last = $("#form_last").val().toString().trim();
            var mail = $("#form_email").val().toString().trim();
            var user = $("#form_username").val().toString().trim();
            
            var date = "";
            
            $(".dateForm").each((k,v)=>{
                if(k != 0)
                date += "." + $(v).val();
                else
                date += "" + $(v).val();
            });
            
            users.push({
                'username': user,
                'password': pass,
                'first': first,
                'last': last,
                'email': mail,
                'date': date
            });
            
            alert("Registration done successfully");
            clearForm("regForm");
            showContainer('Login');
        }, 100);
    }
}

function clearForm(formID){
    $("#" + formID).find(".form-control").each((key,val)=>{
        $(val).val('');
        $(val).removeClass('formOK');
        $(val).removeClass('formErr');
    });
}

//////////////////////////////////////////////////////////////////////////////////

//Login Form
function submitLogin(){
    let msg = $("#loginMsg");
    msg.hide();

    let username = $("#log_username").val().trim();
    let password = $("#log_password").val().trim();

    let filteredUser = users.filter(function(user){
        return user.password == password && user.username == username;
    });

    if(filteredUser.length == 0){
        msg.text("Username and Password does not match");
        msg.show();

        $("#log_username").focus();
        $("#log_password").val("");
    }else{
        alert('Login Successfully!');
        clearForm('logForm');

        _ingameUser = filteredUser[0];
        showContainer('Game');
    }
}

//////////////////////////////////////////////////////////////////////////////////

//Game
function initBoard(){
    //Initialize
    _audio.load();
    ghosts = {};
    teleports = [];

    $("#lblUser").text(_ingameUser.username);  
    time_elapsed = undefined;
    lblTime.value = "0.00";
      
    clearInterval(interval);
    lastKeyPressed = 4; //Start facing right;
    board = new Array();

    let btn = $("#ppBtn");

    btn.html('Start <span class="glyphicon glyphicon-play" aria-hidden="true"></span>');
    btn.removeClass("btn-danger");
    btn.addClass("btn-success");
    btn.attr("onclick","startGame()");

    let mapType = Math.random();

    score = 0;
    health = 3;
    var cnt = 100;

    food_remain = totalFood;
    ghost_remain = amountOfGhosts;

    var pnt25 = Math.floor(food_remain*0.1);
    var pnt15 = Math.floor(food_remain*0.3);
    var pnt5 = food_remain - pnt15 - pnt25;

    maxScore = pnt5*5 + pnt15*15 + pnt25*25 + 50;
    var pacman_remain = 1;
    pac_color = "yellow";

    for (var i = 0; i < _boardSize; i++) {
        board[i] = new Array();
        //put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
        for (var j = 0; j < _boardSize; j++) {
            if(isWall(i,j,mapType)){ //Walls
                board[i][j] = 4;
            }else if((i == 0 && j == 0)){ //Corners
                ghost_remain--;
                board[i][j] = 5;
                ghosts[5] = {i:i,j:j,prev:0,prev_i:i,prev_j:j};
            }else if((i == (_boardSize - 1) && j == (_boardSize - 1)) && ghost_remain > 0){ //Corners
                ghost_remain--;
                board[i][j] = 6;
                ghosts[6] = {i:i,j:j,prev:0,prev_i:i,prev_j:j};
            }else if((i == (_boardSize - 1) && j == 0) && ghost_remain > 0){ //Corners
                ghost_remain--;                
                board[i][j] = 7;
                ghosts[7] = {i:i,j:j,prev:0,prev_i:i,prev_j:j};
            }else if(i == 0 && j == (_boardSize - 1) && ghost_remain > 0){ //Corners
                ghost_remain--;                
                board[i][j] = 8;                    
                ghosts[8] = {i:i,j:j,prev:0,prev_i:i,prev_j:j};            
            }else
                board[i][j] = 0;
        }
    }

    //Taken Care of Empty "D" & "A" of walls
    if(mapType <= 0.5){
        board[7][12] = -1;
        board[7][13] = -1;
        board[8][12] = -1;
        board[8][13] = -1;
        board[7][2] = -1;
        board[8][2] = -1;
    }

    //Assign 25Points    
    for (let i = 0; i < pnt25; i++) {
        var emptyCell = findRandomEmptyCell(board);
        board[emptyCell[0]][emptyCell[1]] = 1.2;
        food_remain--;
    }

    //Assign 15Points    
    for (let i = 0; i < pnt15; i++) {
        var emptyCell = findRandomEmptyCell(board);
        board[emptyCell[0]][emptyCell[1]] = 1.1;
        food_remain--;
    }

    //Assign 5Points        
    for (let i = 0; i < pnt5; i++) {
        var emptyCell = findRandomEmptyCell(board);
        board[emptyCell[0]][emptyCell[1]] = 1;
        food_remain--;
    }

    while(food_remain>0){
        var emptyCell = findRandomEmptyCell(board);
        board[emptyCell[0]][emptyCell[1]] = 1;
        food_remain--;
    }

    //Assign Pacman
    var emptyCell = findRandomEmptyCell(board);
    board[emptyCell[0]][emptyCell[1]] = 2;
    shape.i = emptyCell[0];
    shape.j = emptyCell[1];
    pacman_remain--;

    //Assign Coin    
    emptyCell = findRandomEmptyCell(board);
    board[emptyCell[0]][emptyCell[1]] = 3;
    coin.i = emptyCell[0];
    coin.j = emptyCell[1];
    coin.prev = 0;
    coin.prev_i = coin.i;
    coin.prev_j = coin.j;

    //Assign Freeze
    var emptyCell = findRandomEmptyCell(board);
    board[emptyCell[0]][emptyCell[1]] = 11;

    //Display Hearts
    updateHearts();
    
    //Teleports
    setTeleports();

    addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true;
    }, false);
    addEventListener("keyup", function (e) {
        keysDown[e.keyCode] = false;
    }, false);

    Draw();
}

function startGame(){
    clearInterval(interval);
    
    let btn = $("#ppBtn");

    btn.html('Restart <span class="glyphicon glyphicon-stop" aria-hidden="true"></span>');
    btn.removeClass("btn-primary");
    btn.addClass("btn-danger");
    btn.attr("onclick","initBoard()");

    start_time = new Date();
    pausedTime = start_time;

    _audio.play();
    interval = setInterval(UpdatePosition, 150);
}

function setTeleports(){
    var emptyCell = findRandomEmptyCell(board);
    board[emptyCell[0]][emptyCell[1]] = 9;
    teleports[9] = {
        i:emptyCell[0],
        j:emptyCell[1]
    };

    emptyCell = findRandomEmptyCell(board);
    board[emptyCell[0]][emptyCell[1]] = 10;
    teleports[10] = {
        i:emptyCell[0],
        j:emptyCell[1]
    };
}

//Drawing on canvs
function Draw() {
    
    canvas.width = canvas.width; //clean board

    lblScore.value = score;
    lblTime.value = time_elapsed == undefined ? "0.00" : time_elapsed.toFixed(2);

    if(lastKeyPressed === undefined || lastKeyPressed == null)
        lastKeyPressed = prevKey;

    for (var i = 0; i < _boardSize; i++) {
        for (var j = 0; j < _boardSize; j++) {
            var center = new Object();
            center.x = i * 60 * STANDARTSIZE / _boardSize + 30 * STANDARTSIZE / _boardSize;
            center.y = j * 60 * STANDARTSIZE / _boardSize + 30 * STANDARTSIZE / _boardSize;
            //PACMAN
            if (board[i][j] == 2) {
                context.beginPath();
                context.arc(center.x, center.y, 25 * STANDARTSIZE / _boardSize, 0.15 * Math.PI + pacmanDirection[lastKeyPressed].arc, 1.85 * Math.PI + pacmanDirection[lastKeyPressed].arc); // half circle
                context.lineTo(center.x, center.y);
                context.fillStyle = pac_color; //color 
                context.fill();
                //EYE
                context.beginPath();
                context.arc(center.x + pacmanDirection[lastKeyPressed].x * STANDARTSIZE / _boardSize, center.y + pacmanDirection[lastKeyPressed].y * STANDARTSIZE / _boardSize, 5 * STANDARTSIZE / _boardSize, 0, 2 * Math.PI); // circle
                context.fillStyle = "black"; //color 
                context.fill();
            //TELEPORTS
            }else if(board[i][j] == 9 || board[i][j] == 10){
                var num = board[i][j];

                let img = new Image();
                img.src = `imgs/whirl${num}.png`;
                var x = center.x;
                var y = center.y;

                drawImage(img,x - 15* STANDARTSIZE / _boardSize,y - 15* STANDARTSIZE / _boardSize, 32 * STANDARTSIZE / _boardSize,32 * STANDARTSIZE / _boardSize);
            
            //GHOSTS
            }else if(board[i][j] >= 5 && board[i][j] <= 8){
                var num = board[i][j];

                let img = new Image();
                img.src = `imgs/ghost${num-4}.png`;
                var x = center.x;
                var y = center.y;

                drawImage(img,x - 15* STANDARTSIZE / _boardSize,y - 15* STANDARTSIZE / _boardSize, 32 * STANDARTSIZE / _boardSize,32 * STANDARTSIZE / _boardSize);

            //FOOD
            }else if (board[i][j] == 1) {
                context.beginPath();
                // context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
                context.arc(center.x, center.y, 5 * STANDARTSIZE / _boardSize, 0, 2 * Math.PI); // circle
                context.fillStyle = foodColor; //color 
                context.fill();
            }else if (board[i][j] == 1.1) {
                context.beginPath();
                context.arc(center.x, center.y, 5 * STANDARTSIZE / _boardSize, 0, 2 * Math.PI); // circle
                context.fillStyle = foodColor15; //color 
                context.fill();
            }else if (board[i][j] == 1.2) {
                context.beginPath();
                context.arc(center.x, center.y, 5 * STANDARTSIZE / _boardSize, 0, 2 * Math.PI); // circle
                context.fillStyle = foodColor25; //color 
                context.fill();
            }
            //WALLS
            else if (board[i][j] == 4) {
                context.beginPath();
                // context.setLineDash([2,1]);
                context.strokeStyle =  foodColor;
                context.rect(center.x - 20 * STANDARTSIZE / _boardSize, center.y - 20 * STANDARTSIZE / _boardSize, 40 * STANDARTSIZE / _boardSize, 40 * STANDARTSIZE / _boardSize);
                context.fillStyle = wallColor; //color 
                context.fill();
                context.stroke();
            //COIN
            }else if(board[i][j] == 3){
                let img = new Image();
                img.src = `imgs/pig_template.png`;
                var x = center.x;
                var y = center.y;

                drawImage(img,x - 15* STANDARTSIZE / _boardSize,y - 20 * STANDARTSIZE / _boardSize, 52 * STANDARTSIZE / _boardSize, 52 * STANDARTSIZE / _boardSize);
            }else if(board[i][j] == 11){
                let img = new Image();
                img.src = `imgs/snow.png`;
                var x = center.x;
                var y = center.y;

                drawImage(img,x - 20* STANDARTSIZE / _boardSize,y - 20 * STANDARTSIZE / _boardSize, 48 * STANDARTSIZE / _boardSize, 48 * STANDARTSIZE / _boardSize);
            }
        }
    }
}

function drawImage(img,x,y,h,w){
    if(!img.complete){
        setTimeout(()=>{
            drawImage(img,x,y,h,w);
        }, 5);
        return;
    }
    context.drawImage(img, x,y,h,w);
}

//Movement
function UpdatePosition() {
    if(board == undefined || shape == undefined || shape.i == undefined || shape.j == undefined)
        return;

    board[shape.i][shape.j] = 0;

    prevKey = lastKeyPressed || prevKey;
    lastKeyPressed = GetKeyPressed();

    moveGhosts();
    moveCoin();

    if(lastKeyPressed >= 1 && lastKeyPressed <= 4)
        hasTeleported = false;

    if(lastKeyPressed==1){
        if(shape.j>0 && board[shape.i][shape.j-1]!=4){
            shape.j--;
        }
    }

    if(lastKeyPressed==2){
        if(shape.j<(_boardSize-1) && board[shape.i][shape.j+1]!=4){
            shape.j++;
        }
    }

    if(lastKeyPressed==3){
        if(shape.i>0 && board[shape.i-1][shape.j]!=4){
            shape.i--;
        }
    }

    if(lastKeyPressed==4){
        if(shape.i<(_boardSize-1) && board[shape.i+1][shape.j]!=4){
            shape.i++;
        }
    }

    if(shape.i == coin.i && shape.j == coin.j){
        score += 50;
        coin.i = -1;
        coin.j = -1;

        board[shape.i][shape.j] = 2;
    }

    if(board[shape.i][shape.j] == 11){
        _Difficulty = ghostDifficulty;
        ghostDifficulty = 1;

        setTimeout(() => {
            ghostDifficulty = _Difficulty;
        }, 5000);
    }

    if(board[shape.i][shape.j] == 1)
        score += 5;
    else if(board[shape.i][shape.j]==1.1)
        score += 15
    else if(board[shape.i][shape.j]==1.2)
        score += 25

    let teleportTo = pacmanInTeleport();
    if(teleportTo.length > 0 && !hasTeleported){
        shape.i = teleportTo[0];
        shape.j = teleportTo[1];

        hasTeleported = true;
    }

    $.each(teleports, (idx, tele)=>{
        if(tele == undefined)
            return;
        
        board[tele.i][tele.j] = idx;
    });
    
    board[shape.i][shape.j]=2;

    var currentTime = new Date();
    time_elapsed = (currentTime - start_time)/1000;

    if(time_elapsed >= minimumTime){
        _audio.pause();

        setTimeout(() => {
            if(score < 150){
                _looseSound.play();
                alert(`Time's UP! You've got ${score} points - You can do better!`);
                addHighscore();
                initBoard(); 
            }else{
                _winSound.play();
                alert(`Time's UP! You've got ${score} points - We have a winner!`);
                addHighscore();            
                initBoard(); 
            }
        }, 20);
    }

    $.each(ghosts,(ghostIdx, ghost)=>{
        if(ghost.i == shape.i && ghost.j == shape.j){
            board[ghost.i][ghost.j] = ghostIdx;
            Draw();
            
            _isDead = true;
            setTimeout(() => {
                _audio.pause(); 
                var stopTime = new Date();
                window.clearInterval(interval);
                health--;
                updateHearts();

                setTimeout(()=>{

                    keysDown.map((v,i)=>{keysDown[i] = false;});
                    
                    if(health > 0){
                        _hitSound.play(); 
                        
                        var stopTime = new Date();
                        setTimeout(() => {
                            alert(`OH NO! ${health} tries left for you.`);    

                            decreaseHealthPoint(stopTime);      
                            _audio.play();

                            setTimeout(()=>{
                                _isDead = false;
                            },10);
                            
                        }, 10);
                    
                    }else{      
                        _looseSound.play();
                        
                        setTimeout(()=>{
                            addHighscore();                    
                            window.alert("You Lost - Game OVER!");
                            initBoard(); 
                        }, 10);      
                    }
                }, 5);
                
            }, 5);
        }
    });

    if(score == maxScore){
        Draw();

        setTimeout(() => {
            _audio.pause();            
            addHighscore(); 
            
            setTimeout(()=>{
                _winSound.play();
                window.clearInterval(interval);
                window.alert(`Game completed in ${time_elapsed} seconds`);   
                initBoard();                  
            }, 10);
        }, 50);

    }else{
        Draw();
    }
}

function moveGhosts(){
    $.each(ghosts,(ghostIdx, ghost)=>{
        moveAGhost(ghost, ghostIdx, 1, false);
    });
}

function moveAGhost(ghost, ghostIdx, round, hasMoved){

    if(Math.random() < ghostDifficulty)
        return;

    let rnd = Math.random();

    //move right
    if(((!hasMoved && shape.i > ghost.i) || (round != 1 && rnd <= 0.25)) && !prevPosition(ghost,"R")){
        if(ghost.i+1 != _boardSize && freeForGhost(ghost.i + 1, ghost.j)){
            let prev = ghost.prev;
            ghost.prev = board[ghost.i+1][ghost.j];

            board[ghost.i][ghost.j] = prev;
            board[ghost.i+1][ghost.j] = ghostIdx;
    
            ghost.prev_j = ghost.j;            
            ghost.prev_i = ghost.i;
            ghost.i = ghost.i + 1;
            hasMoved = true;
            
            return;
        }
    }

    //move left
    if(((!hasMoved && shape.i < ghost.i) || (round != 1 && rnd > 0.25 && rnd <= 0.5)) && !prevPosition(ghost,"L")){
        if(ghost.i != 0 && freeForGhost(ghost.i - 1, ghost.j)){
            let prev = ghost.prev;
            ghost.prev = board[ghost.i-1][ghost.j];

            board[ghost.i][ghost.j] = prev;
            board[ghost.i-1][ghost.j] = ghostIdx;

            ghost.prev_j = ghost.j;            
            ghost.prev_i = ghost.i;
            ghost.i = ghost.i - 1;
            hasMoved = true;

            return;            
        }
    }

    //move up
    if(((!hasMoved && shape.j < ghost.j) || (round != 1 && rnd > 0.5 && rnd <= 0.75)) && !prevPosition(ghost,"U")){
        if(ghost.j != 0 && freeForGhost(ghost.i, ghost.j-1)){
            let prev = ghost.prev;
            ghost.prev = board[ghost.i][ghost.j - 1];

            board[ghost.i][ghost.j] = prev;
            board[ghost.i][ghost.j-1] = ghostIdx;
    
            ghost.prev_j = ghost.j;
            ghost.prev_i = ghost.i;                                 
            ghost.j = ghost.j - 1;
            hasMoved = true;

            return;            
        }
    }

    //move down
    if(((!hasMoved && shape.j > ghost.j) || (round != 1)) && !prevPosition(ghost,"D")){
        if(ghost.j + 1 != _boardSize && freeForGhost(ghost.i, ghost.j + 1)){
            let prev = ghost.prev;
            ghost.prev = board[ghost.i][ghost.j + 1];

            board[ghost.i][ghost.j] = prev;
            board[ghost.i][ghost.j+1] = ghostIdx;
    
            ghost.prev_j = ghost.j;   
            ghost.prev_i = ghost.i;         
            ghost.j = ghost.j + 1;
            hasMoved = true;

            return;            
        }
    }

    if(!hasMoved)
        moveAGhost(ghost, ghostIdx, round+1, hasMoved);
}

function moveCoin(){

    if(Math.random() >= 0.4 || (coin.j == -1 && coin.i == -1))
        return;

    let rnd = Math.random();

    //move right
    if(coin.i+1 != _boardSize && freeForCoin(coin.i + 1, coin.j) && rnd <= 0.25){
        let prev = coin.prev;
        coin.prev = board[coin.i+1][coin.j];

        board[coin.i][coin.j] = prev;
        board[coin.i+1][coin.j] = 3;

        coin.prev_j = coin.j;            
        coin.prev_i = coin.i;
        coin.i = coin.i + 1;
        
        return;
    }

    //move left
    if(coin.i != 0 && freeForCoin(coin.i - 1, coin.j) && rnd > 0.25 && rnd <= 0.5){
        let prev = coin.prev;
        coin.prev = board[coin.i-1][coin.j];

        board[coin.i][coin.j] = prev;
        board[coin.i-1][coin.j] = 3;

        coin.prev_j = coin.j;            
        coin.prev_i = coin.i;
        coin.i = coin.i - 1;

        return;            
    }

    //move up
    if(coin.j != 0 && freeForCoin(coin.i, coin.j-1) && rnd > 0.5 && rnd <= 0.75){
        let prev = coin.prev;
        coin.prev = board[coin.i][coin.j - 1];

        board[coin.i][coin.j] = prev;
        board[coin.i][coin.j-1] = 3;

        coin.prev_j = coin.j;
        coin.prev_i = coin.i;                                 
        coin.j = coin.j - 1;

        return;            
    }

    //move down
    if(coin.j + 1 != _boardSize && freeForCoin(coin.i, coin.j + 1)){
        let prev = coin.prev;
        coin.prev = board[coin.i][coin.j + 1];

        board[coin.i][coin.j] = prev;
        board[coin.i][coin.j+1] = 3;

        coin.prev_j = coin.j;   
        coin.prev_i = coin.i;         
        coin.j = coin.j + 1;

        return;            
    }

    moveCoin();
}


//Hit by a ghost
function decreaseHealthPoint(stopTime){

    $.each(ghosts, (idx, ghost)=>{
        if(ghost == undefined)
            return;

        board[ghost.i][ghost.j] = ghost.prev;

        switch(parseInt(idx)){
            case 5:
                board[0][0] = 5;
                ghost.i = ghost.prev_i = 0;
                ghost.j = ghost.prev_j = 0;
                break;
            case 6:
                board[0][_boardSize-1] = 6;
                ghost.i = ghost.prev_i = 0;
                ghost.j = ghost.prev_j = _boardSize-1;
                break;
            case 7:
                board[_boardSize - 1][0] = 7;
                ghost.i = ghost.prev_i = _boardSize-1;
                ghost.j = ghost.prev_j = 0;
                break;
            case 8:
                board[_boardSize - 1][_boardSize - 1] = 8;
                ghost.i = ghost.prev_i = _boardSize-1;
                ghost.j = ghost.prev_j = _boardSize-1;
                break;
        }
        ghost.prev = 0;
    });

    board[shape.i][shape.j] = 0;
    var emptyCell = findRandomEmptyCell(board);
    board[emptyCell[0]][emptyCell[1]] = 2;
    shape.i = emptyCell[0];
    shape.j = emptyCell[1];

    lastKeyPressed = 4;  
    Draw();

    setTimeout(()=>{
        var resumeTime = new Date();
        start_time = new Date(start_time.getTime() + (resumeTime - stopTime));
    
        time_elapsed = (new Date() - start_time)/1000;  
        interval = setInterval(UpdatePosition, 150);
    }, 1500);

}

function updateHearts(){
    let div = $("#hearts");
    div.html('');

    for (let i = 0; i < health; i++) {
        div.append(`<span class="glyphicon glyphicon-heart" aria-hidden="true"></span>`);       
    }
}

//Game Help-Functions
//Listener
function GetKeyPressed() {
    if(_isDead)
        return;
    //UP
    if (keysDown[38])
        return 1;
    
    //DOWN
    if (keysDown[40])  
        return 2;
    
    //LEFT
    if (keysDown[37]) 
        return 3;
    
    //RIGHT
    if (keysDown[39]) 
        return 4;
}

//Positioning
function findRandomEmptyCell(board){
    var i = Math.floor((Math.random() * (_boardSize -1)) + 1);
    var j = Math.floor((Math.random() * (_boardSize -1)) + 1);

    while(board[i][j] != 0)
    {
        i = Math.floor((Math.random() * (_boardSize -1)) + 1);
        j = Math.floor((Math.random() * (_boardSize -1)) + 1);
    }

    return [i,j];             
}

function isWall(i,j,mapType){

    if(mapType > 0.5)
        return (i==3 && j==3)||(i==3 && j==4)||(i==3 && j==5)||(i==6 && j==1)||(i==6 && j==2) || (i == 4 & j == 3) || (i==5 & j==3 || (i==6 && j==3)) //Top-left
        || (i == _boardSize-4 && j == 5) || (i == _boardSize-4 && j == 4) || (i == _boardSize-4 && j == 3) || (i == _boardSize-5 && j == 3) || (i == _boardSize-6 && j == 3) || (i == _boardSize-7 && j == 3)  || (i == _boardSize-7 && j == 2)  || (i == _boardSize-7 && j == 1) //Top-Right
        || (i == 3 && j == _boardSize -2) || (i == 3 && j == _boardSize -3) || (i == 3 && j == _boardSize -4) || (i == 4 && j == _boardSize -4) || (i == 5 && j == _boardSize -4) || (i == 6 && j == _boardSize -4) || (i == 6 && j == _boardSize -3) || (i == 6 && j == _boardSize -2) //Bottom-Left
        || (i == _boardSize-4 && j == _boardSize -2) || (i == _boardSize-4 && j == _boardSize -3) || (i == _boardSize-4 && j == _boardSize -4) || (i == _boardSize-5 && j == _boardSize -4) || (i == _boardSize-6 && j == _boardSize -4) || (i == _boardSize-7 && j == _boardSize -4) || (i == _boardSize-7 && j == _boardSize -3) || (i == _boardSize-7 && j == _boardSize -2) //Bottom-Right
        || (i == _boardSize/2 && j == _boardSize/2) || (i == _boardSize/2-1 && j == _boardSize/2) || (i == _boardSize/2 && j == _boardSize/2+1) || (i == _boardSize/2-1 && j == _boardSize/2+1) || (i == _boardSize/2-2 && j == _boardSize/2+1) || (i == _boardSize/2-3 && j == _boardSize/2+1) || (i == _boardSize/2+1 && j == _boardSize/2+1) || (i == _boardSize/2+2 && j == _boardSize/2+1) || (i == _boardSize/2+3 && j == _boardSize/2+1) || (i == _boardSize/2-4 && j == _boardSize/2+1)
        || (i == 0 && j == _boardSize/2-1) || (i == 0 && j == _boardSize/2) || (i == _boardSize-1 && j == _boardSize/2-1) || (i == _boardSize-1 && j == _boardSize/2)
        ;
    
    return (i == 1 && j == 1) || (i == 2 && j == 1) || (i == 3 && j == 1) || (i == 4 && j == 1) || (i == 3 && j == 2) || (i == 2 && j == 3) || (i == 1 && j == 4) || (i == 2 && j == 4) || (i == 3 && j == 4) || (i == 4 && j == 4) //Z 
        || (i == 6 && j == 4) || (i == 6 && j == 3) || (i == 6 && j == 2) || (i == 6 && j == 1) || (i == 7 && j == 1) || (i == 8 && j == 1) || (i == 9 && j == 1) || (i == 9 && j == 2) || (i == 9 && j == 3) || (i == 9 && j == 4) || (i == 7 && j == 3) || (i == 8 && j == 3)//A
        || (i == 11 && j == 1) || (i == 12 && j == 2) || (i == 13 && j == 3) || (i == 14 && j == 4) || (i == 11 && j == 4) || (i == 12 && j == 3) || (i == 13 && j == 2) || (i == 14 && j == 1) //X
        || (i == 1 && j == 14) || (i == 1 && j == 13) || (i == 1 && j == 12) || (i == 1 && j == 11) || (i == 2 && j == 12) || (i == 3 && j == 13)  || (i == 4 && j == 14) || (i == 4 && j == 13) || (i == 4 && j == 12) || (i == 4 && j == 11) //N
        || (i == 6 && j == 14) || (i == 6 && j == 13) || (i == 6 && j == 12) || (i == 6 && j == 11) || (i == 7 && j == 11) || (i == 9 && j == 12) || (i == 9 && j == 13) || (i == 7 && j == 14) || (i == 8 && j == 14) || (i == 8 && j == 11) //D
        || (i == 13 && j == 14) || (i == 12 && j == 13) || (i == 11 && j == 12) || (i == 11 && j == 11) || (i == 14 && j == 13) || (i == 15 && j == 12) || (i == 15 && j == 11) //V
        ;
}

function pacmanInTeleport(){
    var found = teleports.filter((tele)=>{
        return tele.i == shape.i && tele.j == shape.j;
    });

    if(found.length > 0){
        var current = found[0];
        var res;

        $.each(teleports, (key,tele)=>{
            if(tele == undefined)
                return;

            if(tele.i != current.i || tele.j != current.j)
                res = tele;
        });

        return [res.i,res.j];
    }
    
    return [];
}

function freeForGhost(i,j){
    return (board[i][j] == 11 || board[i][j] == 10 || board[i][j] == 9 || board[i][j] == 0 || board[i][j] == 1 || board[i][j] == 2 || board[i][j] == 1.1 || board[i][j] == 1.2 || board[i][j] == 3 || board[i][j] == 11);
}

function freeForCoin(i,j){
    return (board[i][j] == 0 || board[i][j] == 1);
}

function prevPosition(ghost, direction){
    var res;
    switch(direction){
        case "R":
            res = (ghost.i + 1 == ghost.prev_i);
            break;
        case "L":
            res = (ghost.i - 1 == ghost.prev_i);
            break;
        case "D":
            res = (ghost.j + 1 == ghost.prev_j);
            break;
        case "U":
            res = (ghost.j - 1 == ghost.prev_j);
            break;      
    }

    return res;
}

//HighScores
function addHighscore(){
    highscores.push({
        "name": _ingameUser.username,
        "score": score,
        "time": time_elapsed
    });
}