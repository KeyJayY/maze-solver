const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let selectedStart = false;
let selectedEnd = false;
let size = 30;
let tile_height = canvas.height / size;
let tile_width = canvas.width / size;
let maze = Array.from({ length: size }, () => Array(size).fill(Field.EMPTY));
let activeDrawing = false;

const generatingAlgorithms = [generateMazeDFS, generateMazeKruskal, generateMazePrim, generateMazeBinaryTree, generateMazeGrowingTree];
const solvingAlgorithms = [solveMazeBFS, solveMazeDFS, solveMazeAStar];

document.querySelector("#startButton").addEventListener("click", (e) => {
	if(activeDrawing) return;
	document.querySelector("#endButton").classList.remove("clicked");
	e.target.classList.add("clicked");
  	selectedStart = true;
 	selectedEnd = false;
});

document.querySelector("#endButton").addEventListener("click", (e) => {
	if(activeDrawing) return;
	document.querySelector("#startButton").classList.remove("clicked");
	e.target.classList.add("clicked");
	selectedStart = false;
	selectedEnd = true;
});

document.getElementById("mazeSize").addEventListener("change", () => {
	if(activeDrawing) return;
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
	if(activeDrawing) return;
	const algorithmNumber = parseInt(document.querySelector("#generatingAlgorithm").value)
	activeDrawing = true;
	maze = await generatingAlgorithms[algorithmNumber](size, true);
	activeDrawing = false;
	draw(maze);
});

document.getElementById("solveMaze").addEventListener("click", async () => {
	if(activeDrawing) return;
	clearPath(maze);
	const algorithmNumber = parseInt(document.querySelector("#solvingAlgorithm").value)
	activeDrawing = true;
	const result1 = await solvingAlgorithms[algorithmNumber](size, maze, draw, true);
	console.log(result1.steps);
	// showResultWindow(`${result1.steps} steps for BFS, ${result2.steps} steps for DFS, ${result3.steps} steps for A*`);
	drawPath(result1.path);
	activeDrawing = false;
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

function showResultWindow(text) {
	const window = document.querySelector("#results-window")
	window.querySelector("p").innerText = text;
	window.style.display = "flex";
}

function changeTab(object, tab) {
	document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
	object.classList.add("active");
	document.querySelectorAll(".content").forEach((t) => t.classList.remove("active"));
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
}

function clearPath(){
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (maze[i][j] == Field.PATH) maze[i][j] = Field.EMPTY;
		}
	}
}

function readMazeData() {
	const mazeData = {};
	mazeData.size = size;
	mazeData.walls = [];
	mazeData.start = {};
	mazeData.end = {};
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
	fetch('http://localhost/~2jablonski/labs/proj/data.php', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(mazeData)
	})
	.then(response => response.json())
	.then(data => {
		console.log('Success:', data);
	})
	.catch((error) => {
		console.error('Error:', error);
	});
}

function draw(maze) {
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (maze[i][j] == Field.EMPTY || maze[i][j] == Field.INQUEUE) ctx.fillStyle = "#000000";
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
