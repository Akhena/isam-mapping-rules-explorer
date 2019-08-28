import { Environment } from "./middleware/Environment";

export class IsamService {
    constructor() {
    }

    public getMappingRules(isamEnvironment: Environment): String[] {
        // TODO call ISAM rest api
        return ["myMappingRule.js", "myMappingRule2.js"];
    }
}