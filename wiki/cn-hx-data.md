# @hx/data

基于 Proxy 的响应式数据管理，零依赖、支持 Tree-shaking、完整类型安全。

## 核心特性

- **嵌套响应式** — 对象和数组自动代理包装
- **路径变更追踪** — 用点号路径订阅任意深度的变更
- **通配符监听** — 全局监听（`*`）或分支级监听（`user.*`）
- **层级导航** — 在响应式树中上下遍历：父级、根级、路径解析
- **撤销代理** — 将响应式对象还原为普通 JavaScript 对象
- **类型化路径工具** — 安全的深层次 `get`/`set`，完整类型推导

## 安装

```bash
pnpm add @hx/data
```

## 快速示例

```ts
import { reactive, ERO } from '@hx/data';

// 创建响应式根对象
const state = reactive({
  user: {
    name: '张三',
    address: { city: '北京' }
  },
  count: 0
});

// 监听变更
ERO.on(state, 'user.name', (event) => {
  console.log(`姓名: ${event.oldValue} → ${event.newValue}`);
});

ERO.on(state, '*', (event) => {
  console.log(`[${event.pathToRoot}] 已变更`);
});

// 修改自动触发监听器
state.user.name = '李四';
state.count = 1;
state.user.address.city = '上海';
```

## API 总览

| 分类 | API | 说明 |
|----------|-----|-------------|
| 创建 | `reactive()` | 创建响应式根对象 |
| 监听 | `ERO.on()` | 订阅变更 |
| | `ERO.off()` | 取消订阅 |
| | `ERO.emit()` | 手动触发变更事件 |
| 检测 | `ERO.isReactiveRoot()` | 判断是否为响应式根对象 |
| | `ERO.isReactiveObject()` | 判断是否为响应式对象 |
| 导航 | `ERO.rootOf()` | 从任意嵌套对象获取根对象 |
| | `ERO.parentOf()` | 获取父对象 |
| | `ERO.pathOf()` | 解析到任意节点的路径 |
| | `ERO.pathToRoot()` | 获取从根开始的绝对路径 |
| | `ERO.pathToParent()` | 获取从父级开始的路径片段 |
| 值操作 | `ERO.getValue()` | 按路径获取值 |
| | `ERO.setValue()` | 按路径设值（触发事件） |
| | `ERO.setValueSilent()` | 静默设值（不触发事件） |
| 撤销代理 | `ERO.revoke()` | 响应式 → 普通对象 |
| 工具 | `ERO.fake()` | 创建桩响应式对象 |
| | `get()` / `set()` | 底层路径遍历 |
| | `parsePath()` | 解析路径字符串为片段 |
| | `EventEmitter` | 独立发布/订阅 |
