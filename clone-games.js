const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const normalGameIds = [84, 85, 86, 87, 90, 91, 92, 97, 98, 100, 101, 81, 82, 83, 88, 89]; // Danh sách no lucky
const luckyGameIds = [81, 82, 83, 88, 89]; // Danh sách lucky
const prefixBranch = "dev";
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

async function cloneAndCreateBranch(branchName, gameId) {
    console.log(`Cloning and creating branch for game with ID: ${gameId}`);

    try {
        // Create and switch to new branch

        await runCommand(`git checkout -b ${branchName}`);

        // Clone game
        await runCommand(`node ./clone-game-scripts/main.js ${gameId}`);
        await runCommand(`ts-node ./tolgee-generator/index.ts`);

        // Kiểm tra thay đổi và commit
        const { stdout: status } = await execPromise("git status --porcelain");

        if (status) {
            await runCommand("git add .");
            // Commit changes
            const commitMessage = `chore: update game id ${gameId}`;
            await runCommand(`git commit -m "${commitMessage}"`);

            // Push to remote repository
            await runCommand(`git push -f origin ${branchName}`);
        } else {
            console.log(`No changes to commit for game ${gameId}`);
        }

        console.log(`Successfully cloned and created branch ${branchName} for game ${gameId}`);
    } catch (error) {
        console.error(`Failed to process game ${gameId}:`, error.message);
    }
}

async function processGames(isLucky) {
    const gameIds = isLucky ? luckyGameIds : normalGameIds;
    const rootBranch = isLucky ? `${prefixBranch}-lucky` : `${prefixBranch}`;
    await runCommand(`git checkout ${rootBranch.trim()}`);

    const { stdout: currentBranch } = await execPromise("git rev-parse --abbrev-ref HEAD");
    for (const gameId of gameIds) {
        const branchName = `${prefixBranch}-${gameId}`;
        await cloneAndCreateBranch(branchName, gameId);
        await runCommand(`git checkout ${currentBranch.trim()}`);
        // Delete local branch
        try {
            await runCommand(`git branch -D ${branchName}`);
            console.log(`Deleted local branch ${branchName}`);
        } catch (error) {
            console.error(`Failed to delete local branch ${branchName}:`, error.message);
        }
    }
}

try {
    processGames(false)
        .then(() => {
            console.log("All games processed successfully");
        })
        .catch((e) => console.error(e));
} catch (e) {
    console.error(e);
}
