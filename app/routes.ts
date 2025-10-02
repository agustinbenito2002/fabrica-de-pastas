
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/dashboard.tsx"),
	route("home", "routes/home.tsx"),
	route("clientes", "routes/clientes.tsx"),
] satisfies RouteConfig;
