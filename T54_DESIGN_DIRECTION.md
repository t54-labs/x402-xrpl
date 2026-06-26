# t54 × XRPL AI — 设计方向：**THE LEDGER SPINE**（账本脊柱）

> *"一台装订进版式的链上仪器。每隔几秒，一个 agent 当众证明自己可信——意图被授权、被核验、被封存——平静地，在一根活的脊柱上完成。"*

本方向的招牌不是配色、不是字体、不是 hero 文案——而是**一根垂直脊柱上、由真实结算事件驱动的「verify-then-settle」节拍**。这是产品论点本身的动能化（verify before settle / human-in-control / audit-grade），也是用户唯一会截图、会记住的东西。本文档已**逐条对照真实仓库核实**，并**修正了上一版的全部捏造引用与色彩矛盾**（见 §0.1 勘误）。

---

## 0. 设计宣言 (Design Manifesto)

**核心理念：** 这个站点不是 landing page，也不是 XRPL Explorer 的翻版——它是一台**装订进杂志版式的链上仪器**。首页中央是一根垂直「脊柱」（the spine），每一笔 x402 agent 支付都是一束沿脊柱下行的事件：**coral 出生（人类授权意图）→ blue 流动（链上结算）→ sealed 封存（风控通过、被担保）**。「sealed」状态**不靠第三种颜色**承载，而靠**形态**（实心 vs 空心印章、加粗、收束的封口线）——这正是本版最关键的去模板决定（见 §1 Palette）。

### 0.1 对上一版的勘误（Errata — 必须先读）

上一版有两处**捏造事实**和两处**未解决矛盾**，本版全部修正：

| # | 上一版主张 | 真实情况（已 grep 核实） | 本版处理 |
|---|---|---|---|
| E1 | 「照搬 `success.svg` 的 feGaussianBlur+feColorMatrix」（引用 3 次） | 仓库内**无 `success.svg`**；`apps/web/src` 与 `public` 内 SVG filter **零命中**（仅 `.next/` 构建产物） | **删除全部「照搬」措辞**。辉光是**全新要写的共享 `<defs>`**，按新工作量预算（§1 box-shadow 决策） |
| E2 | 卡片以 `intentHash` 为 key、`borderLeftColor:#${intentHash.slice(0,6)}` | `TransactionRow` **无 `intentHash` 字段**；实有 `hash / amount / asset / timestamp / sourceTag / verifiableIntent / riskChecked / merchant`（`RecentTransactionsLive.tsx:10–19`） | key 改用 **`hash`**；hash-stripe **不再用作 CSS 颜色**，改为**固定 accent 的 mono 文本印迹**（§2 Card） |
| E3 | green 用 `#22C55E`，但去掉绿色又说「green 仅在 seal」 | 仓库 `--success:#10B981`（`globals.css:23`）——两个绿不一致 | **彻底去掉「success-green」作为主信号**：seal 用**形态**表达；保留 `--success #10B981`（沿用仓库值）**仅**用于 micro pill 的文字勾，不作面积色（§1） |
| E4 | 「`#000→#0B0A09` 是唯一允许的 `:root` 一行编辑，简单」 | `--bg-base` 与 `--bg-surface` **都是 `#000`**，且全文有大量 `rgba(255,255,255,*)` elevation 与 `!important` 覆盖块（`globals.css:15,102,116,132,160,165,186,228,232,236…`） | 降级为**多 token 迁移 + 全站视觉回归**，列为**最高风险 CSS 改动**（§6） |

### 0.2 五条原则（这才是它为什么不是 AI 模板）

1. **双色信号系统，第三态靠形态不靠色（the master anti-template rule）。** 全站只有**两种**信号色：冷电光 blue（机器/链上）与暖 oxide-coral（人/意图）。「已担保/sealed」**不引入绿色或任何第三种 hue**——它通过**实心印章 vs 空心轮廓、封口线收束、描边加粗、满不透明**来表达。这一刀砍掉了「coral=人/blue=机/green=成功」那套 crypto-SaaS 叙事陷阱，把调色板压成一个**真正罕见的二色仪表系统**。色分布严守 **80 / 18 / 2**（80% 暖墨底 · 18% blue · 2% coral——coral 是珍贵的）。
2. **排版张力来自账本逻辑，不是借来的「巨数字+宽距小 mono caps」预设。** 所有链上数值用 **Geist Mono tabular-nums 在 display 尺寸（80–128px）** 呈现——一个 instrument 该有的样子，而不是 weight-200 Sans 的 editorial-futurist 预设（那本身已是 2023–24 AI 偏好）。结构张力来自**一条铁律基线**：每个 display 数值的**视觉底边与其 mono 单位标签共享同一基线**（数字与单位咬合成一个仪表读数），不是靠粗细极差堆出来的。
3. **负空间即层级。** 每屏只让一个元素支配；空白是层级工具，不是剩余。
4. **意义先行的运动，连标签都不许装饰。** 每个动作承载真实可读语义（链锁定=被核验、hash 印迹=可追溯证明、封口=担保达成）。**不用 `FIG 0x` 装饰性图注**——除非它真的索引一个读者会回查的图表系统（见 §1 图注规则）。装饰标签和装饰动效一样被禁止。
5. **一套从 logo DNA 长出的线性系统贯穿全站。** 1.5px 圆头描边自定义图标 + 重绘的 XRPL X-in-circle，绝不用任何 stock outline-icon 库（那是最响亮的 AI 模板信号）。

