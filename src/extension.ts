// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import * as path from 'path';
import { promises } from "fs";
import Export from './export';
import Import from './import';

const EXTENSION_VERSION = 'basenvsync.version';    // key in globalState
const RELEASE_NOTES_MD  = 'changelog.md';          // ship this file with your .vsix
const logger = vscode.window.createOutputChannel("BASEnvSync", { log: true });

/**
 * This method is called when your extension is activated
 * Your extension is activated the very first time the command is executed
 * @param context 
 */
export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "basenvsync" is now active!');

	await showWhatsNew(context);

	registerExportCommand(context);
	registerImportCommand(context);
}

/** 
 * This method is called when your extension is deactivated
 */
export function deactivate() {}

async function showWhatsNew(context: vscode.ExtensionContext) {
    // 1. Current version that VS Code just loaded
    const thisVersion = vscode.extensions.getExtension('qualiture.basenvsync')!.packageJSON.version as string;

    // 2. Last version we stored (undefined ⇒ first-ever install)
    const prevVersion = context.globalState.get<string>(EXTENSION_VERSION);

    // 3. Extract major versions (first number in semver x.y.z format)
    const thisMajorVersion = parseInt(thisVersion.split('.')[0]);
    const prevMajorVersion = prevVersion ? parseInt(prevVersion.split('.')[0]) : 0;

    // 4. Only fire when major version increases (skip first install and non-major updates)
    if (prevVersion && thisMajorVersion > prevMajorVersion) {
		logger.info('New major version detected:', thisVersion);

        // Resolve CHANGELOG.md inside your extension bundle
        const notesUri = vscode.Uri.joinPath(context.extensionUri, RELEASE_NOTES_MD);
        logger.info('Release notes URL:', notesUri);

        // Jump straight to the built-in preview
        await vscode.commands.executeCommand('markdown.showPreview', notesUri);
    } else if (prevVersion && thisVersion > prevVersion) {
		logger.info('No new major version detected, but extension was updated to a new version:', thisVersion);
	}

    // 4. Persist the current version for next time
    await context.globalState.update(EXTENSION_VERSION, thisVersion);

}

/**
 * Exports the configuration of the BAS environment in to a zip file
 * @param context 
 */
function registerExportCommand(context: vscode.ExtensionContext) {
	let exportCommand = vscode.commands.registerCommand('basenvsync.export', () => {
		logger.info("Exporting BAS environment...");

		const exportEnv = new Export(context, logger);
        
        exportEnv.run();
	});

	context.subscriptions.push(exportCommand);
}

/**
 * Imports the configuration of the BAS environment from a zip file
 * @param context 
 */
function registerImportCommand(context: vscode.ExtensionContext) {
	let importCommand = vscode.commands.registerCommand('basenvsync.import', async () => {
		logger.info("Importing BAS environment...");

		const panel = vscode.window.createWebviewPanel(
			'fileUpload',
			'Upload File',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);
	
		try {
			const htmlPath = path.join(context.extensionPath, 'out', 'webviews', 'upload.html');
			const html = await promises.readFile(htmlPath, 'utf8');
			panel.webview.html = html;
		} catch (error) {
			logger.error('Failed to load \'upload.html\' with error:', error);
		}
		
		// Handle messages from webview
		panel.webview.onDidReceiveMessage(
			async message => {
				switch (message.command) {
					case 'fileUploaded':
						const importEnv = new Import(message.filePath, message.content, logger);
						importEnv.run();
						// await handleUploadedFile(message.content, message.fileName);
						panel.dispose();
						break;
					case 'uploadError':
						vscode.window.showErrorMessage(`Upload error: ${message.error}`);
						break;
				}
			},
			undefined,
			context.subscriptions
		);
	});
	
	context.subscriptions.push(importCommand);
}
