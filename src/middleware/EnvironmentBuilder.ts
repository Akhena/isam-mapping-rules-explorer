import { Environment } from "./Environment";
import { EnvironmentType } from "./EnvironmentType";

export class EnvironmentBuilder {
    buildIsamEnvironments(): Environment[] {
        var isamEnvironments: Environment[] = new Array();

		const isamEnvDev: Environment = {
			name: "DEV",
			uri: "https://isamappvd01-admin.inprod.ept.lu",
			username: "myuser",
			password: "mypassword",
			type: EnvironmentType.DEV
		};
		const isamEnvTest: Environment = {
			name: "TEST",
			uri: "https://isamappvt01-admin.inprod.ept.lu",
			username: "myuser",
			password: "mypassword",
			type: EnvironmentType.TEST
		};
		const isamEnvUat: Environment = {
			name: "UAT",
			uri: "https://isamappva01-admin.inprod.ept.lu",
			username: "myuser",
			password: "mypassword",
			type: EnvironmentType.UAT
		};
		const isamEnvProd: Environment = {
			name: "PROD",
			uri: "https://isamappvp01-admin.inprod.ept.lu",
			username: "myuser",
			password: "mypassword",
			type: EnvironmentType.PROD
		};

		isamEnvironments.push(isamEnvDev);
		isamEnvironments.push(isamEnvTest);
		isamEnvironments.push(isamEnvUat);
        isamEnvironments.push(isamEnvProd);
        
        return isamEnvironments;
    }
    
    buildDatapowerGwEnvironments(): Environment[] {
        var datapowerGwEnvironments: Environment[] = new Array();

		const datapowerGwEnvDev: Environment = {
			name: "DEV GW",
			uri: "https://dpfegwd01-admin.inprod.ept.lu:9090",
			username: "myuser",
			password: "mypassword",
			type: EnvironmentType.DEV
        };
		const datapowerGwEnvTest: Environment = {
			name: "TST GW",
			uri: "https://dpfegwt01-admin.inprod.ept.lu:9090",
			username: "myuser",
			password: "mypassword",
			type: EnvironmentType.TEST
        };
		const datapowerGwEnvUat: Environment = {
			name: "UAT GW",
			uri: "https://dpfegwt11-admin.inprod.ept.lu:9090",
			username: "myuser",
			password: "mypassword",
			type: EnvironmentType.UAT
		};
		const datapowerGwEnvProd: Environment = {
			name: "PROD",
			uri: "https://dpfegwp11-admin.inprod.ept.lu:9090",
			username: "myuser",
			password: "mypassword",
			type: EnvironmentType.PROD
		};

		datapowerGwEnvironments.push(datapowerGwEnvDev);
		datapowerGwEnvironments.push(datapowerGwEnvTest);
		datapowerGwEnvironments.push(datapowerGwEnvUat);
        datapowerGwEnvironments.push(datapowerGwEnvProd);
        
        return datapowerGwEnvironments;
	}
}