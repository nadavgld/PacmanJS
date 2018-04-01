var context = canvas.getContext("2d");
var shape = new Object();

var board;
var _boardSize = 10;
var score;
var pac_color;
var start_time;
var time_elapsed;    
var interval;
var lastKeyPressed = 4;
var prevKey = lastKeyPressed;

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

var _ingameUser = {
    'username': 'a',
    'password': 'a',
    'first': 'ab',
    'last': 'bc',
    'email': 'ab@cd.ef',
    'date': '12.12.1999'
};

var Welcome = $("#Welcome");
var Register = $("#Register");
var Login = $("#Login");
var About = $("#About");
var Game = $("#Game");

var users = [{
    'username': 'a',
    'password': 'a',
    'first': 'ab',
    'last': 'bc',
    'email': 'ab@cd.ef',
    'date': '12.12.1999'
}];

var validateFormTemplate = {
    'username': false,
    'password': false,
    'first': false,
    'last': false,
    'email': false,
};

var _formValidation;

Start();

function Start() {
    showContainer("Game");
    // showContainer("Welcome");
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
        _formValidation = newFormValidation();
        setFormDates();
        $("#regForm>.btn").prop('disabled',true);
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
        $(document).ready(()=>{
            initBoard();
        });
    }
    
}

function hideAllContainers(){
    Welcome.hide();
    Game.hide();
    Login.hide();
    Register.hide();
    About.hide();
}

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

    $("#regForm>.btn").prop('disabled',!formIsDone);
}

function checkPassword(form){
    var pass = $("#form_password").val().toString().trim();

    if(pass.length == 0 && _formValidation.password == false)
        return;

    if(pass.length < 8){
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

    clearForm("regForm");
    showContainer('Login');
}

function clearForm(formID){
    $("#" + formID).find(".form-control").each((key,val)=>{
        $(val).val('');
        $(val).removeClass('formOK');
        $(val).removeClass('formErr');
    });
}

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

//Game
function initBoard(){
    $("#lblUser").text(_ingameUser.username);    
    clearInterval(interval);

    board = new Array();
    score = 0;
    pac_color = "yellow";
    var cnt = 100;
    var food_remain = 50;
    var pacman_remain = 1;
    start_time= new Date();
    for (var i = 0; i < _boardSize; i++) {
        board[i] = new Array();
        //put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
        for (var j = 0; j < _boardSize; j++) {
            if((i==3 && j==3)||(i==3 && j==4)||(i==3 && j==5)||(i==6 && j==1)||(i==6 && j==2)){
                board[i][j] = 4;
            }else if((i == 0 && j == 0)){
                board[i][j] = 5;
            }else if((i == (_boardSize - 1) && j == (_boardSize - 1))){
                board[i][j] = 6;
            }else if((i == (_boardSize - 1) && j == 0)){
                board[i][j] = 7;
            }else if(i == 0 && j == (_boardSize - 1)){
                board[i][j] = 8;                    
            }else{
                var randomNum = Math.random();
                if (randomNum <= 1.0 * food_remain / cnt) {
                    food_remain--;
                    board[i][j] = 1;
                }else if (randomNum < 1.0 * (pacman_remain + food_remain) / cnt) {
                    shape.i = i;
                    shape.j = j;
                    pacman_remain--;
                    board[i][j] = 2;
                } else {
                    board[i][j] = 0;
                }
            cnt--;
            }
        }
    }
    while(food_remain>0){
        var emptyCell = findRandomEmptyCell(board);
        board[emptyCell[0]][emptyCell[1]] = 1;
        food_remain--;
    }
    keysDown = {};

    addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true;
    }, false);
    addEventListener("keyup", function (e) {
        keysDown[e.keyCode] = false;
    }, false);

    interval = setInterval(UpdatePosition, 150);
}

function isCorner(_i,_j){
    return ;
}

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

function GetKeyPressed() {
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

function Draw() {
    canvas.width = canvas.width; //clean board

    lblScore.value = score;
    lblTime.value = time_elapsed.toFixed(2);

    if(lastKeyPressed === undefined)
        lastKeyPressed = prevKey;

    for (var i = 0; i < _boardSize; i++) {
        for (var j = 0; j < _boardSize; j++) {
            var center = new Object();
            center.x = i * 60 + 30;
            center.y = j * 60 + 30;
            //PACMAN
            if (board[i][j] == 2) {
                context.beginPath();
                context.arc(center.x, center.y, 25, 0.15 * Math.PI + pacmanDirection[lastKeyPressed].arc, 1.85 * Math.PI + pacmanDirection[lastKeyPressed].arc); // half circle
                context.lineTo(center.x, center.y);
                context.fillStyle = pac_color; //color 
                context.fill();
                //EYE
                context.beginPath();
                context.arc(center.x + pacmanDirection[lastKeyPressed].x, center.y + pacmanDirection[lastKeyPressed].y, 5, 0, 2 * Math.PI); // circle
                context.fillStyle = "black"; //color 
                context.fill();
            //GHOSTS
            }else if(board[i][j] >= 5){
                var num = board[i][j];

                let img = new Image();
                img.src = `imgs/ghost${num-4}.png`;
                var x = center.x;
                var y = center.y;

                drawImage(img,x - 15,y - 15, 32,32);

            //FOOD
            }else if (board[i][j] == 1) {
                context.beginPath();
                context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
                context.fillStyle = "black"; //color 
                context.fill();
            }
            //WALLS
            else if (board[i][j] == 4) {
                context.beginPath();
                context.rect(center.x-30, center.y-30, 60, 60);
                context.fillStyle = "grey"; //color 
                context.fill();
            }
        }
    }
}

function drawImage(img,x,y,h,w){
    console.log(x + " " + y);
    
    if(!img.complete){
        setTimeout(()=>{
            drawImage(img,x,y,h,w);
        }, 5);
        return;
    }
    context.drawImage(img, x,y,h,w);
}

function UpdatePosition() {
    if(board == undefined && shape == undefined)
        return;

    board[shape.i][shape.j] = 0;

    prevKey = lastKeyPressed || prevKey;
    lastKeyPressed = GetKeyPressed();
    moveGhosts();

    if(lastKeyPressed==1){
        if(shape.j>0 && board[shape.i][shape.j-1]!=4){
            shape.j--;
        }
    }

    if(lastKeyPressed==2){
        if(shape.j<9 && board[shape.i][shape.j+1]!=4){
            shape.j++;
        }
    }

    if(lastKeyPressed==3){
        if(shape.i>0 && board[shape.i-1][shape.j]!=4){
            shape.i--;
        }
    }

    if(lastKeyPressed==4){
        if(shape.i<9 && board[shape.i+1][shape.j]!=4){
            shape.i++;
        }
    }

    if(board[shape.i][shape.j]==1){
        score++;
    }
    
    board[shape.i][shape.j]=2;
    var currentTime=new Date();
    time_elapsed=(currentTime-start_time)/1000;
    if(score>=20&&time_elapsed<=10){
        pac_color="green";
    }

    if(score==50){
        Draw();

        setTimeout(() => {
            window.clearInterval(interval);
            window.alert("Game completed");        
        }, 50);

    }else{
        Draw();
    }
}

function moveGhosts(){
    
}