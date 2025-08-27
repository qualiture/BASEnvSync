import * as vscode from 'vscode';
import * as path from 'path';
import { readFileSync, lstatSync, readdirSync, promises } from "fs";
import JSZip from "jszip";
import os from 'os';

import Constants from "./constants";

type ExportMethod = {
    label: string;
    description: string;
    detail: string;
};

export default class Export {

    private homeDir: string = "";
    private zip = new JSZip();
    private context: vscode.ExtensionContext;
    private logger: vscode.LogOutputChannel;

    constructor(context: vscode.ExtensionContext, logger: vscode.LogOutputChannel) {
        this.context = context;
        this.logger = logger;
    }

    public async run() {
        const method = await this.getDownloadMethod();

        if (!method) return;

        this.homeDir = os.homedir();

        // TODO: Make this more flexible 
        this.addToZip(".bashrc");
        this.addToZip(".bash_aliases");
        this.addToZip(".profile");
        this.addToZip(".scripts"); // folder with bash shell scripts (autocomplete, history, git prompt, etc)
        this.addToZip(".tmp");     // here's where I store the CF defaultenv plugin
        this.addToZip(".npmrc");
        this.addToZip(".gitignore");
        this.addToZip(".gitconfig");
        this.addToZip(".git-credentials");
        this.addToZip(".inputrc");

        console.log("Running export");

        this.zip.generateAsync({ type: "nodebuffer", streamFiles:true }).then(async (buffer) => {
            // await this.showSaveDialog(buffer);
            await this.handleDownload(method, this.context, buffer);
        }).catch((error) => {
            this.logger.error(`Failed to export BAS environment with error: ${error}`);
            vscode.window.showErrorMessage("Error exporting BAS environmnet. Please check the logs.");
        });
    }

    private async getDownloadMethod() : Promise<ExportMethod | undefined> {
        return await vscode.window.showQuickPick([
            {
                label: '💾 Save with Dialog',
                description: 'Recommended when using VS Code',
                detail: 'Choose exact location where to save the file'
            },
            {
                label: '⬇️ Browser Download (Beta functionality)',
                description: 'Recommended when using browser',
                detail: 'File goes to your Downloads folder'
            }
        ], {
            placeHolder: 'Choose how to download the file'
        });
    }

    private async handleDownload(method: ExportMethod , context: vscode.ExtensionContext, buffer: Buffer<ArrayBufferLike>) {
        if (method.label.includes('Save with Dialog')) {
            this.showSaveDialog(buffer);
        } else {
            this.downloadViaWebView(context, buffer);
        }
    }

    private async downloadViaWebView(context: vscode.ExtensionContext, buffer: Buffer<ArrayBufferLike>) {
        const panel = vscode.window.createWebviewPanel(
            'fileDownload',
            'Download File',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // Load HTML from file
        try {
            const htmlPath = path.join(context.extensionPath, 'out', 'webviews', 'download.html');
            let html = await promises.readFile(htmlPath, 'utf8');
            
            // Replace placeholders with actual values
            const encodedContent = Buffer.from(buffer).toString('base64');
            html = html.replace(/\{\{FILENAME\}\}/g, Constants.DEFAULT_ZIP_FILE);
            html = html.replace(/\{\{ENCODED_CONTENT\}\}/g, encodedContent);
            
            panel.webview.html = html;
        } catch (error) {
            this.logger.error('Failed to load download.html with error:', error);
            vscode.window.showErrorMessage("Failed to load download.html. Use a different method instead.");
        }

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'downloadComplete':
                        vscode.window.showInformationMessage('File downloaded successfully!');
                        // panel.dispose();
                        break;
                    case 'downloadError':
                        vscode.window.showErrorMessage(`Download error: ${message.error}`);
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    }

    private async showSaveDialog(buffer: Buffer<ArrayBufferLike>) {
        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(Constants.DEFAULT_ZIP_FILE),
            filters: {
                'ZIP files': ['zip'],
                'All files': ['*']
            }
        });

        if (uri) {
            await promises.writeFile(uri.fsPath, buffer);
            vscode.window.showInformationMessage(`Exported '${path.basename(uri.fsPath)}' successfully. From there you can upload it to your target environment.`);
        }
    }

    /**
     * Adds a file or folder to the zip archive.
     * If the specified path is a directory, it adds the entire folder to the zip.
     * If the specified path is a file, it adds only that file to the zip.
     * If the file or folder is not found, it logs a message and does not add it to the zip.
     * 
     * @param filename - The name of the file or folder to add to the zip.
     * @param path - The optional path of the file or folder to add to the zip.
     */
    private addToZip(filename: string, path?: string) {
        const fullPath = this.getFullPath(filename, path);

        try {
            const data = lstatSync(fullPath);

            if (data.isDirectory()) {
                this.addFolderToZip(filename, path);
            } else {
                this.addSingleFileToZip(filename, path);
            }
        } catch (error) {
            console.log(`File or folder '${filename}' not found and will not be exported`);
        }
    }

    private addFolderToZip(folder: string, path?: string) {
        const fullPath = this.getFullPath(folder, path);
        const zipfolder = this.zip.folder(this.getZipPath(folder, path));

        const filenames = readdirSync(fullPath);

        for (const filename of filenames) {
            const file = readFileSync(`${fullPath}/${filename}`);
            zipfolder?.file(filename, file);
        }

        console.log(`Folder '${folder}' added to zip, containing ${filenames.length} files.`);
    }

    private addSingleFileToZip(filename: string, path?: string) {
        const fullPath = this.getFullPath(filename, path);

        if (path) {
            const file = readFileSync(fullPath);
            const subfolder = this.zip.folder(path);
            subfolder?.file(filename, file);
        } else {
            const file = readFileSync(fullPath);
            this.zip.file(filename, file);
        }

        console.log(`File '${filename}' added to zip.`);
    }

    private getFullPath(filename: string, path?: string) : string {
        if (path) {
            return `${this.homeDir}/${path}/${filename}`;
        }
        return `${this.homeDir}/${filename}`;
    }
    
    private getZipPath(filename: string, path?: string) : string {
        if (path) {
            return `${path}/${filename}`;
        }
        return filename;
    }
    
}