**显式杀掉的 AI 模板信号：** ① 纯 `#000` 底（暖化为 oxide cocoa-black）；② 均匀色分布（强制 80/18/2 双色）；③ 3 等分 feature 卡片栅格（替换为宣言式 spread）；④ 横向 explorer-clone 卡道（替换为垂直脊柱）；⑤ stock outline 图标（替换为 logo-DNA monoline）；⑥ Inter/SaaS 1.5× 字阶（替换为 mono-instrument display）；⑦ **candy-coral `#FF6x`**（移到 oxide register，见下）；⑧ **「coral/blue/green 三色叙事」本身**（压成双色 + 形态 seal）；⑨ **ambient blob 灯光秀 + 示波器/均衡器外壳**（删除——这是文档自己半承认的 dark-dashboard kitsch，见 §5）；⑩ **`FIG 0x` 装饰图注**（除非载荷化）。

---

## 1. 设计语言 (Design Language)

### Palette — 二色仪表系统（精确 hex，已对账仓库）

**论点：** 别的链是冷蓝；t54 的暖度是差异化武器。但 candy-coral `#FF624A` 读起来像 consumer app。把它压到 **oxide / rust register `#C9462E`**——读作**仪表盘指示灯**而非糖果。整套只有两色信号；「已担保」由形态承载。

```css
:root {
  /* —— Canvas: warm OXIDE cocoa-black, NOT pure #000 —— */
  --ink-base:    #0C0A08;   /* page field (替换 --bg-base)   */
  --ink-surface: #14110D;   /* card surface (替换 --bg-surface)? 见注 */
  --ink-surface: #14110D;   /* card surface                  */
  --ink-raised:  #1B1712;   /* raised / hover                */
  --rule:        #2B2520;   /* 1px hairline divider          */

  /* —— Text on dark —— */
  --paper:       #F1EDE6;
  --paper-mute:  #998A82;
  --paper-faint: #4E443C;

  /* —— TWO signal hues, ONE job each（不存在第三信号色） —— */
  --xrpl-blue:   #008CFF;   /* live ledger / settlement / on-chain truth (沿用仓库值) */
  --t54-coral:   #C9462E;   /* identity / intent / human-in-control — OXIDE, not candy  */

  /* —— State-only（never decoration, never area fill） —— */
  --amber:       #E0941B;   /* pending / in-verification（暖化以贴 oxide 场） */
  --red:         #D6442E;   /* blocked / denied                              */
  --success:     #10B981;   /* 沿用仓库既有值；仅用于 SEALED pill 的 1px 文字勾，绝不作面积色 */

  /* —— Alpha ramps over the dark field —— */
  --blue-08:  #008CFF14;  --blue-16: #008CFF29;  --blue-28: #008CFF47;
  --coral-08: #C9462E14;  --coral-16:#C9462E29;  --coral-28:#C9462E47;
}
```

> **注：** `--ink-base` 与 `--ink-surface` 是**两个不同的暖墨值**（仓库现在两者都是 `#000`）。本版**故意让 surface 比 base 亮一档**，使卡片不靠 box-shadow 也能从场中浮起——这是去掉阴影后建立层级的关键，也是 §6 标注的迁移工作量来源之一。

| 语义 | Token | 用途 | 面积占比 |
|---|---|---|---|
| 机器 / 链上真实 | `--xrpl-blue #008CFF` | ledger 元数据、in-flight 脉冲、脊柱中线 | **18%** |
| 人 / 意图 / 授权 | `--t54-coral #C9462E` | agent 身份、L1/L2 链节、intent spark | **2%（珍贵）** |
| 待处理 | `--amber` | verifying 中间态 | state-only |
| 拒绝 | `--red` | denied/blocked | state-only |
| 已担保（文字勾） | `--success #10B981` | **仅** SEALED pill 内 1px check 描边 | 近乎不可见 |

