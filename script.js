const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let selectedStart = false;
let selectedEnd = false;
let size = 30;
let tile_height = canvas.height / size;
let tile_width = canvas.width / size;
let maze = Array.from({ length: size }, () => Array(size).fill(Field.EMPTY));
let activeDrawing = false;
let drawnPath = false;

const generatingAlgorithms = [
	generateMazeDFS,
	generateMazeKruskal,
	generateMazePrim,
	generateMazeBinaryTree,
	generateMazeGrowingTree,
];
const solvingAlgorithms = [solveMazeBFS, solveMazeDFS, solveMazeAStar];

document.querySelector("#startButton").addEventListener("click", (e) => {
	if (activeDrawing) return;
	document.querySelector("#endButton").classList.remove("clicked");
	e.target.classList.add("clicked");
	selectedStart = true;
	selectedEnd = false;
});

document.querySelector("#endButton").addEventListener("click", (e) => {
	if (activeDrawing) return;
	document.querySelector("#startButton").classList.remove("clicked");
	e.target.classList.add("clicked");
	selectedStart = false;
	selectedEnd = true;
});

document.getElementById("mazeSize").addEventListener("change", () => {
	if (activeDrawing) return;
	size = parseInt(document.getElementById("mazeSize").value);
	if (size > 100) size = 100;
	if (size < 10) size = 10;
	document.getElementById("mazeSize").value = size;
	maze = Array.from({ length: size }, () => Array(size).fill(Field.EMPTY));
	tile_height = canvas.height / size;
	tile_width = canvas.width / size;
	draw(maze);
});

document.getElementById("createMaze").addEventListener("click", async () => {
	if (activeDrawing) return;
	const algorithmNumber = parseInt(
		document.querySelector("#generatingAlgorithm").value
	);
	activeDrawing = true;
	maze = await generatingAlgorithms[algorithmNumber](size, true);
	activeDrawing = false;
	draw(maze);
});

document.getElementById("solveMaze").addEventListener("click", async () => {
	if (activeDrawing) return;
	let results = await startWorkers(maze)
	const algorithmNumber = parseInt(
		document.querySelector("#solvingAlgorithm").value
	);
	activeDrawing = true;
	const result = await solvingAlgorithms[algorithmNumber](
		size,
		maze,
		draw,
		true
	);
	showResultWindow(algorithmNumber, results);
	drawPath(result.path);
	activeDrawing = false;
});

document.querySelector("#save").addEventListener("click", () => {
	const window = document.querySelector("#results-window");
	const text = `
	<header>
	<h2>Zapisz Labirynt</h2>
	</header>
	<div class="form">
		<input type="text" id="name" placeholder="Nazwa" required>
		<div class="buttons">
		<button id='close'>Anuluj</button>
		<button id='save-btn' onclick='saveMaze()'>Zapisz</button>
		</div>
	</div>
	`
	window.querySelector(".window").innerHTML = text;
	window.style.display = "flex";

	document.getElementById("close").addEventListener("click", () => {
        window.style.display = "none";
    });
});

document.querySelector("#info-window").addEventListener("click", (e) => {
	if (e.target === e.currentTarget) {
		document.querySelector("#info-window").style.display = "none";
	}
});

document.querySelector("#results-window").addEventListener("click", (e) => {
	if (e.target === e.currentTarget) {
		document.querySelector("#results-window").style.display = "none";
	}
});

function showResultWindow(algorithmNumber, results) {
	const window = document.querySelector("#results-window");
	const text = `
		${results[0] ? "<header class='positive'><h2>Rozwiązano Labirynt</h2></header>" : "<header class='negative'><h2>Labirynt nie ma rozwiązania</h2></header>"}
        ${results[0] ? `<div class="results">
		<p>liczba kroków dla wybranego algorytmu: ${results[algorithmNumber].steps}</p>
		<h3>Wyniki dla pozostałych algorytmów</h3>
		${algorithmNumber !== 0 ? `<p>BFS: ${results[0].steps} kroków</p>` : ""}
		${algorithmNumber !== 1 ? `<p>DFS: ${results[1].steps} kroków</p>` : ""}
		${algorithmNumber !== 2 ? `<p>A*: ${results[2].steps} kroków</p>` : ""}
        </div>` : ""}
        <button id='close-btn'>OK</button>
	`
	window.querySelector(".window").innerHTML = text;
	window.style.display = "flex";

	document.getElementById("close-btn").addEventListener("click", () => {
        window.style.display = "none";
    });
}

