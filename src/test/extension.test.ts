import * as assert from 'assert';
import * as vscode from 'vscode';

import * as basenvsync from '../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension activation', () => {
		const context = { subscriptions: [] } as unknown as vscode.ExtensionContext;
		basenvsync.activate(context);

		assert.ok(context.subscriptions.length > 0);
	});
});
