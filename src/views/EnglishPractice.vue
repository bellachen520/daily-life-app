<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { bbcEpisodes } from '@/db/bbc'

const router = useRouter()
const route = useRoute()

const episode = computed(() => {
  const id = Number(route.params.id)
  return bbcEpisodes.find(e => e.id === id) || bbcEpisodes[0]
})

// 状态
const showTranslation = ref(true)
const showWordModal = ref(false)
const showWordTip = ref(false)
const currentWord = ref({ word: '', meaning: '' })
const currentSentence = ref(0)
const isPlaying = ref(false)
const playbackRate = ref(1.0)
const isLooping = ref(false)

// TTS
let utterance: SpeechSynthesisUtterance | null = null

function getVoice() {
  const voices = speechSynthesis.getVoices()
  return voices.find(v => v.lang.startsWith('en')) || null
}

function speak(text: string, onEnd?: () => void) {
  speechSynthesis.cancel()
  utterance = new SpeechSynthesisUtterance(text)
  const voice = getVoice()
  if (voice) utterance.voice = voice
  utterance.rate = playbackRate.value
  utterance.pitch = 1.0

  utterance.onend = () => {
    if (onEnd) onEnd()
  }
  utterance.onerror = () => {
    if (onEnd) onEnd()
  }

  speechSynthesis.speak(utterance)
}

// 播放/暂停当前句子
function togglePlay() {
  if (isPlaying.value) {
    speechSynthesis.cancel()
    isPlaying.value = false
  } else {
    playCurrentSentence()
  }
}

function playCurrentSentence() {
  if (!episode.value) return
  isPlaying.value = true
  const text = episode.value.sentences[currentSentence.value].en
  speak(text, () => {
    if (isLooping.value) {
      // 循环模式：重新播放同一句
      setTimeout(() => playCurrentSentence(), 500)
    } else if (currentSentence.value < episode.value!.sentences.length - 1) {
      // 自动播放下一句
      currentSentence.value++
      playCurrentSentence()
    } else {
      isPlaying.value = false
    }
  })
}

// 上一句
function prevSentence() {
  if (currentSentence.value > 0) {
    currentSentence.value--
    if (isPlaying.value) playCurrentSentence()
  }
}

// 下一句
function nextSentence() {
  if (!episode.value) return
  if (currentSentence.value < episode.value.sentences.length - 1) {
    currentSentence.value++
    if (isPlaying.value) playCurrentSentence()
  }
}

// 点击句子
function clickSentence(index: number) {
  currentSentence.value = index
  playCurrentSentence()
}

// 切换循环
function toggleLoop() {
  isLooping.value = !isLooping.value
}

// 倍速
function setRate(rate: number) {
  playbackRate.value = rate
  if (isPlaying.value) {
    playCurrentSentence()
  }
}

