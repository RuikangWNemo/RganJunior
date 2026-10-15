# 第二轮语境复核（2026-10-14）

本轮修正80处英文（79条双语文案、1处固定英文），涉及22个文件。包含参与条件、主语及修饰对象、术语重复、家庭活动语境、茶叙事、元信息及人工监护确认文案。原中文、交互、数据库和权限规则未改动。

重点修正：不要求研究经验；成长扎根于场域的主语关系；International三重前缀；重复的R-Gan Junior品牌前缀；行动误译为Cities and Villages；family practice、drinking with him、entered the mountain itself的歧义；明确监护人同意的是申请人加入社群。

`changes.json`记录实施位置与前后文字；`pair-changes.json`记录双语对照。后一文件按同文件、同中文、同结构键的出现次序匹配，避免把不同位置的同中文候选误判为修改。两个实施脚本仅供追溯，不应在修订后的源码上重复执行。

外部查询：
- [FAO AGROVOC: community-supported agriculture](https://agrovoc.review.fao.org/browse/agrovoc/en/page/c_db44179d?clang=te)：查询结果确认CSA在此处指社区支持农业；与源码中文及动态分类定义一致。网页直开失败，未使用未获取的页面内容。
- [CTB 官方网站](https://www.chinathinksbig.com/)及[发起学生组织的CTB介绍](https://www.hauscr.org/ctb)：核对CTB项目背景。没有用现届或早期届次的页面改写2024年具体成绩与日期；“英文论坛”改为论坛以英语开展，避免读成英语学科论坛。
- [China Daily 对林盘的介绍](https://govt.chinadaily.com.cn/s/202011/02/WS5f9f8f0c498eaba5051bc4d6/innovative-approach-to-growth-brings-rewards.html)：确认林盘是聚落与周边林地、农地形成的环境；未添加本项目的新事实。

验证：85个测试文件、314项测试通过；应用类型检查通过；本地构建通过；涉及源码lint无错误或警告。拼写检查扫描310个文件，字典覆盖的展示文案无英式残留；双语英文连续重复词检测无命中；本轮修订未改变英文中的数字。构建仍有既有资源体积等警告，不代表已完成线上验证。

原37项四列确认简表继续用于用户选择；本轮确定性修正直接实施，没有新增需要用户回答的事实问题。未发布、未改生产数据库。
