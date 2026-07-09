import fs from 'fs'
import path from 'path'

// 组件目录路径（可根据实际情况调整）
const COMPONENTS_DIR = path.resolve(
  __dirname,
  '../src/components/shadcn-io/dropzone'
)
// 生成的 index.ts 路径
const INDEX_FILE_PATH = path.resolve(COMPONENTS_DIR, '..', 'index.ts')

// 忽略的文件/目录（如测试文件、故事书文件等）
const IGNORE_PATTERNS = [/\.test\.tsx$/, /\.stories\.tsx$/, /^_/]

/**
 * 检查文件是否需要忽略
 */
const shouldIgnore = (filename: string): boolean => {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filename))
}

/**
 * 从文件内容中提取导出信息
 */
const extractExports = (fileContent: string, relativePath: string) => {
  const exports = {
    types: [] as string[], // 类型导出
    components: [] as string[], // 组件导出
  }

  // 匹配 export type { ... } 或 export type Name = ...
  const typeExportRegex = /export\s+type\s+(?:\{([^}]+)\}|(\w+))/g
  // 匹配 export { ... } 或 export const Name = ... 或 export default ...
  const componentExportRegex =
    /export\s+(?!type)(?:\{([^}]+)\}|(?:const|function|class)\s+(\w+)|default\s+(\w+))/g

  // 提取类型导出
  let typeMatch
  while ((typeMatch = typeExportRegex.exec(fileContent)) !== null) {
    if (typeMatch[1]) {
      // 匹配 export type { A, B }
      typeMatch[1].split(',').forEach(name => {
        const trimmed = name.trim()
        if (trimmed) exports.types.push(trimmed)
      })
    } else if (typeMatch[2]) {
      // 匹配 export type A = ...
      exports.types.push(typeMatch[2])
    }
  }

  // 提取组件导出
  let componentMatch
  while ((componentMatch = componentExportRegex.exec(fileContent)) !== null) {
    if (componentMatch[1]) {
      // 匹配 export { A, B }
      componentMatch[1].split(',').forEach(name => {
        const trimmed = name.trim()
        if (trimmed) exports.components.push(trimmed)
      })
    } else if (componentMatch[2]) {
      // 匹配 export const A = ... 或 export function A() ...
      exports.components.push(componentMatch[2])
    } else if (componentMatch[3]) {
      // 匹配 export default A
      exports.components.push(componentMatch[3])
    }
  }

  return { ...exports, relativePath }
}

/**
 * 递归扫描目录下的所有 TSX 文件
 */
const scanComponents = (
  dir: string
): Array<ReturnType<typeof extractExports>> => {
  const results: Array<ReturnType<typeof extractExports>> = []

  if (!fs.existsSync(dir)) {
    console.warn(`组件目录不存在: ${dir}`)
    return results
  }

  const files = fs.readdirSync(dir, { withFileTypes: true })

  for (const file of files) {
    const fullPath = path.join(dir, file.name)

    if (file.isDirectory()) {
      // 递归处理子目录
      results.push(...scanComponents(fullPath))
    } else if (
      file.isFile() &&
      file.name.endsWith('.tsx') &&
      !shouldIgnore(file.name)
    ) {
      // 处理 TSX 文件
      const content = fs.readFileSync(fullPath, 'utf8')
      const relativePath = path
        .relative(COMPONENTS_DIR, fullPath)
        .replace(/\\/g, '/') // 统一路径分隔符为 /
        .replace(/\.tsx$/, '') // 移除文件后缀

      results.push(extractExports(content, relativePath))
    }
  }

  return results
}

/**
 * 生成 index.ts 内容
 */
const generateIndexContent = (
  exports: Array<ReturnType<typeof extractExports>>
): string => {
  const lines: string[] = [
    '// 自动生成的组件导出文件',
    '// 请勿手动修改，如需调整请修改脚本或源文件',
    '',
  ]

  exports.forEach(({ types, components, relativePath }) => {
    const hasExports = types.length > 0 || components.length > 0
    if (!hasExports) return

    // 按类型和组件分别导出
    if (types.length > 0) {
      lines.push(
        `export type { ${types.join(', ')} } from './${relativePath}';`
      )
    }
    if (components.length > 0) {
      lines.push(
        `export { ${components.join(', ')} } from './${relativePath}';`
      )
    }
    lines.push('') // 空行分隔不同文件的导出
  })

  return lines.join('\n')
}

/**
 * 主函数
 */
const main = () => {
  try {
    console.log(`开始扫描组件目录: ${COMPONENTS_DIR}`)
    const exportsInfo = scanComponents(COMPONENTS_DIR)

    console.log(`发现 ${exportsInfo.length} 个组件文件，生成导出语句...`)
    const indexContent = generateIndexContent(exportsInfo)

    // 确保组件目录存在
    if (!fs.existsSync(COMPONENTS_DIR)) {
      fs.mkdirSync(COMPONENTS_DIR, { recursive: true })
    }

    // 写入 index.ts 文件
    fs.writeFileSync(INDEX_FILE_PATH, indexContent, 'utf8')
    console.log(`成功生成 index.ts: ${INDEX_FILE_PATH}`)
  } catch (error) {
    console.error('生成 index.ts 失败:', error)
    process.exit(1)
  }
}

// 执行主函数
main()