**「已担保」如何不靠颜色表达（核心去模板手法）：**

| 维度 | Ordinary / 未核验 | **SEALED（已担保）** |
|---|---|---|
| 印章 | **空心**轮廓 shield，1.5px | **实心** shield，描边加粗到 2.5px |
| 封口线 | 链尾**开口**、虚线 | 链尾**收束闭合**、实线、端点回钩 |
| 不透明度 | 0.42 | 1.0 |
| hash 印迹 | `--paper-faint` | `--xrpl-blue` 满色 |
| pill | 无 | `SEALED` mono pill（内含 `--success` 1px 文字勾，唯一一处绿，肉眼几乎只读作白） |

→ **整条 lane 一眼可数有几笔被担保**——靠的是 fill 与闭合，不是一片绿。这就是和 AI 模板列表的根本区别。

### Typography — mono-instrument display（全部用仓库内 Geist，零新字体依赖）

`layout.tsx` 已注入 Geist Sans / Geist Mono，零新依赖。**不引入** General Sans / Hanken / 任何外部字体。

| 角色 | Family / Weight | Size / LH / Tracking | 用途 |
|---|---|---|---|
| **Instrument display** | **Geist Mono** + `tabular-nums`, 400 | 80–128px / 0.92 / −0.02em | **hero 巨型链上读数**（金额、计数）——instrument，非 editorial |
| Display word | Geist Sans 300 | 56–80px / 1.0 / −0.03em | hero/section 的词（`agents` / `settled`） |
| Section head | Geist Sans 400 | 32–44px / 1.1 / −0.02em | section 标题 |
| Body | Geist Sans 400 | 17px / 1.6 / 0 | 正文 |
| Emphasis | Geist Sans 600 | inline | 强调 |
| **Mono value** | Geist Mono + `tabular-nums` | 14–24px | 每一个链上值：金额、hash、ledger index、L1/L2/L3 |
| Micro-label | Geist Mono uppercase | 11px / `letter-spacing:0.22em` / `--paper-mute` | 仪表式微标签（替换现有所有 badge）；tracking 收到 0.22em 以避开「宽距 mono caps」预设的最夸张档 |

> **基线咬合规则（张力的真实来源）：** display 读数（如 `128`）与其紧贴右下的 mono 单位（`RLUSD`）**共享同一条基线**，数字光学底边对齐单位 cap-height 底——读作一个**仪表读数**，而非「大数字配小图注」的 editorial 拼贴。张力来自数字与单位的咬合关系，不是粗细极差。

### Grid / Spacing / Negative Space / 图注规则

- 8px 基准；12 列栅格，**故意打破**：hero 为 **7/5 非对称分栏**，脊柱落宽栏，对侧留大面积刻意空白。
- **图注（FIG）规则：** 默认**不用** `FIG 0x` 装饰编号。**只有**当 Why XRPL 页真正建立一个「读者会回查」的编号图表系统（如 `FIG 1 — verify-then-settle 时序`，正文用 "see FIG 1" 回指）时，才允许出现，且必须真实索引。否则一律删除——装饰图注 = 伪装成严谨的装饰，被原则 4 明令禁止。
- 负空间是首要层级工具——每屏一个支配元素。

### Linework & Iconography

- 仅自定义图标：**统一 1.5px 描边、全圆头 caps、90°+ 四分之一弧 joins**（从 t54 logotype 几何长出）。
- XRPL X-in-circle 用**同样描边重绘**，使 t54 mark 与 X-mark 成一个 lockup。
- 绝不用任何 stock outline-icon 库。

### Motion Signature — calm + intelligent

标准化为 **3 durations / 2 easings**：

```css
:root {
  --dur-micro:  120ms;  /* hover / press feedback */
  --dur-enter:  360ms;  /* element entrance       */
  --dur-cerem:  800ms;  /* ceremonial reveal      */
  --ease-tail:  cubic-bezier(0.16, 1, 0.3, 1);  /* long-tail entrances */
  --ease-micro: cubic-bezier(0.4, 0, 0.2, 1);   /* hover feedback      */
}
```

- **Verification lock** 用高阻尼弹簧（framer-motion）：`{ type:"spring", stiffness:120, damping:24, mass:1 }`——**zero bounce**，机构级冷静。
- Ambient「呼吸」：~6 cycles/min（`10s` 周期），亮度/scale 近乎不可察的漂移——**仅作用于脊柱中线与 live dot 两处**，不铺满全屏。
- **只动 transform / opacity**（GPU）；全程遵守 `prefers-reduced-motion`；运动预算花在**一次编排好的脊柱生命周期**上，而非散落的 fade。

### Box-shadow 约束 → 深度/辉光技术决策（已去捏造）

