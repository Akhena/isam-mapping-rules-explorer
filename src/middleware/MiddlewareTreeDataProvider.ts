import * as vscode from 'vscode';

import { MiddlewareTreeNode } from './MiddlewareTreeNode';
import { MiddlewareTreeModel } from './MiddlewareTreeModel';

export class MiddleWareTreeDataProvider implements vscode.TreeDataProvider<MiddlewareTreeNode> {
	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
    
	constructor(private readonly model: MiddlewareTreeModel) { }
    
    public refresh(): any {
		this._onDidChangeTreeData.fire();
    }
    
	public getTreeItem(element: MiddlewareTreeNode): vscode.TreeItem {
        // transforms MiddlewareTreeNode in TreeItem
        console.log("getTreeItem()");
        console.log(element);
		return {
			resourceUri: element.resource,
			label: element.resource.path.split("/")[element.resource.path.split("/").length - 1],
            collapsibleState: element.isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : void 0,
			command: element.isDirectory ? void 0 : {
				command: 'isamExplorer.openIsamResource',
				arguments: [element],
				title: 'Open ISAM Resource'
			}
		};
	}
	public getChildren(element?: MiddlewareTreeNode): MiddlewareTreeNode[] | Thenable<MiddlewareTreeNode[]> {
        // executed on first display for generatir root
        // executed when a treevieyNode is clicked
		console.log("TreeDataProvider.GetChildren()");
		return element ? this.model.getChildren(element) : this.model.roots;
	}
	public getParent(element: MiddlewareTreeNode): MiddlewareTreeNode | null {
        /*const parent = element.resource.with({ path: dirname(element.resource.path) });
        return parent.path !== '//' ? { resource: parent, isDirectory: true } : null;*/
		// TODO CHECK WHY getParent() is used
		console.log("GetParent()");
		return null;
	}
}
