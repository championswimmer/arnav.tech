// Allow importing parsed YAML via @rollup/plugin-yaml.
declare module '*.yaml' {
	const data: any;
	export default data;
}
