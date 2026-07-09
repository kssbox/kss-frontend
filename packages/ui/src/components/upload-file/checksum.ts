
'use client'

import SparkMD5 from 'spark-md5'

// 只支持 MD5，无需类型定义

// 只返回 hex 字符串，无需 base64

// base64 相关逻辑全部移除

export const computeChecksum = async (file: Blob): Promise<string> => {
  const fileBuffer = await file.arrayBuffer()
  return SparkMD5.ArrayBuffer.hash(fileBuffer)
}
