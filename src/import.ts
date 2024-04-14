import * as vscode from 'vscode';
import { readFileSync } from "fs";
import { outputFileSync } from "fs-extra";
import JSZip from "jszip";
import os from 'os';

export default class Import {

    protected zipfile: string;

    private homeDir: string = "";
    private zip = new JSZip();

    constructor(zipfile: string) {
        this.zipfile = zipfile;
    }

    public run() {
        this.homeDir = os.homedir();

        const zipfile = readFileSync(this.zipfile);

        let processed = 0;

        this.zip.loadAsync(zipfile).then((files) => {
            files.forEach((filepath, index) => {
                this.zip.file(filepath)?.async("nodebuffer").then((content) => {
                    const dest = `${this.homeDir}/${filepath}`;
                    console.log(`Unzipping ${dest}`);
                    outputFileSync(dest, content);

                    processed++;

                    if (processed === Object.keys(files.files).length) {
                        vscode.window.showInformationMessage(`\nSucessfully mported BAS environment settings.`);
                    }
                });
            });
        }).catch((err) => {
            vscode.window.showErrorMessage("Error importing BAS environmnet. Please check the logs.");
        });
    }
    
}
