import * as vscode from 'vscode';
import { basename, dirname, join } from 'path';
import { IsamService } from './isamService';

interface IEntry {
	name: string;
	type: string;
}

export interface IsamNode {

	resource: IsamResource;
	isDirectory: boolean;

}

export interface IsamResource {
	environment: IsamEnvironment;
	type: IsamResourceType;
	name: string;
	path: string;
}

export interface IsamEnvironment {
	type: IsamEnvironmentType;
	name: string;
	uri: string;
	username: string;
	password: string;
}

export enum IsamResourceType {
	ENVIRONMENT,
	REVERSE_PROXIES,
	MAPPING_RULES,
	FILE
}

export enum IsamEnvironmentType {
	DEV,
	TEST,
	UAT,
	PROD
}

export class IsamModel {

	private nodes: Map<string, IsamNode> = new Map<string, IsamNode>();
	private isamEnvironments: IsamEnvironment[] = new Array();

	constructor(envs: IsamEnvironment[]) {
		this.isamEnvironments = this.isamEnvironments.concat(envs);
	}
	
	public get roots(): Thenable<IsamNode[]> {
		let isamRootNodeArray: IsamNode[] = new Array();

		for (let entry of this.isamEnvironments) {
			const isamResource: IsamResource = {
				environment: entry,
				name: entry.name,
				path: entry.uri,
				type: IsamResourceType.ENVIRONMENT
			};
			const isamNode: IsamNode = {
				isDirectory: true,
				resource: isamResource
			};
			isamRootNodeArray.push(isamNode);
		}

		return Promise.resolve(isamRootNodeArray);
	}

	public getChildren(node: IsamNode): Thenable<IsamNode[]> {
		/*return this.connect().then(client => {
			return new Promise((c, e) => {
				client.list(node.resource.fsPath, (err, list) => {
					if (err) {
						return e(err);
					}

					client.end();

					return c(this.sort(list.map(entry => ({ resource: vscode.Uri.parse(`${node.resource.fsPath}/${entry.name}`), isDirectory: entry.type === 'd' }))));
				});
			});
		});*/
		let isamChildrenNodeArray: IsamNode[] = new Array();

		console.debug(node);
		if(node.isDirectory) {
			switch(node.resource.type) {
				case IsamResourceType.ENVIRONMENT:
						isamChildrenNodeArray = isamChildrenNodeArray.concat(this.buildEnvironmentChildrenNodeArray(node.resource));
					break;
			}
		}

		return Promise.resolve(isamChildrenNodeArray);
	}
	buildEnvironmentChildrenNodeArray(resource: IsamResource): IsamNode[] {
		let isamEnvironmentChildrenArray: IsamNode[] = new Array();

			const isamResMappingRules: IsamResource = {
				environment: resource.environment,
				name: IsamResourceType[IsamResourceType.MAPPING_RULES],				
				path: resource.path,
				type: IsamResourceType.MAPPING_RULES
			};
			const isamNodeMappingRules: IsamNode = {
				isDirectory: true,
				resource: isamResMappingRules
			};
			const isamResReverseProxies: IsamResource = {
				environment: resource.environment,
				name: IsamResourceType[IsamResourceType.REVERSE_PROXIES],
				path: resource.path,
				type: IsamResourceType.REVERSE_PROXIES
			};
			const isamNodeReverseProxies: IsamNode = {
				isDirectory: true,
				resource: isamResReverseProxies
			};
			isamEnvironmentChildrenArray.push(isamNodeMappingRules, isamNodeReverseProxies);


		return isamEnvironmentChildrenArray;
	}


	private sort(nodes: IsamNode[]): IsamNode[] {
		return nodes.sort((n1, n2) => {
			if (n1.isDirectory && !n2.isDirectory) {
				return -1;
			}

			if (!n1.isDirectory && n2.isDirectory) {
				return 1;
			}

			return basename(n1.resource.name).localeCompare(basename(n2.resource.name));
		});
	}

	public getContent(resource: vscode.Uri): Thenable<string> {
		/*return this.connect().then(client => {
			return new Promise((c, e) => {
				client.get(resource.path.substr(2), (err, stream) => {
					if (err) {
						return e(err);
					}

					let string = '';
					stream.on('data', function (buffer) {
						if (buffer) {
							var part = buffer.toString();
							string += part;
						}
					});

					stream.on('end', function () {
						client.end();
						c(string);
					});
				});
			});
		});*/
		return Promise.resolve("var a='this is some JS'; \n\rconsole.log('i m out');");
	}
}

export class IsamTreeDataProvider implements vscode.TreeDataProvider<IsamNode>, vscode.TextDocumentContentProvider {

	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

	constructor(private readonly model: IsamModel) { }

	public refresh(): any {
		this._onDidChangeTreeData.fire();
	}


	public getTreeItem(element: IsamNode): vscode.TreeItem {
		return {
			//resourceUri: element.resource.environment.uri,
			label: element.resource.name,
			collapsibleState: element.isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : void 0,
			command: element.isDirectory ? void 0 : {
				command: 'isamExplorer.openIsamResource',
				arguments: [element.resource],
				title: 'Open ISAM Resource'
			}
		};
	}

	public getChildren(element?: IsamNode): IsamNode[] | Thenable<IsamNode[]> {
		return element ? this.model.getChildren(element) : this.model.roots;
	}

	public getParent(element: IsamNode): IsamNode | null {
		/*const parent = element.resource.with({ path: dirname(element.resource.path) });
		return parent.path !== '//' ? { resource: parent, isDirectory: true } : null;*/
		// TODO CHECK WHY getParent() is used
		return null;
	}

	public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
		return this.model.getContent(uri).then(content => content);
	}
}

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

	private openResource(resource: vscode.Uri): void {
		vscode.window.showTextDocument(resource);
	}

	private reveal(): Thenable<void> | null {
		const node = this.getNode();
		if (node) {
			return this.isamViewer.reveal(node);
		}
		return null;
	}

	private getNode(): IsamNode | null {
		if (vscode.window.activeTextEditor) {
			if (vscode.window.activeTextEditor.document.uri.scheme === 'isam') {
				
				return this.buildIsamFileNode(vscode.window.activeTextEditor.document.uri);
			}
		}
		return null;
	}
	buildIsamFileNode(uri: vscode.Uri): IsamNode | null {
		let index: number = this.isamEnvironments.findIndex(env => env.type === IsamEnvironmentType.DEV);
				
		const isamResFile: IsamResource = {
			environment: this.isamEnvironments[index], // TODO find a way to dynamically figure out the correct environment. check uri against all know environments?
			name: IsamResourceType.MAPPING_RULES.toString(),				
			path: uri.toString(),
			type: IsamResourceType.MAPPING_RULES
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