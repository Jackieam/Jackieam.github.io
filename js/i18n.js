/* ------------------------------------------------------------------ */
/*  Trilingual UI (EN default / 中文 / 日本語).                          */
/*                                                                      */
/*  English lives in the HTML itself and is snapshotted on load; the    */
/*  dictionaries below only hold the zh/ja overrides, keyed by the      */
/*  data-i18n attribute. Missing keys fall back to English.             */
/*  Publication titles and author lists stay in English on purpose.     */
/*  Every load starts in English; the picker switches for that visit    */
/*  only, and is deliberately not remembered. <html lang> follows.      */
/* ------------------------------------------------------------------ */

(function () {
  "use strict";

  var DICT = {
    /*  English normally lives in the HTML and is snapshotted from it, so
        this block only needs the strings that no element carries — the
        ones js/telemetry.js and js/vegeta.js build at runtime. */
    en: {
      "pet.off": "Turn it off",
      "pet.on": "Turn it on",

      "tele.you": "you",
      "tele.none": "no country/region data yet"
    },

    zh: {
      "nav.news": "动态",
      "nav.sel": "研究",
      "nav.pubs": "论文发表",
      "nav.exp": "工作经历",

      "tagline": "SB Intuitions Research Scientist · 大阪大学博士",
      "about.p1": "我目前在 <a href=\"https://www.sbintuitions.co.jp/\">SB Intuitions</a> 担任 Research Scientist，从事负责任人工智能（Responsible AI）相关的研究与开发。我于<a href=\"https://www.osaka-u.ac.jp/\">大阪大学</a> D3 中心（原 Institute for Datability Science）取得博士学位，导师为 <a href=\"https://www.n-yuta.jp/\">Yuta Nakashima</a> 教授与 <a href=\"https://is.d3c.osaka-u.ac.jp/en/\">Hajime Nagahara</a> 教授；此前在大阪大学医学系研究科取得硕士学位。",
      "about.p2": "我的研究方向包括<strong>负责任人工智能（Responsible AI）</strong>、<strong>视觉上下文学习（visual in-context learning）</strong>，以及<strong>视觉-语言模型的安全与对齐</strong>。此外，我也关注医学影像分析与医疗领域的 AI 应用。",

      "news.title": "动态",
      "news.emnlp.t": "2026.08", "news.emnlp.b": "<em>Do VLMs Share Safety Neurons Across Modalities?</em> 被 <strong>EMNLP 2026</strong>（主会议）接收。",
      "news.1.t": "2026.04", "news.1.b": "加入 <strong>SB Intuitions</strong>，担任 Research Scientist，从事 Responsible AI 的研究与开发。",
      "news.phd.t": "2026.03", "news.phd.b": "于大阪大学取得<strong>博士学位</strong>。",
      "news.3.t": "2025.09", "news.3.b": "<em>PANICL</em> 已公开于 arXiv。",
      "news.5.t": "2024.09", "news.5.b": "<em>DiReCT</em> 被 NeurIPS 2024（Datasets &amp; Benchmarks Track）接收。",
      "news.6.t": "2023.10", "news.6.b": "<em>InMeMo</em> 被 WACV 2024 接收。",

      "sel.title": "近期研究",
      "sel.note": "以下是四项近期工作的详细介绍。<sup>*</sup> 表示（共同）第一作者。",
      "sel.safetyneuron": "同样的有害请求，以文本给出时视觉-语言模型的语言主干会拒绝，可一旦包装成图像却常常照做。本工作在 10 个 VLM 上对安全机制做了神经元级的<em>因果</em>分析：提出考虑自修复效应的两阶段迭代消融检测流程，并构建了将视觉与文本安全信号解耦的两个模态隔离基准 ViSafe-Detect 与 ViSafe-Eval。结果显示，文本安全高度可定位——约 88 个神经元（不到 0.01%）——且是主导的拒答通路；而视觉安全在单神经元层面高度弥散：文本安全只需约 5 个子空间方向，视觉安全却需要 50 个以上。",
      "sel.panicl": "视觉上下文学习通常只依赖单一的输入-输出图像对作为提示，这会导致预测出现偏差且不稳定。PANICL 是一个<em>免训练</em>框架，转而聚合多个上下文对，并在它们之间平滑匹配分数以消除偏差。该方法在前景分割、单目标检测、图像上色、多目标分割和关键点检测等任务上均超越了强基线，并在数据集迁移和标签空间迁移下保持稳健。",
      "sel.inmemo": "视觉上下文学习只给冻结的大模型提供一对输入-输出图像来示范任务，因此效果高度依赖这一对样例的质量。InMeMo 在上下文对本身注入<em>可学习扰动</em>，让示范样例本身随任务自适应，而大模型保持冻结。这一轻量训练相比无可学习提示的基线，将前景分割的 mIoU 提升 7.35，单目标检测提升 15.13。",
      "sel.direct": "大语言模型在医学考试题上表现出色，却很少给出临床医生可核查的推理过程。DiReCT 是一个包含 511 份临床病历的基准，每份都由医生标注了从观察到最终诊断的完整推理路径，并配有诊断知识图谱。对主流大模型的评测揭示出它们与人类医生在推理能力上的显著差距。",

      "tp.vicl": "视觉上下文学习",
      "tp.tf": "免训练",
      "tp.prompt": "提示学习",
      "tp.llm": "大模型推理",
      "tp.bench": "基准数据集",
      "tp.safety": "视觉语言模型安全",
      "tp.interp": "可解释性",

      "pubs.title": "论文发表",
      "pubs.note": "此处为部分代表性论文，完整列表请见 <a href=\"https://scholar.google.com/citations?user=jRcFD0MAAAAJ\">Google Scholar</a>。<sup>*</sup> 表示（共同）第一作者。",
      "pubs.conf": "国际会议",
      "pubs.jour": "期刊论文",
      "pubs.pre": "预印本",

      "exp.title": "工作经历",
      "exp.sb.when": "2026.04 – 至今",
      "exp.sb.what": "<strong>SB Intuitions</strong> — Research Scientist<br><span class=\"cv-detail\">负责任人工智能（Responsible AI）的研究与开发</span>",
      "exp.ly.when": "2024.08 – 11",
      "exp.ly.what": "<strong>LY Corporation</strong> — 研究实习生<br><span class=\"cv-detail\">基于大规模视觉-语言模型的内容感知版面生成（VASCAR）</span>",
      "exp.ids.when": "2023.08 – 2024.07",
      "exp.ids.what": "<strong>大阪大学 Institute for Datability Science</strong> — 科研助理",
      "exp.pamela.when": "2021.08 – 2022.08",
      "exp.pamela.what": "<strong>PaMeLa Co., Ltd.</strong> — 数据分析师",

      "edu.title": "教育背景",
      "edu.phd.when": "2023.04 – 2026.03",
      "edu.phd.what": "<strong>大阪大学</strong> — 计算机科学博士（D3 中心）<br><span class=\"cv-detail\">导师：Yuta Nakashima 教授、Hajime Nagahara 教授</span>",
      "edu.ms.when": "2021.04 – 2023.03",
      "edu.ms.what": "<strong>大阪大学</strong> — 医科学硕士（医学信息学）· 医学系研究科",
      "edu.rs.when": "2019.10 – 2021.03",
      "edu.rs.what": "<strong>大阪大学</strong> — 研究生（医学信息学）· 医学系研究科",
      "edu.bs.when": "2015 – 2019",
      "edu.bs.what": "<strong>郑州大学</strong> — 计算机科学学士",

      "awards.title": "荣誉奖项",
      "aw.miru.when": "2025.08",
      "aw.miru.what": "<strong>MIRU 学生奖励奖</strong> — 第 28 届图像识别与理解研讨会（MIRU 2025）",
      "aw.fellow.when": "2023 – 2026",
      "aw.fellow.what": "<strong>大阪大学 Fellowship</strong> — Fellowship for Integration of Knowledge with Society",
      "aw.poster.when": "2022.06",
      "aw.poster.what": "<strong>优秀海报奖</strong> — 日本医疗人工智能学会 第 4 届学术年会",
      "aw.paper.when": "2020.11",
      "aw.paper.what": "<strong>最佳论文奖</strong> — 亚太医学信息学会（APAMI）2020",

      "act.title": "学术活动",
      "act.sanken.when": "2025.11",
      "act.sanken.what": "<strong>海报发表</strong>，<a href=\"https://www.sanken.osaka-u.ac.jp/gakujutu/81/\">第 81 回产研学术讲演会</a>，大阪大学 产业科学研究所（SANKEN），日本",
      "act.rev.when": "审稿",
      "act.rev.what": "IJCV、NeurIPS、CVPR、ECCV、ACL ARR、AAAI、BMVC、ACCV",

      "footer.pet": "页面角落镇守着像素超赛魔人贝吉塔——点击任意位置，他就朝那里开火。",
      "footer.credit": "像素图为手绘同人作品，《龙珠》版权归原作者所有。",
      "pet.off": "让他走",
      "pet.on": "请他回来",

      "vg.bigbang": "大爆炸攻击！",
      "vg.galickcharge": "加力克炮……",
      "vg.galick": "发射！",
      "vg.charge": "就用这一击了结你！",
      "vg.finalflash": "终极闪光！！",
      "vg.sacrifice": "这是…… 为了我的家人！",
      "vg.explosion": "最终爆炸！！！",
      "vg.back": "哼。用不着那么惊讶。",
      "vg.blocked": "护盾？…… 哼，有点意思。",

      "tele.visits": "&nbsp;次访问",
      "tele.origins": "访客来源",
      "tele.countries": "&nbsp;个国家 / 地区",
      "tele.scan": "扫描中…",
      "tele.you": "你",
      "tele.none": "暂无国家数据",
      "tele.note": "只按国家 / 地区汇总统计访问来源。不记录 IP、城市、Cookie，也不保存任何单次访问的记录。"
    },

    ja: {
      "nav.news": "ニュース",
      "nav.sel": "研究",
      "nav.pubs": "研究業績",
      "nav.exp": "職歴",

      "tagline": "SB Intuitions リサーチサイエンティスト · 大阪大学 博士（情報科学）",
      "about.p1": "<a href=\"https://www.sbintuitions.co.jp/\">SB Intuitions</a> のリサーチサイエンティストとして、Responsible AI（責任ある AI）に関する研究開発に取り組んでいます。<a href=\"https://www.osaka-u.ac.jp/\">大阪大学</a> D3センター（旧 データビリティフロンティア機構）にて、<a href=\"https://www.n-yuta.jp/\">中島 悠太</a> 教授と <a href=\"https://is.d3c.osaka-u.ac.jp/en/\">長原 一</a> 教授のご指導のもと博士号を取得。それ以前は、大阪大学大学院医学系研究科で修士号を取得しました。",
      "about.p2": "研究テーマは、<strong>Responsible AI</strong>、<strong>視覚的インコンテキスト学習（visual in-context learning）</strong>、<strong>視覚言語モデルの安全性とアライメント</strong>です。医用画像解析や医療分野への AI 応用にも関心があります。",

      "news.title": "ニュース",
      "news.emnlp.t": "2026.08", "news.emnlp.b": "<em>Do VLMs Share Safety Neurons Across Modalities?</em> が <strong>EMNLP 2026</strong>（Main Conference）に採択されました。",
      "news.1.t": "2026.04", "news.1.b": "<strong>SB Intuitions</strong> にリサーチサイエンティストとして入社。Responsible AI の研究開発に従事。",
      "news.phd.t": "2026.03", "news.phd.b": "大阪大学にて<strong>博士号</strong>を取得。",
      "news.3.t": "2025.09", "news.3.b": "<em>PANICL</em> を arXiv で公開しました。",
      "news.5.t": "2024.09", "news.5.b": "<em>DiReCT</em> が NeurIPS 2024（Datasets &amp; Benchmarks Track）に採択されました。",
      "news.6.t": "2023.10", "news.6.b": "<em>InMeMo</em> が WACV 2024 に採択されました。",

      "sel.title": "最近の研究",
      "sel.note": "近年の代表的な 4 件を詳しく紹介します。<sup>*</sup> は（共同）筆頭著者を表します。",
      "sel.safetyneuron": "同じ有害な要求でも、テキストなら LLM バックボーンが拒否するのに、画像として与えられると視覚言語モデルは応じてしまうことがあります。本研究では 10 個の VLM を対象に、安全機構をニューロンレベルで<em>因果的</em>に解析しました。自己修復を考慮した反復アブレーションによる 2 段階の検出パイプラインを提案し、視覚とテキストの安全性シグナルを切り分けるモダリティ分離ベンチマーク ViSafe-Detect・ViSafe-Eval を構築しています。テキストの安全性は約 88 個（0.01% 未満）のニューロンに局在し、拒否の主経路である一方、視覚の安全性は単一ニューロンでは捉えにくく拡散しており、テキストが約 5 方向の部分空間で済むところ 50 方向以上を必要とします。",
      "sel.panicl": "視覚的インコンテキスト学習は単一の入出力画像ペアに依存するため、予測が偏り不安定になりがちです。PANICL は<em>学習不要</em>のフレームワークで、複数のインコンテキストペアを統合し、それらの割当スコアを平滑化することで偏りを抑えます。前景セグメンテーション、単一物体検出、着色、複数物体セグメンテーション、キーポイント検出のいずれでも強力なベースラインを上回り、データセット・ラベル空間のドメインシフトにも頑健です。",
      "sel.inmemo": "視覚的インコンテキスト学習では、凍結した大規模モデルに入出力画像ペアを 1 組だけ与えてタスクを示すため、精度はそのペアの質に大きく左右されます。InMeMo はインコンテキストペア自体に<em>学習可能な摂動</em>を加え、モデルを凍結したまま示例そのものを適応させます。この軽量な学習により、学習可能プロンプトなしのベースラインと比べ、前景セグメンテーションで mIoU +7.35、単一物体検出で +15.13 を達成しました。",
      "sel.direct": "大規模言語モデルは医学試験問題には強い一方、臨床医が検証できる推論過程はほとんど示しません。DiReCT は 511 件の臨床ノートからなるベンチマークで、各ノートには医師が観察から最終診断に至る推論過程を注釈し、診断知識グラフも付属します。主要な大規模言語モデルの評価により、人間の医師との推論能力の大きな差が明らかになりました。",

      "tp.vicl": "視覚的インコンテキスト学習",
      "tp.tf": "学習不要",
      "tp.prompt": "プロンプト学習",
      "tp.llm": "LLM 推論",
      "tp.bench": "ベンチマーク",
      "tp.safety": "VLM の安全性",
      "tp.interp": "解釈可能性",

      "pubs.title": "研究業績",
      "pubs.note": "主要な論文のみを掲載しています。全リストは <a href=\"https://scholar.google.com/citations?user=jRcFD0MAAAAJ\">Google Scholar</a> をご覧ください。<sup>*</sup> は（共同）筆頭著者を表します。",
      "pubs.conf": "国際会議",
      "pubs.jour": "学術誌論文",
      "pubs.pre": "プレプリント",

      "exp.title": "職歴",
      "exp.sb.when": "2026.04 – 現在",
      "exp.sb.what": "<strong>SB Intuitions</strong> — リサーチサイエンティスト<br><span class=\"cv-detail\">Responsible AI の研究開発</span>",
      "exp.ly.when": "2024.08 – 11",
      "exp.ly.what": "<strong>LY Corporation</strong> — リサーチインターン<br><span class=\"cv-detail\">大規模視覚言語モデルによるコンテンツ適応型レイアウト生成（VASCAR）</span>",
      "exp.ids.when": "2023.08 – 2024.07",
      "exp.ids.what": "<strong>大阪大学 データビリティフロンティア機構</strong> — リサーチアシスタント",
      "exp.pamela.when": "2021.08 – 2022.08",
      "exp.pamela.what": "<strong>PaMeLa 株式会社</strong> — データアナリスト",

      "edu.title": "学歴",
      "edu.phd.when": "2023.04 – 2026.03",
      "edu.phd.what": "<strong>大阪大学</strong> — 情報科学 博士課程 修了（D3センター）<br><span class=\"cv-detail\">指導教員：中島 悠太 教授・長原 一 教授</span>",
      "edu.ms.when": "2021.04 – 2023.03",
      "edu.ms.what": "<strong>大阪大学</strong> — 大学院医学系研究科 医療情報学 修士課程 修了",
      "edu.rs.when": "2019.10 – 2021.03",
      "edu.rs.what": "<strong>大阪大学</strong> — 大学院医学系研究科 研究生（医療情報学）",
      "edu.bs.when": "2015 – 2019",
      "edu.bs.what": "<strong>鄭州大学</strong> — 計算機科学 学士",

      "awards.title": "受賞",
      "aw.miru.when": "2025.08",
      "aw.miru.what": "<strong>MIRU学生奨励賞</strong> — 第28回 画像の認識・理解シンポジウム（MIRU2025）",
      "aw.fellow.when": "2023 – 2026",
      "aw.fellow.what": "<strong>大阪大学フェローシップ</strong> — Fellowship for Integration of Knowledge with Society",
      "aw.poster.when": "2022.06",
      "aw.poster.what": "<strong>優秀ポスター賞</strong> — 日本メディカルAI学会 第4回学術集会",
      "aw.paper.when": "2020.11",
      "aw.paper.what": "<strong>Best Paper Award</strong> — アジア太平洋医療情報学会（APAMI）2020",

      "act.title": "学術活動",
      "act.sanken.when": "2025.11",
      "act.sanken.what": "<strong>ポスター発表</strong>、<a href=\"https://www.sanken.osaka-u.ac.jp/gakujutu/81/\">第81回 産研学術講演会</a>、大阪大学 産業科学研究所（SANKEN）、日本",
      "act.rev.when": "査読",
      "act.rev.what": "IJCV、NeurIPS、CVPR、ECCV、ACL ARR、AAAI、BMVC、ACCV",

      "footer.pet": "ページの隅を守るピクセルの超サイヤ人・魔人ベジータ。クリックした場所へ撃ち込みます。",
      "footer.credit": "スプライトは手描きのファンアートです。ドラゴンボールの権利は原著作者に帰属します。",
      "pet.off": "オフにする",
      "pet.on": "オンにする",

      "vg.bigbang": "ビッグバンアタック！",
      "vg.galickcharge": "ギャリック砲……",
      "vg.galick": "発射！",
      "vg.charge": "これで終わりだ！",
      "vg.finalflash": "ファイナルフラッシュ！！",
      "vg.sacrifice": "これは…… 家族のためだ！",
      "vg.explosion": "ファイナルエクスプロージョン！！！",
      "vg.back": "フン。そんなに驚くな。",
      "vg.blocked": "バリアだと？…… フン、面白い。",

      "tele.visits": "&nbsp;アクセス",
      "tele.origins": "アクセス元",
      "tele.countries": "&nbsp;か国・地域",
      "tele.scan": "スキャン中…",
      "tele.you": "あなた",
      "tele.none": "国・地域のデータはまだありません",
      "tele.note": "アクセス元の国・地域だけを集計しています。IP・都市・Cookie は記録せず、個々のアクセスも保存しません。"
    }
  };

  var HTML_LANG = { en: "en", zh: "zh-CN", ja: "ja" };

  var els = document.querySelectorAll("[data-i18n]");
  var base = {};
  els.forEach(function (el) { base[el.getAttribute("data-i18n")] = el.innerHTML; });

  var current = "en";

  function t(key) {
    if (current !== "en" && DICT[current] && DICT[current][key] != null) return DICT[current][key];
    if (base[key] != null) return base[key];
    if (DICT.en[key] != null) return DICT.en[key];
    return key;
  }

  function apply(lang) {
    current = (lang === "zh" || lang === "ja") ? lang : "en";
    document.documentElement.lang = HTML_LANG[current];
    els.forEach(function (el) { el.innerHTML = t(el.getAttribute("data-i18n")); });
    var sel = document.getElementById("lang-select");
    if (sel) sel.value = current;
    document.dispatchEvent(new CustomEvent("sitelang"));
  }

  window.siteI18n = { t: t, apply: apply };

  /*  The page always opens in English, so what a first-time reader sees
      never depends on what some earlier visit happened to click. The picker
      still switches the page for as long as the visitor stays on it. To make
      it sticky again, write the language in apply() and restore it here.

      sel.value is pinned rather than assumed: Firefox restores <select>
      state across a reload, which would otherwise leave the picker reading
      中文 above English content. The key older builds wrote is cleared too,
      so a browser still carrying one is not left stuck in zh/ja. */
  var sel = document.getElementById("lang-select");
  if (sel) {
    sel.value = "en";
    sel.addEventListener("change", function () { apply(sel.value); });
  }
  try { localStorage.removeItem("lang"); } catch (e) { /* private mode */ }
})();
