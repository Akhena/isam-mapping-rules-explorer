import { Environment } from "../middleware/Environment";

export class DatapowerService {
    constructor() {
    }

    public getFilesystemFolders(dpEnvironment: Environment): String[] {
        // TODO call DP rest api
        return ["certs", "local", "tmp"];
    }

}