`globals.css:172 / 178` 强制 `box-shadow: none !important`。**决策：不放松该全局规则**。深度与辉光通过下列手段，**全部为新写代码（无既有 success.svg 可照搬）**：

1. **SVG `feGaussianBlur` + `feColorMatrix` + `feMerge` —— 团队从零作者的共享 `<defs id="spine-glow">`。** 这是标准、可行技术，但**是新工作量**，按 §6 P1 预算。提供一次、全站复用。
2. **`--ink-surface` 比 `--ink-base` 亮一档**的色阶层级（替代阴影做卡片浮起）。
3. **Conic-gradient 1px border**（SEALED 卡的「担保」边，克制使用）。
4. **Radial-gradient surface fills**（raised 卡片深度）。

> 唯一**不**通过的手段：blurred ambient color blobs（已从 §5 删除）。

---

## 2. 招牌交互：The Ledger Spine（中央脊柱）

**形态：** 不是横向卡道（explorer-clone，最大模板信号），而是**垂直脊柱**——一条 1px blue 渐变中线（账本静脉），settlement 卡从顶部进入、沿脊柱下行，脊柱在每笔经过时脉动。**这是整个系统唯一的招牌节拍。**

### Frame-by-frame（一笔 x402 settlement 的生命周期）— 诚实标注数据来源

> **数据诚实声明：** 真实 `TransactionRow` 只携带 `verifiableIntent`、`riskChecked` 两个布尔 + `timestamp` + `hash/amount/asset/merchant`。下面的多阶段「仪式」是**由这两个布尔 + 时间戳驱动的确定性编排（choreography）**，**不是**每阶段的真实链上遥测。L1/L2/L3 的逐节点计时、delegation ceiling 数值等**属于 aspirational，必须接入真实数据源后才点亮**（见 §3 与 §6 P4），**默认不显示捏造数值**。

| 阶段 | 时间 | 动作 | 驱动数据 | 颜色 |
|---|---|---|---|---|
| **Birth** | 0–120ms | coral spark 在脊柱顶端点亮（新写 `spine-glow` filter）——意图被授权 | `verifiableIntent === true` | coral |
| **Enter** | 120–480ms | 卡片 `y:-16→0`+`opacity:0→1`，`--ease-tail`；旧卡 `layout` 下推（AnimatePresence）；脊柱该段跑一次性 blue pulse | 入列事件 | coral→blue |
| **Verify** | 480–1080ms | 内嵌 3-node 链逐节点亮锁定（spring）；**节点数值留空/占位**，除非真实数据在场 | `verifiableIntent` | coral→blue |
| **Seal** | 1080–1280ms | 链尾收束闭合，**空心 shield → 实心 shield**，描边加粗，hash 印迹转 blue 满色，`SEALED` pill 满不透明出现 | `riskChecked === true` | blue + 形态 |
| **Calm** | 持续 | 卡片落定，脊柱中线以 6 cycles/min 亮度漂移呼吸（仅此一处 ambient） | — | blue ambient |

### Card 语义（继承 Explorer 排版纪律，为 agent 重做）

```
┌─[2px hash-stripe（固定 --xrpl-blue 实色），右侧并排 hash 前 8 位 mono 文本]──┐
│  248.00 RLUSD            ·  3.4s ago  ·  agent.alpha (coral)                │  ← mono tabular-nums，基线咬合
│  ◖L1─────◗ ◖L2─────◗ ◖L3─────◗   [▣ shield] SEALED                        │  ← 3-node chain（数值仅在有真数据时显示）
└─────────────────────────────────────────────────────────────────────────────┘
```

- **左轨 2px hash-stripe = 固定 `--xrpl-blue` 实色**；hash 的可追溯性靠**并排的 mono 文本 `7a3f…e9` 前 8 位**表达——**绝不**用 `#${hash.slice(0,6)}` 当 CSS 颜色（那会产生随机 hue、撞 blue/coral、直接打碎 80/18/2 纪律）。「证明」是**可读的 hash 文本**，不是随机色块。
- 金额、时间、agent 身份全 mono；agent 一侧 coral，ledger 元数据 blue。
- **3-node 链**取代 explorer 的 tx-shape glyph 栅格——这是 explorer 没有的信任节拍。
- **未核验/普通卡片：0.42 opacity + 空心未闭合链 + 无 shield**——整条 lane 一眼可读安全性。

### 如何超越 XRPL Explorer

| | XRPL Explorer | THE LEDGER SPINE |
|---|---|---|
| 单位 | 匿名 ledger | 语义丰富的 agent settlement |
| 揭示 | *什么*结算了 | *它在结算前被核验了* |
| 节拍 | 机械横移 | coral→blue 生命周期脉冲沿活脊柱下行，以形态封存 |
| 信任 climax | UNL bars + check | 3-link chain 锁定 + **实心 shield 封口** |
| 情绪 | 网络在运行 | 智能意图被授权、核验、担保——平静，从不慌张 |

