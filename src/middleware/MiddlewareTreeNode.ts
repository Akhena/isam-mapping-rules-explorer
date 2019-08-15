import * as vscode from 'vscode';

export interface MiddlewareTreeNode {
	resource: vscode.Uri;
	isDirectory: boolean;
}
