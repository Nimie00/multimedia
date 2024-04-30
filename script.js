$(document).ready(function(){
    let gemClass = "gem";
    let gemIdPrefix = "gem";
    let numRows = 8;
    let numCols = 8;
    let selectedRow = -1;
    let selectedCol = -1;
    let posX;
    let posY;
    let jewels = [];
    let movingItems = 0;
    let gameState = "pick";
    let swipeStart = null;
    let swipeStartX = null;
    let swipeStartY  = null;
    let mouseDownTarget = null;
    let horizontalSearch = false;
    let matchFound = false;
    let middlesearch = false
    let searchedX = 0;
    let searchedY = 0;
    let gemtypes = 8;
    let szam = 3;
    const paddingsize = 10;
    const gameBoard = $('#gamefield');
    const imagePath = 'resources/images/';

    const gemSize = 64;

    let widthnumber = (numCols*gemSize)+((numCols-1)*paddingsize/2);
    let heightnumber = (numRows*gemSize)+((numRows-1)*paddingsize/2);

    let bgColors = ["magenta", "mediumblue", "yellow", "cyan", "orange", "crimson", "gray"];
    $("body").append('<button id="findMatchButton">Megfelelő elem keresése</button>');
    $("body").append('<div id="marker"></div>').css({
        "background-color": "black",
        "margin": "0"
    });
    let marker = $('#marker');
    $(gameBoard).css({
        "width": widthnumber+"px",
        "height": heightnumber+"px",
        "border": "1px solid black",
        "padding": paddingsize,
    });
    $(marker).css({
        "width": (gemSize - 10) + "px",
        "height": (gemSize - 10) + "px",
        "border": "5px solid white",
        "position": "absolute"
    }).hide();
    for(let i = 0; i < numRows; i++){
        jewels[i] = [];
        for(let j = 0; j < numCols; j++){
            jewels[i][j] = -1;
        }
    }
    for(let i = 0; i < numRows; i++){
        for(let j = 0; j < numCols; j++){
            do{
                jewels[i][j] = Math.floor(Math.random() * gemtypes);
            } while(isStreak(i, j));
            let gem = $('<img class="' + gemClass + '" id="' + gemIdPrefix + '_' + i + '_' + j + '" src="' + getRandomGemImagePath(jewels[i][j]) + '" />');
            $(gameBoard).append(gem);
            gem.css({
                "top": (i * (gemSize + paddingsize / 2)) + ($(gameBoard).get(0).offsetTop)  + ((heightnumber-((gemSize+paddingsize/2)*numRows)))+paddingsize+1+ "px",
                "left": (j * (gemSize + paddingsize / 2)) + ($(gameBoard).get(0).offsetLeft)  + ((widthnumber-((gemSize+paddingsize/2)*numCols)))+paddingsize+1 + "px",
                "width": gemSize-10 + "px",
                "height": gemSize-10 + "px",
                "position": "absolute",
                "cursor": "pointer",
                "background-color": bgColors[jewels[0][i]],
                "margin": paddingsize
            });
        }
    }

    function getRandomGemImagePath(number) {
        let gemTypes = ['gem0.png', 'gem1.png','gem2.png','gem3.png','gem4.png','gem5.png','gem6.png','gem7.png']; //
        return imagePath + gemTypes[number];
    }

    $(gameBoard).on("mousedown", function(event) {
        event.preventDefault();
        let target = event.target;
        mouseDownTarget = event.target;
        if ($(target).hasClass("gem")) {
            if (gameState === "pick") {
                let row = parseInt($(target).attr("id").split("_")[1]);
                let col = parseInt($(target).attr("id").split("_")[2]);
                $(marker).show().css({
                    "top": ((row * (gemSize + paddingsize / 2)) + ($(gameBoard).get(0).offsetTop) + ((heightnumber - ((gemSize-0.5 + paddingsize / 2) * numRows))) + paddingsize + 2) + "px",
                    "left": ((col * (gemSize + paddingsize / 2)) + ($(gameBoard).get(0).offsetLeft) + ((widthnumber - ((gemSize-0.5 + paddingsize / 2) * numCols))) + paddingsize + 2) + "px"
                });
                if (selectedRow === -1) {
                    selectedRow = row;
                    selectedCol = col;
                    swipeStartX = event.pageX;
                    swipeStartY = event.pageY;
                } else {
                    if ((Math.abs(selectedRow - row) === 1 && selectedCol === col) || (Math.abs(selectedCol - col) === 1 && selectedRow === row)) {
                        $(marker).hide();
                        gameState = "switch";
                        posX = col;
                        posY = row;
                        gemSwitch();
                    } else {
                        swipeStartX = row;
                        swipeStartY = col;
                        selectedRow = row;
                        selectedCol = col;
                    }
                }
            }
        }
    });


    $(gameBoard).on("mouseup", function(event) {
        let target = event.target;
        if (target === mouseDownTarget) {
            if ($(target).hasClass("gem")) {
                if (swipeStart != null) {
                    if (gameState === "pick") {
                        selectedRow = parseInt($(swipeStart).attr("id").split("_")[1]);
                        selectedCol = parseInt($(swipeStart).attr("id").split("_")[2]);
                        let direction = getSwipeDirection(event.pageX, event.pageY);
                        switch (direction) {
                            case "up":
                                if (selectedRow > 0) {
                                    $(marker).hide();
                                    gameState = "switch";
                                    posX = selectedCol;
                                    posY = selectedRow - 1;
                                    gemSwitch();
                                }
                                break;
                            case "down":
                                if (selectedRow < numRows - 1) {
                                    $(marker).hide();
                                    gameState = "switch";
                                    posX = selectedCol;
                                    posY = selectedRow + 1;
                                    gemSwitch();
                                }
                                break;
                            case "left":
                                if (selectedCol > 0) {
                                    $(marker).hide();
                                    gameState = "switch";
                                    posX = selectedCol - 1;
                                    posY = selectedRow;
                                    gemSwitch();
                                }
                                break;
                            case "right":
                                if (selectedCol < numRows - 1) {
                                    $(marker).hide();
                                    gameState = "switch";
                                    posX = selectedCol + 1;
                                    posY = selectedRow;
                                    gemSwitch();
                                }
                                break;
                        }
                    }
                }
            }
        }
        mouseDownTarget = null;
    });

    $(gameBoard).on("mousemove", function(event) {
        if (event.buttons === 1) {
            swipeStart = null;
            let target = event.target;
            if ($(target).hasClass("gem")) {
                swipeStart = target;
            }
        }
    });

    function getSwipeDirection(x, y) {
        let deltaX = x - swipeStartX;
        let deltaY = y - swipeStartY;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                return "right";
            } else {
                return "left";
            }
        } else {
            if (deltaY > 0) {
                return "down";
            } else {
                return "up";
            }
        }
    }

    function checkMoving(){
        movingItems--;
        if(movingItems === 0){
            switch(gameState){
                case "revert":
                case "switch":
                    if(!isStreak(selectedRow, selectedCol) && !isStreak(posY, posX)){
                        if(gameState !== "revert"){
                            gameState = "revert";
                            gemSwitch();
                        }
                        else{
                            gameState = "pick";
                            selectedRow = -1;
                        }
                    }
                    else{
                        gameState = "remove";
                        if(isStreak(selectedRow, selectedCol)){
                            removeGems(selectedRow, selectedCol);
                        }
                        if(isStreak(posY, posX)){
                            removeGems(posY, posX);
                        }
                        gemFade();
                    }
                    break;
                case "remove":
                    checkFalling();
                    break;
                case "refill":
                    placeNewGems();
                    break;
            }
        }
    }

    function placeNewGems(){
        let gemsPlaced = 0;
        for(let i = 0; i < numCols; i++){
            if(jewels[0][i] === -1){
                jewels[0][i] = Math.floor(Math.random() * gemtypes);
                let gem = $('<img class="' + gemClass + '" id="' + gemIdPrefix + '_0_' + i + '" src="' + getRandomGemImagePath(jewels[0][i] ) + '" />');
                $(gameBoard).append(gem);
                gem.css({
                    "top": ($(gameBoard).get(0).offsetTop)  + (heightnumber-((gemSize+paddingsize/2)*numRows)) + paddingsize + 1 + "px",
                    "left": (i * (gemSize + paddingsize / 2)) + ($(gameBoard).get(0).offsetLeft)  + (widthnumber-(gemSize+paddingsize/2)*numCols) + paddingsize + 1 + "px",
                    "width": gemSize-10 + "px",
                    "height": gemSize-10 + "px",
                    "position": "absolute",
                    "cursor": "pointer",
                    "margin": paddingsize
                });
                gemsPlaced++;
            }
        }
        if(gemsPlaced){
            gameState = "remove";
            checkFalling();
        }
        else{
            let combo = 0
            for(let i = 0; i < numRows; i++){
                for(let j = 0; j < numCols; j++){
                    if(j <= numCols - 3 && jewels[i][j] === jewels[i][j + 1] && jewels[i][j] === jewels[i][j + 2]){
                        combo++;
                        removeGems(i, j);
                    }
                    if(i <= numRows - 3 && jewels[i][j] === jewels[i + 1][j] && jewels[i][j] === jewels[i + 2][j]){
                        combo++;
                        removeGems(i, j);
                    }
                }
            }
            if(combo > 0){
                gameState = "remove";
                gemFade();
            }
            else{
                gameState = "pick";
                selectedRow= -1;
            }
        }
    }

    function checkFalling(){
        let fellDown = 0;
        for(let j = 0; j < numCols; j++){
            for(let i = numRows - 1; i > 0; i--){
                if(jewels[i][j] === -1 && jewels[i - 1][j] >= 0){
                    $("#" + gemIdPrefix + "_" + (i - 1) + "_" + j).addClass("fall").attr("id", gemIdPrefix + "_" + i + "_" + j);
                    jewels[i][j] = jewels[i - 1][j];
                    jewels[i - 1][j] = -1;
                    fellDown++;
                }
            }
        }
        $.each($(".fall"), function(){
            movingItems++;
            $(this).animate({
                    top: "+=" + ((gemSize) + (paddingsize/2))
                },
                {
                    duration: 100,
                    complete: function(){
                        $(this).removeClass("fall");
                        checkMoving();
                    }
                });
        });
        if(fellDown === 0){
            gameState = "refill";
            movingItems = 1;
            checkMoving();
        }
    }

    function gemFade(){
        $.each($(".remove"), function(){
            movingItems++;
            $(this).animate({
                    opacity:0
                },
                {
                    duration: 200,
                    complete: function(){
                        $(this).remove();
                        checkMoving();
                    }
                });
        });
    }

    function gemSwitch() {

        let yOffset = selectedRow - posY;
        let xOffset = selectedCol - posX;

        $("#" + gemIdPrefix + "_" + selectedRow + "_" + selectedCol).addClass("switch").attr("dir", "-1");
        $("#" + gemIdPrefix + "_" + posY + "_" + posX).addClass("switch").attr("dir", "1");

        $.each($(".switch"), function() {
            movingItems++;
            $(this).animate({
                left: "+=" + xOffset * ((gemSize) + (paddingsize / 2)) * $(this).attr("dir"),
                top: "+=" + yOffset * ((gemSize) + (paddingsize / 2)) * $(this).attr("dir")
            }, {
                duration: 250,
                complete: function() {
                    checkMoving();
                }
            }).removeClass("switch").removeAttr("dir");
        });

        $("#" + gemIdPrefix + "_" + selectedRow + "_" + selectedCol).attr("id", "temp");
        $("#" + gemIdPrefix + "_" + posY + "_" + posX).attr("id", gemIdPrefix + "_" + selectedRow + "_" + selectedCol);
        $("#temp").attr("id", gemIdPrefix + "_" + posY + "_" + posX);
        let temp = jewels[selectedRow][selectedCol];
        jewels[selectedRow][selectedCol] = jewels[posY][posX];
        jewels[posY][posX] = temp;
    }

    function removeGems(row, col){
        let gemValue = jewels[row][col];
        let tmp = row;
        $("#" + gemIdPrefix + "_" + row + "_" + col).addClass("remove");
        if(isVerticalStreak(row, col)){
            while(tmp > 0 && jewels[tmp - 1][col] === gemValue){
                $("#" + gemIdPrefix + "_" + (tmp - 1) + "_" + col).addClass("remove");
                jewels[tmp - 1][col] = -1;
                tmp--;
            }
            tmp = row;
            while(tmp < numRows - 1 && jewels[tmp + 1][col] === gemValue){
                $("#" + gemIdPrefix + "_" + (tmp + 1) + "_" + col).addClass("remove");
                jewels[tmp + 1][col] = -1;
                tmp++;
            }
        }
        if(isHorizontalStreak(row, col)){
            tmp = col;
            while(tmp > 0 && jewels[row][tmp - 1]===gemValue){
                $("#" + gemIdPrefix + "_" + row + "_" + (tmp - 1)).addClass("remove");
                jewels[row][tmp - 1] = -1;
                tmp--;
            }
            tmp = col;
            while(tmp < numCols - 1 && jewels[row][tmp + 1]===gemValue){
                $("#" + gemIdPrefix + "_" + row + "_" + (tmp + 1)).addClass("remove");
                jewels[row][tmp + 1] = -1;
                tmp++;
            }
        }
        jewels[row][col] = -1;
    }

    function isVerticalStreak(row, col){
        let gemValue = jewels[row][col];
        let streak = 0;
        let tmp = row;
        while(tmp > 0 && jewels[tmp - 1][col] === gemValue){
            streak++;
            tmp--;
        }
        tmp = row;
        while(tmp < numRows - 1 && jewels[tmp + 1][col] === gemValue){
            streak++;
            tmp++;
        }
        return streak > 1
    }

    function isHorizontalStreak(row, col){
        let gemValue = jewels[row][col];
        let streak = 0;
        let tmp = col
        while(tmp > 0 && jewels[row][tmp - 1] === gemValue){
            streak++;
            tmp--;
        }
        tmp = col;
        while(tmp < numCols - 1 && jewels[row][tmp + 1] === gemValue){
            streak++;
            tmp++;
        }
        return streak > 1
    }

    function isStreak(row, col){
        return isVerticalStreak(row, col) || isHorizontalStreak(row, col);
    }


    $(window).on('resize', function() {
        display();
    });

    $("#findMatchButton").on("click", function() {
        matchFound = false;

        // Végigmegyünk az összes elemen a táblán (kivéve az utolsó előtti sort és oszlopot)
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                let found = false;
                //jobbra vagy balra levő elem megegyezik-e a másikkal (TEHÁT 2 UGYANOLYAN VAN-E EGYMÁS MELLETT)
                if ((j < (numCols - 1) && jewels[i][j] === jewels[i][j + 1]) || (j > 0 && jewels[i][j] === jewels[i][j - 1])) {
                    horizontalSearch = true;
                    middlesearch = false;
                    // found = true;
                }

                //felette vagy alatta levő elem megegyezik-e a másikkal (TEHÁT 2 UGYANOLYAN VAN-E EGYMÁS MELLETT)
                if ((i < (numRows - 1) && jewels[i][j] === jewels[i + 1][j]) || (i > 0 && jewels[i][j] === jewels[i - 1][j])) {
                    horizontalSearch = false;
                    middlesearch = false;
                    // found = true;
                }

                // Ellenőrzi, hogy az adott elem mellett van-e két azonos típusú elem,
                if ((j < (numCols - 1) && (j > 0)) && (jewels[i][j - 1] === jewels[i][j + 1])) {
                    console.log("Jobb elem: " +jewels[i][j + 1])
                    console.log("Ball elem: " +jewels[i][j - 1])
                    horizontalSearch = true;
                    middlesearch = true;
                    found = true;
                }

                // Ellenőrzi, hogy az adott elem alatt és felett van-e két azonos típusú elem,
                if ((i < (numRows - 1) && (i > 0)) && (jewels[i - 1][j] === jewels[i + 1][j])) {
                    console.log("alatta elem: " +jewels[i - 1][j])
                    console.log("felette elem: " +jewels[i + 1][j])
                    horizontalSearch = false;
                    middlesearch = true;
                    found = true;
                }

                if (found) {
                    // Ha találunk ilyen párost, megvizsgáljuk a következő elemeket
                    if (checkNextElements(i, j)) {
                        selectedRow = searchedX;
                        selectedCol = searchedY;
                        // Ha találunk megfelelő elemet, beállítjuk a marker pozícióját és a kiválasztott sor és oszlop értékeit
                        $(marker).show().css({
                            "top": ((searchedX * (gemSize + paddingsize / 2)) + ($(gameBoard).get(0).offsetTop) + ((heightnumber - ((gemSize - 0.5 + paddingsize / 2) * numRows))) + paddingsize + 2) + "px",
                            "left": ((searchedY * (gemSize + paddingsize / 2)) + ($(gameBoard).get(0).offsetLeft) + ((widthnumber - ((gemSize - 0.5 + paddingsize / 2) * numCols))) + paddingsize + 2) + "px"
                        });
                        matchFound = true;
                        return;
                    }
                }
                if (matchFound) {
                    return;
                }
            }
        }

        // Ha nem találtunk megfelelő elemet, akkor megjelenítünk egy üzenetet és felkínálunk két gombot
        if (!matchFound) {
            alert("Nincs megfelelő elem.");
            if (szam > 0) {
                // Ha még van számunk, akkor felkínáljuk a feladást és az újragenerálást
                let surrenderButton = '<button id="surrenderButton">Feladás</button>';
                let regenerateButton = '<button id="regenerateButton">Újragenerálás (' + szam + ')</button>';
                $("body").append(surrenderButton + regenerateButton);

                // Eseményfigyelőt adunk a feladás gombhoz
                $("#surrenderButton").on("click", function() {
                    alert("Feladtad.");
                    // Tegyük nullára a számot, hogy ne lehessen tovább újragenerálni
                    szam = 0;
                });

                // Eseményfigyelőt adunk az újragenerálás gombhoz
                $("#regenerateButton").on("click", function() {
                    alert("Újragenerálás...");
                    // Itt hajtsd végre az újragenerálást és csökkentsd eggyel a számot
                    // ...
                    szam--;
                });
            } else {
                // Ha a szám már nullánál van, akkor csak egy feladás gombot kínálunk fel
                let surrenderButton = '<button id="surrenderButton">Feladás</button>';
                $("body").append(surrenderButton);
                $("#surrenderButton").on("click", function() {
                    alert("Feladtad.");
                });
            }
        }
    });

    function checkNextElements(row, col) {
        let gemValue = jewels[row][col];
        console.log("sor: "+ row + "    " + "oszlop: " + col)
        //függőlegesen nézzük meg az elemeket
        if(!horizontalSearch && !middlesearch){
            // Ellenőrizzük az elemet alatta
            if(row < numRows - 1 && jewels[row + 1][col] !== gemValue){

                if (row < numRows - 2 && jewels[row + 2][col] === gemValue) {
                    searchedX = row + 2;
                    searchedY = col;
                    console.log("felfele-jo")
                    return true;
                }
                // Ellenőrizzük az elemet alatta + balra
                if (col > 0 && jewels[row + 1][col-1] === gemValue) {
                    searchedX = row + 1;
                    searchedY = col - 1;
                    console.log("balra-jo")
                    return true;
                }
                // Ellenőrizzük az elemet alatta + jobbra
                if (col < numCols-1 && jewels[row + 1][col+1] === gemValue) {
                    searchedX = row + 1;
                    searchedY = col + 1;
                    console.log("jobbra-jo")
                    return true;
                }
            }
            // Ellenőrizzük az elemet felette
            if(row > 0 && jewels[row - 1][col] !== gemValue){
                // felette
                if (row > 1 && jewels[row - 2][col] === gemValue) {
                    searchedX = row - 2;
                    searchedY = col;
                    console.log("lefele-jo")
                    return true;
                }
                // Ellenőrizzük az elemet felette + balra
                if (col > 0 && jewels[row - 1][col - 1] === gemValue) {
                    searchedX = row - 1;
                    searchedY = col - 1;
                    console.log("jobbra-jo")
                    return true;
                }
                // Ellenőrizzük az elemet alatta + jobbra
                if (col < numCols && jewels[row - 1][col+1] === gemValue) {
                    searchedX = row - 1;
                    searchedY = col + 1;
                    console.log("balra-jo")
                    return true;
                }
            }


        }
        if (horizontalSearch && !middlesearch){
            // Ellenőrizzük az elemet jobbra
            if(col < numCols - 1 && jewels[row][col + 1] !== gemValue){
                // + alatta
                if (col < numCols - 2 && jewels[row][col+2] === gemValue) {
                    searchedX = row;
                    searchedY = col + 2;
                    console.log("balra-jo")
                    return true;
                }
                // Ellenőrizzük az elemet jobbra + felfele
                if (row > 0 && jewels[row - 1][col+1] === gemValue) {
                    searchedX = row - 1;
                    searchedY = col + 1;
                    console.log("le2-jobraell")
                    return true;
                }
                // Ellenőrizzük az elemet jobbra + lefele
                if (row < numRows-1 && jewels[row + 1][col+1] === gemValue) {
                    searchedX = row + 1;
                    searchedY = col + 1;
                    console.log("felfele-jo")
                    return true;
                }
            }
            // Ellenőrizzük az elemet balra
            if(col > 0 && jewels[row][col-1] !== gemValue){
                // + balra
                if (col > 1 && jewels[row][col-2] === gemValue) {
                    searchedX = row;
                    searchedY = col - 2;
                    console.log("jobbra-jo")
                    return true;
                }
                // Ellenőrizzük az elemet balra + felfele
                if (row > 0 && jewels[row - 1][col-1] === gemValue) {
                    searchedX = row - 1;
                    searchedY = col - 1;
                    console.log("le-jo")
                    return true;
                }
                // Ellenőrizzük az elemet balra + lefele
                if (row < numRows && jewels[row + 1][col-1] === gemValue) {
                    searchedX = row + 1;
                    searchedY = col - 1;
                    console.log("felfele-jo")
                    return true;
                }
            }

        }

        if(middlesearch) {
            if (!horizontalSearch) {
                if (col > 0 && col < numCols - 1) {
                    gemValue = jewels[row+1][col];
                    console.log("A megadott típus: " + gemValue)
                    if (jewels[row][col + 1] === gemValue) {
                        searchedX = row;
                        searchedY = col+1;
                        console.log("A középső elem:" + jewels[row][col])
                        console.log("horizontálisan balra")
                        return true;
                    }
                    if (jewels[row ][col -1] === gemValue) {
                        searchedX = row;
                        searchedY = col-1;
                        console.log("A középső elem:" + jewels[row][col])
                        console.log("horizontálisan jobbra")
                        return true;
                    }
                }
            } else {
                if (row > 0 && row < numRows - 1) {
                    gemValue = jewels[row + 1][col];
                    console.log("A megadott típus: " + gemValue)
                    if (jewels[row+1][col] === gemValue && jewels[row+1][col+1] === gemValue) {
                        console.log(jewels[row+1][col])
                        console.log(jewels[row+1][col+1])

                        searchedX = row -1;
                        searchedY = col;
                        console.log("A középső elem:" + jewels[row][col])
                        console.log("vertikálisan alatta")
                        return true;
                    }
                    if (jewels[row-1][col] === gemValue && jewels[row-1][col+1] === gemValue) {
                        searchedX = row+1;
                        searchedY = col;
                        console.log("A középső elem:" + jewels[row][col])
                        console.log("vertikálisan felette")
                        return true;
                    }
                }
            }
            return false;
        }
        return false;
    }
});
