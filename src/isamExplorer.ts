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

export class IsamExplorer {

	private isamViewer: vscode.TreeView<IsamNode>;
	private isamEnvironments: IsamEnvironment[] = new Array();

	constructor(context: vscode.ExtensionContext) {
		/* Please note that login information is hardcoded only for this example purpose and recommended not to do it in general. */
		this.buildIsamEnvironments();
		const isamModel = new IsamModel(this.isamEnvironments);
		const treeDataProvider = new IsamTreeDataProvider(isamModel);
		context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('isam', treeDataProvider));

		this.isamViewer = vscode.window.createTreeView('isamExplorer', { treeDataProvider });

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
			return this.isamViewer.reveal(node);
		}
		return null;
	}

	private getNode(): IsamNode | null {
		console.log("getNode()");
		if (vscode.window.activeTextEditor) {
			if (vscode.window.activeTextEditor.document.uri.scheme === 'isam') {
				return this.buildIsamFileNode(vscode.window.activeTextEditor.document.uri);
			}
		}
		return null;
	}
	buildIsamFileNode(uri: vscode.Uri): IsamNode | null {
		console.log("buildIsamFileNode()")
		let index: number = this.isamEnvironments.findIndex(env => env.type === IsamEnvironmentType.DEV);

		const isamResFile: IsamResource = {
			environment: this.isamEnvironments[index], // TODO find a way to dynamically figure out the correct environment. check uri against all know environments?
			name: IsamResourceType.MAPPING_RULES.toString(),
			path: uri.toString(),
			type: IsamResourceType.MAPPING_RULES,
			uri: vscode.Uri.parse("isam:" + uri.toString())
		};
		const isamNodeFile: IsamNode = {
			isDirectory: true,
			resource: isamResFile
		};
		return isamNodeFile;
	}

	buildIsamEnvironments() {
		const isamEnvDev: IsamEnvironment = {
			name: "DEV",
			uri: "https://isamappvd01-admin.inprod.ept.lu",
			username: "myuser",
			password: "mypassword",
			type: IsamEnvironmentType.DEV
		};
		const isamEnvTest: IsamEnvironment = {
			name: "TEST",
			uri: "https://isamappvt01-admin.inprod.ept.lu",
			username: "myuser",
			password: "mypassword",
			type: IsamEnvironmentType.TEST
		};
		const isamEnvUat: IsamEnvironment = {
			name: "UAT",
			uri: "https://isamappva01-admin.inprod.ept.lu",
			username: "myuser",
			password: "mypassword",
			type: IsamEnvironmentType.UAT
		};
		const isamEnvProd: IsamEnvironment = {
			name: "PROD",
			uri: "https://isamappvp01-admin.inprod.ept.lu",
			username: "myuser",
			password: "mypassword",
			type: IsamEnvironmentType.PROD
		};

		this.isamEnvironments.push(isamEnvDev);
		this.isamEnvironments.push(isamEnvTest);
		this.isamEnvironments.push(isamEnvUat);
		this.isamEnvironments.push(isamEnvProd);
	}
}