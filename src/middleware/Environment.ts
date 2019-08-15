import { EnvironmentType } from "./EnvironmentType";
export interface Environment {
	type: EnvironmentType;
	name: string;
	uri: string;
	username: string;
	password: string;
}
