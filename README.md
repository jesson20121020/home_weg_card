# Home State Grid Card

一个专为中国国网电力用户设计的 Home Assistant Lovelace 卡片，提供美观、直观的电费和用电数据展示。

## 功能特性

- 📊 **实时电费显示** - 显示当前电费余额和户号信息
- ⚡ **阶梯电价可视化** - 直观展示三阶梯电价结构和当前所在阶梯
- 📈 **多维度统计图表** - 年/月/日用电量统计和趋势图
- 📅 **日历视图** - 以日历形式展示每日用电数据
- 🚗 **汽车充电模式** - 专为电动车充电用户优化
- 🌙 **深色模式支持** - 自动适应 Home Assistant 主题
- 📱 **响应式设计** - 完美适配桌面和移动设备

## 安装方法

### 方法一：通过 HACS 安装（推荐）

1. 在 HACS 中搜索 "Home State Grid Card"
2. 点击安装
3. 重启 Home Assistant

### 方法二：手动安装

1. 下载 `home_state_grid_card.js` 文件
2. 将文件放置在 `<config>/www/` 目录下
3. 在 Lovelace 界面配置中添加资源引用：
   ```yaml
   resources:
     - url: /local/home_state_grid_card.js
       type: module
   ```

## 配置选项

### 必需配置

| 参数 | 类型 | 描述 |
|------|------|------|
| `entity` | string | 国网集成实体 ID |
| `tier1_price` | number | 第一阶梯电价（元/度） |
| `tier2_price` | number | 第二阶梯电价（元/度） |
| `tier3_price` | number | 第三阶梯电价（元/度） |

### 可选配置

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `tier1_max` | number | 2520 | 第一阶梯最大用电量（度） |
| `tier2_max` | number | 4800 | 第二阶梯最大用电量（度） |
| `iscar` | boolean | false | 是否启用汽车充电模式 |

## 配置示例

### 基础配置

```yaml
type: custom:home-state-grid-card
entity: sensor.guojia_dianwang
tier1_price: 0.5380
tier2_price: 0.7480
tier3_price: 1.2680
```

### 完整配置

```yaml
type: custom:home-state-grid-card
entity: sensor.guojia_dianwang
tier1_price: 0.5380
tier2_price: 0.7480
tier3_price: 1.2680
tier1_max: 2520
tier2_max: 4800
iscar: false
```

### 汽车充电模式配置

```yaml
type: custom:home-state-grid-card
entity: sensor.guojia_dianwang
tier1_price: 0.5380
tier2_price: 0.7480
tier3_price: 1.2680
iscar: true
```

## 使用说明

### 数据实体要求

卡片需要一个国网集成实体，该实体应包含以下属性：

```json
{
  "sumMoney": "当前电费余额",
  "date": "数据更新日期",
  "friendly_name": "显示名称",
  "consNo": "户号",
  "dayList": [
    {
      "day": "20231201",
      "dayElePq": "15.5"
    }
  ],
  "monthList": [
    {
      "month": "202312",
      "monthEleNum": "450.5",
      "monthEleCost": "285.2"
    }
  ],
  "lmonthList": [
    {
      "month": "202311",
      "monthEleNum": "380.2",
      "monthEleCost": "245.8"
    }
  ]
}
```

### 界面操作

1. **年用电** - 显示年度用电总量和总电费
2. **月用电** - 柱状图显示每月用电量，折线图显示每月电费
3. **日用电** - 柱状图显示每日用电量，支持电费计算
4. **日历** - 日历形式展示每日用电数据

### 电费计算

在日用电和日历视图中，可以选择不同的电价阶梯来计算日电费：
- 第一阶梯：选择此阶梯的电价
- 第二阶梯：选择此阶梯的电价
- 第三阶梯：选择此阶梯的电价

点击图表或日期即可查看详细的电费信息。

## 阶梯电价说明

中国居民阶梯电价通常分为三档：

1. **第一阶梯** (0-2520度): 基础电价
2. **第二阶梯** (2521-4800度): 中等电价
3. **第三阶梯** (4801度以上): 高等电价

卡片会根据年度累计用电量自动计算当前所在阶梯，并在界面上直观展示。

## 注意事项

- 确保国网集成正常工作并提供正确的数据格式
- 电价参数请根据当地供电局公布的最新电价调整
- 汽车充电模式会隐藏阶梯电价显示，适合纯充电用户
- 数据更新频率取决于国网集成的刷新间隔

## 兼容性

- **Home Assistant**: 2021.3.0+
- **浏览器**: 支持所有现代浏览器
- **移动设备**: 完全响应式设计

## 许可证

本项目采用 MIT 许可证。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！
