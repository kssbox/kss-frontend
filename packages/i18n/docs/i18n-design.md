# i18n SSOT (Single Source of Truth ) 单一事实来源

## 概述

i18n SSOT 是一个集中管理和维护多语言翻译资源的系统，旨在确保所有翻译内容的一致性和准确性。通过使用 SSOT，开发团队可以更有效地管理国际化（i18n）资源，减少重复工作，提高翻译质量，并简化更新流程。

## 目标

- 提供一个统一的翻译资源库，确保所有应用程序和服务使用相同的翻译内容。
- 简化翻译流程，减少错误和不一致性。
- 支持多语言和地区的扩展，满足全球用户的需求。
- 提供版本控制和变更跟踪，确保翻译资源的可维护性。
- 完成前端后端的集成，确保翻译资源能够无缝应用于各种平台。

## 实现方式

- **选择存储方案**：根据项目需求选择合适的存储方案，如数据库、JSON/YAML 文件等。

## 翻译维护与使用规范

### ui json 前端维护

```json en.json

{
  "button.submit": "Submit",
  "title.login": "Login Account"
}

```

```json zh.json

{
  "button.submit": "提交",
  "title.login": "登录账户"
}
```

### api json 服务端维护

```json en.json

{
    "code": {
        "404": "Resource {filename} not found {timestamp}",
        "500": "Internal server error",
        "FILE_NOT_FOUND": "The requested file was not found"
    } 
}
```json zh.json

{
    "code": {
        "404": "{filename} 没有找到 {timestamp}",
        "500": "服务器内部错误",
        "FILE_NOT_FOUND": "请求的文件未找到"
    } 
}

```

### api response 示例

- api 的 msg 永远是英文，前端会拿着 code 去 i18n 里找对应语言的翻译，如果没有找到就显示英文 msg。
- 返回时可以携带参数，前端替换掉对应的变量。

```json

{
  "code": "404",
  "msg": "File {document.txt} Not Found {2024-06-01T12:00:00Z}",
  "data": null
}

```

### 前端使用

``` typescript
t("button.submit") // "Submit"
t("code.404", msg) // "Resource document.txt not found 2024-06-01T12:00:00Z"
```

## 集成方式

- 由于所有的 i18n 资源都集中管理所以各端需要进行集成以确保使用统一的翻译内容。

### 前端

编译时集成：在构建过程中将 i18n 资源打包到前端应用中，确保所有翻译内容在应用启动时可用。

### 服务端

调用自己实现的 codegen 脚本生成的 code的类型定义文件，确保服务端返回的 code 与前端使用的一致。

## 替换规则

- 前端判断code，有，就解析 msg 的模版按照位置，去 i18n 里去替换模板并展示，其他状况都直接返回服务端的 msg。
