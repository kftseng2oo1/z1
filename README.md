# 紫微斗數排盤系統（紫微斗數 AI 大師）

完整的紫微斗數排盤與飛星分析：輸入生辰排出命盤，做三層飛宮分析，並可請 AI 大師依主題深度論命。

**線上使用**：https://kftseng2oo1.github.io/z1/

## 主要功能
- **排盤**：國曆轉農曆（含閏月）、命宮身宮、五行局、十四主星、輔星煞星、四化（祿權科忌）
- **流年切換**：去年／今年／明年，或用 ◀ ▶ 逐年切換
- **⚖ 大師級飛星分析**：體（生年）、用（大限）、出（流年）三層飛宮，宮位互飛、自化、因果、核心衝突等
- **專題分析**：婚姻感情、學業考試、健康體質、生育子女、財富格局、事業職涯、六親緣分、今年重點
- **🤖 AI 紫微大師**：針對命盤對話式論命
- **🔍 定盤助手**：時辰不確定時協助推定
- 儲存多人命盤、匯出 PDF、分享、語音朗讀

## 技術與依賴
- 單檔 HTML PWA（`index.html` 內含全部 HTML/CSS/JS），`manifest.json` + `sw.js` 提供安裝到主畫面與離線快取。（約 380 KB）
- AI：經 `arcar.kftseng2oo1.workers.dev` 代理，也可直連 `api.anthropic.com`
- Canvas、`MediaRecorder`、`speechSynthesis`、Web Share

## 相關 repo
- [ZIWEI](https://github.com/kftseng2oo1/ZIWEI)：另一個獨立的紫微斗數 App
- [tts-studio](https://github.com/kftseng2oo1/tts-studio)：產生飛星分析影片的旁白
