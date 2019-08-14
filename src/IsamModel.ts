import * as vscode from 'vscode';
import { basename } from 'path';
import { IsamNode } from './IsamNode';
import { IsamResource } from './IsamResource';
import { IsamEnvironment } from './IsamEnvironment';
import { IsamResourceType } from './IsamResourceType';
export class IsamModel {
	private nodes: Map<string, IsamNode> = new Map<string, IsamNode>();
	private isamEnvironments: IsamEnvironment[] = new Array();
	constructor(envs: IsamEnvironment[]) {
		this.isamEnvironments = this.isamEnvironments.concat(envs);
	}
	public get roots(): Thenable<IsamNode[]> {
        console.log("IsamModel.roots()");
		let isamRootNodeArray: IsamNode[] = new Array();
		for (let entry of this.isamEnvironments) {
			const isamResource: IsamResource = {
				environment: entry,
				name: entry.name,
				path: entry.uri,
				type: IsamResourceType.ENVIRONMENT,
                uri: vscode.Uri.parse("isam:" + entry.uri)
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
        console.log("getChildren()");
        console.log(node);
		if (node.isDirectory) {
			switch (node.resource.type) {
				case IsamResourceType.ENVIRONMENT:
					isamChildrenNodeArray = isamChildrenNodeArray.concat(this.buildEnvironmentChildrenNodeArray(node.resource));
					break;
				case IsamResourceType.MAPPING_RULES:
					isamChildrenNodeArray = isamChildrenNodeArray.concat(this.buidMappingRulesChildrenNodeArray(node.resource));
					break;
				default:
					console.log("node.isDirectory is file");
			}
		}
		else {
			console.log("node is file");
		}
		return Promise.resolve(isamChildrenNodeArray);
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
		console.log("getContent() TODO go fetch file");
		console.log(resource);
		return Promise.resolve("var a='this is some JS'; \n\rconsole.log('i m out');");
	}
    
	buildEnvironmentChildrenNodeArray(resource: IsamResource): IsamNode[] {
		let isamEnvironmentChildrenArray: IsamNode[] = new Array();
		const isamResMappingRules: IsamResource = {
			environment: resource.environment,
			name: IsamResourceType[IsamResourceType.MAPPING_RULES],
			path: resource.path,
            type: IsamResourceType.MAPPING_RULES,
            uri: vscode.Uri.parse("isam:" + resource.path)
		};
		const isamNodeMappingRules: IsamNode = {
			isDirectory: true,
			resource: isamResMappingRules
		};
		const isamResReverseProxies: IsamResource = {
			environment: resource.environment,
			name: IsamResourceType[IsamResourceType.REVERSE_PROXIES],
			path: resource.path,
			type: IsamResourceType.REVERSE_PROXIES,
            uri: vscode.Uri.parse("isam:" + resource.path)
		};
		const isamNodeReverseProxies: IsamNode = {
			isDirectory: true,
			resource: isamResReverseProxies
		};
		isamEnvironmentChildrenArray.push(isamNodeMappingRules, isamNodeReverseProxies);
		return isamEnvironmentChildrenArray;
	}
	buidMappingRulesChildrenNodeArray(resource: IsamResource): IsamNode[] {
		let isamNodeMappingRulesForEnv: IsamNode[] = new Array();
		// Get mappingrules for enviroment
		const isamResMappingRulesForEnv: IsamResource = {
			environment: resource.environment,
			name: "OauthPostToken.json",
            path: resource.path,
            uri: vscode.Uri.parse("isam:" + resource.path),
			type: IsamResourceType.FILE
		};
		const isamNodeMappingRuleForEnv: IsamNode = {
			isDirectory: false,
			resource: isamResMappingRulesForEnv
		};
		isamNodeMappingRulesForEnv.push(isamNodeMappingRuleForEnv);
		return isamNodeMappingRulesForEnv;
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
}
