window.SCALE_DEFINITIONS = {
  gad7: {
    name: "GAD-7",
    englishName: "Generalized Anxiety Disorder 7-item Scale",
    category: "焦虑",
    purpose: "快速了解一般性焦虑症状水平。",
    period: "过去两周",
    source: "Spitzer et al., 2006",
    version: "GAD-7 原版结构",
    language: "中文自评版本",
    licenseStatus: "unknown",
    enabled: true,
    options: [
      { label: "完全不会", value: 0 },
      { label: "有几天", value: 1 },
      { label: "一半以上天数", value: 2 },
      { label: "几乎每天", value: 3 }
    ],
    questions: [
      "感觉紧张、焦虑或急切",
      "不能停止或控制担忧",
      "对各种各样的事情担忧过多",
      "很难放松下来",
      "由于不安而无法静坐",
      "变得容易烦恼或急躁",
      "感到似乎将有可怕的事情发生而害怕"
    ],
    maxScore: 21,
    bands: [
      { max: 4, label: "极少", description: "近期相关症状较少。" },
      { max: 9, label: "轻度", description: "存在一些轻度焦虑症状。" },
      { max: 14, label: "中度", description: "症状达到中等水平，可能开始干扰日常状态。" },
      { max: 21, label: "重度", description: "症状较为显著，可能已影响日常生活。" }
    ]
  },
  oasis: {
    name: "OASIS",
    englishName: "Overall Anxiety Severity and Impairment Scale",
    category: "焦虑与功能",
    purpose: "关注焦虑对工作、学习、社交与生活功能的影响。",
    period: "过去一周",
    source: "Norman et al., 2006",
    version: "OASIS 原版结构",
    language: "中文自评版本",
    licenseStatus: "unknown",
    enabled: true,
    options: [
      { label: "无 / 完全没有", value: 0 },
      { label: "偶尔 / 轻微", value: 1 },
      { label: "频繁 / 中度", value: 2 },
      { label: "很频繁 / 重度", value: 3 },
      { label: "持续 / 极重度", value: 4 }
    ],
    questions: [
      "在过去一周里，你感到焦虑或担忧的频率如何？",
      "你有多少种情境或活动是因为焦虑而回避或害怕的？",
      "焦虑在多大程度上干扰了你的工作或学习效率？",
      "焦虑在多大程度上干扰了你的社交生活或人际关系？",
      "焦虑在多大程度上损害了你享受生活的能力？"
    ],
    maxScore: 20,
    bands: [
      { max: 4, label: "亚临床", description: "焦虑症状较少，对日常功能影响有限。" },
      { max: 9, label: "轻度", description: "存在轻度焦虑，可能在特定情境下被唤起。" },
      { max: 14, label: "中度", description: "焦虑与功能影响处于中等水平，值得关注。" },
      { max: 20, label: "重度", description: "焦虑与功能影响较显著，建议尽早寻求专业评估。" }
    ]
  },
  phq9: {
    name: "PHQ-9",
    englishName: "Patient Health Questionnaire-9",
    category: "情绪低落",
    purpose: "了解近期低落、兴趣、精力与睡眠等相关症状。",
    period: "过去两周",
    source: "Kroenke et al., 2001",
    version: "PHQ-9 原版结构",
    language: "中文自评版本",
    licenseStatus: "unknown",
    enabled: true,
    options: [
      { label: "完全不会", value: 0 },
      { label: "有几天", value: 1 },
      { label: "一半以上天数", value: 2 },
      { label: "几乎每天", value: 3 }
    ],
    questions: [
      "做事时提不起劲或没有兴趣",
      "感到心情低落、沮丧或绝望",
      "入睡困难、睡不安稳或睡眠过多",
      "感觉疲倦或没有活力",
      "食欲不振或吃太多",
      "觉得自己很糟，或觉得自己很失败，或让自己或家人失望",
      "对事物专注有困难，例如阅读报纸或看电视时",
      "动作或说话速度缓慢到别人已经察觉，或烦躁、坐立不安",
      "有不如死掉或用某种方式伤害自己的念头"
    ],
    maxScore: 27,
    bands: [
      { max: 4, label: "无明显", description: "近期相关症状较少。" },
      { max: 9, label: "轻度", description: "存在轻度情绪低落相关症状。" },
      { max: 14, label: "中度", description: "症状达到中等水平，可能影响日常状态。" },
      { max: 19, label: "中重度", description: "症状较为明显，建议进一步评估。" },
      { max: 27, label: "重度", description: "症状显著，建议尽快寻求专业评估。" }
    ],
    safetyQuestion: 8
  },
  dass21: {
    name: "DASS-21",
    englishName: "Depression Anxiety Stress Scales-21",
    category: "综合",
    purpose: "查看抑郁、焦虑、压力三个维度的症状水平。",
    period: "过去一周",
    source: "Lovibond & Lovibond, 1995",
    version: "DASS-21 原版结构",
    language: "中文自评版本",
    licenseStatus: "permission-required",
    scoreMode: "subscales",
    subscales: [
      { key: "depression", name: "抑郁", indexes: [2, 4, 9, 12, 15, 16, 20], multiplier: 2, bands: [{ max: 9, label: "正常" }, { max: 13, label: "轻度" }, { max: 20, label: "中度" }, { max: 27, label: "重度" }, { max: 42, label: "极重度" }] },
      { key: "anxiety", name: "焦虑", indexes: [1, 3, 6, 8, 11, 13, 18], multiplier: 2, bands: [{ max: 7, label: "正常" }, { max: 9, label: "轻度" }, { max: 14, label: "中度" }, { max: 19, label: "重度" }, { max: 42, label: "极重度" }] },
      { key: "stress", name: "压力", indexes: [0, 5, 7, 10, 14, 17, 19], multiplier: 2, bands: [{ max: 14, label: "正常" }, { max: 18, label: "轻度" }, { max: 25, label: "中度" }, { max: 33, label: "重度" }, { max: 42, label: "极重度" }] }
    ],
    enabled: true,
    options: [
      { label: "不符合", value: 0 },
      { label: "有时符合", value: 1 },
      { label: "经常符合", value: 2 },
      { label: "总是符合", value: 3 }
    ],
    questions: [
      "我觉得很难让自己安静下来",
      "我感到口干舌燥",
      "我好像不能体会到任何愉快或美好的感觉",
      "我感到呼吸困难",
      "我觉得很难主动去开始工作或做事",
      "我往往对事情做出过度反应",
      "我感到颤抖",
      "我觉得自己消耗了很多精神在焦虑上",
      "我担心一些自己可能会恐慌或出丑的场合",
      "我觉得自己没有什么可以期待的",
      "我发现自己很容易烦躁不安",
      "我觉得很难放松",
      "我感到忧愁、沮丧",
      "我无法容忍任何阻碍我继续做事的事物",
      "我感到快要惊慌失措了",
      "我对任何事情都提不起热情",
      "我觉得自己作为一个人没有什么价值",
      "我觉得自己相当易怒",
      "我在没有明显体力消耗的情况下也感到心跳加速或心律不齐",
      "我无缘无故地感到害怕",
      "我觉得生命没有意义"
    ],
    maxScore: 126,
    bands: [
      { max: 126, label: "按三个维度分别解释", description: "DASS-21 按抑郁、焦虑和压力三个维度分别计分，每个维度分数乘以 2。" }
    ]
  },
  pss10: {
    name: "PSS-10",
    englishName: "Perceived Stress Scale-10",
    category: "压力",
    purpose: "了解近一个月的压力感与失控感。",
    period: "过去一个月",
    source: "Cohen et al., 1983",
    version: "PSS-10 原版结构",
    language: "中文自评版本",
    licenseStatus: "permission-required",
    enabled: true,
    options: [
      { label: "从不", value: 0 },
      { label: "偶尔", value: 1 },
      { label: "有时", value: 2 },
      { label: "时常", value: 3 },
      { label: "频繁", value: 4 }
    ],
    reverse: [3, 4, 6, 7],
    questions: [
      "因为意外发生的事情而感到心烦意乱",
      "感觉无法控制生活中重要的事情",
      "感到紧张和有压力",
      "对自己处理个人问题的能力感到有信心",
      "感觉事情都在自己的掌控之中",
      "发现自己无法应付所有必须做的事情",
      "能够控制生活中令你恼怒的事情",
      "感觉自己能驾驭日常事务",
      "因为一些自己无法控制的事情而生气",
      "感到困难堆积如山，自己无法克服"
    ],
    maxScore: 40,
    bands: [
      { max: 13, label: "低压力", description: "近期感知到的压力水平较低。" },
      { max: 19, label: "中等压力", description: "存在一定压力，多数人会经历这一水平。" },
      { max: 27, label: "高压力", description: "压力感偏高，可能影响情绪和身体状态。" },
      { max: 40, label: "压力很高", description: "压力感显著，建议主动减压并寻求支持。" }
    ]
  },
  isi: {
    name: "ISI",
    englishName: "Insomnia Severity Index",
    category: "睡眠",
    purpose: "了解入睡、维持睡眠和白天功能受损程度。",
    period: "过去两周",
    source: "Morin et al., 1993",
    version: "ISI 原版结构",
    language: "中文自评版本",
    licenseStatus: "permission-required",
    enabled: true,
    options: [
      { label: "无 / 非常满意", value: 0 },
      { label: "轻度 / 满意", value: 1 },
      { label: "中度 / 一般", value: 2 },
      { label: "重度 / 不满意", value: 3 },
      { label: "极重度 / 非常不满意", value: 4 }
    ],
    questions: [
      "入睡困难的程度",
      "夜间维持睡眠困难的程度",
      "清晨早醒的程度",
      "你对目前睡眠模式的满意度",
      "睡眠问题对白天功能的影响",
      "别人察觉到你的睡眠问题影响生活质量的程度",
      "你对当前睡眠问题的担忧或苦恼程度"
    ],
    maxScore: 28,
    bands: [
      { max: 7, label: "无临床失眠", description: "睡眠问题未达到临床意义。" },
      { max: 14, label: "亚临床失眠", description: "存在轻度睡眠困扰，值得关注睡眠卫生。" },
      { max: 21, label: "中度临床失眠", description: "失眠已较明显，建议寻求专业帮助。" },
      { max: 28, label: "重度临床失眠", description: "失眠严重，建议寻求专业评估。" }
    ]
  },
  who5: {
    name: "WHO-5",
    englishName: "WHO-Five Well-Being Index",
    category: "身心状态",
    purpose: "从积极视角了解近期身心健康与幸福感。",
    period: "过去两周",
    source: "World Health Organization, 1998",
    version: "WHO-5 原版结构",
    language: "中文自评版本",
    licenseStatus: "permission-required",
    enabled: true,
    options: [
      { label: "从未", value: 0 },
      { label: "偶尔", value: 1 },
      { label: "少于一半时间", value: 2 },
      { label: "多于一半时间", value: 3 },
      { label: "大部分时间", value: 4 },
      { label: "所有时间", value: 5 }
    ],
    questions: [
      "我感到愉快、心情好",
      "我感到平静和放松",
      "我感到精力充沛、有活力",
      "我醒来时感觉清新、得到了休息",
      "我的日常生活充满了令我感兴趣的事情"
    ],
    maxScore: 100,
    scoreMultiplier: 4,
    bands: [
      { max: 28, label: "需警惕", description: "身心健康指数明显偏低，建议进一步评估。" },
      { max: 50, label: "偏低", description: "身心健康指数偏低，值得关注近期状态。" },
      { max: 100, label: "良好", description: "近期身心健康状态相对良好。" }
    ]
  }
};
