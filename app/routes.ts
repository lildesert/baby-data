import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home/_home.tsx"),
  route("healthcheck", "routes/healthcheck.tsx"),
] satisfies RouteConfig;
