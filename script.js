$(document).ready(function() {
    let timer;
    loadLeaderboard();
    const boardSize = 8;
    const gemCount = boardSize * boardSize;
    const imagePath = 'resources/images/';
    const gameBoard = $('#game-area');

    function generateGems() {
        for (let i = 0; i < gemCount; i++) {
            const gem = $('<img alt="">').attr('src', getRandomGemImagePath()).addClass('gem');
            gameBoard.append(gem);
        }
    }

    function getRandomGemImagePath() {
        const gemTypes = ['gem1.png', 'gem2.png', 'gem3.png', 'gem4.png', 'gem5.png', 'gem6.png'];
        const randomIndex = Math.floor(Math.random() * gemTypes.length);
        return imagePath + gemTypes[randomIndex];
    }

    function initializeGame() {
        generateGems();
    }

    initializeGame();

    function addToLeaderboard(data) {
        var leaderboardData = localStorage.getItem('leaderboardData');
        if (!leaderboardData) {
            localStorage.setItem('leaderboardData', JSON.stringify([data]));
        } else {
            var parsedData = JSON.parse(leaderboardData);
            parsedData.push(data);
            localStorage.setItem('leaderboardData', JSON.stringify(parsedData));
        }

        var path = 'leaderboard/points.txt';

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var fileData = 'Felhasználónév,Pontszám,Dátum\n' + data.join(',') + '\n';
            var file = new Blob([fileData], {type: 'text/plain'});

            var a = $('<a>').attr('href', URL.createObjectURL(file)).attr('download', path).appendTo('body');
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

    function gameEnd(score) {
        let username = prompt("Gratulálunk! Pontszámod: " + score + "\nKérlek, add meg a felhasználóneved:");
        if (username != null && username !== "") {
            let data = [username, score, getCurrentDateTime()];
            addToLeaderboard(data);
        }
    }

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
});
