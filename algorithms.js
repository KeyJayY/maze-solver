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

function placeStartEnd(size, maze) {
	startX = 0;
	startY = 0;
	endX = size - 1;
	endY = size - 1;

	maze[startY][startX] = Field.START;
	maze[endY][endX] = Field.END;

	if (
		maze[endY - 1][endX] === Field.WALL &&
		maze[endY][endX - 1] === Field.WALL
	) {
		if (Math.floor(Math.random() * 2)) maze[endY - 1][endX] = Field.EMPTY;
		else maze[endY][endX - 1] = Field.EMPTY;
	}

	if (
		maze[startY + 1][startX] === Field.WALL &&
		maze[startY][startX + 1] === Field.WALL
	) {
		if (Math.floor(Math.random() * 2))
			maze[startY + 1][startX] = Field.EMPTY;
		else maze[startY][startX + 1] = Field.EMPTY;
	}

	return maze;
}

// Algorytm DFS
async function generateMazeDFS(size, visualisation = false) {
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
				if (visualisation) {
					draw(tempMaze);
					await new Promise((resolve) => setTimeout(resolve, 1));
				}
				await dfs(nx, ny);
			}
		}
	}

	tempMaze[startY][startX] = Field.START;
	await dfs(startX, startY);

	placeStartEnd(size, tempMaze);

	return tempMaze;
}

// Algorytm Kruskala
async function generateMazeKruskal(size, visualisation = false) {
	const tempMaze = Array.from({ length: size }, () =>
		Array(size).fill(Field.WALL)
	);

	function find(cell, parent) {
		if (parent[cell] === cell) return cell;
		return (parent[cell] = find(parent[cell], parent));
	}

	function union(cell1, cell2, parent, rank) {
		const root1 = find(cell1, parent);
		const root2 = find(cell2, parent);
		if (root1 !== root2) {
			if (rank[root1] > rank[root2]) parent[root2] = root1;
			else if (rank[root1] < rank[root2]) parent[root1] = root2;
			else {
				parent[root2] = root1;
				rank[root1]++;
			}
			return true;
		}
		return false;
	}

	const edges = [];
	const parent = {};
	const rank = {};

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			if (y % 2 === 1 && x % 2 === 1) {
				const cell = `${y},${x}`;
				parent[cell] = cell;
				rank[cell] = 0;
				tempMaze[y][x] = Field.EMPTY;

				if (y > 1)
					edges.push([
						[y, x],
						[y - 2, x],
					]);
				if (x > 1)
					edges.push([
						[y, x],
						[y, x - 2],
					]);
			}
		}
	}

	for (let i = edges.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[edges[i], edges[j]] = [edges[j], edges[i]];
	}

	for (const [[y1, x1], [y2, x2]] of edges) {
		const cell1 = `${y1},${x1}`;
		const cell2 = `${y2},${x2}`;

		if (union(cell1, cell2, parent, rank)) {
			tempMaze[(y1 + y2) / 2][(x1 + x2) / 2] = Field.EMPTY;
			if (visualisation) {
				draw(tempMaze);
				await new Promise((resolve) => setTimeout(resolve, 1));
			}
		}
	}

	placeStartEnd(size, tempMaze);

	return tempMaze;
}

// Algorytm Prima
async function generateMazePrim(size, visualisation = false) {
	const tempMaze = Array.from({ length: size }, () =>
		Array(size).fill(Field.WALL)
	);

	const walls = [];
	const addWalls = (x, y) => {
		if (x > 1) walls.push([x - 1, y, x - 2, y]);
		if (x < size - 2) walls.push([x + 1, y, x + 2, y]);
		if (y > 1) walls.push([x, y - 1, x, y - 2]);
		if (y < size - 2) walls.push([x, y + 1, x, y + 2]);
	};

	const startX = Math.floor(Math.random() * (size / 2)) * 2 + 1;
	const startY = Math.floor(Math.random() * (size / 2)) * 2 + 1;
	tempMaze[startY][startX] = Field.EMPTY;
	addWalls(startX, startY);

	while (walls.length > 0) {
		const index = Math.floor(Math.random() * walls.length);
		const [wallX, wallY, cellX, cellY] = walls.splice(index, 1)[0];

		if (tempMaze[cellY][cellX] === Field.WALL) {
			tempMaze[wallY][wallX] = Field.EMPTY;
			tempMaze[cellY][cellX] = Field.EMPTY;
			if (visualisation) {
				draw(tempMaze);
				await new Promise((resolve) => setTimeout(resolve, 1));
			}
			addWalls(cellX, cellY);
		}
	}

	placeStartEnd(size, tempMaze);

	return tempMaze;
}

