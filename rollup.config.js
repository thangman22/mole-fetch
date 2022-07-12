import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
  input: 'src/mole-fetch.js',
  output: {
    file: 'example/public/mole-fetch.min.js',
    format: 'es',
    name: 'MoleFetch'
  },
  plugins: [nodeResolve()]
}
