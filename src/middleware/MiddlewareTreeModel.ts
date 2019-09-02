import * as vscode from 'vscode';

import { Environment } from "./Environment";
import { MiddlewareTreeNode } from "./MiddlewareTreeNode";
import { IsamService } from '../services/isamService';
import { DatapowerService } from '../services/datapowerService';

export class MiddlewareTreeModel {
    private isamEnvironments: Environment[] = new Array();
    private datapowerEnvironments: Environment[] = new Array();
    
    private isamService: IsamService = new IsamService();
    private datapowerService: DatapowerService = new DatapowerService();

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
        mdwRootNodeArray.push(dpNode);

        console.log("built " + mdwRootNodeArray.length + " root nodes");
        return Promise.resolve(mdwRootNodeArray);
    }

    public getChildren(node: MiddlewareTreeNode): Thenable<MiddlewareTreeNode[]> {
        let childrenNodeArray: MiddlewareTreeNode[] = new Array();

        console.log("MiddleTreeModel.getChildren() for " + (node.isDirectory ? "directory " : "file ") + node.resource.toString());

        if (node.isDirectory) {
            let splitPath = node.resource.path.split("/");
            switch (splitPath[0].toLowerCase()) {
                case "isam":
                    if (splitPath.length === 1) {
                        childrenNodeArray = childrenNodeArray.concat(this.createIsamEnvironmentsTreeNodes());
                    } else if (splitPath.length === 2) {
                        childrenNodeArray = childrenNodeArray.concat(this.createIsamFileTypesTreeNodes(node));
                    } else if (splitPath.length === 3) {
                        childrenNodeArray = childrenNodeArray.concat(this.createIsamFilesTreeNodes(node));
                    }
                    break;
                case "datapower":
                    if (splitPath.length === 1) {
                        childrenNodeArray = childrenNodeArray.concat(this.createDatapowerEnvironmentsTreeNodes());
                    } else if (splitPath.length === 2) {
                        childrenNodeArray = childrenNodeArray.concat(this.createDatapowerFileTypesTreeNodes(node));
                    }
                    break;
                default:
                    console.error("node is file");
            }
        }
        else {
            console.warn("node is file");
        }
        return Promise.resolve(childrenNodeArray);
    }
    
    private createIsamFilesTreeNodes(parentNode: MiddlewareTreeNode): MiddlewareTreeNode[] {
        let isamFilesChildrenArray: MiddlewareTreeNode[] = new Array();

        let currentEnv = this.getCurrentEnvironment(parentNode);

        let splitPath = parentNode.resource.path.split("/");
        switch (splitPath[2]) {
            case "MAPPING-RULES":
                this.isamService.getMappingRules(currentEnv).forEach(function (file) {
                    isamFilesChildrenArray.push({
                        isDirectory: false,
                        resource: vscode.Uri.parse(parentNode.resource.scheme + ":" + parentNode.resource.path + "/" + file)
                    });
                });
                break;
            case "RP-CONFIGS":
                this.isamService.getReverseProxiesList(currentEnv).forEach(function (rpConfFile) {
                    isamFilesChildrenArray.push({
                        isDirectory: false,
                        resource: vscode.Uri.parse(parentNode.resource.scheme + ":" + parentNode.resource.path + "/" + rpConfFile)
                    });
                });
                break;
        }

        return isamFilesChildrenArray;
    }

    private getCurrentEnvironment(parentNode: MiddlewareTreeNode): Environment {
        let splitPath = parentNode.resource.path.split("/");
        let foundEnv: Environment | null = null;
        let environmentsToSearch = this.isamEnvironments;

        switch (splitPath[0].toLowerCase()) {
            case "isam":
                environmentsToSearch = this.isamEnvironments;
                break;
            case "datapower":
                environmentsToSearch = this.datapowerEnvironments;
                break;
        }

        environmentsToSearch.forEach(function (env) {
            if (env.name.toLowerCase() === splitPath[1].toLowerCase()) {
                foundEnv = env;
            }
        });

        if (foundEnv !== null) {
            return foundEnv;
        } else {
            throw new Error("Unable to identify environment : " + parentNode.resource.toString);
        }
    }

    private createIsamFileTypesTreeNodes(parentNode: MiddlewareTreeNode): MiddlewareTreeNode[] {
        let isamFileTypesChildrenArray: MiddlewareTreeNode[] = new Array();

        isamFileTypesChildrenArray.push({
            isDirectory: true,
            resource: vscode.Uri.parse(parentNode.resource.scheme + ":" + parentNode.resource.path + "/MAPPING-RULES")
        });
        isamFileTypesChildrenArray.push({
            isDirectory: true,
            resource: vscode.Uri.parse(parentNode.resource.scheme + ":" + parentNode.resource.path + "/RP-CONFIGS")
        });

        return isamFileTypesChildrenArray;
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

    private createDatapowerFileTypesTreeNodes(parentNode: MiddlewareTreeNode): ConcatArray<MiddlewareTreeNode> {
        let dpFileTypesChildrenArray: MiddlewareTreeNode[] = new Array();

        this.datapowerService.getFilesystemFolders(this.getCurrentEnvironment(parentNode)).forEach(folder => {
            dpFileTypesChildrenArray.push({
                isDirectory: true,
                resource: vscode.Uri.parse(parentNode.resource.scheme + ":" + parentNode.resource.path + "/" + folder)
            });            
        });
        
        return dpFileTypesChildrenArray;
    }
}