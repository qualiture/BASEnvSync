# Change Log

All notable changes to the "BASEnvSync" SAP Business Application Studio extension will be documented in this file.

## [1.2.0]

- New: 🥳 Finally managed to get the 'Save As' dialog to work for both Chrome / Edge using the experimental `window.showSaveFilePicker()` method! However, please note the following: 
   - As `window.showSaveFilePicker()` is experimental, it may stop working in the future.
   - Also, since `window.showSaveFilePicker()` does not allow cross-origin sub frames, you must run SAP BAS / SAP Build Code from its original URL, and not from any custom domain. I.e., run it from `https://theia-workspaces-ws-...cloud.sap` instead of `https://mycompany...cloud.sap`.

## [1.1.5]

- Found no solution for download flow. Behavior now is the following: 
   - SAP BAS / SAP Build Code: Downloads to workspace (choose your project root from the file picker dialog)
   - VS Code: Downloads to local harddisk 

## [1.1.1 - 1.1.4]

- Tried various attempts at streamlining the download functionality.

## [1.1.0]

- New: Implemented display of 'What's New' tab on updated extension

## [1.0.2]

- Fixes: Blocking bug in presenting webview for upload
- Updated documentation

## [1.0.1]

- First major version
- Significant overhaul of the download and upload flow for the configuration ZIP file
- Updated packages

## [0.2.0]

- Added `.inputrc` to exported files
- Updated packages

## [0.1.3]

- Added logo
- Improved stability and error handling

## [0.1.2]

- Minor bugfixes
- Updated documentation

## [0.1.1]

- Refreshed npm dependencies

## [0.1.0]

- First Open-VSX beta release

## [0.0.9]

- Initial release
