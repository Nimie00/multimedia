$(document).ready(function() {
    //Ezzel tudjuk megnézni, hogy az oldal, ahol vagyunk az a listázás vagy az index
    //Ha a listás oldalon vagyunk, akkor csak egy pár fügvény kell.
    if (window.location.pathname.includes('list.html')) {

        orderByPointsDesc();
        loadLeaderboard();

        //Ez betölti a local storage-ből a táblázatunk sorait, ha vannak.
        function loadLeaderboard() {
            let leaderboardData = localStorage.getItem('leaderboardData');
            if (!leaderboardData) {
                console.log('Nincsenek adatok a ponttáblában.');
                return;
            }
            displayLeaderboard(JSON.parse(leaderboardData));
        }

        //A táblázat adatait feltölti a paraméterben kapott sorok alapján
        //Paraméterek:
        // data :
        function displayLeaderboard(data) {
            //Megkeressük a táblázatot
            const tableBody = $('tbody');
            tableBody.empty();
            //A pontokkal feltöltjük a táblázatot, minden sor egy befejezett játék eredménye (név; pontszám; dátum)
            data.forEach(function (rowData) {
                let tr = $('<tr>');
                //Mindegyik adattagnak egy külön cellát hoz létre.
                rowData.forEach(function (cellData) {
                    let td = $('<td>').text(cellData);
                    tr.append(td);
                });
                tableBody.append(tr);
            });
        }


        function orderByPointsDesc() {
            // Ellenőrizzük, hogy van-e már mentett adat a localStorage-ben
            if (localStorage.getItem("leaderboardData")) {
                // Betöltjük a mentett adatokat a pontok változóba
                let pontok = JSON.parse(localStorage.getItem("leaderboardData"));

                // Rendezzük a pontokat csökkenő sorrendben
                pontok.sort((a, b) => b[1] - a[1]);

                // Frissítjük a localStorage-t a rendezett pontokkal
                localStorage.setItem("leaderboardData", JSON.stringify(pontok));
            }
        }

        //Ez akkor fut le, ha nem a list.html oldalon vagyunk, mivel a program 2 oldalból áll, ezért biztos, hogy ez az index,html
    } else {
        const gameBoard = $('#gamefield');
        const timeBar = $('#time-bar');
        const timeBarContainer = $('#time-bar-container');
        const timeIndicator = $('#timeIndicator');
        const currentScore = $('#current-score');
        const currentMultiplier = $('#current-multiplier');
        const numRows = 8;
        const numCols = 8;
        const paddingSize = 10;
        const rowMaxIndex = (numRows - 1);
        const colMaxIndex = (numCols - 1);
        const startingTime = 30;
        const imagePath = 'resources/images/';
        const soundPath = "resources/sounds/";
        const selectSoundList = ["select1.ogg", "select2.ogg", "select3.ogg"];
        const breakSoundList = ["break1.ogg", "break2.ogg"];
        const specialSound = "resources/sounds/special.ogg";
        const backgroundMusic = new Audio("resources/sounds/background.ogg");
        const buttons = $("#buttons");
        let interact = false;
        let superSound = true;
        let regenerateButton = $('#regenerateButton');
        let soundsOn = true;
        let musicOn = true;
        let gemClass = "gem";
        let gemIdPrefix = "gem";
        let selectedRow = -1; //Alapból -1 a kiválasztott elem, ezzel biztosítjuk, hogy nincs elem kiválasztva.
        let selectedCol = -1; //Alapból -1 a kiválasztott elem, ezzel biztosítjuk, hogy nincs elem kiválasztva.
        let posX;
        let posY;
        let jewels = [];
        let movingItems = 0;
        let gameState = "pick";
        let swipeStart = null;
        let swipeStartX = null;
        let swipeStartY = null;
        let mouseDownTarget = null;
        let rightLeft = false;
        let matchFound = false;
        let middleDifferent = false
        let searchedX = 0;
        let searchedY = 0;
        let gemTypes = 8;
        let regeneratePossibilities = 3;
        let timeLeft = startingTime;
        let started = false;
        let specialGem = 0;
        let superRemove = false;
        let points = 10;
        let multiplier = 1;
        let multiCounter = 0;
        let gemIdSelector = null;
        backgroundMusic.volume = 0.2;
        backgroundMusic.loop=true;

        const gemSize = 64;

        let widthnumber = (numCols * gemSize) + ((numCols - 1) * paddingSize / 2);
        let heightnumber = (numRows * gemSize) + ((numRows - 1) * paddingSize / 2);

        let bgColors = ["#ACC3B9", "#000000", "#6AFF00", "#FF0400", "#7B00FF", "#91D1FF", "#FF11A0", "#77FFCB", "#FFBC49", "#51012D"];

        buttons.append('<button id="findMatchButton">Megfelelő elem keresése</button><br>');
        $("body").append('<div id="marker"></div>').css({
            "background-color": "#66b3cc",
            "margin": "0"
        });

        let marker = $('#marker');

        // Újra generáljuk a jewels tömböt
        for (let i = 0; i < numRows; i++) {
            jewels[i] = [];
            for (let j = 0; j < numCols; j++) {
                jewels[i][j] = -1;
            }
        }

        function setupGame() {
            $(gameBoard).empty();
            $(gameBoard).css({
                "width": widthnumber + "px",
                "height": heightnumber + "px",
                "padding": paddingSize,
                "margin": paddingSize * 2
            });
            $(timeBarContainer).css({
                "width": widthnumber + "px",
                "height": 30 + "px",
                "padding": paddingSize,
                "position": "absolute",
                "top": 40 + "px",
                "left": $(gameBoard).get(0).offsetLeft + "px"
            });
            $(marker).css({
                "width": (gemSize - 10) + "px",
                "height": (gemSize - 10) + "px",
                "border": "5px solid white",
                "position": "absolute"
            }).hide();
        }
        setupGame();
        regenerateBoard(0,false);

        //Ez a metódus generálja le a játéktéren található összes drágakövet
        function regenerateBoard(specialGems = 0, exists) {
            // Töröljük az összes gyémántot a tábláról
            $(gameBoard).empty();

            let rowofspecial = numCols*numRows+1; // Egy olyan helyet választunk, ami nem lehetséges
            let colofspecial = numCols*numRows+1; // Egy olyan helyet választunk, ami nem lehetséges
            if (specialGems === 1) {
                // Ha igen, akkor speciális elemet teszünk az adott pozícióra
                let specialgem = Math.floor(Math.random()*rowMaxIndex*colMaxIndex);
                if (specialgem !== 0) { // Ellenőrizzük, hogy nem az alapértelmezett érték
                    rowofspecial = Math.floor(specialgem / numCols); // Számoljuk ki a sor számát
                    colofspecial = specialgem % numCols; // Számoljuk ki az oszlop számát
                } else {
                    rowofspecial = 0;
                    colofspecial = 0;
                }
            }
            //Minden drágakő kap egy értéket és azt az értéket belerakjuk a drágaköveket tároló 2d-s array-be
            for (let i = 0; i < numRows; i++) {
                for (let j = 0; j < numCols; j++) {

                    if(!exists) {

                        //Egy random számot választunk, amely megadja, hogy mekkora esélyel lehet az új elem super drágakő
                        // Ebben az esetben: 1 / 172
                        // Ha nem olyan értéket kapunk ami super drágakövet generálna akkor random választunk 1-et a többi drágakő típusból
                        let isSpecialPosition = (i === rowofspecial && j === colofspecial);
                        if (!isSpecialPosition) {
                            do {
                                let randomszam = Math.floor(Math.random() * rowMaxIndex * colMaxIndex * rowMaxIndex / 2);
                                if (randomszam === 1 && specialGem === 0) {
                                    jewels[i][j] = 9;
                                    specialGem = 1;
                                } else {
                                    jewels[i][j] = Math.floor(Math.random() * gemTypes);
                                }
                            } while (Streak(i, j)); // Ellenőrizzük, hogy ne legyen streak
                        } else {
                            jewels[i][j] = 9;
                        }
                    }


                    // Létrehozzuk a gyémántot a megfelelő képpel
                    let gem;
                    if(jewels[i][j] !== 9) {
                        gem = $('<img alt="gemstone"  class="' + gemClass + '" id="' + gemIdPrefix + '_' + i + '_' + j + '" src="' + getRandomGemImagePath(jewels[i][j]) + '" />');
                        $(gameBoard).append(gem);
                    } else {
                        if (soundsOn && interact && superSound){
                            superSound = false
                            let specialaudio = new Audio(specialSound);
                            void specialaudio.play();
                        }
                        gem = $('<img alt="gemstone"  class="' + gemClass + '" id="' + gemIdPrefix + '_' + i + '_' + j + '" src="' + imagePath+"gem9.png" + '" />');
                        gem.addClass('special');
                        $(gameBoard).append(gem);
                    }
                    // Beállítjuk a gyémánt helyzetét és stílusát
                    gem.css({
                        "top": (i * (gemSize + paddingSize / 2)) + $(gameBoard).get(0).offsetTop + ((heightnumber - ((gemSize + paddingSize / 2) * numRows))) + paddingSize + 1 + "px",
                        "left": (j * (gemSize + paddingSize / 2)) + $(gameBoard).get(0).offsetLeft + ((widthnumber - ((gemSize + paddingSize / 2) * numCols))) + paddingSize + 1 + "px",
                        "width": gemSize - 10 + "px",
                        "height": gemSize - 10 + "px",
                        "position": "absolute",
                        "cursor": "pointer",
                        "background-color": bgColors[jewels[i][j]],
                        "margin": paddingSize
                    });
                }
            }
        }

        //Ez a metódus egy számot vár paraméterként és kiválasztja az ahhoz a számhoz tartozó kép elérését, és visszaadja az elérési utat
        //Paraméterek
        // number :  Az a szám, ami indexként szolgál a gemTypes tömb elemeihez
        function getRandomGemImagePath(number) {
            let gemTypes = ['gem0.png', 'gem1.png', 'gem2.png', 'gem3.png', 'gem4.png', 'gem5.png', 'gem6.png', 'gem7.png']; //
            return imagePath + gemTypes[number];
        }

        //Ez a programrész akkor fut le, ha a jétéktéren lenyomunk egy egérgombot
        $(gameBoard).on("mousedown", function (event) {
            interact = true;
            event.preventDefault();
            let target = event.target;
            mouseDownTarget = event.target;
            if ($(target).hasClass("gem")) {
                if (gameState === "pick") {
                    //A kattintott elem koordinátáit elmentjük, majd az adott koordinátához rajzoljuk a "markert" és megkapja az adott elem a selected.gif-et képnek
                    let row = parseInt($(target).attr("id").split("_")[1]);
                    let col = parseInt($(target).attr("id").split("_")[2]);
                    $(marker).show().css({
                        "top": ((row * (gemSize + paddingSize / 2)) + ($(gameBoard).get(0).offsetTop) + ((heightnumber - ((gemSize - 0.5 + paddingSize / 2) * numRows))) + paddingSize + 2) + "px",
                        "left": ((col * (gemSize + paddingSize / 2)) + ($(gameBoard).get(0).offsetLeft) + ((widthnumber - ((gemSize - 0.5 + paddingSize / 2) * numCols))) + paddingSize + 2) + "px"
                    });
                    gemIdSelector = $("#" + gemIdPrefix + "_" + row + "_" + col);
                    gemIdSelector.attr("src", (imagePath + "selected.gif"));
                    //Ha a selectedRow === -1, akkor még nincs elem kijelölve, ezért a mostani elemet kiválasztjuk, és ha nincs elindítva játék, akkor elnidítjuk
                    if (selectedRow === -1) {
                        selectedRow = row;
                        selectedCol = col;
                        swipeStartX = event.pageX;
                        swipeStartY = event.pageY;
                        if (!started) {
                            startTimer();
                        }
                        if (soundsOn && interact){
                            let soundselect = new Audio(soundPath + selectSoundList[Math.floor(Math.random() * selectSoundList.length)])
                            void soundselect.play();
                        }
                    //Itt már volt elem kijelölve, tehát ez a második elem ami ki lett jelölve és itt meg kell vizsgálni, hogy egymás mellett vannak-e
                    } else {
                        //Egymás mellett van a 2 drágakő, akkor meghívjuk a gemswitch-et rá, ha nem akkor a második elem lesz az első,
                        if ((Math.abs(selectedRow - row) === 1 && selectedCol === col) || (Math.abs(selectedCol - col) === 1 && selectedRow === row)) {
                            $(marker).hide();
                            gameState = "switch";
                            posX = col;
                            posY = row;
                            gemSwitch();
                        } else {
                            gemIdSelector = $("#" + gemIdPrefix + "_" + selectedRow + "_" + selectedCol);
                            gemIdSelector.attr("src", (imagePath + "gem" + jewels[selectedRow][selectedCol] + ".png"));
                            swipeStartX = row;
                            swipeStartY = col;
                            selectedRow = row;
                            selectedCol = col;
                        }
                    }
                }
                if(superRemove){
                    superRemoveProcedure()
                    superSound = true;
                }
            }
        });

        //Ha a táblán felemeljük az egeret, akkor lefut ez a programrész,
        //Ha ugyan az az elem, ahol lenyomtuk és felemeltük az egeret, és az drágakő akkor megnézzük, hogy a
        $(gameBoard).on("mouseup", function (event) {
            interact = true;
            let target = event.target;
            if (target === mouseDownTarget) {
                if ($(target).hasClass("gem")) {
                    if (swipeStart != null) {
                        //Itt már tudjuk, hogy egy megfelelő elemre kattintottunk és tudjuk, hogy melyik elemen van az egér
                        //Ha a játék választás módban van, akkor az adtott elemből kiolvassuk a koordinátákat és kiszámoljuk a csere irányát.
                        if (gameState === "pick") {
                            selectedRow = parseInt($(swipeStart).attr("id").split("_")[1]);
                            selectedCol = parseInt($(swipeStart).attr("id").split("_")[2]);
                            let direction = getSwipeDirection(event.pageX, event.pageY);
                            //A kiszámolt irány szerint eltüntetjük a "marker-t", átváltunk csere üzemmódba és a cserélt elem
                            //Koordinátáit is elmentjük és meghívjuk a gemSwitch() metódust.
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
            //A kiválasztott elemet null-ra állítjuk, hogy újra kelljen 1. elemet választani a cserélés előtt.
            mouseDownTarget = null;
        });

        //Ez a programrész folyamatosan lefut, ha a játékot elkezdtük, és mozgatjuk az egeret,
        //Ha bal klikkelünk, és az elem amire klikkeltünk egy drágakő, akkor a swipetargetet beállítja arra az elemre, amire kattintottunk.
        $(gameBoard).on("mousemove", function (event) {
            if (event.buttons === 1) {
                swipeStart = null;
                let target = event.target;
                if ($(target).hasClass("gem")) {
                    swipeStart = target;
                }
            }
        });

        //Ez a metódus kiszámolja, hogy merre cseréltünk ki 2 drágakövet, és visszaad egy irányt
        //Paraméterek:
        // x : a cserélt elem x koordinátája a weboldalon
        // y : a cserélt elem y koordinátája a weboldalon
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

        //Ez a metódus valósítja meg a játék részeinek elválasztását, a többi függvény lefutása alatt lehetnek olyan drágakövek amik elmozdulnak
        //ha van mozgó item akkor azt 1-el csökkentjük, ha nincs akkor megvizsgáljuk, hogy milyen módban vagyunk.
        function checkMoving() {
            movingItems--;
            if (movingItems === 0) {
                switch (gameState) {
                    case "revert":
                    case "switch":
                        //Ha csere módban vagyunk akkor megnézzük, hogy van-e a kiválasztott elemek között streak, ha nincs akkor vissza cseréljük
                        //Ha van akkor tudjuk, hogy törlés lesz ez miatt törlünk
                        if (!Streak(selectedRow, selectedCol) && !Streak(posY, posX)) {
                            if (gameState !== "revert") {
                                gameState = "revert";
                                gemSwitch();
                            } else {
                                gameState = "pick";
                                selectedRow = -1;
                            }
                        } else {
                            gameState = "remove";
                            if (Streak(selectedRow, selectedCol)) {
                                addRemoveClass(selectedRow, selectedCol);
                            }
                            if (Streak(posY, posX)) {
                                addRemoveClass(posY, posX);
                            }
                            gemFade();
                        }
                        break;
                        //Törlés után lehet remove az állapot és ekkor minden drágakövet ami alatt -1 van lentebb tolunk
                    case "remove":
                        checkFalling();
                        break;
                        //Ha már nem tudunk elemeket tolni lefele akkor újratöltjük a tetejéről kezdve.
                    case "refill":
                        placeNewGems();
                        break;
                }
            }
        }

        //Ez a metódus akkor fut le, ha kicseréltünk 2 elemet, és az egyik super drágakő volt,
        //Ha tényleg super drágakövet cseréltünk akkor a másik elem típusából az összes törlésre lesz jelölve, és a típusa -1 lesz.
        function superRemoveGems(row, col) {
            if (superRemove) {
                let gemValue = jewels[row][col];
                for (let i = 0; i < numRows; i++) {
                    for (let j = 0; j < numCols; j++) {
                        if (jewels[i][j] === gemValue) {
                            gemIdSelector = $("#" + gemIdPrefix + "_" + i + "_" + j);
                            gemIdSelector.addClass("remove");
                            if (soundsOn && interact) {
                                let sounddelete = new Audio(soundPath + breakSoundList[Math.floor(Math.random() * breakSoundList.length)]);
                                void sounddelete.play();
                            }
                            addscore(points, multiplier);
                            jewels[i][j] = -1;
                        }
                    }
                }
            }
        }

        //Ez a metódus végzi el az új elemek létrehozását, miután eltüntettünk már meglévő elemeket, ezek mindig az 1. sorban lesznek
        function placeNewGems() {
            let gemsPlaced = 0;
            for (let i = 0; i < numCols; i++) {
                if (jewels[0][i] === -1) {
                    //Egy random számot választunk, amely megadja, hogy mekkora esélyel lehet az új elem super drágakő
                    // Ebben az esetben: 1 / 172
                    // Ha nem olyan értéket kapunk ami super drágakövet generálna akkor random választunk 1-et a többi drágakő típusból
                    let randomszam = Math.floor(Math.random()*rowMaxIndex*colMaxIndex*rowMaxIndex/2);
                    if (randomszam === 1  && specialGem === 0){
                        jewels[0][i] = 9;
                        specialGem = 1;
                    } else {
                        jewels[0][i] = Math.floor(Math.random() * gemTypes);
                    }


                    //Létrehozunk egy drágakövet, amely az osztályaival tudja, hogy drágakő, tudja a sorát és oszlopát,
                    //A képét pedig a fent generált típusa szerint kapja meg, majd hozzáadjuk a játéktérhez a drágakövet
                    let gem;
                    if(jewels[0][i] !== 9) {
                        gem = $('<img alt="gemstone"  class="' + gemClass + '" id="' + gemIdPrefix + '_' + 0 + '_' + i + '" src="' + getRandomGemImagePath(jewels[0][i]) + '" />');
                        $(gameBoard).append(gem);
                    } else {
                        gem = $('<img alt="gemstone"  class="' + gemClass + '" id="' + gemIdPrefix + '_' + 0 + '_' + i + '" src="' + imagePath+"gem9.png" + '" />');
                        gem.addClass('special');
                        $(gameBoard).append(gem);
                        if (soundsOn && interact){
                            let specialaudio = new Audio(specialSound);
                            void specialaudio.play();
                        }

                    }
                    //A drágakövet abszolult pozícióval adjuk meg, és itt kiszámoljuk, hogy a sora és oszlopa alapján hol kell lennie.
                    gem.css({
                        "top": ($(gameBoard).get(0).offsetTop) + (heightnumber - ((gemSize + paddingSize / 2) * numRows)) + paddingSize + 1 + "px",
                        "left": (i * (gemSize + paddingSize / 2)) + $(gameBoard).get(0).offsetLeft + ((widthnumber - ((gemSize + paddingSize / 2) * numCols))) + paddingSize + 1 + "px",
                        "width": gemSize - 10 + "px",
                        "height": gemSize - 10 + "px",
                        "position": "absolute",
                        "cursor": "pointer",
                        "background-color": bgColors[jewels[0][i]],
                        "margin": paddingSize
                    });
                    gemsPlaced++;
                }
            }
            //Ha adtunk hozzá elemet, akkor azt le kell tolnunk addig ameddig lehet, ezt a checkfalling metódus elvégzi.
            if (gemsPlaced) {
                gameState = "remove";
                checkFalling();
            } else { //Ha nincs hozzáadott elem, akkor meg kell néznünk, hogy van-e olyan elem, amit ki tudunk törölni.
                let combo = 0
                for (let i = 0; i < numRows; i++) {
                    for (let j = 0; j < numCols; j++) {
                        //Ha 3 elem egymás mellett megegyezik, akkor töröljük az adott elemeket
                        if (j <= numCols - 3 && jewels[i][j] === jewels[i][j + 1] && jewels[i][j] === jewels[i][j + 2]) {
                            combo++;
                            addRemoveClass(i, j);
                        }
                        //Ha 3 elem egymás alatt megegyezik, akkor töröljük az adott elemeket
                        if (i <= numRows - 3 && jewels[i][j] === jewels[i + 1][j] && jewels[i][j] === jewels[i + 2][j]) {
                            combo++;
                            addRemoveClass(i, j);
                        }
                    }
                }
                //Ha volt olyan elem, amit töröltünk, akkor újra el kell tüntetnünkazokat
                if (combo > 0) {
                    gameState = "remove";
                    gemFade();
                } else { // Ha nincs, akkor szabadon választhatunk elemet, mert a játék pick módba lép
                    gameState = "pick";
                    selectedRow = -1;
                }
            }
        }

        //Ez a metódus megvalósítja a super drágakő törléséhez szükséges lépéseket, majd megjelenít egy szöveget a képernyőn, a kimenetel szerint
        function superRemoveProcedure(){
            superRemoveGems(selectedRow, selectedCol);
            superRemoveGems(posY, posX);
            superRemove = false;
            gameState = "remove";
            addRemoveClass(selectedRow,selectedCol)
            gemFade()
            specialGem = 0;
            let randomszam = Math.floor(Math.random()*4);
            switch (randomszam) {
                case 0:
                    regeneratePossibilities++;
                    let buttonText = 'Újragenerálás (' + regeneratePossibilities + ')';
                    if (regenerateButton.length > 0) {
                        buttonText = regenerateButton.text().split(' ')[0] + ' (' + regeneratePossibilities + ')';
                        regenerateButton.text(buttonText);
                    }
                    showCustomMessage("Kaptál egy bónusz újragenerálást", 2000);
                    break;
                case 1:
                    multiplier++;
                    addscore(0, multiplier);
                    showCustomMessage("A szorzó nagyobb lett!", 2000); // 3 másodpercig jelenik meg
                    break;
                case 2:
                    points  +=5;
                    showCustomMessage("Az alap pontozás nagyobb lett!", 2000); // 3 másodpercig jelenik meg
                    break;
                case 3:
                    timeLeft += 15
                    if(timeLeft > 100){
                        timeLeft += 15
                    }
                    addscore(500, 1);
                    showCustomMessage("Az idő egy kicsit több lett és kaptál 500 pontot!", 3000); // 3 másodpercig jelenik meg
                    break;
                default:
                    break;
            }
        }

        //Ebben a metódusban megvizsgáljuk, hogy van-e olyan elem, ami már ki lett törölve, tehát az értéke -1
        //Ha talál olyan elemet, akkor a felette levőket lefele tolja és ezt animálva megjeleníti a felhasználónak
        function checkFalling() {
            let fellDown = 0;
            for (let j = 0; j < numCols; j++) {
                for (let i = numRows - 1; i > 0; i--) {
                    if (jewels[i][j] === -1 && jewels[i - 1][j] >= 0) {
                        gemIdSelector = $("#" + gemIdPrefix + "_" + (i - 1) + "_" + j)
                        gemIdSelector.addClass("fall").attr("id", gemIdPrefix + "_" + i + "_" + j);
                        jewels[i][j] = jewels[i - 1][j];
                        jewels[i - 1][j] = -1;
                        fellDown++;
                    }
                }
            }
            //Minden esés osztállyal rendelkező drágakő lefele esik addig, ameddig csak tud (alatta már van elem).
            $.each($(".fall"), function () {
                movingItems++;
                $(this).animate({
                        top: "+=" + ((gemSize) + (paddingSize / 2))
                    },
                    {
                        duration: 100,
                        complete: function () {
                            $(this).removeClass("fall");
                            checkMoving();
                        }
                    });
            });
            //Itt ha nincs leeső elem, akkor átváltunk az elemek újratőltésére, Ezzel biztosítjuk, hogy ne akadjon össze a folyamat
            if (fellDown === 0) {
                gameState = "refill";
                movingItems = 1;
                checkMoving();
            }
        }

        //Ez a metódus kitörli azokat az elemeket, amik rendelkeznek a remove osztállyal, ezt animálva mutatja a felhasználónak
        //Ezen kívül az időt is módosítja, ha >100 mp akkor csökkenti és a pont szorzót módosítja
        function gemFade() {
            $.each($(".remove"), function () {
                movingItems++;
                $(this).animate({
                        opacity: 0
                    },
                    {
                        duration: 200,
                        complete: function () {
                            timeLeft += 5
                            if(timeLeft > 100){
                                timeLeft -= 50;
                                multiCounter += 1;
                                if(multiCounter >=3){
                                    multiCounter = 0;
                                    multiplier += 1;
                                }
                            }
                            $(this).remove();
                            checkMoving();
                        }
                    });
            });
        }

        //Ez a metódus megcserél 2 elemet, annak helyzeti tulajdonságait, és a drágaköveket tároló 2d-s arrayban is.
        function gemSwitch() {
            let yOffset = selectedRow - posY;
            let xOffset = selectedCol - posX;

            let gemIdSelectorSwtich1 = $("#" + gemIdPrefix + "_" + selectedRow + "_" + selectedCol);
            let gemIdSelectorSwitch2 = $("#" + gemIdPrefix + "_" + posY + "_" + posX);

            //Mindkét drágakő megkapja a cserét segítő "switch" osztályt, és egy dir tulajdonságot, ami a csere irányát adja meg az adott elemnek.
            gemIdSelectorSwtich1.addClass("switch").attr("dir", "-1");
            gemIdSelectorSwitch2.addClass("switch").attr("dir", "1");

            //A két drágakő képet is cserél.
            gemIdSelectorSwitch2.attr("src", (imagePath + "gem" + jewels[posY][posX] + ".png"));
            gemIdSelectorSwtich1.attr("src", (imagePath + "gem" + jewels[selectedRow][selectedCol] + ".png"));

            //A cserére szánt elemeket kicseréli animációval a felhasználói felületen, és megnézi, hogy van-e mozgó elem
            $.each($(".switch"), function () {
                movingItems++;
                $(this).animate({
                    "left" : "+=" + xOffset * ((gemSize) + (paddingSize / 2)) * $(this).attr("dir"),
                    "top" : "+=" + yOffset * ((gemSize) + (paddingSize / 2)) * $(this).attr("dir")
                }, {
                    duration: 250,
                    complete: function () {
                        checkMoving();
                    }
                }).removeClass("switch").removeAttr("dir");
            });

            //Megcseréljük a drágakövek id-ját ami itt tartalmazza , hogy melyik sorban és oszlopban vannak
            gemIdSelectorSwtich1.attr("id", "temp");
            gemIdSelectorSwitch2.attr("id", gemIdPrefix + "_" + selectedRow + "_" + selectedCol);
            $("#temp").attr("id", gemIdPrefix + "_" + posY + "_" + posX);

            //Megcseréljük a 2 drágakövet a drágakövek típusát tartalmazó 2d-s arrayben
            let temp = jewels[selectedRow][selectedCol];
            jewels[selectedRow][selectedCol] = jewels[posY][posX];
            jewels[posY][posX] = temp;

            //Ez a változó azt tárolja, hogyha az egyik megcserélt elem SUPER drágakő akkor igaz lesz, és superRemove lesz a sima remove helyett
            superRemove = jewels[selectedRow][selectedCol] === 9 || jewels[posY][posX] === 9
        }

        //Ez a metódus a paraméterben kapott elemtől kezdve megnézi, hogy vizszintesen vagy függőlegesen van e sorozat,
        //Ha talál ilyet akkor azokat törlésre jelöli, és mindegyik elem után ad pontot és lejátsza a törés hangot.
        //Paraméterek
        // row : a vizsgált elem sora
        // col : a vizsgált elem oszlopa
        function addRemoveClass(row, col) {
            let gemType = jewels[row][col];
            let tmp = row;
            $("#" + gemIdPrefix + "_" + row + "_" + col).addClass("remove");
            let sounddelete = new Audio(soundPath + breakSoundList[Math.floor(Math.random() * breakSoundList.length)])

            if (VerticalStreak(row, col)) {
                while (tmp > 0 && jewels[tmp - 1][col] === gemType) {
                    $("#" + gemIdPrefix + "_" + (tmp - 1) + "_" + col).addClass("remove");
                    if (soundsOn && interact){
                       void sounddelete.play();
                    }

                    addscore(points, multiplier)
                    jewels[tmp - 1][col] = -1;
                    tmp--;
                }
                tmp = row;
                while (tmp < numRows - 1 && jewels[tmp + 1][col] === gemType) {
                    $("#" + gemIdPrefix + "_" + (tmp + 1) + "_" + col).addClass("remove");
                    if (soundsOn && interact){
                        void sounddelete.play();
                    }
                    addscore(points, multiplier)
                    jewels[tmp + 1][col] = -1;
                    tmp++;
                }
            }
            if (HorizontalStreak(row, col)) {
                tmp = col;
                while (tmp > 0 && jewels[row][tmp - 1] === gemType) {
                    $("#" + gemIdPrefix + "_" + row + "_" + (tmp - 1)).addClass("remove");
                    if (soundsOn && interact){
                       void sounddelete.play();
                    }
                    addscore(points, multiplier)
                    jewels[row][tmp - 1] = -1;
                    tmp--;
                }
                tmp = col;
                while (tmp < numCols - 1 && jewels[row][tmp + 1] === gemType) {
                    $("#" + gemIdPrefix + "_" + row + "_" + (tmp + 1)).addClass("remove");
                    if (soundsOn && interact){
                        void sounddelete.play();
                    }
                    addscore(points, multiplier)
                    jewels[row][tmp + 1] = -1;
                    tmp++;
                }
            }
            jewels[row][col] = -1;
            addscore(points, multiplier);
        }

        //Ez a metódus megnézi, hogy függőlegesen van-e egymás mellet 3 ugyan olyan elem, ha igen akkor igazat ad vissza
        //Paraméterek
        // row : a vizsgált elem sora
        // col : a vizsgált elem oszlopa
        function VerticalStreak(row, col) {
            let gemValue = jewels[row][col];
            let streak = 0;
            let tmp = row;
            while (tmp > 0 && jewels[tmp - 1][col] === gemValue) {
                streak++;
                tmp--;
            }
            tmp = row;
            while (tmp < numRows - 1 && jewels[tmp + 1][col] === gemValue) {
                streak++;
                tmp++;
            }
            return streak > 1
        }

        //Ez a metódus megnézi, hogy vizszintesen van-e egymás mellet 3 ugyan olyan elem, ha igen akkor igazat ad vissza
        //Paraméterek
        // row : a vizsgált elem sora
        // col : a vizsgált elem oszlopa
        function HorizontalStreak(row, col) {
            let gemType = jewels[row][col];
            let streak = 0;
            let tmp = col
            while (tmp > 0 && jewels[row][tmp - 1] === gemType) {
                streak++;
                tmp--;
            }
            tmp = col;
            while (tmp < numCols - 1 && jewels[row][tmp + 1] === gemType) {
                streak++;
                tmp++;
            }
            return streak > 1
        }

        //Akkor ad vissza igazat, ha az adott elemből vagy sorban vagy oszlopban van 3 ugyan olyan egymás mellett / alatt
        //Paraméterek
        // row : a vizsgált elem sora
        // col : a vizsgált elem oszlopa
        function Streak(row, col) {
            return VerticalStreak(row, col) || HorizontalStreak(row, col);
        }

        //Ki / bekapcsolja a háttérzenét
        $("#mute-music-button").on("click", function () {
            interact = true;
            if (started) {
                if(musicOn){
                    backgroundMusic.pause();
                    musicOn = false;
                } else {
                    void backgroundMusic.play();
                    musicOn = true;
                }


            }
        });

        //Ki / bekapcsolja a hangeffekteket
        $("#mute-sounds-button").on("click", function () {
            interact = true;
            soundsOn = !soundsOn;
        });

        //Ez a programrész a findmatchbutton lenyomása után fut le, és keres olyan elemet, amit elcserélve elemeket tudunk törölni.
        $("#findMatchButton").on("click", function () {
            interact = true;
            if (gameState === "pick") {
                if (!started) {
                    startTimer();
                }
                matchFound = false;
                if (selectedRow !== -1){
                    let gemId = gemIdPrefix + "_" + selectedRow + "_" + selectedCol;
                    $("#" + gemId).attr("src", (imagePath + "gem" + jewels[selectedRow][selectedCol] + ".png"));

                }

                // Végigmegyünk az összes elemen a táblán (kivéve az utolsó előtti sort és oszlopot)
                for (let i = 0; i < numRows; i++) {
                    for (let j = 0; j < numCols; j++) {

                        let found = false;
                        //jobbra vagy balra levő elem megegyezik-e a másikkal (TEHÁT 2 UGYANOLYAN VAN-E EGYMÁS MELLETT)
                        if ((j < colMaxIndex && jewels[i][j] === jewels[i][j + 1]) || (j > 0 && jewels[i][j] === jewels[i][j - 1])) {
                            rightLeft = true;
                            middleDifferent = false;
                            found = true;
                        }

                        //felette vagy alatta levő elem megegyezik-e a másikkal (TEHÁT 2 UGYANOLYAN VAN-E EGYMÁS alatt)
                        if (!found && ((i < rowMaxIndex && jewels[i][j] === jewels[i + 1][j]) || (i > 0 && jewels[i][j] === jewels[i - 1][j]))) {
                            rightLeft = false;
                            middleDifferent = false;
                            found = true;
                        }

                        // Ellenőrzi, hogy az adott elem mellett van-e két azonos típusú elem,
                        if (!found && ((j < colMaxIndex && (j > 0)) && (jewels[i][j - 1] === jewels[i][j + 1]))) {
                            rightLeft = true;
                            middleDifferent = true;
                            found = true;
                        }

                        // Ellenőrzi, hogy az adott elem alatt és felett van-e két azonos típusú elem,
                        if (!found && ((i < rowMaxIndex && (i > 0)) && (jewels[i - 1][j] === jewels[i + 1][j]))) {
                            rightLeft = false;
                            middleDifferent = true;
                            found = true;
                        }

                        //Ha van olyan hely, ahol lehet megfelelő elem, akkor ez lefut és pontosan megkeresi a checkNextElements, hogy az valóban jó-e
                        //Ha jó, akkor kijelöli azt az elemet és a "marker"-t is oda helyezi.
                        if (found) {
                            if (checkNextElements(i, j)) {
                                selectedRow = searchedX;
                                selectedCol = searchedY;
                                let gemId = gemIdPrefix + "_" + selectedRow + "_" + selectedCol;
                                $("#" + gemId).attr("src", (imagePath + "selected.gif")); // Írd át az "új_kép_útvonala.jpg" részt a kívánt kép útvonalára
                                if (soundsOn && interact){
                                    let soundselect = new Audio(soundPath + selectSoundList[Math.floor(Math.random() * selectSoundList.length)])
                                    void soundselect.play();
                                }
                                $(marker).show().css({
                                    "top": ((searchedX * (gemSize + paddingSize / 2)) + ($(gameBoard).get(0).offsetTop) + ((heightnumber - ((gemSize - 0.5 + paddingSize / 2) * numRows))) + paddingSize + 2) + "px",
                                    "left": ((searchedY * (gemSize + paddingSize / 2)) + ($(gameBoard).get(0).offsetLeft) + ((widthnumber - ((gemSize - 0.5 + paddingSize / 2) * numCols))) + paddingSize + 2) + "px"
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

                if (!matchFound) {
                    alert("Nem található eltüntethető drágakő, ha van szuper drágakő a pályán, akkor azt cseréld ki egy mellette levővel, hogy eltünjön minden olyan típusú drágakő, vagy generáld újra a játékteret.");
                }
            }
        });

        //Megnézi az előfeltételek szerint, hogy hol lehet elem, és pontosan megnézi az onnan elérhető drágaköveket
        //Paraméterek:
        // row : a vizsgált elem sora
        // col : a vizsgált elem oszlopa
        //Itt fontos tudni, hogy a console.log-ok visszaadják, hogy az elemet merre kell cserélni.
        function checkNextElements(row, col) {
            let gemValue = jewels[row][col];
            //függőlegesen nézzük meg az elemeket
            if (!rightLeft && !middleDifferent) {
                // Ellenőrizzük az elemet alatta
                if (row < rowMaxIndex && jewels[row + 1][col] !== gemValue) {
                    if (row < rowMaxIndex - 1 && jewels[row + 2][col] === gemValue) {
                        console.log("felfele")
                        searchedX = row + 2;
                        searchedY = col;
                        return true;
                    }
                    // Ellenőrizzük az elemet alatta + balra
                    if (col > 0 && jewels[row + 1][col - 1] === gemValue) {
                        console.log("jobbra")
                        searchedX = row + 1;
                        searchedY = col - 1;
                        return true;
                    }
                    // Ellenőrizzük az elemet alatta + jobbra
                    if (col < colMaxIndex && jewels[row + 1][col + 1] === gemValue) {
                        console.log("balra")
                        searchedX = row + 1;
                        searchedY = col + 1;
                        return true;
                    }
                }
                // Ellenőrizzük az elemet felette
                if (row > 0 && jewels[row - 1][col] !== gemValue) {
                    // felette
                    if (row > 1 && jewels[row - 2][col] === gemValue) {
                        console.log("lefele")
                        searchedX = row - 2;
                        searchedY = col;
                        return true;
                    }
                    // Ellenőrizzük az elemet felette + balra
                    if (col > 0 && jewels[row - 1][col - 1] === gemValue) {
                        console.log("jobbra")
                        searchedX = row - 1;
                        searchedY = col - 1;
                        return true;
                    }
                    // Ellenőrizzük az elemet alatta + jobbra
                    if (col < numCols && jewels[row - 1][col + 1] === gemValue) {
                        console.log("balra")
                        searchedX = row - 1;
                        searchedY = col + 1;
                        return true;
                    }
                }
            }

            //Vízszintesen nézzük az elemeket
            if (rightLeft && !middleDifferent) {
                // Ellenőrizzük az elemet jobbra
                if (col < numCols - 1 && jewels[row][col + 1] !== gemValue) {
                    // + alatta
                    if (col < numCols - 2 && jewels[row][col + 2] === gemValue) {
                        console.log("balra")
                        searchedX = row;
                        searchedY = col + 2;
                        return true;
                    }
                    // Ellenőrizzük az elemet jobbra + felfele
                    if (row > 0 && jewels[row - 1][col + 1] === gemValue) {
                        console.log("lefele")
                        searchedX = row - 1;
                        searchedY = col + 1;
                        return true;
                    }
                    // Ellenőrizzük az elemet jobbra + lefele
                    if (row < numRows - 1 && jewels[row + 1][col + 1] === gemValue) {
                        console.log("felfele")
                        searchedX = row + 1;
                        searchedY = col + 1;
                        return true;
                    }
                }
                // Ellenőrizzük az elemet balra
                if (col > 0 && jewels[row][col - 1] !== gemValue ) {
                    // + balra
                    if (col > 1 && jewels[row][col - 2] === gemValue) {
                        console.log("jobbra")
                        searchedX = row;
                        searchedY = col - 2;
                        return true;
                    }
                    // Ellenőrizzük az elemet balra + felfele
                    if (row > 0 && jewels[row - 1][col - 1] === gemValue) {
                        console.log("lefele")
                        searchedX = row - 1;
                        searchedY = col - 1;
                        return true;
                    }
                    // Ellenőrizzük az elemet balra + lefele
                    if (row < numRows-1 && jewels[row + 1][col - 1] === gemValue) {
                        console.log("felfele")
                        searchedX = row + 1;
                        searchedY = col - 1;
                        return true;
                    }
                }
            }
            //Két azonos drágakő között vizsgáljuk az elemeket
            if (middleDifferent) {
                //Függőlegesen van a 2 elem egymáshoz képest, ezért jobbra és balra nézzük az elemeket
                if (!rightLeft) {

                    if (col > 0 && col < numCols - 1) {
                        gemValue = jewels[row + 1][col];
                        //jobbra
                        if (jewels[row][col + 1] === gemValue) {
                            searchedX = row;
                            searchedY = col + 1;
                            console.log("balra")
                            return true;
                        }
                        //balra
                        if (jewels[row][col - 1] === gemValue) {
                            searchedX = row;
                            searchedY = col - 1;
                            console.log("jobbra")
                            return true;
                        }
                    }
                } else {
                    if (row > 0 && row < numRows - 1) {
                        gemValue = jewels[row][col + 1];
                        if (jewels[row + 1][col] === gemValue) {

                            searchedX = row + 1;
                            searchedY = col;
                            console.log("felfele")
                            return true;
                        }
                        if (jewels[row - 1][col] === gemValue) {
                            searchedX = row - 1;
                            searchedY = col;
                            console.log("lefele")
                            return true;
                        }
                    }
                }
                return false;
            }
            return false;
        }


        // JÁTÉK VÉGE:
        //megállítja a zenét és meghívja az addtoleaderboard-ot
        function gameEnd(score) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
            let username = prompt("Gratulálunk! Pontszámod: " + score + "\nKérlek, add meg a felhasználóneved:");
            if (username != null && username !== "") {
                let data = [username, score, getCurrentDateTime()];
                addToLeaderboard(data);
            }
            started = false;
        }


        // AZ IDŐZÍTÉSHEZ ÉS AZ IDŐSVÁHOZ TARTOZÓ METÓDUSOK:
        let timer = null;

        //Ez a metódus elindítja az időzítőt
        function startTimer() {
            started = true;
            timeLeft = startingTime;
            void backgroundMusic.play();
            document.getElementById("currentTime").textContent = timeLeft + "sec"; // itt sem működött jqueryvel
            //Ez a kódrész módosítja az időzítőt és ha letelne az idő akkor ez hívja meg a játék végét.
            timer = setInterval(function () {
                timeLeft--;
                updateTimerBar(timeLeft);
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    gameEnd(parseInt($('#current-score').text()));
                }
            }, 1000);
            timeBar.css({
                left: $(gameBoard).get(0).offsetLeft + ((widthnumber - ((gemSize + paddingSize / 2) * numCols))) + paddingSize + 1 + "px",
                width: widthnumber + "px"
            });
        }

        //Ez a metódus megállítja az időzítőt
        function stopTimer() {
            clearInterval(timer);
            document.getElementById("currentTime").textContent = "";
        }

        //A segítség gombra kattintva futle
        $('#help-button').on('click', function () {
            interact = true;
            alert("Szia! Üdv a Bejeweled játékban!\n\nEbben a játékban az a cél, hogy cserélgesd az egyforma színű gyémántokat úgy, hogy legalább három egymás mellett vagy alatt legyenek. Így eltűnnek, és pontokat kapsz érte.\n\nHa elakadsz, és nem tudod, hogy mit cserélj ki, használd a Megfelelő Elem Keresése gombot. Ez a játék megkeres egy lehetséges cserét, hogy gyorsan pontokat szerezz.\n\nHa a felső idő letelt, akkor vége a játéknak. Ha nem szeretnéd végigvárni, nyugodtan kattints a Feladás gombra.\n\nHa már nincs olyan gyémánt, amit lecserélve pontokat kaphatsz, használd az Újrarendezés gombot. Ez újra generálja a pályát, hogy új esélyed legyen. Ha már nincs Újrarendezés gomb, akkor csak a Feladás gombra tudsz kattintani. Kattints egy drágakőre, hogy elkezdődjön a játék");

        });

        //A játék feladás gombra kattintva fut le.
        $('#end-game-button').on('click', function () {
            interact = true;
            stopTimer();
            let score = parseInt($('#current-score').text());
            gameEnd(score);
        });


        // Hozzáadjuk pontokat az aktuális pontszámhoz
        function addscore(pont, multiplier) {
            let scorePoints = parseInt(currentScore.text()); // Az aktuális pontszám kiolvasása és számmá alakítása

            scorePoints += pont * multiplier;

            // Frissítjük a span tartalmát a módosított pontszámmal
            currentScore.text(scorePoints);
            currentMultiplier.text(multiplier);
        }

        //Ez a metódus visszaadja a lefutásának pillanatában a dátumot szöveg formátumban
        function getCurrentDateTime() {
            let now = new Date();
            let year = now.getFullYear();
            let month = padZero(now.getMonth() + 1);
            let day = padZero(now.getDate());
            let hour = padZero(now.getHours());
            let minute = padZero(now.getMinutes());
            let second = padZero(now.getSeconds());
            return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
        }

        //Ez a metódus az oldal tetején található idősávot módosítja, annak méretét és szövegét animálva.
        function updateTimerBar(timeLeft) {
            let percentLeft = Math.min((timeLeft / startingTime) * 100, 100);
            // $("#currentTime").textContent = timeLeft + " sec"; valamiért nem módosul így.
            document.getElementById("currentTime").textContent = timeLeft + " sec";
            timeIndicator.animate({
                "left": widthnumber * (percentLeft / 200) + "px",
                "top": 25 + "%"
            }, {
                duration: 200,
            });
            timeBar.animate({
                "width": (percentLeft + "%"),
            }, {
                duration: 200,
            });
        }

        //Ha a szám kisebb mint 10 akkor az első helyre beilleszt egy nullát
        //Így pl 1. hónapból -> 01.hónap lesz. ez az adattáblába írásnál egységesíti a dátumok hosszát.
        //Paraméterek:
        // number : az a szám, amit ki kell bővíteni
        function padZero(number) {
            return (number < 10 ? '0' : '') + number;
        }

        //Ez a metódus az újragenerálás gomb szövegét módosítja és hozzáadja a gombokhoz
        function regenerateBoardButton(){
            let buttonText = 'Újragenerálás (' + regeneratePossibilities + ')';
            if (regenerateButton.length > 0) {
                buttonText = regenerateButton.text().split(' ')[0] + ' (' + regeneratePossibilities + ')';
                regenerateButton.text(buttonText);
            } else {
                regenerateButton = $('<button id="regenerateButton">' + buttonText + '</button>');
                buttons.append(regenerateButton);
            }
        }
        regenerateBoardButton();


        // Újragenerálás gombra kattintva ezek futnak le,
        regenerateButton.on("click", function () {
            interact = true;
            alert("Újragenerálás...");
            //újragenerálja a pályát arra figyelemmel, hogy volt-e speciális elem
            regenerateBoard(specialGem);
            regeneratePossibilities--;
            // Csökkentjük a látható szám értékét
            regenerateButton.text( regenerateButton.text().split(' ')[0] + ' (' + regeneratePossibilities + ')');

            //Ha már nincs több regenerálási lehetőség akkor töröljük a gombot
            if (regeneratePossibilities === 0) {
                regenerateButton.remove();
            }
        });

        //a képernyő közepén megjelenítünk egy szöveget
        //A paraméterek :
        // message : az üzenet amit megjelenítünk,
        // duration : a megnyitott ablak képernyűn létének hossza
        function showCustomMessage(message, duration) {
            let customMessage = $("#customMessage");
            customMessage.text(message);
            customMessage.show();

            setTimeout(function() {
                customMessage.hide();
            }, duration);
        }

        //miután minden betöltött megjelenítjük a felhasználó számára a használatot segítő leírást
        alert("Szia! Üdv a Bejeweled játékban!\n\nEbben a játékban az a cél, hogy cserélgesd az egyforma színű gyémántokat úgy, hogy legalább három egymás mellett vagy alatt legyenek. Így eltűnnek, és pontokat kapsz érte.\n\nHa elakadsz, és nem tudod, hogy mit cserélj ki, használd a Megfelelő Elem Keresése gombot. Ez a játék megkeres egy lehetséges cserét, hogy gyorsan pontokat szerezz.\n\nHa a felső idő letelt, akkor vége a játéknak. Ha nem szeretnéd végigvárni, nyugodtan kattints a Feladás gombra.\n\nHa már nincs olyan gyémánt, amit lecserélve pontokat kaphatsz, használd az Újrarendezés gombot. Ez újra generálja a pályát, hogy új esélyed legyen. Ha már nincs Újrarendezés gomb, akkor csak a Feladás gombra tudsz kattintani. Kattints egy drágakőre, hogy elkezdődjön a játék");

    }


    // A játék végén hozzáadás az eredmények táblához.
    function addToLeaderboard(data) {
        let leaderboardData = localStorage.getItem('leaderboardData');
        if (!leaderboardData) {
            localStorage.setItem('leaderboardData', JSON.stringify([data]));
        } else {
            let parsedData = JSON.parse(leaderboardData);
            parsedData.push(data);
            localStorage.setItem('leaderboardData', JSON.stringify(parsedData));
        }
    }

    $(window).on('resize', function() {
        setupGame();
        regenerateBoard(0,true);
    });

});
