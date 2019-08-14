import { IsamEnvironmentType } from "./IsamEnvironmentType";
export interface IsamEnvironment {
	type: IsamEnvironmentType;
	name: string;
	uri: string;
	username: string;
	password: string;
}
