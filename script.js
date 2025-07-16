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
        const wrapper = document.createElement("div");
        wrapper.className = "score-input-wrapper";

        const input = document.createElement("input");
        input.type = "text";
        input.setAttribute("inputmode", "numeric");
        input.pattern = "-?[0-9]*";

        // Ajout des attributs id et name uniques ici
        input.id = `score-input-${player}`;
        input.name = `score-input-${player}`;

        input.placeholder = `Score de ${player}`;
        input.autocomplete = "off";

        // Bouton -
        const minusBtn = document.createElement("button");
        minusBtn.type = "button";
        minusBtn.classList.add("minus-button");
        minusBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                <rect x="2" y="7" width="12" height="2" fill="currentColor"/>
            </svg>`;
        minusBtn.onclick = () => {
            if (input.value.startsWith("-")) {
                input.value = input.value.slice(1);
            } else {
                input.value = "-" + input.value;
            }
        };

        // Bouton x2
        const doubleBtn = document.createElement("button");
        doubleBtn.type = "button";
        doubleBtn.classList.add("double-button");
        doubleBtn.textContent = "×2";
        doubleBtn.style.marginLeft = "5px";
        doubleBtn.onclick = () => {
            let value = input.value.trim();
            if (/^-?\d+$/.test(value)) {
                input.value = String(parseInt(value) * 2);
            }
        };

        wrapper.appendChild(input);
        wrapper.appendChild(minusBtn);
        wrapper.appendChild(doubleBtn);
        form.appendChild(wrapper);
        form.appendChild(document.createElement("br"));
    });
}

function submitScores() {
    const submitBtn = document.getElementById("submit-scores-btn");
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
        // On récupère le player à partir de input.name en enlevant le préfixe
        const player = input.name.replace("score-input-", "");
        const value = parseInt(input.value.trim());
        totalScores[player] += value;
        round[player] = value;
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
    if (!container) {
        console.warn("L'élément #round-history est introuvable dans le DOM.");
        return; 
    }

    container.innerHTML = "";

    const gameOver = isGameOver();

    history.forEach((round, index) => {
        const div = document.createElement("div");
        div.classList.add("round");

        const listItems = players.map(p => {
            const score = round[p] ?? 0;
            return `
                <li>
                    ${p} :
                    <input type="number"
                        id="history-score-${index}-${p}"
                        name="history-score-${index}-${p}"
                        value="${score}"
                        ${gameOver ? "readonly" : ""}
                        onchange="editScore(${index}, '${p}', this.value)"
                        style="width: 60px;" />
                    pts
                </li>`;
        }).join("");

        div.innerHTML = `<h3>Manche ${index + 1}</h3><ul>${listItems}</ul>`;
        container.appendChild(div);
    });
}

function editScore(roundIndex, player, newValue) {
    newValue = parseInt(newValue);

    if (isNaN(newValue)) {
        alert("Veuillez entrer une valeur valide.");
        return;
    }

    const oldValue = history[roundIndex][player] || 0;
    const diff = newValue - oldValue;

    history[roundIndex][player] = newValue;
    totalScores[player] += diff;

    updateScoreboard();
    updateHistory();
}

function checkEndGame() {
    const someoneReachedLimit = Object.values(totalScores).some(score => score >= 100);

    if (!someoneReachedLimit) return;

    requestAnimationFrame(() => {
        setTimeout(() => {
            showWinner();

            document.getElementById("submit-scores-btn").disabled = true;

            document.querySelectorAll("#score-form input").forEach(input => input.disabled = true);
            document.querySelectorAll("#score-form button").forEach(btn => btn.disabled = true);
        }, 200);
    });
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

    document.getElementById("winner-name").textContent = winner;
    document.getElementById("winner-score").textContent = totalScores[winner];
    document.getElementById("winner-popup").classList.remove("hidden");
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
    document.getElementById("submit-scores-btn").disabled = false;

    const popup = document.getElementById("winner-popup");
    if (popup) {
        popup.classList.add("hidden");
    }
}

function toggleDetails() {
    const modal = document.getElementById("details-modal");
    if (modal.classList.contains("hidden")) {
        modal.classList.remove("hidden");
        renderDetailedHistory();
    } else {
        modal.classList.add("hidden");
    }
}

function renderDetailedHistory() {
    const container = document.getElementById("detailed-history");
    container.innerHTML = "";

    if (history.length === 0) {
        container.textContent = "Aucune manche jouée pour le moment.";
        return;
    }

    history.forEach((round, index) => {
        const div = document.createElement("div");
        div.style.borderBottom = "1px solid #ccc";
        div.style.marginBottom = "1rem";
        div.style.paddingBottom = "0.5rem";

        const title = document.createElement("h3");
        title.textContent = `Manche ${index + 1}`;
        div.appendChild(title);

        const ul = document.createElement("ul");
        players.forEach(player => {
            const li = document.createElement("li");
            li.textContent = `${player} : ${round[player] ?? 0} points`;
            ul.appendChild(li);
        });
        div.appendChild(ul);

        container.appendChild(div);
    });
}
