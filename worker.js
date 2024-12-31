importScripts('algorithms.js');

onmessage = async function (event) {
    const solvingAlgorithms = [solveMazeBFS, solveMazeDFS, solveMazeAStar];
    const { id, maze, solverIndex, size } = event.data;

    const solution = await solvingAlgorithms[solverIndex](size, maze, null, false);

    postMessage({ id, solution });
};