### 响应式

- **Desktop：** 中央垂直脊柱 + 左 vital-signs 条 + 右 Verification Scope 详情面板。
- **Tablet：** 脊柱 + vital-signs 折叠为顶部条；详情面板变 bottom-sheet。
- **Mobile：** 单列脊柱，卡片简化（hash-stripe + 金额 + 折叠链 + SEALED pill）；关闭脊柱呼吸。

### 可落地技术（framer-motion 12 + SVG，已修正 key 与颜色）

```tsx
// LedgerSpine.tsx  —— 核心选段（对照真实 TransactionRow）
const SPRING = { type: "spring", stiffness: 120, damping: 24, mass: 1 } as const;

type Settlement = {            // = 仓库 TransactionRow，零新增字段
  hash: string; amount: string; asset: string; timestamp: string;
  sourceTag?: number | null; verifiableIntent?: boolean;
  riskChecked?: boolean; merchant?: { address: string; name: string | null } | null;
};

function Spine({ events }: { events: Settlement[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative">
      {/* 脊柱中线：linear-gradient，不是 box-shadow */}
      <div className="absolute left-1/2 top-0 h-full w-px
                      bg-[linear-gradient(180deg,transparent,var(--blue-28),transparent)]" />
      <AnimatePresence initial={false}>
        {events.slice(0, 12).map((e) => {
          const sealed = !!e.riskChecked;          // 形态封存，不是颜色
          const verified = !!e.verifiableIntent;
          return (
            <motion.article
              key={e.hash}                          // ← 真实字段，非 intentHash
              layout
              initial={reduce ? false : { y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: verified ? 1 : 0.42 }}
              exit={{ opacity: 0, transition: { duration: 0.24 } }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="relative my-3 rounded-2xl bg-[var(--ink-surface)]
                         border-l-2 border-[var(--xrpl-blue)]"  // ← 固定色，非 hash 切片
            >
              <CardHeader e={e} />                  {/* hash 前 8 位作 mono 文本印迹 */}
              <VerificationChain
                state={sealed ? "sealed" : verified ? "verifying" : "idle"} />
            </motion.article>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
```

```css
@media (prefers-reduced-motion: reduce){ *{animation:none!important} }
```

**数据层：** 复用现有 settlement 源（WebSocket / 轮询），节流 ~200ms，内存保留最近 ~50 笔，渲染 12 笔。`pause/resume` 冻结入列。**脊柱呼吸是唯一常驻动效**（无 equalizer、无 blob）。

---

## 3. Verifiable Intent 可视化（L1→L2→L3）

**形态：** monoline 3-link 链，每个 link = 圆头描边 node + connector，宽距 mono 标注。**节点的具体数值（delegation ceiling、allowed assets）默认不渲染**——它们是 aspirational，仅在真实 verifiable-intent 数据源接入后点亮（见 §6 P4）。默认只显示**链的结构与锁定状态**。

- **L1 · TRUSTLINE CRED**（coral）—— 凭证已签发。
- **L2 · OWNER DELEGATION**（coral）—— spend ceiling / allowed assets，owner 签署。**数值占位**（如 `— · —`），除非真实数据在场（届时显示 `≤ 250 RLUSD · RLUSD,XRP`）。
- **L3 · AGENT-SIGNED ACTION**（coral→blue）—— agent 对此精确动作签名，结算前核验。

### 四态机（颜色仅 coral/blue/amber/red，封存靠形态）

| State | 视觉 | 颜色 |
|---|---|---|
| **idle** | 链 `--paper-faint`、开口、未连通、0.42 opacity | faint |
| **verifying** | link 逐段从左到右填充，每段锁定时一次 `spine-glow` pulse；node「咔」合拢；中间态可 amber | coral / amber |
| **sealed** | 三节全锁，链尾**收束闭合**，**空心→实心 shield**，描边加粗到 2.5px，hash 印迹转 blue 满色，`SEALED` pill | blue + 形态（**无绿面积**） |
| **denied** | 在失败 link 处停止，该节点闪 `--red`，链断开，`DENIED` pill | red |

### 微动效 + 技术（已修正 pathLength 用法）

> **修正：** `pathLength` 是**逐形状**属性，**不被 `<g>` 继承**。因此：connector 用 `<line>`/`<path>` 各自动画 `pathLength`；圆形 node 用 **scale/opacity reveal**（不要在裸 `<circle>` 上指望 pathLength 描边）。四态机**先在隔离环境原型化**，再接入 feed。

