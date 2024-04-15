// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import Export from './export';
import Import from './import';

/**
 * This method is called when your extension is activated
 * Your extension is activated the very first time the command is executed
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "basenvsync" is now active!');

	registerExportCommand(context);
	registerImportCommand(context);
}

/** 
 * This method is called when your extension is deactivated
 */
export function deactivate() {}

/**
 * Exports the configuration of the BAS environment in to a zip file
 * @param context 
 */
function registerExportCommand(context: vscode.ExtensionContext) {
	let exportCommand = vscode.commands.registerCommand('basenvsync.export', () => {
		console.log("Exporting BAS environment...");

		const exportEnv = new Export();
        
        exportEnv.run();
	});

	context.subscriptions.push(exportCommand);
}

/**
 * Imports the configuration of the BAS environment from a zip file
 * @param context 
 */
function registerImportCommand(context: vscode.ExtensionContext) {
	let importCommand = vscode.commands.registerCommand('basenvsync.import', () => {
		console.log("Importing BAS environment...");

		vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			openLabel: "Select the BAS environment zip file to import",
			filters: {
				"Zip Files": ["zip"]
			}
		}).then((fileUri) => {
			if (fileUri && fileUri.length > 0) {
				const importEnv = new Import(fileUri[0].fsPath);
				importEnv.run();
			}
		});
	});
	
	context.subscriptions.push(importCommand);
}