// 单词点击
function onWordClick(word: string) {
  const clean = word.replace(/[.,!?;:'"()]/g, '').toLowerCase()
  if (!clean || clean.length < 2) return

  const vocab = episode.value?.vocabulary.find(v => v.word.toLowerCase() === clean)

  const basicDict: Record<string, string> = {
    'hello': '你好', 'welcome': '欢迎', 'today': '今天', 'about': '关于',
    'people': '人们', 'more': '更多', 'world': '世界', 'time': '时间',
    'years': '年', 'many': '许多', 'much': '很多', 'very': '非常',
    'things': '事情', 'different': '不同的', 'important': '重要的',
    'really': '真正地', 'think': '认为', 'feel': '感觉', 'make': '使、做',
    'help': '帮助', 'work': '工作', 'life': '生活', 'good': '好的',
    'great': '伟大的', 'better': '更好的', 'best': '最好的',
    'first': '第一', 'last': '最后', 'need': '需要', 'want': '想要',
    'know': '知道', 'find': '找到', 'learn': '学习', 'study': '学习',
    'research': '研究', 'scientists': '科学家', 'experts': '专家',
    'language': '语言', 'music': '音乐', 'food': '食物',
    'reading': '阅读', 'books': '书', 'story': '故事',
    'dream': '梦', 'dreams': '梦', 'dreaming': '做梦',
    'loneliness': '孤独', 'lonely': '孤独的', 'alone': '独自',
    'remote': '远程的', 'office': '办公室', 'home': '家',
    'technology': '科技', 'future': '未来', 'past': '过去',
    'happiness': '幸福', 'happy': '快乐的', 'secret': '秘密',
    'climate': '气候', 'change': '改变', 'earth': '地球',
    'conversation': '对话', 'talk': '谈话', 'speak': '说话',
    'brain': '大脑', 'body': '身体', 'health': '健康',
    'children': '孩子们', 'child': '孩子', 'family': '家庭',
    'friends': '朋友', 'social': '社交的', 'media': '媒体',
    'morning': '早上', 'evening': '晚上', 'night': '夜晚',
    'water': '水', 'energy': '能量', 'nature': '自然',
    'question': '问题', 'answer': '答案', 'idea': '想法',
    'problem': '问题', 'solution': '解决方案',
    'history': '历史', 'culture': '文化', 'country': '国家',
    'school': '学校', 'teacher': '老师', 'student': '学生',
    'money': '钱', 'business': '商业', 'company': '公司',
    'phone': '电话', 'computer': '电脑', 'internet': '互联网',
    'exercise': '锻炼', 'sleep': '睡觉', 'eat': '吃',
    'play': '玩、演奏', 'listen': '听', 'watch': '看',
    'write': '写', 'read': '读', 'remember': '记住',
    'forget': '忘记', 'understand': '理解', 'believe': '相信',
    'happen': '发生', 'become': '成为', 'start': '开始',
    'stop': '停止', 'keep': '保持', 'give': '给',
    'take': '拿、花费', 'come': '来', 'go': '去',
    'new': '新的', 'old': '旧的', 'big': '大的', 'small': '小的',
    'high': '高的', 'low': '低的', 'long': '长的', 'short': '短的',
    'right': '正确的', 'wrong': '错误的', 'true': '真实的',
    'also': '也', 'even': '甚至', 'just': '只是', 'only': '仅仅',
    'always': '总是', 'never': '从不', 'sometimes': '有时',
    'everything': '一切', 'nothing': '没有什么', 'someone': '某人',
    'everyone': '每个人', 'anyone': '任何人',
    'between': '在...之间', 'during': '在...期间', 'without': '没有',
    'through': '通过', 'against': '反对', 'around': '周围',
    'however': '然而', 'therefore': '因此', 'because': '因为',
    'another': '另一个', 'other': '其他的', 'same': '相同的',
    'being': '存在、生物', 'having': '有', 'doing': '做',
    'using': '使用', 'making': '制作', 'getting': '获得',
    'living': '生活', 'working': '工作', 'learning': '学习',
    'talking': '谈话', 'saying': '说', 'thinking': '思考',
    'feeling': '感觉', 'looking': '看', 'asking': '问',
    'trying': '尝试', 'coming': '来', 'going': '去',
    'like': '像、喜欢', 'well': '好地', 'still': '仍然',
    'part': '部分', 'place': '地方', 'point': '点',
    'number': '数字', 'group': '组', 'example': '例子',
    'reason': '原因', 'fact': '事实', 'way': '方式',
    'day': '天', 'week': '周', 'month': '月', 'year': '年',
    'percent': '百分比', 'million': '百万', 'billion': '十亿',
    'degree': '度', 'level': '水平', 'temperature': '温度',
    'process': '过程', 'system': '系统', 'skill': '技能',
    'experience': '经验', 'knowledge': '知识', 'information': '信息',
    'habit': '习惯', 'balance': '平衡', 'attention': '注意力',
    'memory': '记忆', 'emotion': '情绪', 'feeling': '感觉',
    'situation': '情况', 'condition': '条件', 'environment': '环境',
    'challenge': '挑战', 'opportunity': '机会', 'choice': '选择',
    'decision': '决定', 'action': '行动', 'result': '结果',
    'effect': '效果', 'benefit': '好处', 'advantage': '优势',
    'disadvantage': '劣势', 'difference': '区别', 'similarity': '相似',
    'relationship': '关系', 'communication': '沟通',
    'development': '发展', 'improvement': '改善',
    'entertainment': '娱乐', 'education': '教育',
    'government': '政府', 'population': '人口',
    'activity': '活动', 'community': '社区',
    'individual': '个人', 'society': '社会',
    'science': '科学', 'art': '艺术', 'sport': '运动',
    'travel': '旅行', 'adventure': '冒险',
    'imagine': '想象', 'discover': '发现', 'create': '创造',
    'share': '分享', 'connect': '连接', 'support': '支持',
    'protect': '保护', 'control': '控制', 'manage': '管理',
    'develop': '发展', 'improve': '改善', 'increase': '增加',
    'reduce': '减少', 'prevent': '预防', 'avoid': '避免',
    'allow': '允许', 'encourage': '鼓励', 'suggest': '建议',
    'explain': '解释', 'describe': '描述', 'compare': '比较',
    'include': '包括', 'provide': '提供', 'produce': '生产',
    'consider': '考虑', 'expect': '期望', 'realize': '意识到',
    'wonder': '想知道', 'notice': '注意到', 'recognize': '认出',
    'appear': '出现', 'disappear': '消失', 'remain': '保持',
    'continue': '继续', 'follow': '跟随', 'lead': '带领',
    'bring': '带来', 'carry': '携带', 'hold': '持有',
    'build': '建造', 'break': '打破', 'cut': '切',
    'grow': '生长', 'die': '死亡', 'fall': '落下',
    'rise': '上升', 'turn': '转',
    'move': '移动', 'run': '跑', 'walk': '走',
    'stand': '站', 'sit': '坐', 'lie': '躺',
    'put': '放', 'set': '设置', 'get': '得到',
    'around': '在...周围', 'across': '穿过', 'along': '沿着',
    'above': '在...上方', 'below': '在...下方', 'behind': '在...后面',
    'before': '在...之前', 'after': '在...之后',
    'inside': '在里面', 'outside': '在外面',
    'together': '一起', 'apart': '分开',
    'away': '离开', 'back': '回来', 'forward': '向前',
    'up': '向上', 'down': '向下', 'over': '越过',
    'off': '离开', 'on': '在...上', 'in': '在...里', 'out': '出去',
    'soon': '很快', 'later': '稍后', 'now': '现在',
    'then': '那时', 'here': '这里', 'there': '那里',
    'everywhere': '到处', 'somewhere': '某处',
    'maybe': '也许', 'perhaps': '或许', 'probably': '可能',
    'certainly': '当然', 'definitely': '肯定', 'absolutely': '绝对',
    'actually': '实际上', 'basically': '基本上', 'especially': '尤其',
    'finally': '最后', 'eventually': '最终', 'suddenly': '突然',
    'immediately': '立即', 'recently': '最近', 'frequently': '频繁地',
    'usually': '通常', 'normally': '正常地', 'generally': '一般地',
    'mainly': '主要地', 'mostly': '大部分', 'partly': '部分地',
    'hardly': '几乎不', 'barely': '勉强', 'nearly': '几乎',
    'almost': '几乎', 'quite': '相当', 'rather': '相当',
    'too': '太', 'enough': '足够', 'extremely': '极其',
    'highly': '高度地', 'deeply': '深深地', 'strongly': '强烈地',
    'widely': '广泛地', 'closely': '紧密地', 'directly': '直接地',
    'exactly': '精确地', 'clearly': '清楚地', 'obviously': '明显地',
    'apparently': '显然', 'naturally': '自然地', 'easily': '容易地',
    'quickly': '快速地', 'slowly': '缓慢地', 'carefully': '仔细地',
    'simply': '简单地', 'mainly': '主要地',
  }

  const meaning = vocab?.meaning || basicDict[clean] || ''

  currentWord.value = { word: word.replace(/[.,!?;:'"()]/g, ''), meaning }
  showWordTip.value = true
}

function closeWordModal() {
  showWordModal.value = false
  showWordTip.value = false
}

// 重置进度
function resetProgress() {
  currentSentence.value = 0
  isPlaying.value = false
  speechSynthesis.cancel()
}

onUnmounted(() => {
  speechSynthesis.cancel()
})
</script>

<template>
  <div class="english-detail-page">
    <!-- 顶部栏 -->
    <div class="top-bar">
      <div class="back-btn" @click="router.push('/life')">
        <van-icon name="arrow-left" size="16" />
        <span>返回生活</span>
      </div>
      <a
        class="bbc-link"
        href="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english"
        target="_blank"
      >
        BBC 官网 ↗
      </a>
    </div>

    <div class="scroll-area">
      <!-- 文章标题 -->
      <div class="article-title-section">
        <h1>{{ episode.title }}</h1>
        <p class="subtitle">{{ episode.titleZh }}</p>
      </div>

      <!-- 统计信息 -->
      <div class="stats-row">
        <div class="stat-item">
          <van-icon name="notes-o" size="16" />
          <span>共 {{ episode.wordCount }} 词</span>
        </div>
        <div class="stat-item">
          <van-icon name="clock-o" size="16" />
          <span>时长 {{ episode.duration }}</span>
        </div>
        <div class="stat-item">
          <van-icon name="aim" size="16" />
          <span>词汇量 {{ episode.vocabLevel }}</span>
        </div>
      </div>

      <!-- 提示条 -->
      <div class="tip-box">
        当前译文为机器自动翻译，仅供参考；盲听时建议关闭「显示译文」专注听英文。
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button
          class="action-btn"
          :class="{ active: showTranslation }"
          @click="showTranslation = !showTranslation"
        >
          <van-icon name="description" />
          {{ showTranslation ? '隐藏译文' : '显示译文' }}
        </button>
        <button class="action-btn" @click="showWordModal = true">
          <van-icon name="graduation-cap" />
          单词训练
        </button>
        <button class="action-btn" @click="resetProgress">
          <van-icon name="replay" />
          重置进度
        </button>
      </div>

      <!-- 句子列表 -->
      <div class="sentence-list">
        <div
          class="sentence-item"
          v-for="(s, i) in episode.sentences"
          :key="i"
          :class="{ active: currentSentence === i }"
          @click="clickSentence(i)"
        >
          <div class="sentence-num">{{ i + 1 }}</div>
          <div class="sentence-content">
            <div class="sentence-en">
              <span
                v-for="(w, j) in s.en.split(' ')"
                :key="j"
                class="word"
                @click.stop="onWordClick(w)"
              >{{ w }} </span>
            </div>
            <div class="sentence-zh" v-if="showTranslation">{{ s.zh }}</div>
          </div>
        </div>
      </div>

      <!-- 底部占位 -->
      <div style="height: 220px"></div>
    </div>

    <!-- 底部播放器 -->
    <div class="player-bar">
      <!-- 倍速 -->
      <div class="rate-control">
        <span>倍速 {{ playbackRate.toFixed(1) }}x</span>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          :value="playbackRate"
          @input="(e) => { playbackRate = Number((e.target as HTMLInputElement).value); setRate(playbackRate); }"
        />
      </div>

      <!-- 进度 -->
      <div class="progress-info">
        <span>{{ currentSentence + 1 }}/{{ episode.sentences.length }}</span>
      </div>

      <!-- 控制按钮 -->
      <div class="control-buttons">
        <button class="ctrl-btn" @click="prevSentence">
          <van-icon name="arrow-left" size="20" />
        </button>
        <button class="ctrl-btn play-btn" :class="{ playing: isPlaying }" @click="togglePlay">
          <van-icon :name="isPlaying ? 'pause' : 'play'" size="24" />
        </button>
        <button class="ctrl-btn" @click="nextSentence">
          <van-icon name="arrow" size="20" />
        </button>
        <button class="ctrl-btn" :class="{ active: isLooping }" @click="toggleLoop">
          <van-icon name="replay" size="20" />
        </button>
      </div>
    </div>

    <!-- 单词弹窗 -->
    <van-popup v-model:show="showWordModal" round position="center" :style="{ width: '80%', padding: '20px' }">
      <div class="word-modal">
        <h3>🎓 单词训练</h3>
        <div class="word-list">
          <div class="word-row" v-for="v in episode.vocabulary" :key="v.word">
            <span class="word-en">{{ v.word }}</span>
            <span class="word-meaning">{{ v.meaning }}</span>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 单词点击提示 -->
    <van-popup v-model:show="showWordTip" round position="bottom" :style="{ padding: '20px' }">
      <div class="word-tip">
        <div class="word-tip-word">{{ currentWord.word }}</div>
        <div class="word-tip-meaning" v-if="currentWord.meaning">{{ currentWord.meaning }}</div>
        <div class="word-tip-meaning" v-else style="color: #999;">暂无翻译</div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.english-detail-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
  height: 100vh;
  height: 100dvh;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #07c160;
  cursor: pointer;
}
.bbc-link {
  font-size: 13px;
  color: #07c160;
  text-decoration: none;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
  padding: 16px;
  min-height: 0;
}

.article-title-section {
  margin-bottom: 12px;
}
.article-title-section h1 {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}
.subtitle {
  margin: 0;
  font-size: 15px;
  color: #666;
}

.stats-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.tip-box {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #d48806;
  line-height: 1.5;
  margin-bottom: 12px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 0;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn.active {
  border-color: #07c160;
  color: #07c160;
  background: #f6ffed;
}
.action-btn:active {
  opacity: 0.8;
}

.sentence-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.sentence-item {
  display: flex;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.15s;
}
.sentence-item.active {
  background: #f6ffed;
}
.sentence-item:active {
  background: #f5f5f5;
}
.sentence-num {
  min-width: 24px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  text-align: right;
}
.sentence-content {
  flex: 1;
}
.sentence-en {
  font-size: 15px;
  line-height: 1.7;
  color: #333;
  margin-bottom: 4px;
}
.word {
  cursor: pointer;
  transition: all 0.1s;
  border-radius: 2px;
  padding: 0 1px;
}
.word:hover {
  background: #ffeaa7;
}
.word:active {
  background: #fdcb6e;
}
.sentence-zh {
  font-size: 14px;
  color: #999;
  line-height: 1.6;
}

/* 底部播放器 */
.player-bar {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px 12px;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
}
.rate-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}
.rate-control input {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #e8e8e8;
  border-radius: 2px;
  outline: none;
}
.rate-control input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #07c160;
  cursor: pointer;
}

.progress-info {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.control-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}
.ctrl-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #d9d9d9;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}
.ctrl-btn:active {
  opacity: 0.7;
}
.ctrl-btn.active {
  border-color: #07c160;
  color: #07c160;
  background: #f6ffed;
}
.play-btn {
  width: 52px;
  height: 52px;
  background: #07c160;
  color: #fff;
  border: none;
}
.play-btn.playing {
  background: #ff976a;
}

/* 单词弹窗 */
.word-modal h3 {
  margin: 0 0 16px;
  font-size: 16px;
  text-align: center;
}
.word-list {
  max-height: 300px;
  overflow-y: auto;
}
.word-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.word-en {
  font-weight: 600;
  color: #333;
}
.word-meaning {
  color: #666;
  font-size: 14px;
}

.word-tip {
  text-align: center;
}
.word-tip-word {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}
.word-tip-meaning {
  font-size: 16px;
  color: #666;
}
</style>
