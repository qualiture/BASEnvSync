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

        this.zip.loadAsync(zipfile).then((files) => {
            // Rudimentary check to see if the zip file contains the expected files
            if (!files.files[".bashrc"]) {
                vscode.window.showErrorMessage("Error importing BAS environment. This does not appear to be a valid BAS environment zip file.");
                return;
            } else {
                files.forEach((filepath, index) => {
                    this.zip.file(filepath)?.async("nodebuffer").then((content) => {
                        const dest = `${this.homeDir}/${filepath}`;
                        console.log(`Unzipping ${dest}`);
                        outputFileSync(dest, content);
                    });
                });

                vscode.window.showInformationMessage(`Sucessfully imported BAS environment settings.`);
            }
        }).catch((err) => {
            vscode.window.showErrorMessage("Error importing BAS environmnet. Please check the logs.");
        });
    }
    
}
