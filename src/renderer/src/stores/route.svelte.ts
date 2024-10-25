type Routes = "login" | "home";

type Route = {
	name: Routes;
};

export const route = $state<Route>({
	name: "login",
});
