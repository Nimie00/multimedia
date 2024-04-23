$( document ). ready ( function () {
    const paddingsize = 10;
    const imagePath = 'resources/images/';
    const gameBoard = $('#game-area');
    const rowSize = 8;
    const colSize = 8;
    const gemSize = 64;

    let widthnumber = (rowSize*gemSize)+((rowSize-1)*paddingsize/2);
    let heightnumber = (colSize*gemSize)+((colSize-1)*paddingsize/2);

    let gameBoardWidth = widthnumber+"px";
    let gameBoardHeight = heightnumber+"px";
    let gemTypesBoard = [];

    for(let i = 0; i < rowSize; i++){
        gemTypesBoard[i] = [];
        for(let j = 0; j < colSize; j++){
            gemTypesBoard[i][j] = -1;
        }
    }

    $(gameBoard).css({
        "width": gameBoardWidth,
        "height": gameBoardHeight,
        "border": "1px solid black",
        "padding": paddingsize,
    });

    let gemArray = [];

    function generateGems() {
        for (let i = 0; i < rowSize; i++) {
            gemArray[i] = []; // Minden sorhoz létrehozunk egy üres tömböt
            for (let j = 0; j < colSize; j++) {
                let gemSrc = getRandomGemImagePath();
                let gemType = gemSrc.substring(gemSrc.lastIndexOf('/') + 1, gemSrc.lastIndexOf('.'));
                const rowIndex = i;
                const colIndex = j;
                let gem = $('<img alt="" src="">').attr('src', gemSrc).addClass('gem').addClass(gemType).addClass('_' + rowIndex + '_' + colIndex);
                
                gem.css({
                    "position": "absolute",
                    "width": gemSize,
                    "height": gemSize,
                    "margin": paddingsize,
                    "cursor": "pointer",
                });

                gemArray[i][j] = gem;

            }
        }
    }

    function display() {
        for (let i = 0; i < rowSize; i++) {
            for (let j = 0; j < colSize; j++) {
                let gem = gemArray[i][j];
                gem.css({
                    "top": (i * (gemSize + paddingsize / 2)) + ($(gameBoard).get(0).offsetTop)  + ((heightnumber-((gemSize+paddingsize/2)*rowSize)))+paddingsize/2+0.5+ "px",
                    "left": (j * (gemSize + paddingsize / 2)) + ($(gameBoard).get(0).offsetLeft)  + ((widthnumber-((gemSize+paddingsize/2)*rowSize)))+paddingsize/2+0.5 + "px",
                });
                gameBoard.append(gem);
            }
        }
    }

    function getRandomGemImagePath() {
        const gemTypes = ['gem1.png', 'gem2.png', 'gem3.png', 'gem4.png', 'gem5.png', 'gem6.png', 'gem7.png', 'gem8.png'];
        const randomIndex = Math.floor(Math.random() * gemTypes.length);
        return imagePath + gemTypes[randomIndex];
    }

    function clear() {
        $(gameBoard).empty(); // gameBoard tartalmának törlése
    }

    function initializeGame() {
        clear();
        generateGems();
        display();
        getGemstoneTypeArray();
        printGemstoneTypeArray();
    }


    initializeGame();


    function getGemstoneTypeArray(){
        $('.gem').each(function(index) {
            const rowIndex = Math.floor(index / rowSize);
            const colIndex = index % rowSize;
             gemTypesBoard[rowIndex][colIndex] = $(this).attr('class').split(' ')[1][3]; // TÍPUS
        });
        // gemTypesBoard[rowIndex][colIndex] = $(this).attr('class').split(' ')[2].split('_')[1]// SOR
        // gemTypesBoard[rowIndex][colIndex] = $(this).attr('class').split(' ')[2].split('_')[2] // OSZLOP
    }

    function printGemstoneTypeArray(){
        for(let i = 0; i < rowSize; i++){
            let row = ""
            for(let j = 0; j < colSize; j++){
                row = row + (gemTypesBoard[i][j]+ " ")
            }
            console.log(row +" \n");
        }
    }

    let selectedGem = null;

    $('.gem').on('click', function() {
        // Ellenőrizzük, hogy van-e már kiválasztott gyémánt
        if (selectedGem === null) {
            // Ha nincs kiválasztott gyémánt, akkor jelöljük meg a kattintottat
            selectedGem = $(this);
        } else {
            // Ellenőrizzük, hogy a kattintott gyémánt szomszédos-e a kiválasztottal
            const selectedRowIndex = parseInt(selectedGem.attr('class').split(' ')[2].split('_')[1]);
            const selectedColIndex = parseInt(selectedGem.attr('class').split(' ')[2].split('_')[2]);
            const clickedRowIndex = parseInt($(this).attr('class').split(' ')[2].split('_')[1]);
            const clickedColIndex = parseInt($(this).attr('class').split(' ')[2].split('_')[2]);
            if ((Math.abs(selectedRowIndex - clickedRowIndex) === 1 && selectedColIndex === clickedColIndex) ||
                (Math.abs(selectedColIndex - clickedColIndex) === 1 && selectedRowIndex === clickedRowIndex)) {
                // Ha a mezők szomszédosak, akkor cseréld ki őket egymással

                let temp =  gemArray[selectedRowIndex][selectedColIndex];
                gemArray[selectedRowIndex][selectedColIndex] = gemArray[clickedRowIndex][clickedColIndex];
                gemArray[clickedRowIndex][clickedColIndex] = temp;

                gemArray[selectedRowIndex][selectedColIndex].removeClass('_' + selectedRowIndex + '_' + selectedColIndex).addClass('_' + clickedRowIndex + '_' + clickedColIndex);
                gemArray[clickedRowIndex][clickedColIndex].removeClass('_' + clickedRowIndex + '_' + clickedColIndex).addClass('_' + selectedRowIndex + '_' + selectedColIndex);
                selectedGem.removeClass('_' + selectedRowIndex + '_' + selectedColIndex).addClass('_' + clickedRowIndex + '_' + clickedColIndex);
                $(this).removeClass('_' + clickedRowIndex + '_' + clickedColIndex).addClass('_' + selectedRowIndex + '_' + selectedColIndex);

                //TODO:csere animáció megcsinálása:

                display();
                //TODO: MEGNÉZNI, HOGY HA CSERÉLÜNK AKKOR ELTŰNIK E ELEM
                selectedGem = null;
            } else {
                // Ha a mezők nem szomszédosak, akkor a kiválasztott gyémántot null-ra állítjuk vissza
                selectedGem = null;
            }
        }
    });

    $(window).on('resize', function() {
        clear();
        display();
    });


    // JÁTÉK VÉGE:

    function gameEnd(score) {
        let username = prompt("Gratulálunk! Pontszámod: " + score + "\nKérlek, add meg a felhasználóneved:");
        if (username != null && username !== "") {
            let data = [username, score, getCurrentDateTime()];
            addToLeaderboard(data);
        }
    }


    // AZ IDŐZÍTÉSHEZ ÉS AZ IDŐSVÁHOZ TARTOZÓ METÓDUSOK:
    let timer;

    function startTimer() {
        let timeLeft = 100;
        timer = setInterval(function() {
            timeLeft--;
            updateTimerBar(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timer);
                gameEnd(0);
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
    }

    $('#help-button').on('click', function() {
        startTimer();
    });

    $('#end-game-button').on('click', function() {
        stopTimer();
        let score = parseInt($('#current-score').text());
        gameEnd(score);
    });

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

    function updateTimerBar(timeLeft) {
        let timeBar = $('#time-bar');
        let percentLeft = (timeLeft / 100) * 100;
        timeBar.width(percentLeft + "%");
    }

    function padZero(number) {
        return (number < 10 ? '0' : '') + number;
    }







    // A LEJÁTSZÓTT JÁTÉKOK TÁBLÁHOZ TARTOZÓ METÓDUSOK:

    loadLeaderboard();
    function addToLeaderboard(data) {
        let leaderboardData = localStorage.getItem('leaderboardData');
        if (!leaderboardData) {
            localStorage.setItem('leaderboardData', JSON.stringify([data]));
        } else {
            let parsedData = JSON.parse(leaderboardData);
            parsedData.push(data);
            localStorage.setItem('leaderboardData', JSON.stringify(parsedData));
        }

        let path = 'leaderboard/points.txt';

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            let fileData = 'Felhasználónév,Pontszám,Dátum\n' + data.join(',') + '\n';
            let file = new Blob([fileData], {type: 'text/plain'});

            let a = $('<a>').attr('href', URL.createObjectURL(file)).attr('download', path).appendTo('body');
            a[0].click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } else {
            console.log('A böngészője nem támogatja a File API-t.');
        }
    }

    function loadLeaderboard() {
        if (window.location.pathname.includes('list.html')) {
            let leaderboardData = localStorage.getItem('leaderboardData');
            if (!leaderboardData) {
                console.log('Nincsenek adatok a ponttáblában.');
                return;
            }
            displayLeaderboard(JSON.parse(leaderboardData));
        }
    }

    function displayLeaderboard(data) {
        let tableBody = $('tbody');
        tableBody.empty();
        data.forEach(function(rowData) {
            let tr = $('<tr>');
            rowData.forEach(function(cellData) {
                let td = $('<td>').text(cellData);
                tr.append(td);
            });
            tableBody.append(tr);
        });
    }

});



