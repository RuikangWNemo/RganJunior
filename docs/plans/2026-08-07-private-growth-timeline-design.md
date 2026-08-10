# 阿柑少年人物自然名与私有成长时间线设计

日期：2026-08-07

## 目标

在现有 Account、Profile、Person、Media 和 Impact 权限体系上增加：

- 人物自然名；
- 语义明确且不可伪造的账号注册时间；
- 按实际观察时间组织的私有成长笔记与照片时间线。

成长档案涉及未成年人资料。V1 默认完全私密，仅 `impact.read` 和 `impact.manage` 权限可以访问，不向匿名用户、普通注册用户、人物本人或家长开放。

## 数据模型

### People

在 `public.people` 增加：

- `nature_name text null`

自然名是人物在自然教育或活动中长期使用的称呼，与账号 username、展示名和私有真实姓名相互独立。自然名允许为空，也允许不同人物重名，因此不建立唯一约束。

### Profiles

在 `public.profiles` 增加：

- `registered_at timestamptz not null`

字段从对应 `auth.users.created_at` 回填。未来注册时由 `private.handle_new_user()` 写入，客户端不得修改。保留原有 `created_at` 作为 Profile 数据行的技术创建时间。

### Growth Records

建立 `private.growth_records`：

- `id bigint identity primary key`
- `person_id bigint`
- `observed_at timestamptz`
- `observed_timezone text default 'Asia/Shanghai'`
- `title text null`
- `note text`
- `recorded_by uuid`
- `created_at timestamptz`
- `updated_at timestamptz`
- `archived_at timestamptz null`

`observed_at` 表示成长变化实际发生或被观察的时间；`created_at` 表示系统录入时间。两者不能混用。时间在数据库中保存为绝对时间，原始时区单独保留，展示时再转换为用户时区。

建立 `private.growth_record_media`：

- `growth_record_id bigint`
- `media_asset_id bigint`
- `sort_order integer`
- `is_primary boolean`
- `caption text null`
- `attached_by uuid`
- `attached_at timestamptz`

一条成长记录可以有 0–N 张照片；同一记录最多一张主图。媒体必须是 `private-impact` bucket 中处于 active 状态的图片。

## 权限与暴露边界

成长表位于未暴露的 `private` schema，不直接授予 `anon` 或 `authenticated` 表权限。

- `impact.read`：读取成长时间线与照片元数据。
- `impact.manage`：创建、修改、归档成长记录，上传、关联、排序和移除成长照片。
- Super Admin 通过现有权限函数自动拥有全部能力。

公开 RPC 使用 `SECURITY INVOKER`。实际读取和写入实现位于 `private` schema，必要时使用 `SECURITY DEFINER`，固定空 `search_path`，检查 `auth.uid()` 和具体 permission，并撤销默认 `PUBLIC` 执行权限。

所有创建、修改、归档和照片关联操作写入 `private.audit_logs`。成长记录采用归档而非物理删除。

## Storage 与数据流

成长照片复用现有私有 bucket `private-impact`：

```text
private-impact/{操作者 UUID}/{Person ID}/{随机文件名}
```

写入流程：

1. 管理员通过 RPC 创建成长记录。
2. 浏览器 service 将照片上传到 `private-impact`。
3. 写入 `media_assets`，visibility 固定为 private。
4. 通过受控 RPC 将媒体关联到成长记录。
5. 若元数据或关联失败，service 清理本次上传产生的孤立 Storage 对象。

Storage 对象读取继续复用现有 `impact.read` / `impact.manage` 策略，不创建公开 URL。

## 服务层

新增 `src/services/growth/`：

- `createGrowthRecord()`
- `listGrowthRecords()`
- `updateGrowthRecord()`
- `archiveGrowthRecord()`
- `uploadGrowthPhoto()`
- `attachGrowthPhoto()`
- `removeGrowthPhoto()`

列表采用 `(observed_at desc, id desc)` 游标分页。稳定错误码包括：

- `PERSON_NOT_FOUND`
- `GROWTH_RECORD_NOT_FOUND`
- `INVALID_OBSERVED_AT`
- `INVALID_OBSERVED_TIMEZONE`
- `INVALID_GROWTH_MEDIA`
- `PERMISSION_DENIED`

## 迁移与索引

新 migration 将：

1. 增加 `people.nature_name` 和 `profiles.registered_at`。
2. 回填注册时间并更新注册触发器。
3. 创建两个 private 成长表、约束与更新时间触发器。
4. 建立 `growth_records(person_id, observed_at desc, id desc)` 索引。
5. 建立媒体反向外键索引与每条记录单一主图的 partial unique index。
6. 创建私有实现函数、公开 RPC 包装器与最小执行权限。
7. 扩展生成的 TypeScript types 和业务 service。

## 验证

线上事务测试覆盖：

- 注册时间等于 `auth.users.created_at` 且不可修改。
- 自然名允许为空、允许重名且可由 People 管理权限修改。
- 匿名、Member、Contributor 无法访问成长记录。
- `impact.read` 可读但不可写。
- `impact.manage` 可以创建、修改、归档和关联照片。
- 不能关联其他 bucket、非图片或 archived 媒体。
- 同一成长记录不能拥有两张主图。
- observed time、timezone 与录入时间正确分离。
- 敏感操作产生 Audit Log。
- Security Advisor 无新增告警。

## 非目标

本阶段不建立家长/监护人授权、不向人物本人开放成长档案、不提供公开成长故事、不建立量表评分或自动化成长结论。这些能力需要未来 consent 和 guardian 模型后再设计。