function changeTab(object, tab) {
	document
		.querySelectorAll(".tab")
		.forEach((t) => t.classList.remove("active"));
	object.classList.add("active");
	document
		.querySelectorAll(".content")
		.forEach((t) => t.classList.remove("active"));
	document.querySelector(`#${tab}`).classList.add("active");
}

function showInfoWindow() {
	const window = document.querySelector("#info-window");
	window.style.display = "flex";
}

function clearButtons() {
	document.querySelector("#startButton").classList.remove("clicked");
	document.querySelector("#endButton").classList.remove("clicked");
	selectedStart = false;
	selectedEnd = false;
}

function removeTileFromMaze(field) {
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (maze[i][j] === field) {
				maze[i][j] = Field.EMPTY;
			}
		}
	}
}

function drawPath(path) {
	for (const { x, y } of path) {
		maze[x][y] = Field.PATH;
	}
	draw(maze);
	drawnPath = true;
}

function clearPath() {
	if (!drawnPath) return;
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (maze[i][j] == Field.PATH) maze[i][j] = Field.EMPTY;
		}
	}
	drawnPath = false;
}

function saveMaze() {
	const mazeData = {};
	mazeData.size = size;
	mazeData.walls = [];
	mazeData.start = {};
	mazeData.end = {};
	mazeData.name = document.getElementById("name").value;
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (maze[i][j] === Field.WALL) {
				mazeData.walls.push({ x: i, y: j });
			} else if (maze[i][j] === Field.START) {
				mazeData.start = { x: i, y: j };
			} else if (maze[i][j] === Field.END) {
				mazeData.end = { x: i, y: j };
			}
		}
	}
	console.log(JSON.stringify(mazeData));
	fetch("http://localhost/~2jablonski/labs/proj/data.php", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(mazeData),
	})
		.then((data) => {
			console.log("Success:", data);
		})
		.catch((error) => {
			console.error("Error:", error);
		});
}

function draw(maze) {
	clearPath();
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (maze[i][j] == Field.EMPTY || maze[i][j] == Field.INQUEUE)
				ctx.fillStyle = "#000000";
			else if (maze[i][j] == Field.WALL) ctx.fillStyle = "#00ff00";
			else if (maze[i][j] == Field.START) ctx.fillStyle = "#ff0000";
			else if (maze[i][j] == Field.END) ctx.fillStyle = "#0000ff";
			else if (maze[i][j] == Field.VISITED) ctx.fillStyle = "#ff00ff";
			else if (maze[i][j] == Field.CURRENT) ctx.fillStyle = "#ffff00";
			else if (maze[i][j] == Field.PATH) ctx.fillStyle = "#00ffff";
			ctx.fillRect(
				i * tile_width,
				j * tile_height,
				tile_width,
				tile_height
			);
		}
	}
}

canvas.addEventListener("click", function (event) {
	if (activeDrawing) return;
	let x = Math.floor(event.offsetX / tile_width);
	let y = Math.floor(event.offsetY / tile_height);
	if (selectedStart) {
		removeTileFromMaze(Field.START);
		maze[x][y] = Field.START;
	} else if (selectedEnd) {
		removeTileFromMaze(Field.END);
		maze[x][y] = Field.END;
	} else maze[x][y] = maze[x][y] ? Field.EMPTY : Field.WALL;
	clearButtons();
	draw(maze);
});



function startWorkers(maze) {
    const workers = [];
    const results = [];
    let completed = 0;

    return new Promise((resolve, reject) => {
        solvingAlgorithms.forEach((solver, index) => {
            const worker = new Worker("worker.js");
            workers.push(worker);

            worker.postMessage({
                id: index,
                maze: maze,
                size: size,
                solverIndex: index,
            });

            worker.onmessage = function (event) {
                results[event.data.id] = event.data.solution;
                completed++;

                if (completed === solvingAlgorithms.length) {
                    console.log("Wyniki wszystkich workerów:", results);
                    resolve(results);
                }
            };

            worker.onerror = function (error) {
                console.error(`Błąd w workerze ${index}:`, error.message);
                reject(error);
            };
        });
    });
}

