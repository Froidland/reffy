function createRouteStore(initialValue: string) {
	let route = $state(initialValue);

	return {
		get value() {
			return route;
		},
		set(value: string) {
			route = value;
		},
	};
}

export const router = createRouteStore("login");
