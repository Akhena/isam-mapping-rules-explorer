import * as vscode from 'vscode';

import { Environment } from "./Environment";
import { MiddlewareTreeNode } from "./MiddlewareTreeNode";

export class MiddlewareTreeModel {
    private isamEnvironments: Environment[] = new Array();
    private datapowerEnvironments: Environment[] = new Array();

    constructor(isamEnvs: Environment[], dpEnvs: Environment[]) {
        this.isamEnvironments = this.isamEnvironments.concat(isamEnvs);
        this.datapowerEnvironments = this.datapowerEnvironments.concat(dpEnvs);
    }
    
    public get roots(): Thenable<MiddlewareTreeNode[]> {
        let mdwRootNodeArray: MiddlewareTreeNode[] = new Array();
        
        const isamNode: MiddlewareTreeNode = {
            isDirectory: true,
            resource: vscode.Uri.parse("isam:ISAM")
        };
        mdwRootNodeArray.push(isamNode);
        const dpNode: MiddlewareTreeNode = {
            isDirectory: true,
            resource: vscode.Uri.parse("isam:DATAPOWER")
        };
        mdwRootNodeArray.push(isamNode);

		return Promise.resolve(mdwRootNodeArray);
    }

    public getChildren(node: MiddlewareTreeNode): Thenable<MiddlewareTreeNode[]> {
        let childrenNodeArray: MiddlewareTreeNode[] = new Array();
        
        console.log("getChildren()");
        console.log(node);

		if (node.isDirectory) {
			switch (node.resource.path.split("/")[0].toLowerCase()) {
				case "isam":
					childrenNodeArray = childrenNodeArray.concat(this.createIsamEnvironmentsTreeNodes());
					break;
				case "datapower":
					childrenNodeArray = childrenNodeArray.concat(this.createDatapowerEnvironmentsTreeNodes());
					break;
				default:
					console.log("node.isDirectory is file");
			}
		}
		else {
			console.log("node is file");
		}
		return Promise.resolve(childrenNodeArray);
    }

    private createIsamEnvironmentsTreeNodes(): MiddlewareTreeNode[] {
        let environmentChildrenArray: MiddlewareTreeNode[] = new Array();

        this.isamEnvironments.forEach(function (env) {
            environmentChildrenArray.push({
                isDirectory: true,
                resource: vscode.Uri.parse("isam:ISAM/" + env.name)
             });
        });

		return environmentChildrenArray;        
    }

    private createDatapowerEnvironmentsTreeNodes(): MiddlewareTreeNode[] {
        let environmentChildrenArray: MiddlewareTreeNode[] = new Array();

        this.datapowerEnvironments.forEach(function (env) {
            environmentChildrenArray.push({
                isDirectory: true,
                resource: vscode.Uri.parse("isam:DATAPOWER/" + env.name)
             });
        });

		return environmentChildrenArray;        
    }
}