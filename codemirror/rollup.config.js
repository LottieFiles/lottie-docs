import {nodeResolve} from "@rollup/plugin-node-resolve"
export default {
    input: "./editor.js",
    output: {
        file: "../docs/scripts/editor.bundle.js",
        format: "umd",
        name: "CodeMirrorWrapper",
    },
    plugins: [nodeResolve()]
}
