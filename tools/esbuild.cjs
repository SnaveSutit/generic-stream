/// <reference types="esbuild"/>

const fs = require('fs')
const esbuild = require('esbuild')
const PACKAGE = require('../package.json')

let infoPlugin = {
	name: 'infoPlugin',
	/**
	 *
	 * @param {esbuild.PluginBuild} build
	 */
	setup(build) {
		let start = Date.now()
		build.onStart(() => {
			console.log('\u{1F528} Building...')
			start = Date.now()
		})

		build.onEnd((result) => {
			let end = Date.now()
			const diff = end - start
			console.log(
				`\u{2705} Build completed in ${diff}ms with ${result.warnings.length} warnings and ${result.errors.length} errors.`
			)
		})
	},
}

function createBanner(dev) {
	const LICENSE = fs.readFileSync('./LICENSE').toString()

	let lines = [
		`[ ${PACKAGE.title} ]`,
		`${PACKAGE.description}`,
		`Created by ${PACKAGE.author.name}`,
		`(${PACKAGE.author.email}) [${PACKAGE.author.url}]`,
		``,
		`[ SOURCE ]`,
		`${PACKAGE.repository.url}`,
		``,
		`[ LICENSE ]`,
		...LICENSE.split('\n').map((v) => v.trim()),
	]

	let maxLength = JSON.parse(JSON.stringify(lines)).sort(
		(a, b) => b.length - a.length
	)[0].length
	const leftBuffer = Math.floor(maxLength / 2)
	const rightBuffer = Math.ceil(maxLength / 2)

	let header = `-`.repeat(maxLength + 4)
	let footer = `-`.repeat(maxLength + 4)

	lines = lines.map((v) => {
		const div = v.length / 2
		const l = Math.floor(leftBuffer - div)
		const r = Math.ceil(rightBuffer - div)
		return '| ' + ' '.repeat(l) + v + ' '.repeat(r) + ' |'
	})

	let banner =
		'\n' +
		[header, ...lines, footer].map((v) => `// ${v}`).join('\n') +
		'\n'

	return {
		js: banner,
	}
}

async function buildDev() {
	const ctx = await esbuild.context({
		entryPoints: ['./src/index.ts'],
		outfile: `./dist/index.js`,
		bundle: true,
		minify: false,
		platform: 'node',
		sourcemap: true,
		plugins: [infoPlugin],
		format: 'esm',
		packages: 'external',
	})
	await ctx.watch()
}

function buildProd() {
	esbuild.build({
		entryPoints: ['./src/index.ts'],
		outfile: `./dist/index.js`,
		bundle: true,
		minify: true,
		platform: 'node',
		sourcemap: false,
		plugins: [infoPlugin],
		banner: createBanner(),
		drop: ['debugger'],
		packages: 'external',
		format: 'esm',
	})
}

async function main() {
	if (process.argv.includes('--dev')) {
		await buildDev()
		return
	}
	buildProd()
}

main()