```tsx
function VerificationChain({ state }: { state: ChainState }) {
  const LINKS = ["L1·TRUSTLINE", "L2·DELEGATION", "L3·AGENT-SIGNED"];
  const active = state === "sealed" || state === "verifying";
  const stroke = state === "sealed" ? "var(--xrpl-blue)" : "var(--t54-coral)";
  return (
    <svg viewBox="0 0 360 48" role="img" aria-label="verification chain">
      <defs>
        {/* 新写的共享辉光（NO success.svg 可照搬——这是新工作量） */}
        <filter id="spine-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {LINKS.map((label, i) => (
        <g key={label}>
          {/* connector：pathLength 在 <line> 上逐形状动画（正确用法） */}
          <motion.line
            x1={i * 120 + 14} y1="24" x2={i * 120 + 104} y2="24"
            stroke={stroke} strokeWidth="2" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.42 }}
            animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0.42 }}
            transition={{ ...SPRING, delay: i * 0.18 }}
          />
          {/* node：scale/opacity reveal，不依赖 pathLength */}
          <motion.circle
            cx={i * 120 + 8} cy="24" r="5" fill="none" strokeWidth="2" stroke={stroke}
            initial={{ scale: 0.6, opacity: 0.42 }}
            animate={{ scale: active ? 1 : 0.6, opacity: active ? 1 : 0.42 }}
            transition={{ ...SPRING, delay: i * 0.18 + 0.05 }}
          />
        </g>
      ))}

      {/* 封口：实心 shield（形态封存，非绿色） */}
      {state === "sealed" && (
        <motion.path
          d="M332 14 l10 4 v6 c0 6 -4 11 -10 13 c-6 -2 -10 -7 -10 -13 v-6 z"
          fill="var(--xrpl-blue)" stroke="var(--xrpl-blue)" strokeWidth="2.5"
          filter="url(#spine-glow)"
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPRING, delay: 0.5 }}
        />
      )}
    </svg>
  );
}
```

### SEALED 处理（不容错认的「安全」，全靠形态）

- **Sealed：** 满不透明 + **实心** shield + `spine-glow` halo + **conic-gradient 1px 担保边** + `RISK-CHECKED · PRE-EXECUTION` mono caption + `SEALED` pill（pill 内唯一一处 `--success` 1px 文字勾）。
- **Ordinary/未核验：** 0.42 opacity + 开口未闭合链 + **空心** shield 或无 shield。
- 安全性在**整条 lane 一眼可数**——这正是把它和 AI 模板列表区分开的东西。

---

## 4. 交互框架与子页面 (Interaction Framework & Subpages)

### 让每一页都 bespoke 的系统（through-line）

四个不变母题贯穿全站，使其读作**一个工程化系统**而非拼接模板：

1. **3-link chain** —— 既是 per-card glyph，也是 section divider。
2. **hash 文本印迹 + 固定 blue accent** —— 唯一的 accent 规则（**文本可追溯，不是随机色**）。
3. **mono tabular-nums + 基线咬合** —— 唯一的 stat 样式。
4. 一套 logo-DNA monoline 图标 + 80/18/2 双色律 + 三 durations / 两 easings 运动 token。

### (a) Home / Index

- **7/5 非对称 hero：** 一侧是 **mono-instrument display 读数**（如实时 `PAYMENTS/MIN`），数字与单位基线咬合；另一侧**垂直脊柱 feed** 直接作 hero，周围大量负空间。
- **顶部 vital-signs 条**（mono）：`PAYMENTS/MIN` · `RLUSD SETTLED` · `% RISK-CHECKED` · `ACTIVE AGENTS` + `pause/resume`。
- **侧栏 Verification Scope 面板：** 选中某卡时放大其 L1→L2→L3 链 + settlement hash（delegation 数值仅在真数据时显示）。
- **杀掉的信号：** 居中 hero + 两按钮、3 卡栅格、横向 explorer 卡道、纯黑底、ambient blob。

### (b) Why XRPL（论点）—— 宣言式 spread

- **杀掉 3 卡行。** 整屏 display 陈述句（`Verify before you settle.`）。
- 每个滚动 section 由一个**巨型 mono-instrument 数字支配**（`~3.5s` finality · `$0.0002` fee · `100% pre-execution checked`），3-link chain 作 section divider。
- **若**建立编号图表系统，此处是 `FIG 1 / FIG 2` 唯一合法出现地（正文必须 "see FIG n" 回指）；否则不用。
- 侧栏小型 **live mini-graph**：agent → facilitator → merchant，一束脉冲循环走过——页面**演示**论点而非罗列 feature。**mini-graph 在无真实链上数据前用确定性模拟，并明确标注。**
- **杀掉的信号：** equal cards、emoji 图标、aspirational hedging 文案。

