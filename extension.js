const vscode = require('vscode');
const { exec } = require('child_process');

function activate(context) {
    let disposable = vscode.commands.registerCommand('bashCommandExecutor.execute', async function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const document = editor.document;
        const selection = editor.selection;
        const line = document.lineAt(selection.start.line);
        const lineText = line.text;

        if (lineText.startsWith('!!')) {
            const command = lineText.slice(2).trim();

            try {
                const output = await executeCommand(command);
                await editor.edit(editBuilder => {
		    // insert newline before executing command to separate output from previous command
			editBuilder.insert(new vscode.Position(line.lineNumber + 1, 0), '\n');
                });
                await editor.edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(line.lineNumber + 2, 0), output);
                });
            } catch (error) {
                vscode.window.showErrorMessage(`Error executing command: ${error}`);
            }
        }
    });

    context.subscriptions.push(disposable);
}

function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout || stderr);
            }
        });
    });
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}

