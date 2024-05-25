/* eslint-disable no-console */

import fs from 'fs/promises'
import { glob } from 'glob'
import * as prettier from 'prettier'

type Path = {
  path: string
  params?: string[]
}

const PATHS_FILE = './src/utils/nav/path-test.ts'

const readPaths = async () => {
  const pathnamesPromise = glob('./src/app/**/page.tsx')
  const pathFileContentsPromise = fs.readFile(PATHS_FILE)
  const prettierConfigPromise = prettier.resolveConfig('./prettier.config.mjs')

  const paths = await pathnamesPromise

  const tidyPaths = paths
    .map<Path | null>((path) => {
      if (path.match(/\/_[A-Za-z]+/)) {
        return null
      } else if (path === 'src/app/page.tsx') {
        return {
          path: '/',
        }
      }

      const noBoilerplate = path.replace(
        /(^src\/app)|(\/\([a-zA-Z]*\))|(\/page\.tsx)/g,
        ''
      )
      const variableMatch = Array.from(
        noBoilerplate.matchAll(/\[([a-zA-Z]+)\]/g)
      )
      if (variableMatch.length) {
        let fixedUp = noBoilerplate
        const params: string[] = []
        variableMatch.forEach(([, name]) => {
          if (name) {
            fixedUp = fixedUp.replace(`[${name}]`, `:${name}`)
            params.push(name)
          }
        })
        return {
          path: fixedUp,
          params,
        }
      }
      return {
        path: noBoilerplate,
      }
    })
    .filter(Boolean) as Path[]

  // Make a zod validator!!!

  const pathContentsBlob = await pathFileContentsPromise

  const pathContents = pathContentsBlob.toString()

  let zodPaths = ''
  for (const path of tidyPaths) {
    const params = path.params
      ? `z.object({ ${path.params
          .map((param) => `${param}: z.string()`)
          .join(', ')} })`
      : 'z.null()'

    zodPaths += `  '${path.path}': ${params}, `
  }

  const START_GEN_PATH = `/* <generated-paths> */\n`
  const END_GEN_PATH = `\n/* </generated-paths> */`

  zodPaths = `${START_GEN_PATH}${zodPaths}${END_GEN_PATH}`

  const finalPaths = pathContents.replace(
    /\/\* <generated-paths>((.|\n)*)<\/generated-paths> \*\//,
    zodPaths
  )

  const formatted = await prettier.format(finalPaths, {
    parser: 'typescript',
    ...(await prettierConfigPromise),
  })

  await fs.writeFile(PATHS_FILE, formatted)

  console.log(`Written\n\n${formatted}\n\nto ${PATHS_FILE}`)
}

readPaths().catch(console.warn)
