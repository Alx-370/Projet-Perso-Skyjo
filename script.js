let players = [];
let totalScores = {};
let history = [];
let gameStarted = false;

function addPlayer() {
    if (gameStarted) {
        alert("La partie a déjà commencé, impossible d'ajouter des joueurs.");
        return;
    }

    const nameInput = document.getElementById("player-name");
    const name = nameInput.value.trim();
    if (name === "" || players.includes(name)) return;

    players.push(name);
    totalScores[name] = 0;

    const playerList = document.getElementById("player-list");
    const li = document.createElement("li");
    li.textContent = name;
    playerList.appendChild(li);

    updateScoreForm();
    updateScoreboard();

    nameInput.value = "";
}

function updateScoreForm() {
    const form = document.getElementById("score-form");
    form.innerHTML = "";

    players.forEach(player => {
        const input = document.createElement("input");
        input.type = "text";
        input.inputMode = "numeric";
        input.pattern = "-?[0-9]*";
        input.name = player;
        input.placeholder = `Score de ${player}`;
        input.disabled = false;
        input.setAttribute("step", "1");
        input.autocomplete = "off";
        form.appendChild(input);
        form.appendChild(document.createElement("br"));
    });
}


function submitScores() {
    const submitBtn = document.querySelector('#score-container button');
    submitBtn.disabled = true;

    if (players.length === 0) {
        alert("Ajoutez au moins un joueur avant de commencer la partie.");
        submitBtn.disabled = false;
        return;
    }

    const inputs = document.getElementById("score-form").getElementsByTagName("input");
    if (inputs.length === 0) {
        alert("Les champs de score ne sont pas encore prêts. Ajoutez un joueur ou rechargez la page.");
        submitBtn.disabled = false;
        return;
    }

    if (!gameStarted) {
        gameStarted = true;
        document.getElementById("player-name").disabled = true;
        document.getElementById("add-player-btn").disabled = true;
    }

    let hasError = false;
    let errorMessages = [];

    
    for (let input of inputs) {
        const name = input.name;
        const valueStr = input.value.trim();

        if (valueStr === "") {
            hasError = true;
            errorMessages.push(`Veuillez saisir un score pour ${name}.`);
        } else if (!/^[-]?\d+$/.test(valueStr)) {
            hasError = true;
            errorMessages.push(`Veuillez entrer un nombre entier valide pour ${name}.`);
        }
    }

    if (hasError) {
        alert(errorMessages.join("\n"));
        submitBtn.disabled = false;
        return;
    }

    
    const round = {};
    for (let input of inputs) {
        const name = input.name;
        const value = parseInt(input.value.trim());
        totalScores[name] += value;
        round[name] = value;
        input.value = "";
    }

    history.push(round);
    updateScoreboard();
    updateHistory();
    checkEndGame();

    if (!isGameOver()) {
        submitBtn.disabled = false;
    }
}

function updateScoreboard() {
    const scoreboard = document.getElementById("scoreboard");
    scoreboard.innerHTML = "";
    for (let player of players) {
        const li = document.createElement("li");
        li.textContent = `${player} : ${totalScores[player]} points`;
        scoreboard.appendChild(li);
    }
}

function updateHistory() {
    const container = document.getElementById("round-history");
    container.innerHTML = "";

    history.forEach((round, index) => {
        const div = document.createElement("div");
        div.classList.add("round");
        div.innerHTML = `<h3>Manche ${index + 1}</h3><ul>` +
            players.map(p => `<li>${p} : ${round[p] ?? 0} pts</li>`).join("") +
            `</ul>`;
        container.appendChild(div);
    });
}

function checkEndGame() {
    for (let player in totalScores) {
        if (totalScores[player] >= 100) {
            alert(`Fin de la partie ! Le joueur ayant le moins de points gagne.`);
            showWinner();

            
            document.querySelector('#score-container button').disabled = true;
            document.getElementById("restart-btn").style.display = "inline-block";
            document.querySelectorAll("#score-form input").forEach(input => {
                input.disabled = true;
            });

            return;
        }
    }
}

function isGameOver() {
    return Object.values(totalScores).some(score => score >= 100);
}

function showWinner() {
    let winner = players[0];
    players.forEach(p => {
        if (totalScores[p] < totalScores[winner]) {
            winner = p;
        }
    });
    alert(`🎉 Le gagnant est ${winner} avec ${totalScores[winner]} points !`);
}

function restartGame() {
    players = [];
    totalScores = {};
    history = [];
    gameStarted = false;

    document.getElementById("player-list").innerHTML = "";
    document.getElementById("score-form").innerHTML = "";
    document.getElementById("scoreboard").innerHTML = "";
    document.getElementById("round-history").innerHTML = "";
    document.getElementById("player-name").value = "";

    document.getElementById("player-name").disabled = false;
    document.getElementById("add-player-btn").disabled = false;
    document.querySelector('#score-container button').disabled = false;
    document.getElementById("restart-btn").style.display = "none";
}
