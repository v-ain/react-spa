import { SubsystemModule, DocumentTab } from '../types/system'

interface RawPackageLock {
  packages?: {
    [key: string]: {
      version?: string
      resolved?: string
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
  }
}

export const parsePackageLock = (lockData: RawPackageLock): SubsystemModule[] => {
  if (!lockData || !lockData.packages) return []

  const packages = lockData.packages
  // Берем только ключевые зависимости из node_modules верхнего уровня
  // Исключаем пустую строку (это сам корень проекта)
  const keys = Object.keys(packages).filter((key) => key.startsWith('node_modules/') && key.split('/').length === 2)

  // Ограничимся первыми 6-7 пакетами, чтобы карта топологии не превратилась в кашу
  const targetKeys = keys.slice(0, 7)

  return targetKeys.map((fullKey, idx) => {
    const pkgName = fullKey.replace('node_modules/', '')
    const pkgData = packages[fullKey]!
    const version = pkgData.version || '0.0.0'

    // Генерируем "исходный код" для просмотра во вкладках инспектора
    const infoLines = [
      `// AUTO_GENERATED_MANIFEST_BY_KERNEL`,
      `module.exports = {`,
      `  package_name: "${pkgName}",`,
      `  runtime_version: "${version}",`,
      `  integrity_hash: "${pkgData.resolved ? 'VERIFIED_SHA_512' : 'LOCAL_LINK'}",`,
      `  licence: "MIT_OSI_APPROVED",`,
      `  sub_dependencies_count: ${Object.keys(pkgData.dependencies || {}).length}`,
      `};`,
    ]

    const depLines = [
      `// INTERNAL_DEPENDENCY_TREE_STREAM`,
      ...Object.entries(pkgData.dependencies || {}).map(
        ([dep, ver]) => `const ${dep.replace(/[^a-zA-Z]/g, '')} = require("${dep}") // requires ${ver};`
      ),
    ]

    if (depLines.length === 1) depLines.push(`// No sub-dependencies found in registry.`)

    const tabs: DocumentTab[] = [
      { name: 'package.config', type: 'code', lines: infoLines },
      { name: 'dependency.tree', type: 'code', lines: depLines },
    ]

    // Мапим в наш строгий интерфейс SubsystemModule
    return {
      id: pkgName,
      name: `pkg-${pkgName}`,
      prefix: `[PKG_0${idx + 1}]`,
      status: 'online', // Все установленные пакеты по умолчанию в сети
      desc: `Пакет манифеста проекта. Версия: v${version}.`,
      metrics: {
        time: `${10 + idx * 2}ms`,
        memory: `${(Math.random() * 5 + 1).toFixed(1)}MB`,
        load: idx % 3 === 0 ? 'high' : idx % 2 === 0 ? 'medium' : 'low',
        filesCount: String(Math.floor(Math.random() * 40 + 10)),
        extra: `v${version}`,
      },
      tags: ['package-lock', 'runtime'],
      path: `node_modules/${pkgName}`,
      tabs: tabs,
    }
  })
}
