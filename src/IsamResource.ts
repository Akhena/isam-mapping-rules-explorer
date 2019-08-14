import * as vscode from 'vscode';
import { IsamResourceType } from "./IsamResourceType";
import { IsamEnvironment } from "./IsamEnvironment";
export interface IsamResource {
	environment: IsamEnvironment;
	type: IsamResourceType;
	name: string;
	path: string;
	uri: vscode.Uri;
}
