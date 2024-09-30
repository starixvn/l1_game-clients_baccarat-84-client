const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const gameIds = [84, 85, 86, 87, 91, 92, 97, 98, 100, 101]; // Danh sách no lucky
// const gameIds = [81,82,83,88, 89]; // Danh sách lucky
async function runCommand(command) {
    try {
        const { stdout, stderr } = await execPromise(command);
        if (stderr) console.error("Stderr:", stderr);
        console.log("Stdout:", stdout);
    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}

async function cloneAndCreateBranch(gameId) {
    console.log(`Cloning and creating branch for game with ID: ${gameId}`);

    try {
        // Clone game
        await runCommand(`node ./clone-game-scripts/main.js ${gameId}`);
        await runCommand(`ts-node ./tolgee-generator/index.ts`);

        // Create and switch to new branch
        const branchName = `main-${gameId}`;
        await runCommand(`git checkout -b ${branchName}`);

        // Commit changes
        const commitMessage = `chore: update game id ${gameId}`;
        await runCommand(`git commit -m "${commitMessage}"`);

        // Push to remote repository
        await runCommand(`git push -f origin ${branchName}`);

        console.log(`Successfully cloned and created branch ${branchName} for game ${gameId}`);
    } catch (error) {
        console.error(`Failed to process game ${gameId}:`, error.message);
    }
}

async function processGames() {
    const { stdout: currentBranch } = await execPromise("git rev-parse --abbrev-ref HEAD");
    for (const gameId of gameIds) {
        await cloneAndCreateBranch(gameId);
        await runCommand(`git checkout ${currentBranch.trim()}`);
    }
}

processGames()
    .then(() => console.log("All games processed successfully"))
    .catch(console.error);
