"use strict";
const { PythonShell } = require('python-shell');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { execSync } = require('child_process');
// 判断是否是开发环境
const isDev = !process?.env?.npm_lifecycle_script ? false : process.env.npm_lifecycle_script.includes('development');
console.log('isDev: %j', isDev);
const isMac = process.platform === 'darwin';
const pythonName = isMac ? 'bin/python3' : 'Scripts/python.exe';
const pythonPath = isDev
    ? path.join(__dirname, `../venv/${pythonName}`)
    : path.join(process.resourcesPath, 'venv', pythonName);
console.log('pythonPath: %j', pythonPath);
let options = {
    mode: 'text',
    pythonPath: pythonPath,
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: './',
    args: []
};
const delimiter = ', ';

async function checkEnvironment() {
    const checks = {
        python: false,
        pip: false,
        venv: false,
        venvPackages: false
    };
    try {
        // 检查 Python 是否安装
        try {
            const pythonVersion = execSync('python --version').toString();
            checks.python = pythonVersion.includes('Python 3');
        }
        catch (err) {
            console.error('Python check failed:', err.message);
        }
        // 检查 pip 是否安装
        try {
            const pipVersion = execSync('pip --version').toString();
            checks.pip = pipVersion.includes('pip');
        }
        catch (err) {
            console.error('pip check failed:', err.message);
        }
        // 检查 venv 是否可用
        try {
            const venvCheck = execSync('python -c "import venv"').toString();
            checks.venv = true;
        }
        catch (err) {
            console.error('venv check failed:', err.message);
        }
        // 检查虚拟环境是否存在且包含必要的包
        const venvPath = isDev ? path.join(__dirname, '../../../venv') : path.join(process.resourcesPath, 'venv');
        console.log('venvPath', venvPath)
        if (fs.existsSync(venvPath)) {
            const venvPython = isMac
                ? path.join(venvPath, 'bin/python3')
                : path.join(venvPath, 'Scripts/python.exe');
            if (fs.existsSync(venvPython)) {
                try {
                    // 检查关键包是否安装
                    const packages = ['pyJianYingDraft'];
                    for (const pkg of packages) {
                        execSync(`${venvPython} -c "import ${pkg}"`);
                    }
                    checks.venvPackages = true;
                }
                catch (err) {
                    console.error('venv packages check failed:', err.message);
                }
            }
        }
        // 计算完整性百分比
        const totalChecks = Object.keys(checks).length;
        const passedChecks = Object.values(checks).filter(Boolean).length;
        const completeness = (passedChecks / totalChecks) * 100;
        return {
            checks,
            completeness,
            needsInstall: completeness < 100
        };
    }
    catch (err) {
        console.error('Environment check failed:', err.message);
        return {
            checks,
            completeness: 0,
            needsInstall: true
        };
    }
}
async function installEnvironment() {
    const platform = process.platform;
    let scriptPath;
    let scriptName;
    // Determine which installation script to use based on platform
    if (platform === 'win32') {
        scriptName = 'install.bat';
    }
    else if (platform === 'darwin') {
        scriptName = 'install.command';
    }
    else {
        scriptName = 'install.sh';
    }
    // Get the absolute path to the installation script
    scriptPath = isDev
        ? path.join(__dirname, '..', scriptName)
        : path.join(process.resourcesPath, scriptName);
    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
        throw new Error(`Installation script not found: ${scriptPath}`);
    }
    return new Promise((resolve, reject) => {
        let process;
        // 根据不同平台使用不同的终端打开方式
        if (platform === 'win32') {
            // Windows: 使用 start cmd.exe 并在脚本执行完后自动退出
            process = spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/c', `${scriptPath} && exit`], {
                shell: true,
                detached: true
            });
        }
        else if (platform === 'darwin') {
            // macOS: 使用 osascript 来控制 Terminal
            const script = `
                tell application "Terminal"
                    do script "\"${scriptPath}\" && exit"
                    activate
                end tell
            `;
            process = spawn('osascript', ['-e', script], {
                shell: true,
                detached: true
            });
        }
        else {
            // Linux: 使用 x-terminal-emulator 或其他终端模拟器
            const terminals = [
                'x-terminal-emulator',
                'gnome-terminal',
                'konsole',
                'xfce4-terminal',
                'xterm'
            ];
            let terminalCmd = null;
            for (const term of terminals) {
                try {
                    execSync(`which ${term}`);
                    terminalCmd = term;
                    break;
                }
                catch (e) {
                    continue;
                }
            }
            if (!terminalCmd) {
                reject(new Error('No terminal emulator found'));
                return;
            }
            // 根据不同的终端使用不同的命令
            if (terminalCmd === 'gnome-terminal') {
                process = spawn(terminalCmd, ['--', 'bash', '-c', `${scriptPath}; read -p "Installation complete. Press enter to exit..." && exit`], {
                    shell: true,
                    detached: true
                });
            }
            else if (terminalCmd === 'konsole') {
                process = spawn(terminalCmd, ['-e', 'bash', '-c', `${scriptPath}; read -p "Installation complete. Press enter to exit..." && exit`], {
                    shell: true,
                    detached: true
                });
            }
            else {
                process = spawn(terminalCmd, ['-e', `bash -c "${scriptPath}; read -p 'Installation complete. Press enter to exit...' && exit"`], {
                    shell: true,
                    detached: true
                });
            }
        }
        // 分离子进程，让它在新窗口中独立运行
        process.on('error', (err) => {
            reject(new Error(`Failed to start installation process: ${err.message}`));
        });
        process.on('close', (code) => {
            resolve(true);
        });
        process.unref();
    });
}
module.exports = {
    installEnvironment,
    checkEnvironment
};
