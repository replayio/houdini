import path from 'path'
import fs from 'fs/promises'
import { compile } from 'mdsvex'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { parse } from 'node-html-parser'

// grab the list of files
export async function loadOutline() {
	// the root directory
	const routeDir = path.resolve('src', 'routes')

	// we need to build up an outline of all of the documents
	// the api sections for documents are directories with an inline or store file

	// build up an object from every directory in the routeDir
	const content = Object.fromEntries(
		await Promise.all(
			['inline', 'store'].map(async (which) => {
				return [
					which,
					Object.fromEntries(
						(
							await Promise.all(
								(await fs.readdir(routeDir)).map(async (category) => {
									const categoryDir = path.join(routeDir, category)
									// if the path is not a directory, ignore it
									if (!(await fs.lstat(categoryDir)).isDirectory()) {
										return null
									}

									/** @type {{ length: number; [key: number]: any }} */
									const list = { length: 0 }

									// look at every file in the category directory
									for (let file of await fs.readdir(categoryDir)) {
										// the file's path
										let filepath = path.join(categoryDir, file)
										if (file.startsWith('_')) {
											continue
										}

										// if the file points to a directory, we need to append which
										if ((await fs.stat(filepath)).isDirectory()) {
											filepath = path.join(filepath, which + '.svx')
											file = path.join(file, which + '.svx')
										}

										// open the contents of the file so we can extract the frontmatter
										const contents = await fs.readFile(filepath, 'utf-8')
										const { data, code } = await compile(contents, {
											rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings]
										})
										/** @type { { [key: string]: any }} */
										const metadata = data.fm
										if (typeof metadata.sidebar === 'boolean' && !metadata.sidebar) {
											continue
										}

										// parse the contents so we can extract the various headers
										const parsed = parse(code)

										// every h2 gets an entry in the timeline
										const subcategories = parsed
											.querySelectorAll('h2')
											.map((h2) => ({
												text: h2.text,
												id: h2.attributes.id
											}))
											.filter((subcat) => !subcat.text.toLowerCase().endsWith('s next?'))

										const fileName = file.split('.').slice(0, -1).join('.')

										list[metadata.index] = {
											title: metadata.title,
											slug: `/${category}/${fileName}`,
											filepath,
											subcategories
										}
									}

									// give it the appropriate length value
									list.length = Object.keys(list).length - 1

									return [category, Array.from(list)]
								})
							)
						).filter(Boolean)
					)
				]
			})
		)
	)

	// transform the keys of an object
	return Object.fromEntries(
		['inline', 'store'].map((which) => [
			which,
			Object.fromEntries(
				['intro', 'guides', 'api'].map((category) => {
					const files = content[which][category]

					return [
						category,
						{
							// pretty print the category name
							name:
								{
									intro: 'Get started',
									guides: 'Guides',
									api: 'API'
								}[category] || category,
							// set the first file as the default
							index: files[0],
							// add the prev and next references
							files: files.map((file, i) => ({
								...file,
								previous: files[i - 1],
								next: files[i + 1]
							}))
						}
					]
				})
			)
		])
	)
}