### (c) Build（开发者指南）—— live-result-then-code（Carbon/Atlassian）

- **顶部先渲染运行结果：** x402 流程动画（agent requests → `402` → chain verifies → settles），实时 chain 锁定。
- **下方紧跟精确代码片段**，mono block，可复制，tab 分 **Usage / Code / Verify**。
- `Verify` tab 显示链上 artifact（settlement hash），role tab（Agent dev / Merchant / Facilitator）。
- **杀掉的信号：** 通用指令卡片栅格；改为「先看它跑，再看代码」，天然抗模板。

---

## 5. 自然 × 科幻 × 机构信任 的平衡（已删除 ambient garnish）

三者各占一层，互不打架。**关键收敛：删除 ambient blob 灯光秀与示波器/均衡器外壳**——文档自己半承认那是 dark-dashboard kitsch，也是最安全/最模板的部分。把全部「活」感**集中在脊柱本身**。

| 层 | 由谁承载 | 表现 |
|---|---|---|
| **自然 / organic**（节奏，背景） | tempo | **唯一两处** ~6 cycles/min 呼吸：**脊柱中线**亮度漂移 + **live dot** 缓脉。**无 blob、无 organism/nervous-system 隐喻**。 |
| **科幻 / sci-fi**（实质，中景） | substance | 脊柱发光、链以 spring 物理锁定、实心 shield 封存、agent 自述生命周期。**无 equalizer、无示波器框。** |
| **机构信任**（数据，前景） | restraint | mono machine-truth、tabular-nums、vital-signs 条、可见 pause 控件、hash 文本身份、封存靠形态而非颜色狂欢。 |

### Ambient 层（极简、高性能）

- 背景：**仅** 24px blueprint grid（两个 linear-gradient，paper ~6% alpha，静态）。
- **无 blob、无 WebGL、无 box-shadow。** 深度全靠 `--ink-surface` > `--ink-base` 色阶 + SVG filter。
- mobile / `prefers-reduced-motion`：关闭脊柱呼吸，grid 保持静态。

### Anti-gimmick 铁律

1. 运动必须澄清而非分散；2. 双色 + 80/18/2，拒绝多色装饰，**拒绝第三信号色**；3. 「已担保」靠形态，绿色只在 pill 内 1px 文字勾；4. 不用 stock 图标；5. 不放松全局 box-shadow 规则；6. 运动预算只花在脊柱生命周期；7. 不用装饰性 `FIG` 图注；8. 不用随机 hash 色块。

---

## 6. 落地实现 (Implementation Plan)

### 组件映射（真实 stack：Next 16 App Router + Tailwind 4 + framer-motion 12）

| 现有 / 目标 | 动作 | 说明 |
|---|---|---|
| `RecentTransactionsLive.tsx` | **重写** → `LedgerSpine` | 垂直脊柱 + AnimatePresence + layout；**复用其现有 `freshHashes` 逻辑与 `TransactionRow` 类型，零新增字段** |
| — | **新建** `VerificationChain` | §3 SVG 四态组件（含**新写的** `spine-glow` filter） |
| — | **新建** `VitalSignsStrip` | mono tabular-nums + pause/resume |
| — | **新建** `VerificationScopePanel` | 选中卡的放大详情 |
| — | **新建** `SettlementCard` | hash-stripe（固定色）+ hash 文本印迹 + header + chain |
| Home hero | **重构** | 7/5 非对称，脊柱即 hero |
| `why-xrpl/page.tsx` | **重写** | 宣言 spread |
| `build/page.tsx` | **重写** | live-result-then-code + tabs |
| `globals.css` | **多 token 迁移（非一行）** | 见下「最高风险改动」 |
| `layout.tsx` | 保持 | Geist Sans/Mono 已在 |

### globals.css 迁移（**本套最高风险 CSS 改动**——非一行 token swap）

E4 已确认这不是简单 swap。迁移清单：

1. `--bg-base #000 → --ink-base #0C0A08`；`--bg-surface #000 → --ink-surface #14110D`（**两者拉开一档**）。
2. `body { background }`（`:31`）随之更新。
3. 审计**全部** `rgba(255,255,255,*)` elevation（`:15,102,116,132,160,165,228,232,236…`）——它们都是针对纯黑调过的，在暖墨场上需重新取值。
4. 审计 `!important` 覆盖块（`:186,201,206…` 把硬编码 bg 强推 `--bg-surface`）——确认改名后仍生效。
5. 新增 palette / motion token（`--t54-coral #C9462E`、alpha ramps、3 durations / 2 easings）。
6. `box-shadow:none !important`（`:172/:178`）**保持不动**。
7. **强制全站视觉回归 pass**——这是该方向风险最高的一步，必须排期，不可当作顺手改。

