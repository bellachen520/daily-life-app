<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEnglishProgress } from '@/composables/useDB'
import { bbcEpisodes, type BBCEpisode } from '@/db/bbc'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
dayjs.extend(dayOfYear)

const router = useRouter()
const route = useRoute()
const { getByDate, markCompleted } = useEnglishProgress()

const today = dayjs().format('YYYY-MM-DD')
const showTranslation = ref(true)
const todayProgress = ref<any>(null)
const score = ref(0)
const currentEpisode = ref<BBCEpisode | null>(null)
const showEpisodeList = ref(false)
const isSpeaking = ref(false)
const speakingSentence = ref(-1)
const wordPopover = ref({ show: false, word: '', meaning: '', x: 0, y: 0 })

// 根据路由参数或当天日期选择文章
const episodeId = computed(() => {
  const id = Number(route.query.episode)
  if (id && bbcEpisodes.find(e => e.id === id)) return id
  const doy = dayjs().dayOfYear()
  return bbcEpisodes[doy % bbcEpisodes.length].id
})

onMounted(() => {
  currentEpisode.value = bbcEpisodes.find(e => e.id === episodeId.value) || bbcEpisodes[0]
  loadProgress()
})

async function loadProgress() {
  todayProgress.value = await getByDate(today)
  if (todayProgress.value?.score) {
    score.value = todayProgress.value.score
  }
}

const isDone = computed(() => !!todayProgress.value?.completed)

// ===== TTS 朗读 =====
function getVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  let voice = voices.find(v => v.lang.startsWith('en-GB') && v.name.includes('Female'))
  if (!voice) voice = voices.find(v => v.lang.startsWith('en-GB'))
  if (!voice) voice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Female'))
  if (!voice) voice = voices.find(v => v.lang.startsWith('en-US'))
  if (!voice) voice = voices.find(v => v.lang.startsWith('en'))
  return voice || null
}

// 全文朗读
function speakAll() {
  if (!currentEpisode.value) return
  if (isSpeaking.value) {
    speechSynthesis.cancel()
    isSpeaking.value = false
    speakingSentence.value = -1
    return
  }
  speakSentenceBySentence(0)
}

function speakSentenceBySentence(index: number) {
  if (!currentEpisode.value) return
  const sentences = currentEpisode.value.sentences
  if (index >= sentences.length) {
    isSpeaking.value = false
    speakingSentence.value = -1
    return
  }

  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(sentences[index].en)
  const voice = getVoice()
  if (voice) utterance.voice = voice
  utterance.rate = 0.9
  utterance.pitch = 1.0

  isSpeaking.value = true
  speakingSentence.value = index

  utterance.onend = () => {
    speakSentenceBySentence(index + 1)
  }

  utterance.onerror = () => {
    speakSentenceBySentence(index + 1)
  }

  speechSynthesis.speak(utterance)
}

// 逐句朗读
function speakSentence(index: number) {
  if (!currentEpisode.value) return
  speechSynthesis.cancel()
  isSpeaking.value = false
  speakingSentence.value = -1

  const utterance = new SpeechSynthesisUtterance(currentEpisode.value.sentences[index].en)
  const voice = getVoice()
  if (voice) utterance.voice = voice
  utterance.rate = 0.9

  isSpeaking.value = true
  speakingSentence.value = index

  utterance.onend = () => {
    isSpeaking.value = false
    speakingSentence.value = -1
  }
  utterance.onerror = () => {
    isSpeaking.value = false
    speakingSentence.value = -1
  }
  speechSynthesis.speak(utterance)
}

function stopSpeaking() {
  speechSynthesis.cancel()
  isSpeaking.value = false
  speakingSentence.value = -1
}

