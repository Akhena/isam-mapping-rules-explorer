import * as vscode from 'vscode';
import { IsamFS } from './IsamFileSystemProvider';
import { EnvironmentBuilder } from './middleware/EnvironmentBuilder';
import { MiddleWareTreeDataProvider } from './middleware/MiddlewareTreeDataProvider';
import { MiddlewareTreeModel } from './middleware/MiddlewareTreeModel';
import { MiddlewareTreeNode } from './middleware/MiddlewareTreeNode';

export class IsamExplorer {
	private middlewareViewer: vscode.TreeView<MiddlewareTreeNode>;
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
	}

	private async openResource(middlewareNode: MiddlewareTreeNode): Promise<void> {		
		if (middlewareNode.resource.scheme !== "isam") {
			console.warn("openResource() not isam: custom scheme");
			return; // not my scheme
		}
		console.log("openResource() opening file : " + middlewareNode.resource.toString());
		let doc = await vscode.workspace.openTextDocument(middlewareNode.resource.toString()); // calls back into the provider
    	await vscode.window.showTextDocument(doc, { preview: false });
		//vscode.window.showTextDocument(resource);
	}

	initIsamFS(isamFS: IsamFS) {
		isamFS.createDirectory(vscode.Uri.parse("memfs:/ISAM/"));		
		isamFS.createDirectory(vscode.Uri.parse("memfs:/DATAPOWER/"));
	}
}