### Box-shadow 决策

**不放松全局规则。** 全部辉光走**新写的** SVG `feGaussianBlur`+`feMerge`（共享 `<defs>`）+ conic-gradient border + radial-gradient fill + 色阶层级。**无 `success.svg` 可照搬——按新工作量预算。**

### 性能预算

- 仅动 `transform` / `opacity`；每帧动画元素 < ~24（去掉 blob/equalizer 后更低）。
- feed DOM 上限 12 卡；数据节流 200ms。
- 背景仅静态 grid。`prefers-reduced-motion` 全程 gate；Lighthouse perf ≥ 90，INP < 200ms。

### 分阶段构建顺序（数据真实性已诚实分级）

| Phase | 内容 | 可行性 / 数据诚实度 |
|---|---|---|
| **P1（现在可做）** | palette/motion token；**globals.css 多 token 迁移 + 回归**；新写 `spine-glow` filter；`LedgerSpine` + `SettlementCard` + `VerificationChain` 四态（由 `verifiableIntent`/`riskChecked`/`timestamp` **两布尔驱动的确定性编排**）；hash 文本印迹；`prefers-reduced-motion` | **Feasible now** — 全部基于真实字段；多阶段是 choreography，非真实遥测（已声明） |
| **P2** | `VitalSignsStrip` + pause/resume + `VerificationScopePanel`；静态 blueprint grid；Home hero 7/5 重构 | Feasible |
| **P3** | Why XRPL 宣言 spread（+ 可选编号 FIG 系统）；Build live-result-then-code + tabs | Feasible |
| **P4（aspirational — 需真实数据源）** | **L1/L2/L3 逐节点真实计时、delegation ceiling 真实数值、mini-graph 真实链上数据**；kinetic hero 词替换；完整 logo-DNA 图标集重绘 | **现在即 aspirational**：在数据源到位前，这些数值**留空/占位**，绝不显示捏造值 |

---

## 7. 关键决策点 (Decisions for the stakeholder)

| # | 决策 | 推荐 | 影响 |
|---|---|---|---|
| 1 | **第三信号色 vs 形态封存** | **形态封存**（实心/闭合/加粗），green 仅 pill 内 1px 文字勾 | 这是最大去模板杠杆；放弃它会滑回 crypto-SaaS 三色叙事 |
| 2 | **coral register** | **oxide `#C9462E`**，非 candy `#FF624A` | 决定整站读作 instrument 还是 consumer app |
| 3 | **是否全局放松 box-shadow** | **否** —— 新写 SVG filter + 色阶层级足够 | 放松会影响全站既有元素 |
| 4 | **字体** | **仅仓库内 Geist Sans/Mono**，mono 作 instrument display | 零新依赖、零许可风险 |
| 5 | **globals.css 暖墨迁移** | 同意，但**按多 token 迁移 + 全站回归排期**（非一行） | 本套最高风险 CSS 改动 |
| 6 | **feed/chain 数据真实性** | P1 两布尔驱动确定性编排并**声明**；逐节点数值/delegation/mini-graph 列 P4 aspirational，数据到位前留空 | BD 受众会识破捏造遥测——诚实分级是信誉前提 |
| 7 | **FIG 图注** | 默认不用；仅 Why XRPL 真编号图表系统时启用且必须回指 | 防止装饰伪装严谨 |

---

**Buildability 对账（逐条 grep 核实，已去除全部捏造）：**
Geist Sans/Mono 在 `apps/web/src/app/layout.tsx`（已注入）；framer-motion 12 + Tailwind 4 + Next 16 在 `package.json`；`--bg-base`/`--bg-surface` 均为 `#000`、`--success:#10B981`、大量 `rgba(255,255,255,*)` elevation 与 `!important` 覆盖在 `globals.css`（暖墨迁移按多 token + 回归处理）；`box-shadow:none !important` 在 `globals.css:172/178`（保持不动，辉光走**新写** SVG filter——仓库内**无 `success.svg`**，按新工作量预算）；`TransactionRow` 字段为 `hash/amount/asset/timestamp/sourceTag/verifiableIntent/riskChecked/merchant`（`RecentTransactionsLive.tsx:10–19`——**无 `intentHash`**，故 key 用 `hash`、hash-stripe 用固定色 + 文本印迹，不用随机 hash 色块）；`pathLength` 逐形状动画（line/path），circle 用 scale/opacity。**本方向全程不违反任何既定技术约束，且所有引用均可在仓库中验证。**