// ===== 单词点击 =====
function onWordClick(event: MouseEvent, word: string) {
  // 清理单词（去掉标点）
  const cleanWord = word.replace(/[.,!?;:'"()]/g, '').toLowerCase()
  if (!cleanWord || cleanWord.length < 2) return

  // 先从当前节目词汇表查找
  const vocab = currentEpisode.value?.vocabulary.find(
    v => v.word.toLowerCase() === cleanWord
  )

  // 基础词义映射
  const basicMeanings: Record<string, string> = {
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
    'rise': '上升', 'change': '改变', 'turn': '转',
    'move': '移动', 'run': '跑', 'walk': '走',
    'stand': '站', 'sit': '坐', 'lie': '躺',
    'put': '放', 'set': '设置', 'get': '得到',
  }

  const meaning = vocab?.meaning || basicMeanings[cleanWord] || ''

  wordPopover.value = {
    show: true,
    word: word.replace(/[.,!?;:'"()]/g, ''),
    meaning,
    x: Math.min(event.clientX, window.innerWidth - 150),
    y: event.clientY - 60,
  }

  // 3秒后自动关闭
  setTimeout(() => {
    wordPopover.value.show = false
  }, 3000)
}

function closeWordPopover() {
  wordPopover.value.show = false
}

// ===== 文章切换 =====
function selectEpisode(ep: BBCEpisode) {
  stopSpeaking()
  currentEpisode.value = ep
  showEpisodeList.value = false
  router.replace({ query: { episode: ep.id } })
}

async function handleComplete() {
  if (!currentEpisode.value) return
  score.value = score.value || 3
  await markCompleted(currentEpisode.value.id, score.value)
  await loadProgress()
}

onUnmounted(() => {
  speechSynthesis.cancel()
})
</script>

<template>
  <div class="english-page" @click="closeWordPopover">
    <van-nav-bar title="BBC 英语" left-arrow @click-left="router.back()" />

    <div class="scroll-area">
      <!-- 完成状态 -->
      <div v-if="isDone" class="done-banner">
        <van-icon name="success" color="#fff" size="20" />
        <span>今日跟练已完成 🎉</span>
        <span class="done-score">{{ '⭐'.repeat(score) }}</span>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <van-button
          :type="isSpeaking ? 'danger' : 'primary'"
          size="small"
          round
          @click="speakAll"
        >
          <van-icon :name="isSpeaking ? 'pause-circle-o' : 'play-circle-o'" />
          {{ isSpeaking ? '停止' : '全文朗读' }}
        </van-button>
        <van-button size="small" round plain @click="showTranslation = !showTranslation">
          {{ showTranslation ? '隐藏翻译' : '显示翻译' }}
        </van-button>
        <van-button size="small" round plain @click="showEpisodeList = true">
          更多节目
        </van-button>
      </div>

      <!-- 文章标题 -->
      <div class="article-header" v-if="currentEpisode">
        <h2>{{ currentEpisode.title }}</h2>
        <p class="title-zh">{{ currentEpisode.titleZh }}</p>
        <span class="diff-tag" :class="currentEpisode.difficulty">
          {{ currentEpisode.difficulty === 'easy' ? '⭐ 简单' : currentEpisode.difficulty === 'medium' ? '⭐⭐ 中等' : '⭐⭐⭐ 较难' }}
        </span>
      </div>

      <!-- 逐句显示 -->
      <div class="sentence-list" v-if="currentEpisode">
        <div
          class="sentence-item"
          v-for="(s, i) in currentEpisode.sentences"
          :key="i"
          :class="{ active: speakingSentence === i }"
        >
          <div class="sentence-en" @click.stop="speakSentence(i)">
            <span class="sentence-num">{{ i + 1 }}</span>
            <span
              v-for="(w, j) in s.en.split(' ')"
              :key="j"
              class="word"
              @click.stop="onWordClick($event, w)"
            >{{ w }} </span>
            <van-icon
              name="volume-o"
              size="16"
              class="speak-icon"
              :class="{ playing: speakingSentence === i }"
            />
          </div>
          <div class="sentence-zh" v-show="showTranslation">{{ s.zh }}</div>
        </div>
      </div>

      <!-- 词汇表 -->
      <div class="vocab-section" v-if="currentEpisode">
        <h3>📝 重点词汇（点击查看释义）</h3>
        <div class="vocab-list">
          <span
            class="vocab-item"
            v-for="v in currentEpisode.vocabulary"
            :key="v.word"
            @click.stop="wordPopover = { show: true, word: v.word, meaning: v.meaning, x: 100, y: 200 }"
          >
            <b>{{ v.word }}</b>
            <span class="vocab-meaning">{{ v.meaning }}</span>
          </span>
        </div>
      </div>

      <!-- 完成打卡 -->
      <div v-if="!isDone" class="complete-section">
        <div class="score-row">
          <span>自我评价：</span>
          <van-rate v-model="score" :count="5" color="#FF8C69" void-color="#eee" />
        </div>
        <van-button type="primary" block round size="large" @click="handleComplete">
          完成今日跟练
        </van-button>
      </div>
    </div>

    <!-- 单词弹窗 -->
    <teleport to="body">
      <div
        v-if="wordPopover.show"
        class="word-popover"
        :style="{ left: wordPopover.x + 'px', top: wordPopover.y + 'px' }"
        @click.stop
      >
        <div class="popover-word">{{ wordPopover.word }}</div>
        <div class="popover-meaning" v-if="wordPopover.meaning">{{ wordPopover.meaning }}</div>
        <div class="popover-meaning" v-else style="color: #999;">暂无翻译</div>
      </div>
    </teleport>

    <!-- 节目列表弹窗 -->
    <van-popup v-model:show="showEpisodeList" position="bottom" round :style="{ height: '70%', padding: '20px' }">
      <h3>📻 BBC 6 Minute English</h3>
      <div class="episode-list">
        <div
          class="episode-item"
          v-for="ep in bbcEpisodes"
          :key="ep.id"
          :class="{ active: currentEpisode?.id === ep.id }"
          @click="selectEpisode(ep)"
        >
          <div class="ep-title">{{ ep.title }}</div>
          <div class="ep-title-zh">{{ ep.titleZh }}</div>
          <van-tag size="mini" :type="ep.difficulty === 'easy' ? 'success' : ep.difficulty === 'medium' ? 'warning' : 'danger'">
            {{ ep.difficulty === 'easy' ? '简单' : ep.difficulty === 'medium' ? '中等' : '较难' }}
          </van-tag>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.english-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}

.done-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #52C41A, #73D13D);
  color: #fff;
  padding: 12px 16px;
  border-radius: 10px;
  margin-top: 12px;
  font-size: 14px;
  font-weight: 500;
}
.done-score { margin-left: auto; font-size: 12px; }

.action-bar {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.article-header {
  margin-top: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}
.article-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
  line-height: 1.4;
}
.title-zh {
  margin: 4px 0 8px;
  font-size: 14px;
  color: #999;
}
.diff-tag {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
}
.diff-tag.easy { background: #f0f9ff; color: #07c160; }
.diff-tag.medium { background: #fff7e6; color: #ff976a; }
.diff-tag.hard { background: #fff0f0; color: #ee0a24; }

.sentence-list {
  margin-top: 12px;
}
.sentence-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 6px;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}
.sentence-item.active {
  border-left-color: #1989fa;
  background: #f0f7ff;
}
.sentence-en {
  font-size: 15px;
  line-height: 1.7;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
}
.sentence-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  background: #1989fa;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  margin-right: 8px;
  margin-top: 1px;
  flex-shrink: 0;
}
.word {
  cursor: pointer;
  transition: all 0.15s;
  border-radius: 3px;
  padding: 0 1px;
}
.word:hover {
  background: #ffeaa7;
}
.word:active {
  background: #fdcb6e;
}
.speak-icon {
  margin-left: auto;
  color: #1989fa;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.speak-icon.playing {
  opacity: 1;
  animation: pulse 0.8s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.sentence-zh {
  font-size: 13px;
  color: #666;
  margin-top: 8px;
  padding-left: 30px;
  line-height: 1.6;
  border-top: 1px dashed #eee;
  padding-top: 8px;
}

.vocab-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.vocab-section h3 { margin: 0 0 10px; font-size: 14px; color: #666; }
.vocab-list { display: flex; flex-wrap: wrap; gap: 8px; }
.vocab-item {
  background: #f0f9ff;
  padding: 6px 12px;
  border-radius: 14px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  gap: 6px;
  align-items: center;
}
.vocab-item:active { background: #d6eeff; transform: scale(0.96); }
.vocab-meaning { color: #999; font-size: 12px; }

.complete-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.score-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

/* 单词弹窗 */
.word-popover {
  position: fixed;
  background: #333;
  color: #fff;
  padding: 10px 16px;
  border-radius: 10px;
  z-index: 9999;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  max-width: 200px;
  pointer-events: none;
  animation: popIn 0.2s ease;
}
@keyframes popIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.popover-word {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}
.popover-meaning {
  font-size: 13px;
  color: #ccc;
}

.episode-list {
  max-height: calc(100% - 50px);
  overflow-y: auto;
}
.episode-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
}
.episode-item.active { background: #e8f4ff; }
.episode-item:active { background: #f5f5f5; }
.ep-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ep-title-zh {
  font-size: 12px;
  color: #999;
  min-width: 80px;
  text-align: right;
}
</style>
