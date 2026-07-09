# i18n 详细实现文档

本文档是 `i18n.md` 的补充，提供更详细的实现代码、示例和最佳实践。

## 目录

1. [核心 i18n 工具库](#1-核心-i18n-工具库)
2. [全局 i18n 实例管理](#2-全局-i18n-实例管理)
3. [HTTP 拦截器统一处理](#3-http-拦截器统一处理)
4. [React Context 集成](#4-react-context-集成)
5. [组件示例](#5-组件示例)
6. [完整工作流示例](#6-完整工作流示例)
7. [测试](#7-测试)
8. [最佳实践](#8-最佳实践)

---

## 1. 核心 i18n 工具库

### 1.1 完整实现 (packages/i18n/src/index.ts)

```typescript
// packages/i18n/src/index.ts
import en from "../lang/en.json";
import zh from "../lang/zh.json";

export type Lang = "en" | "zh";

interface Catalog {
  [key: string]: any;
}

const catalogs: Record<Lang, Catalog> = {
  en: en as Catalog,
  zh: zh as Catalog,
};

/**
 * 通过点分隔的路径访问嵌套对象
 * 示例: getByPath({ button: { submit: "提交" } }, "button.submit") → "提交"
 */
export function getByPath(obj: any, path: string): any {
  const keys = path.split(".");
  let value = obj;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return undefined;
  }
  return value;
}

/**
 * 从服务端 msg 中提取参数值
 * 示例: "File {document.txt} Not Found {2024-06-01}" → ["document.txt", "2024-06-01"]
 */
export function extractParams(msg: string): string[] {
  const pattern = /\{([^}]+)\}/g;
  const params: string[] = [];
  let match: RegExpExecArray | null;
  
  while ((match = pattern.exec(msg)) !== null) {
    params.push(match[1]);
  }
  
  return params;
}

/**
 * 按位置将参数值替换到模板中
 * 示例: ("文件 {filename} 不存在", ["document.txt"]) → "文件 document.txt 不存在"
 */
export function replaceByPosition(template: string, params: string[]): string {
  let index = 0;
  
  const result = template.replace(/\{([^}]+)\}/g, (match, varName) => {
    if (index >= params.length) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[i18n] 参数不足: 模板需要变量 "${varName}"，但只提供了 ${params.length} 个参数`,
          { template, params }
        );
      }
      return match; // 保留原样
    }
    return params[index++];
  });
  
  if (index < params.length && process.env.NODE_ENV === "development") {
    console.warn(
      `[i18n] 参数过多: 提供了 ${params.length} 个参数，但模板只需要 ${index} 个`,
      { template, params }
    );
  }
  
  return result;
}

/**
 * UI 文案中的命名参数替换
 * 示例: ("共 {total} 条", { total: "42" }) → "共 42 条"
 */
export function replaceByName(template: string, params: Record<string, string>): string {
  return template.replace(/\{([^}]+)\}/g, (match, varName) => {
    if (varName in params) {
      return params[varName];
    }
    if (process.env.NODE_ENV === "development") {
      console.warn(`[i18n] 参数 "${varName}" 未提供`, { template, params });
    }
    return match;
  });
}

/**
 * 创建 i18n 实例
 */
export function createI18n(lang: Lang = "en") {
  const currentCatalog = catalogs[lang];
  const fallbackCatalog = catalogs.en;
  
  /**
   * 统一的翻译函数
   */
  function t(key: string, paramsOrMsg?: Record<string, string> | string): string {
    // 1. 查找翻译模板
    let template = getByPath(currentCatalog, key);
    
    if (!template && lang !== "en") {
      template = getByPath(fallbackCatalog, key);
      if (template && process.env.NODE_ENV === "development") {
        console.warn(`[i18n] 键 "${key}" 在 ${lang} 中未找到，使用英文`);
      }
    }
    
    // 2. 判断调用方式
    if (typeof paramsOrMsg === "string") {
      // API 错误模式: t("code.FILE_NOT_FOUND", "File {doc.txt} Not Found")
      if (!template) {
        // 未找到翻译，直接返回服务端 msg
        if (process.env.NODE_ENV === "development") {
          console.warn(`[i18n] API code "${key}" 未找到翻译，使用原始 msg`);
        }
        return paramsOrMsg;
      }
      // 从 msg 中提取参数值，按位置替换到模板
      const params = extractParams(paramsOrMsg);
      return replaceByPosition(template, params);
    } else {
      // UI 文案模式: t("button.submit") 或 t("table.total", { total: "42" })
      if (!template) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[i18n] 翻译键 "${key}" 未找到`);
        }
        return key;
      }
      if (!paramsOrMsg) return template;
      return replaceByName(template, paramsOrMsg);
    }
  }
  
  return { t, lang };
}

export type I18n = ReturnType<typeof createI18n>;
```

### 1.2 TypeScript 类型定义

```typescript
// packages/i18n/src/types.ts
export type Lang = "en" | "zh";

export interface I18n {
  t(key: string, paramsOrMsg?: Record<string, string> | string): string;
  lang: Lang;
}

export interface TranslationKeys {
  // UI 文案
  button: {
    submit: string;
    cancel: string;
    confirm: string;
    delete: string;
  };
  form: {
    email: {
      label: string;
      placeholder: string;
      error: {
        required: string;
        invalid: string;
      };
    };
  };
  // API 错误码
  code: {
    FILE_NOT_FOUND: string;
    FILE_TOO_LARGE: string;
    INVALID_TOKEN: string;
    // ...更多错误码
  };
}
```

## 2. 全局 i18n 实例管理

### 2.1 创建全局实例 (utils/i18n.ts)

```typescript
// utils/i18n.ts
import { createI18n, Lang, I18n } from "@kssbox/i18n";

// 创建全局实例
let globalI18n: I18n = createI18n("en");

/**
 * 获取全局 i18n 实例（用于 HTTP 拦截器等非 React 环境）
 */
export function getGlobalI18n(): I18n {
  return globalI18n;
}

/**
 * 设置全局语言
 */
export function setGlobalLang(lang: Lang): void {
  globalI18n = createI18n(lang);
}

/**
 * 获取当前语言
 */
export function getCurrentLang(): Lang {
  return globalI18n.lang;
}
```

## 3. HTTP 拦截器统一处理

### 3.1 Axios 拦截器实现

```typescript
// utils/request.ts
import axios from "axios";
import { toast } from "sonner";
import { getGlobalI18n } from "./i18n";

/**
 * 创建 axios 实例
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 请求拦截器
 */
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证 token
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 统一处理错误翻译
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { t } = getGlobalI18n();
    
    // 1. 提取错误信息
    const code = error.response?.data?.code;
    const msg = error.response?.data?.msg || error.response?.data?.message;
    const status = error.response?.status;
    
    // 2. 优先使用 code 进行翻译
    if (code && msg) {
      const translatedMsg = t(`code.${code}`, msg);
      toast.error(translatedMsg);
      
      // 将翻译后的消息附加到 error 对象
      error.translatedMessage = translatedMsg;
    } 
    // 3. 尝试使用 HTTP 状态码翻译
    else if (status) {
      const translatedMsg = t(`code.${status}`, msg || `HTTP ${status}`);
      toast.error(translatedMsg);
      error.translatedMessage = translatedMsg;
    } 
    // 4. 网络错误
    else if (error.message === "Network Error" || !navigator.onLine) {
      const networkMsg = t("message.error.networkError");
      toast.error(networkMsg);
      error.translatedMessage = networkMsg;
    } 
    // 5. 超时错误
    else if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      const timeoutMsg = t("code.TIMEOUT", "Request timeout");
      toast.error(timeoutMsg);
      error.translatedMessage = timeoutMsg;
    } 
    // 6. 兜底处理
    else {
      const fallbackMsg = msg || error.message || t("message.error.unknown");
      toast.error(fallbackMsg);
      error.translatedMessage = fallbackMsg;
    }
    
    return Promise.reject(error);
  }
);

/**
 * 请求封装（带类型）
 */
export async function request<T = any>(config: any): Promise<T> {
  const response = await apiClient.request(config);
  return response.data;
}

export default apiClient;
```

### 3.2 Fetch 封装版本

```typescript
// utils/fetch.ts
import { getGlobalI18n } from "./i18n";
import { toast } from "sonner";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * 统一的 fetch 封装
 */
export async function fetchAPI<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { t } = getGlobalI18n();
  const { params, ...fetchOptions } = options;
  
  // 构建 URL
  let finalUrl = url;
  if (params) {
    const query = new URLSearchParams(params).toString();
    finalUrl = `${url}?${query}`;
  }
  
  // 添加默认 headers
  const headers = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };
  
  // 添加 token
  const token = localStorage.getItem("auth_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(finalUrl, {
      ...fetchOptions,
      headers,
    });
    
    // 解析 JSON
    const data = await response.json();
    
    // 检查业务错误
    if (!response.ok || data.code !== "200") {
      const code = data.code;
      const msg = data.msg || data.message;
      
      if (code && msg) {
        const translatedMsg = t(`code.${code}`, msg);
        toast.error(translatedMsg);
        throw new Error(translatedMsg);
      } else {
        const statusMsg = t(`code.${response.status}`, `HTTP ${response.status}`);
        toast.error(statusMsg);
        throw new Error(statusMsg);
      }
    }
    
    return data.data || data;
  } catch (error: any) {
    // 网络错误
    if (!navigator.onLine) {
      const networkMsg = t("message.error.networkError");
      toast.error(networkMsg);
      throw new Error(networkMsg);
    }
    
    // 重新抛出已处理的错误
    throw error;
  }
}
```

## 4. React Context 集成

### 4.1 I18n Context Provider

```typescript
// contexts/I18nContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createI18n, Lang, I18n } from "@kssbox/i18n";
import { setGlobalLang } from "@/utils/i18n";

interface I18nContextValue {
  i18n: I18n;
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "app_lang";

export function I18nProvider({ 
  children, 
  defaultLang = "en" 
}: { 
  children: ReactNode; 
  defaultLang?: Lang;
}) {
  // 1. 从 localStorage 读取保存的语言偏好
  const getInitialLang = (): Lang => {
    if (typeof window === "undefined") return defaultLang;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") return stored;
    
    // 2. 尝试从浏览器语言推断
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("zh")) return "zh";
    return "en";
  };
  
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const [i18n, setI18n] = useState(() => createI18n(lang));
  
  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    
    // 创建新的 i18n 实例
    const newI18n = createI18n(newLang);
    setI18n(newI18n);
    
    // 同步更新全局实例（用于 HTTP 拦截器）
    setGlobalLang(newLang);
    
    // 3. 持久化到 localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLang);
      
      // 4. 更新 html lang 属性（利于 SEO 和辅助技术）
      document.documentElement.lang = newLang;
    }
  };
  
  // 5. 初始化时设置 html lang 和全局实例
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = lang;
      setGlobalLang(lang);
    }
  }, [lang]);
  
  return (
    <I18nContext.Provider value={{ i18n, lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
```

### 4.2 在 App 中使用

```typescript
// app/layout.tsx (Next.js App Router)
import { I18nProvider } from "@/contexts/I18nContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <I18nProvider defaultLang="en">
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

```typescript
// main.tsx (Vite + React)
import { I18nProvider } from "@/contexts/I18nContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider defaultLang="en">
      <App />
    </I18nProvider>
  </React.StrictMode>
);
```

## 5. 组件示例

### 5.1 语言切换器

```typescript
// components/LanguageSwitcher.tsx
import { useI18n } from "@/contexts/I18nContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const languages = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
] as const;

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  
  return (
    <Select value={lang} onValueChange={(value) => setLang(value as "en" | "zh")}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>
          {languages.find((l) => l.value === lang)?.flag}{" "}
          {languages.find((l) => l.value === lang)?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.value} value={language.value}>
            {language.flag} {language.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### 5.2 登录表单

```typescript
// components/LoginForm.tsx
import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { login } from "@/services/authService";
import { Button, Input, Label } from "@/components/ui";
import { toast } from "sonner";

export function LoginForm() {
  const { i18n } = useI18n();
  const { t } = i18n;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = t("form.email.error.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("form.email.error.invalid");
    }
    
    if (!password) {
      newErrors.password = t("form.password.error.required");
    } else if (password.length < 8) {
      newErrors.password = t("form.password.error.minLength");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await login({ email, password });
      toast.success(t("message.success.loggedIn"));
      // 跳转到首页等
    } catch (error) {
      // HTTP 拦截器已经统一处理了错误翻译和 toast
      // 这里只需要处理业务逻辑（如清理密码输入）
      setPassword("");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold">{t("title.login")}</h1>
      
      <div>
        <Label htmlFor="email">{t("form.email.label")}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("form.email.placeholder")}
          className={errors.email ? "border-red-500" : ""}
          disabled={loading}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="password">{t("form.password.label")}</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("form.password.placeholder")}
          className={errors.password ? "border-red-500" : ""}
          disabled={loading}
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password}</p>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? t("button.loading") : t("button.submit")}
        </Button>
        <Button type="button" variant="outline" disabled={loading}>
          {t("button.cancel")}
        </Button>
      </div>
    </form>
  );
}
```

### 5.3 文件上传组件

```typescript
// components/FileUpload.tsx
import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { uploadFile } from "@/services/fileService";
import { Button, Progress } from "@/components/ui";
import { toast } from "sonner";

export function FileUpload() {
  const { i18n } = useI18n();
  const { t } = i18n;
  
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProgress(0);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    try {
      await uploadFile(file, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percent);
        },
      });
      
      toast.success(t("message.success.uploaded"));
      setFile(null);
      setProgress(0);
    } catch (error: any) {
      // HTTP 拦截器已经统一处理了错误翻译
      // 服务端可能返回：
      // { code: "FILE_TOO_LARGE", msg: "File {document.pdf} Exceeds {10MB}" }
      // 拦截器自动调用：t("code.FILE_TOO_LARGE", msg) → "文件 document.pdf 超过最大限制 10MB"
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full"
        />
      </div>
      
      {file && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {t("file.selected")}: {file.name}
          </p>
          
          {uploading && (
            <div>
              <Progress value={progress} />
              <p className="text-sm text-center mt-1">{progress}%</p>
            </div>
          )}
          
          <Button
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? t("button.uploading") : t("button.upload")}
          </Button>
        </div>
      )}
    </div>
  );
}
```

## 6. 完整工作流示例

### 6.1 添加新错误码的完整流程

**步骤 1**：后端定义错误码

```go
// backend/config/errcode.go
const (
    CodeQuotaExceeded ErrorCode = "QUOTA_EXCEEDED"
)
```

**步骤 2**：后端添加消息模板

```go
// backend/utils/response_util.go
templates := map[config.ErrorCode]string{
    // ...
    config.CodeQuotaExceeded: "Usage quota %s exceeded: %s / %s",
}
```

**步骤 3**：前端添加翻译

```json
// packages/i18n/lang/en.json
{
  "code": {
    "QUOTA_EXCEEDED": "Usage quota {quotaType} exceeded: {used} / {limit}"
  }
}

// packages/i18n/lang/zh.json
{
  "code": {
    "QUOTA_EXCEEDED": "{quotaType} 配额已超限：{used} / {limit}"
  }
}
```

**步骤 4**：后端返回错误

```go
utils.ResponseError(c,
    utils.NewApiError(
        config.CodeQuotaExceeded,
        "storage",
        "2.5GB",
        "2GB",
    ),
    http.StatusForbidden,
)
// 返回: { code: "QUOTA_EXCEEDED", msg: "Usage quota {storage} exceeded: {2.5GB} / {2GB}" }
```

**步骤 5**：HTTP 拦截器自动处理

```typescript
// 拦截器自动调用：
t("code.QUOTA_EXCEEDED", "Usage quota {storage} exceeded: {2.5GB} / {2GB}")

// 中文显示: "storage 配额已超限：2.5GB / 2GB"
// 英文显示: "Usage quota storage exceeded: 2.5GB / 2GB"
```

**步骤 6**：业务代码无需修改

```typescript
try {
  await uploadFile(file);
  toast.success(t("message.success.uploaded"));
} catch (error) {
  // 拦截器已自动显示翻译后的错误
}
```

## 7. 测试

### 7.1 单元测试

```typescript
// packages/i18n/src/index.test.ts
import { describe, it, expect } from "vitest";
import { extractParams, replaceByPosition, replaceByName, getByPath, createI18n } from "./index";

describe("extractParams", () => {
  it("应该正确提取参数", () => {
    expect(extractParams("File {document.txt} Not Found {2024-06-01}")).toEqual([
      "document.txt",
      "2024-06-01",
    ]);
  });
  
  it("应该处理无参数的情况", () => {
    expect(extractParams("Service unavailable")).toEqual([]);
  });
});

describe("replaceByPosition", () => {
  it("应该按位置替换参数", () => {
    const result = replaceByPosition(
      "文件 {filename} 没有找到 {timestamp}",
      ["document.txt", "2024-06-01"]
    );
    expect(result).toBe("文件 document.txt 没有找到 2024-06-01");
  });
});

describe("createI18n", () => {
  it("应该正确翻译 UI 文案", () => {
    const { t } = createI18n("zh");
    expect(t("button.submit")).toBe("提交");
  });
  
  it("应该正确翻译 API 消息", () => {
    const { t } = createI18n("zh");
    const result = t(
      "code.FILE_NOT_FOUND",
      "File {document.txt} Not Found"
    );
    expect(result).toBe("文件 document.txt 不存在");
  });
  
  it("API 翻译应该在缺失时返回原始 msg", () => {
    const { t } = createI18n("zh");
    const result = t(
      "code.UNKNOWN_CODE",
      "Something went wrong"
    );
    expect(result).toBe("Something went wrong");
  });
});
```

## 8. 最佳实践

### 8.1 DO's (推荐做法)

1. **使用语义化键名**

   ```json
   // ✅ 好
   "form.email.error.invalid": "Invalid email format"
   
   // ❌ 不好
   "err1": "Invalid email format"
   ```

2. **HTTP 拦截器统一处理错误**

   ```typescript
   // ✅ 好：拦截器自动处理
   try {
     await uploadFile(file);
   } catch (error) {
     // 拦截器已处理，只需处理业务逻辑
   }
   
   // ❌ 不好：重复处理
   try {
     await uploadFile(file);
   } catch (error) {
     toast.error(t(`code.${error.code}`, error.msg));
   }
   ```

3. **保持占位符一致**

   ```json
   // ✅ 好
   // en: "File {filename} exceeds {maxSize}"
   // zh: "文件 {filename} 超过 {maxSize}"
   
   // ❌ 不好
   // en: "File {filename} exceeds {maxSize}"
   // zh: "{maxSize} 超过限制的文件 {filename}"
   ```

### 8.2 DON'Ts (避免做法)

1. **避免硬编码文本**

   ```tsx
   // ❌ 不好
   <button>Submit</button>
   
   // ✅ 好
   <button>{t("button.submit")}</button>
   ```

2. **避免在业务代码中重复处理 API 错误**

   ```typescript
   // ❌ 不好：HTTP 拦截器已经处理了
   const { t } = useI18n();
   try {
     await api.call();
   } catch (error) {
     toast.error(t(`code.${error.code}`, error.msg));
   }
   ```

---

**更新时间**: 2024-12-19  
**维护者**: 前端团队  
**相关文档**: `i18n.md`
