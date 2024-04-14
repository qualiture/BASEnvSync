// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import Export from './export';
import Import from './import';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "basenvsync" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let exportCommand = vscode.commands.registerCommand('basenvsync.export', () => {
		console.log("Exporting BAS environment...");

		const exportEnv = new Export();
        
        exportEnv.run();
	});

	let importCommand = vscode.commands.registerCommand('basenvsync.import', () => {
		console.log("Importing BAS environment...");

		vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			openLabel: "Select the BAS environment zip file to import"
		}).then((fileUri) => {
			if (fileUri && fileUri.length > 0) {
				const importEnv = new Import(fileUri[0].fsPath);
				importEnv.run();
			}
		});
	});

	context.subscriptions.push(exportCommand);
	context.subscriptions.push(importCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
