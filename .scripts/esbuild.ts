import chalk from 'chalk'
import { Command } from 'commander'
import ESBuild from 'esbuild'
import PACKAGE from '../package.json'
import { readFileSync } from 'fs'

import nodeModulesVscodeProblemsPatch from 'node-modules-vscode-problems-patch'

const PROGRAM = new Command()
PROGRAM.name('esbuild-tool')
	.option('--dev', 'Build in development mode.')
	.description('A tool for building esbuild projects.')
	.parse()
const OPTIONS = PROGRAM.opts()

if (OPTIONS.dev === true) {
	process.env.NODE_ENV = 'development'
} else {
	process.env.NODE_ENV = 'production'
}

const INFO_PLUGIN: ESBuild.Plugin = {
	name: 'infoPlugin',
	setup(build) {
		let buildStart = Date.now()

		build.onStart(() => {
			console.log('🔨 Building...')
			buildStart = Date.now()
		})

		build.onEnd(result => {
			let message = chalk.green(`✅ Built in ${Date.now() - buildStart}ms`)

			if (result.errors.length > 0) {
				const plural = result.errors.length > 1 ? 's' : ''
				message += chalk.gray(` | `) + chalk.red(result.errors.length + ' error' + plural)
			}

			if (result.warnings.length > 0) {
				const plural = result.warnings.length > 1 ? 's' : ''
				message +=
					chalk.gray(` | `) + chalk.yellow(result.warnings.length + ' warning' + plural)
			}

			console.log(message)

			if (process.env.NODE_ENV === 'development') {
				console.log(chalk.gray('👀 Watching for changes...'))
			}
		})
	},
}

function createCommentBox(text: string) {
	const lines = text.split('\n').map(v => v.trimEnd())
	const maxLength = Math.max(...lines.map(line => line.length))
	return (
		`// ╭${`─`.repeat(maxLength + 2)}╮\n` +
		lines.map(v => `// │ ${v}${' '.repeat(Math.floor(maxLength - v.length))} │`).join('\n') +
		`\n// ╰${`─`.repeat(maxLength + 2)}╯`
	)
}

function createHeader() {
	let packageJson: {
		name?: string
		version?: string
		description?: string
		author?: {
			name: string
			email?: string
			url?: string
		}
		repository: {
			url: string
		}
	}
	try {
		packageJson = JSON.parse(readFileSync('./package.json').toString())
	} catch (e) {
		console.log(chalk.red('❌ Failed to read package.json for banner generation.'))
		console.error(e)
		process.exit(1)
	}

	let license: string | undefined
	try {
		license = readFileSync('./LICENSE').toString()
	} catch {
		console.log(chalk.yellow('⚠️ No LICENSE file found.'))
	}

	let banner = '#!/usr/bin/env node\n'

	if (packageJson.name) {
		banner += `\n// ${packageJson.name}`
		if (packageJson.version) {
			banner += ` v${packageJson.version}`
		}
	}

	if (packageJson.description) {
		banner += `\n//    "${packageJson.description}"`
	}

	if (packageJson.author) {
		banner += `\n// Created by: ${packageJson.author.name}`
		if (packageJson.author.email) {
			banner += ` <${packageJson.author.email}>`
		}
		if (packageJson.author.url) {
			banner += ` (${packageJson.author.url})`
		}
	}

	if (packageJson.repository?.url) {
		banner += `\n// Source: ${packageJson.repository.url}`
	}

	if (license) {
		banner += '\n\n' + createCommentBox(license)
	}

	return { js: banner + '\n' }
}

const DEFINES: Record<string, string> = {}

Object.entries(process.env).forEach(([key, value]) => {
	if (/[^A-Za-z0-9_]/i.exec(key)) return
	DEFINES[`process.env.${key}`] = JSON.stringify(value)
})

const DEFAULT_BUILD_OPTIONS: ESBuild.BuildOptions = {
	get banner() {
		return createHeader()
	},
	entryPoints: ['./src/index.ts'],
	outfile: `./dist/${PACKAGE.name}.js`,
	bundle: true,
	minify: false,
	sourcemap: 'inline',
	platform: 'node',
	loader: {
		'.svg': 'dataurl',
		'.ttf': 'binary',
	},
	plugins: [INFO_PLUGIN, nodeModulesVscodeProblemsPatch()],
	define: DEFINES,
	treeShaking: true,
}

async function buildDev() {
	const ctx = await ESBuild.context({ ...DEFAULT_BUILD_OPTIONS })
	await ctx.watch()
}

function buildProd() {
	ESBuild.build({
		...DEFAULT_BUILD_OPTIONS,
		minify: true,
		keepNames: true,
		drop: ['debugger'],
	}).catch(() => process.exit(1))
}

async function main() {
	if (process.env.NODE_ENV === 'development') {
		await buildDev()
		return
	}
	buildProd()
}

void main()
