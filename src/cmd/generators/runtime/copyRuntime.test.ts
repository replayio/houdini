// external imports
import path from 'path'
import fs from 'fs/promises'
import * as typeScriptParser from 'recast/parsers/typescript'
import { ProgramKind } from 'ast-types/gen/kinds'
import * as recast from 'recast'
// local imports
import { testConfig } from '../../../common'
import '../../../../jest.setup'
import { runPipeline } from '../../generate'

test('cache index runtime imports config file - commonjs', async function () {
	const config = testConfig({ framework: 'sapper', module: 'commonjs' })
	// execute the generator
	await runPipeline(config, [])

	// open up the index file
	const fileContents = await fs.readFile(
		path.join(config.runtimeDirectory, 'cache', 'index.js'),
		'utf-8'
	)

	expect(fileContents).toBeTruthy()
	// parse the contents
	const parsedQuery: ProgramKind = recast.parse(fileContents, {
		parser: typeScriptParser,
	}).program
	// verify contents
	expect(parsedQuery).toMatchInlineSnapshot(`
		var config = require('../../../../../config.cjs');
		Object.defineProperty(exports, "__esModule", { value: true });
		const cache_1 = require("./cache");
		let cache;
		try {
		    // @ts-ignore: config will be defined by the generator
		    cache = new cache_1.Cache(config || {});
		}
		catch {
		    // @ts-ignore
		    cache = new cache_1.Cache({});
		}
		exports.default = cache;
	`)
})

test('cache index runtime imports config file - kit', async function () {
	const config = testConfig({ module: 'esm', framework: 'kit' })
	// execute the generator
	await runPipeline(config, [])

	// open up the index file
	const fileContents = await fs.readFile(
		path.join(config.runtimeDirectory, 'cache', 'index.js'),
		'utf-8'
	)
	expect(fileContents).toBeTruthy()
	// parse the contents
	const parsedQuery: ProgramKind = recast.parse(fileContents, {
		parser: typeScriptParser,
	}).program
	// verify contents
	expect(parsedQuery).toMatchInlineSnapshot(`
		import config from "../../../config.cjs"
		import { Cache } from './cache';
		let cache;
		try {
		    // @ts-ignore: config will be defined by the generator
		    cache = new Cache(config || {});
		}
		catch {
		    // @ts-ignore
		    cache = new Cache({});
		}
		export default cache;
	`)
})
