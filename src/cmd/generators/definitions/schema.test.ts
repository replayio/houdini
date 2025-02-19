// external
import fs from 'fs/promises'
import * as graphql from 'graphql'
// local imports
import { testConfig } from '../../../common'
import '../../../../jest.setup'
import { runPipeline } from '../../generate'
import { mockCollectedDoc } from '../../testUtils'
import { CollectedGraphQLDocument } from '../../types'

const config = testConfig()

test('adds internal documents to schema', async function () {
	const docs: CollectedGraphQLDocument[] = [
		mockCollectedDoc(`query TestQuery { version }`),
		mockCollectedDoc(`fragment TestFragment on User { firstName }`),
	]

	// execute the generator
	await runPipeline(config, docs)

	// read the schema file and make sure it got the internal documents
	expect(graphql.parse(await fs.readFile(config.definitionsSchemaPath, 'utf-8')))
		.toMatchInlineSnapshot(`
		enum CachePolicy {
		  CacheAndNetwork
		  CacheOnly
		  CacheOrNetwork
		  NetworkOnly
		}

		"""
		@list is used to mark a field for the runtime as a place to add or remove
		entities in mutations
		"""
		directive @list(name: String!, connection: Boolean) on FIELD

		"""
		@paginate is used to to mark a field for pagination.
		More info in the [doc](https://www.houdinigraphql.com/guides/pagination).
		"""
		directive @paginate(name: String) on FIELD

		"""@prepend is used to tell the runtime to add the result to the end of the list"""
		directive @prepend(parentID: ID) on FRAGMENT_SPREAD

		"""@append is used to tell the runtime to add the result to the start of the list"""
		directive @append(parentID: ID) on FRAGMENT_SPREAD

		"""
		@parentID is used to provide a parentID without specifying position or in situations
		where it doesn't make sense (eg when deleting a node.)
		"""
		directive @parentID(value: ID!) on FRAGMENT_SPREAD

		"""@when is used to provide a conditional or in situations where it doesn't make sense (eg when removing or deleting a node.)"""
		directive @when on FRAGMENT_SPREAD

		"""@when_not is used to provide a conditional or in situations where it doesn't make sense (eg when removing or deleting a node.)"""
		directive @when_not on FRAGMENT_SPREAD

		"""@arguments is used to define the arguments of a fragment"""
		directive @arguments on FRAGMENT_DEFINITION

		"""@cache is used to specify cache rules for a query"""
		directive @cache(policy: CachePolicy, partial: Boolean) on QUERY

	`)
})

test('list operations are included', async function () {
	const docs: CollectedGraphQLDocument[] = [
		mockCollectedDoc(
			`query TestQuery { usersByCursor @list(name: "Friends") { edges { node { id } } } }`
		),
		mockCollectedDoc(`fragment TestFragment on User { firstName }`),
	]

	// execute the generator
	await runPipeline(config, docs)

	// read the schema file
	expect(graphql.parse(await fs.readFile(config.definitionsSchemaPath, 'utf-8')))
		.toMatchInlineSnapshot(`
		enum CachePolicy {
		  CacheAndNetwork
		  CacheOnly
		  CacheOrNetwork
		  NetworkOnly
		}

		"""
		@list is used to mark a field for the runtime as a place to add or remove
		entities in mutations
		"""
		directive @list(name: String!, connection: Boolean) on FIELD

		"""
		@paginate is used to to mark a field for pagination.
		More info in the [doc](https://www.houdinigraphql.com/guides/pagination).
		"""
		directive @paginate(name: String) on FIELD

		"""@prepend is used to tell the runtime to add the result to the end of the list"""
		directive @prepend(parentID: ID) on FRAGMENT_SPREAD

		"""@append is used to tell the runtime to add the result to the start of the list"""
		directive @append(parentID: ID) on FRAGMENT_SPREAD

		"""
		@parentID is used to provide a parentID without specifying position or in situations
		where it doesn't make sense (eg when deleting a node.)
		"""
		directive @parentID(value: ID!) on FRAGMENT_SPREAD

		"""@when is used to provide a conditional or in situations where it doesn't make sense (eg when removing or deleting a node.)"""
		directive @when on FRAGMENT_SPREAD

		"""@when_not is used to provide a conditional or in situations where it doesn't make sense (eg when removing or deleting a node.)"""
		directive @when_not on FRAGMENT_SPREAD

		"""@arguments is used to define the arguments of a fragment"""
		directive @arguments on FRAGMENT_DEFINITION

		"""@cache is used to specify cache rules for a query"""
		directive @cache(policy: CachePolicy, partial: Boolean) on QUERY

		directive @User_delete repeatable on FIELD

	`)

	// read the documents file
	expect(graphql.parse(await fs.readFile(config.definitionsDocumentsPath, 'utf-8')))
		.toMatchInlineSnapshot(`
		fragment Friends_insert on User {
		  id
		}

		fragment Friends_toggle on User {
		  id
		  id
		}

		fragment Friends_remove on User {
		  id
		}

	`)
})

test("writing twice doesn't duplicate definitions", async function () {
	const docs: CollectedGraphQLDocument[] = [
		mockCollectedDoc(`query TestQuery { version }`),
		mockCollectedDoc(`fragment TestFragment on User { firstName }`),
	]

	// execute the generator twice
	await runPipeline(config, docs)
	await runPipeline(config, docs)

	// read the schema file and make sure it got the internal documents
	expect(graphql.parse(await fs.readFile(config.definitionsSchemaPath, 'utf-8')))
		.toMatchInlineSnapshot(`
		enum CachePolicy {
		  CacheAndNetwork
		  CacheOnly
		  CacheOrNetwork
		  NetworkOnly
		}

		"""
		@list is used to mark a field for the runtime as a place to add or remove
		entities in mutations
		"""
		directive @list(name: String!, connection: Boolean) on FIELD

		"""
		@paginate is used to to mark a field for pagination.
		More info in the [doc](https://www.houdinigraphql.com/guides/pagination).
		"""
		directive @paginate(name: String) on FIELD

		"""@prepend is used to tell the runtime to add the result to the end of the list"""
		directive @prepend(parentID: ID) on FRAGMENT_SPREAD

		"""@append is used to tell the runtime to add the result to the start of the list"""
		directive @append(parentID: ID) on FRAGMENT_SPREAD

		"""
		@parentID is used to provide a parentID without specifying position or in situations
		where it doesn't make sense (eg when deleting a node.)
		"""
		directive @parentID(value: ID!) on FRAGMENT_SPREAD

		"""@when is used to provide a conditional or in situations where it doesn't make sense (eg when removing or deleting a node.)"""
		directive @when on FRAGMENT_SPREAD

		"""@when_not is used to provide a conditional or in situations where it doesn't make sense (eg when removing or deleting a node.)"""
		directive @when_not on FRAGMENT_SPREAD

		"""@arguments is used to define the arguments of a fragment"""
		directive @arguments on FRAGMENT_DEFINITION

		"""@cache is used to specify cache rules for a query"""
		directive @cache(policy: CachePolicy, partial: Boolean) on QUERY

	`)
})
