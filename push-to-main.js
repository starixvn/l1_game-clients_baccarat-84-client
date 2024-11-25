const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const gameIds = [84, 85, 86, 87, 90, 91, 92, 97, 98, 100, 101, 81, 82, 83, 88, 89];

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

async function pushToMain(gameId) {
    const devBranch = `dev-${gameId}`;
    const mainBranch = `main-${gameId}`;
    
    try {
        console.log(`Đang xử lý game ${gameId}: ${devBranch} -> ${mainBranch}`);
        
        // Checkout nhánh dev
        await runCommand(`git checkout ${devBranch}`);
        
        // Push từ dev lên main với force push
        await runCommand(`git push origin ${devBranch}:${mainBranch} -f`);
        
        console.log(`Đã push thành công ${devBranch} lên ${mainBranch}`);
    } catch (error) {
        console.error(`Lỗi khi xử lý game ${gameId}:`, error.message);
    }
}

async function processAllGames() {
    for (const gameId of gameIds) {
        await pushToMain(gameId);
    }
}

try {
    processAllGames()
        .then(() => {
            console.log("Đã hoàn thành việc push tất cả các game");
        })
        .catch((error) => {
            console.error("Lỗi:", error);
        });
} catch (error) {
    console.error("Lỗi:", error);
} 