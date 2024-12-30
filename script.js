const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const Field = {
  EMPTY: 0,
	WALL: 1,
	START: 2,
	END: 3,
	VISITED: 4,
	CURRENT: 5,
	INQUEUE: 6,
	PATH: 7,
};

let selectedStart = false;
let selectedEnd = false;
let size = 40;
let tile_height = canvas.height / size;
let tile_width = canvas.width / size;
let maze = Array.from({ length: size }, () => Array(size).fill(Field.WALL));

document.querySelector("#startButton").addEventListener("click", (e) => {
	document.querySelector("#endButton").classList.remove("clicked");
	e.target.classList.add("clicked");
  selectedStart = true;
  selectedEnd = false;
});

document.querySelector("#endButton").addEventListener("click", (e) => {
	document.querySelector("#startButton").classList.remove("clicked");
	e.target.classList.add("clicked");
	selectedStart = false;
	selectedEnd = true;
});

document.getElementById("mazeSize").addEventListener("change", () => {
	size = parseInt(document.getElementById("mazeSize").value);
	document.getElementById("mazeSize").value = size;
	maze = Array.from({ length: size }, () => Array(size).fill(Field.WALL));
	tile_height = canvas.height / size;
	tile_width = canvas.width / size;
	draw(maze);
});

document.getElementById("createMaze").addEventListener("click", () => {
	generateMaze(size);
});

document.getElementById("solveMaze").addEventListener("click", async () => {
	drawPath(await solveMaze(size, maze, draw));
});

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

async function generateMaze(size) {
	const tempMaze = Array.from({ length: size }, () =>
		Array(size).fill(Field.WALL)
	);

	const startX = 0;
	const startY = 0;

	tempMaze[startY][startX] = Field.START;

	function isInBounds(x, y) {
		return x >= 0 && y >= 0 && x < size && y < size;
	}
	async function dfs(x, y) {
		const directions = [
			[0, -1],
			[0, 1],
			[-1, 0],
			[1, 0],
		];

		for (let i = directions.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[directions[i], directions[j]] = [directions[j], directions[i]];
		}

		for (const [dx, dy] of directions) {
			const nx = x + dx * 2;
			const ny = y + dy * 2;

			if (isInBounds(nx, ny) && tempMaze[ny][nx] === Field.WALL) {
				tempMaze[y + dy][x + dx] = Field.EMPTY;
				tempMaze[ny][nx] = Field.EMPTY;
				draw(tempMaze);
				await new Promise((resolve) => setTimeout(resolve, 1));
				await dfs(nx, ny);
			}
		}
	}

	tempMaze[startY][startX] = Field.START;
	draw(tempMaze);
	await dfs(startX, startY);

	maze = tempMaze;
}

async function solveMaze(size, maze, draw) {
	const tempMaze = maze.map((row) => [...row]);

	let start = null;
	let end = null;

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (maze[i][j] === Field.START) start = { x: i, y: j };
			if (maze[i][j] === Field.END) end = { x: i, y: j };
		}
	}

	if (!start || !end) {
		console.error("Brak punktu START lub END w labiryncie.");
		return;
	}

	const directions = [
		{ dx: -1, dy: 0 },
		{ dx: 1, dy: 0 },
		{ dx: 0, dy: -1 },
		{ dx: 0, dy: 1 },
	];

	const queue = [{ x: start.x, y: start.y, path: [] }];

	while (queue.length > 0) {
		const current = queue.shift();
		const { x, y, path } = current;

		if (x === end.x && y === end.y) {
			console.log("Labirynt rozwiązany!");
			return path;
		}

		tempMaze[x][y] = Field.CURRENT;
		draw(tempMaze);
    	await new Promise((resolve) => setTimeout(resolve, 50));
		tempMaze[x][y] = Field.VISITED;

		for (const { dx, dy } of directions) {
			const nx = x + dx;
			const ny = y + dy;

			if (
				nx >= 0 &&
				nx < size &&
				ny >= 0 &&
				ny < size &&
				(tempMaze[nx][ny] === Field.EMPTY ||
					tempMaze[nx][ny] === Field.END)
			) {
				tempMaze[nx][ny] = Field.INQUEUE;		
				queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
			}
		}
	}

	console.log("Labirynt nie ma rozwiązania.");
}

async function solveMazeDFS(size, maze, draw) {
	const tempMaze = maze.map((row) => [...row]);

	let start = null;
	let end = null;

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (maze[i][j] === Field.START) start = { x: i, y: j };
			if (maze[i][j] === Field.END) end = { x: i, y: j };
		}
	}

	if (!start || !end) {
		console.error("Brak punktu START lub END w labiryncie.");
		return;
	}

	const directions = [
		{ dx: -1, dy: 0 },
		{ dx: 1, dy: 0 },
		{ dx: 0, dy: -1 },
		{ dx: 0, dy: 1 },
	];

	async function dfs(x, y, path) {
		if (x === end.x && y === end.y) {
			console.log("Labirynt rozwiązany!");
			return path;
		}

		tempMaze[x][y] = Field.VISITED;
		draw(tempMaze);
		await new Promise((resolve) => setTimeout(resolve, 50));

		for (const { dx, dy } of directions) {
			const nx = x + dx;
			const ny = y + dy;

			if (
				nx >= 0 &&
				nx < size &&
				ny >= 0 &&
				ny < size &&
				(tempMaze[nx][ny] === Field.EMPTY ||
					tempMaze[nx][ny] === Field.END)
			) {
				const result = await dfs(nx, ny, [...path, { x: nx, y: ny }]);
				if (result) return result;
			}
		}

		return null;
	}

	return dfs(start.x, start.y, []);
}

async function solveMazeAStar(size, maze, draw) {
	const tempMaze = maze.map((row) => [...row]);

	let start = null;
	let end = null;

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (maze[i][j] === Field.START) start = { x: i, y: j };
			if (maze[i][j] === Field.END) end = { x: i, y: j };
		}
	}

	if (!start || !end) {
		console.error("Brak punktu START lub END w labiryncie.");
		return;
	}

	const directions = [
		{ dx: -1, dy: 0 },
		{ dx: 1, dy: 0 },
		{ dx: 0, dy: -1 },
		{ dx: 0, dy: 1 },
	];

	function heuristic(x, y) {
		return Math.abs(x - end.x) + Math.abs(y - end.y);
	}

	const openSet = [
		{
			x: start.x,
			y: start.y,
			cost: 0,
			heuristic: heuristic(start.x, start.y),
			path: [],
		},
	];

	while (openSet.length > 0) {
		openSet.sort((a, b) => a.cost + a.heuristic - (b.cost + b.heuristic));
		const current = openSet.shift();
		const { x, y, cost, path } = current;

		if (x === end.x && y === end.y) {
			console.log("Labirynt rozwiązany!");
			return path;
		}

		tempMaze[x][y] = Field.VISITED;
		draw(tempMaze);
    await new Promise((resolve) => setTimeout(resolve, 50));
    console.log(openSet)

		for (const { dx, dy } of directions) {
			const nx = x + dx;
			const ny = y + dy;

			if (
				nx >= 0 &&
				nx < size &&
				ny >= 0 &&
				ny < size &&
				(tempMaze[nx][ny] === Field.EMPTY ||
					tempMaze[nx][ny] === Field.END)
			) {
				openSet.push({
					x: nx,
					y: ny,
					cost: cost + 1,
					heuristic: heuristic(nx, ny),
					path: [...path, { x: nx, y: ny }],
				});
			}
		}
	}

	console.log("Labirynt nie ma rozwiązania.");
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
