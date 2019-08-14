import * as vscode from 'vscode';

import { IsamNode } from './IsamNode';
import { IsamModel } from './IsamModel';
export class IsamTreeDataProvider implements vscode.TreeDataProvider<IsamNode>, vscode.TextDocumentContentProvider {
	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
	constructor(private readonly model: IsamModel) { }
	public refresh(): any {
		this._onDidChangeTreeData.fire();
	}
	public getTreeItem(element: IsamNode): vscode.TreeItem {
        // transforms IsamNode in TreeItem
        console.log("getTreeItem()");
        console.log(element);
		return {
			resourceUri: vscode.Uri.parse("isam:" + element.resource.environment.uri),
			label: element.resource.name,
            collapsibleState: element.isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : void 0,
			command: element.isDirectory ? void 0 : {
				command: 'isamExplorer.openIsamResource',
				arguments: [element],
				title: 'Open ISAM Resource'
			}
		};
	}
	public getChildren(element?: IsamNode): IsamNode[] | Thenable<IsamNode[]> {
        // executed on first display for generatir root
        // executed when a treevieyNode is clicked
		console.log("IsamTreeDataProvider.GetChildren()");
		return element ? this.model.getChildren(element) : this.model.roots;
	}
	public getParent(element: IsamNode): IsamNode | null {
        /*const parent = element.resource.with({ path: dirname(element.resource.path) });
        return parent.path !== '//' ? { resource: parent, isDirectory: true } : null;*/
		// TODO CHECK WHY getParent() is used
		console.log("GetParent()");
		return null;
	}
	public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
		console.log("provideTextDocumentContent()");
		return this.model.getContent(uri).then(content => content);
	}
}