async function generateMazeBinaryTree(size, visualisation = false) {
	const tempMaze = Array.from({ length: size }, () =>
		Array(size).fill(Field.WALL)
	);

	for (let y = 0; y < size; y += 2) {
		for (let x = 0; x < size; x += 2) {
			tempMaze[y][x] = Field.EMPTY;
			const directions = [];
			if (y > 0) directions.push([0, -1]);
			if (x > 0) directions.push([-1, 0]);

			if (directions.length > 0) {
				const [dx, dy] =
					directions[Math.floor(Math.random() * directions.length)];
				tempMaze[y + dy][x + dx] = Field.EMPTY;
			}
			if (visualisation) {
				draw(tempMaze);
				await new Promise((resolve) => setTimeout(resolve, 1));
			}
		}
	}

	placeStartEnd(size, tempMaze);

	return tempMaze;
}

async function generateMazeGrowingTree(size, visualisation = false) {
	const tempMaze = Array.from({ length: size }, () =>
		Array(size).fill(Field.WALL)
	);

	const cells = [[0, 0]];
	tempMaze[0][0] = Field.EMPTY;

	function isInBounds(x, y) {
		return x >= 0 && y >= 0 && x < size && y < size;
	}

	while (cells.length > 0) {
		const index =
			Math.random() < 0.5
				? cells.length - 1
				: Math.floor(Math.random() * cells.length);
		const [x, y] = cells[index];

		const directions = [
			[0, -1],
			[0, 1],
			[-1, 0],
			[1, 0],
		];
		const validDirections = directions.filter(([dx, dy]) => {
			const nx = x + dx * 2,
				ny = y + dy * 2;
			return isInBounds(nx, ny) && tempMaze[ny][nx] === Field.WALL;
		});

		if (validDirections.length > 0) {
			const [dx, dy] =
				validDirections[
					Math.floor(Math.random() * validDirections.length)
				];
			const nx = x + dx * 2,
				ny = y + dy * 2;
			tempMaze[y + dy][x + dx] = Field.EMPTY;
			tempMaze[ny][nx] = Field.EMPTY;
			cells.push([nx, ny]);
		} else {
			cells.splice(index, 1);
		}
		if (visualisation) {
			draw(tempMaze);
			await new Promise((resolve) => setTimeout(resolve, 1));
		}
	}

	placeStartEnd(size, tempMaze);

	return tempMaze;
}

async function solveMazeBFS(size, maze, draw, visualisation = false) {
	const tempMaze = maze.map((row) => [...row]);

	let start = null;
	let end = null;

	let steps = 0;

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
		steps++;
		const current = queue.shift();
		const { x, y, path } = current;

		if (visualisation) {
			tempMaze[x][y] = Field.CURRENT;
			draw(tempMaze);
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
		tempMaze[x][y] = Field.VISITED;

		for (const { dx, dy } of directions) {
			const nx = x + dx;
			const ny = y + dy;

			if (isInBounds(nx, ny) && tempMaze[nx][ny] === Field.END) {
				return { steps: steps, path: path };
			}
			if (isInBounds(nx, ny) && tempMaze[nx][ny] === Field.EMPTY) {
				tempMaze[nx][ny] = Field.INQUEUE;
				queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
			}
		}
	}

	console.log("Labirynt nie ma rozwiązania.");
}

async function solveMazeDFS(size, maze, draw, visualisation = false) {
	const tempMaze = maze.map((row) => [...row]);

	let start = null;
	let end = null;

	let steps = 0;

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
		steps++;

		if (visualisation) {
			tempMaze[x][y] = Field.CURRENT;
			draw(tempMaze);
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
		tempMaze[x][y] = Field.VISITED;

		for (const { dx, dy } of directions) {
			const nx = x + dx;
			const ny = y + dy;

			if (isInBounds(nx, ny) && tempMaze[nx][ny] === Field.END) {
				return { steps: steps, path: path };
			}
			if (isInBounds(nx, ny) && tempMaze[nx][ny] === Field.EMPTY) {
				const result = await dfs(nx, ny, [...path, { x: nx, y: ny }]);
				if (result) return result;
			}
		}

		return null;
	}

	return dfs(start.x, start.y, []);
}

async function solveMazeAStar(size, maze, draw, visualisation = false) {
	const tempMaze = maze.map((row) => [...row]);

	let start = null;
	let end = null;

	let steps = 0;

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
		steps++;
		openSet.sort((a, b) => a.cost + a.heuristic - (b.cost + b.heuristic));
		const current = openSet.shift();
		const { x, y, cost, path } = current;

		if (visualisation) {
			tempMaze[x][y] = Field.CURRENT;
			draw(tempMaze);
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
		tempMaze[x][y] = Field.VISITED;

		for (const { dx, dy } of directions) {
			const nx = x + dx;
			const ny = y + dy;

			if (isInBounds(nx, ny) && tempMaze[nx][ny] === Field.END) {
				return { steps: steps, path: path };
			}
			if (isInBounds(nx, ny) && tempMaze[nx][ny] === Field.EMPTY) {
				tempMaze[nx][ny] = Field.INQUEUE;
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

function isInBounds(x, y) {
	return x >= 0 && y >= 0 && x < size && y < size;
}
