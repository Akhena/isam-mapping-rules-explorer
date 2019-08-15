import * as vscode from 'vscode';
import { dirname, join } from 'path';
import { IsamService } from './isamService';
import { IsamNode } from './IsamNode';
import { IsamResource } from './IsamResource';
import { IsamEnvironment } from './IsamEnvironment';
import { IsamResourceType } from './IsamResourceType';
import { IsamEnvironmentType } from './IsamEnvironmentType';
import { IsamModel } from './IsamModel';
import { IsamTreeDataProvider } from './IsamTreeDataProvider';
import { IsamFS } from './IsamFileSystemProvider';
import { MiddlewareTreeModel } from './middleware/MiddlewareTreeModel';
import { MiddlewareTreeNode } from './middleware/MiddlewareTreeNode';
import { EnvironmentBuilder } from './middleware/EnvironmentBuilder';
import { MiddleWareTreeDataProvider } from './middleware/MiddlewareTreeDataProvider';

export class IsamExplorer {
	private middlewareViewer: vscode.TreeView<MiddlewareTreeNode>;
	private isamEnvironments: IsamEnvironment[] = new Array();
	private isamFileSystemProvider: IsamFS;

	constructor(context: vscode.ExtensionContext) {
		/* Please note that login information is hardcoded only for this example purpose and recommended not to do it in general. */
		var envBuilder = new EnvironmentBuilder();

		const middlewareTreeModel = new MiddlewareTreeModel(envBuilder.buildIsamEnvironments(), envBuilder.buildDatapowerGwEnvironments());		
		const treeDataProvider = new MiddleWareTreeDataProvider(middlewareTreeModel);
		this.middlewareViewer = vscode.window.createTreeView('isamExplorer', { treeDataProvider });

		this.isamFileSystemProvider = new IsamFS(middlewareTreeModel);
		context.subscriptions.push(vscode.workspace.registerFileSystemProvider('isam', this.isamFileSystemProvider, { isCaseSensitive: true }));
		this.initIsamFS(this.isamFileSystemProvider);
				

		vscode.commands.registerCommand('isamExplorer.refresh', () => treeDataProvider.refresh());
		vscode.commands.registerCommand('isamExplorer.openIsamResource', resource => this.openResource(resource));
		vscode.commands.registerCommand('isamExplorer.revealResource', () => this.reveal());
	}

	private async openResource(isamNode: IsamNode): Promise<void> {		
		if (isamNode.resource.uri.scheme !== "isam") {
			console.log("openResource() not isam: custom scheme");
			return; // not my scheme
		}
		let doc = await vscode.workspace.openTextDocument(isamNode.resource.uri); // calls back into the provider
    	await vscode.window.showTextDocument(doc, { preview: false });
		//vscode.window.showTextDocument(resource);
	}

	private reveal(): Thenable<void> | null {
		console.log("reveal()");
		const node = this.getNode();
		if (node) {
			return this.middlewareViewer.reveal(node);
		}
		return null;
	}

	private getNode(): MiddlewareTreeNode | null {
		console.log("getNode()");
		if (vscode.window.activeTextEditor) {
			if (vscode.window.activeTextEditor.document.uri.scheme === 'isam') {
				return this.buildMiddlewareFileNode(vscode.window.activeTextEditor.document.uri);
			}
		}
		return null;
	}
	buildMiddlewareFileNode(uri: vscode.Uri): MiddlewareTreeNode | null {
		console.log("buildMiddlewareFileNode()")
		let index: number = this.isamEnvironments.findIndex(env => env.type === IsamEnvironmentType.DEV);

		const isamNodeFile: MiddlewareTreeNode = {
			isDirectory: true,
			resource: vscode.Uri.parse("isam:" + uri.toString())
		};
		return isamNodeFile;
	}

	initIsamFS(isamFS: IsamFS) {
		isamFS.createDirectory(vscode.Uri.parse("memfs:/ISAM/"));		
		isamFS.createDirectory(vscode.Uri.parse("memfs:/DATAPOWER/"));
	}
}