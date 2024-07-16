import { is } from "@electron-toolkit/utils";

export function debug(message?: any, ...optionalParams: any[]): void {
	if (!is.dev) {
		return;
	}

	console.log(message, ...optionalParams);
}
