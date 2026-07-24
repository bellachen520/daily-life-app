<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEnglishProgress } from '@/composables/useDB'
import { useTTS } from '@/composables/useTTS'
import { bbcEpisodes, type BBCEpisode } from '@/db/bbc'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
dayjs.extend(dayOfYear)

const router = useRouter()
const route = useRoute()
const { getByDate, markCompleted } = useEnglishProgress()
const tts = useTTS()

const today = dayjs().format('YYYY-MM-DD')
const showTranslation = ref(true)
const todayProgress = ref<any>(null)
const score = ref(0)
const currentEpisode = ref<BBCEpisode | null>(null)
const showEpisodeList = ref(false)

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

function handleSpeak() {
  if (!currentEpisode.value) return
  if (tts.isSpeaking.value) {
    tts.stop()
  } else {
    const text = currentEpisode.value.sentences.map(s => s.en).join('. ')
    tts.speak(text)
  }
}

async function handleComplete() {
  if (!currentEpisode.value) return
  score.value = score.value || 3
  await markCompleted(currentEpisode.value.id, score.value)
  await loadProgress()
}

function selectEpisode(ep: BBCEpisode) {
  currentEpisode.value = ep
  showEpisodeList.value = false
  router.replace({ query: { episode: ep.id } })
}
</script>

<template>
  <div class="english-page">
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
          :type="tts.isSpeaking.value ? 'danger' : 'primary'"
          size="small"
          round
          :icon="tts.isSpeaking.value ? 'pause-circle-o' : 'play-circle-o'"
          @click="handleSpeak"
        >
          {{ tts.isSpeaking.value ? '停止' : '全文朗读' }}
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
      </div>

      <!-- 逐句显示 -->
      <div class="sentence-list" v-if="currentEpisode">
        <div
          class="sentence-item"
          v-for="(s, i) in currentEpisode.sentences"
          :key="i"
          @click="tts.speak(s.en)"
        >
          <div class="sentence-en">
            <span class="sentence-num">{{ i + 1 }}</span>
            {{ s.en }}
          </div>
          <div class="sentence-zh" v-show="showTranslation">{{ s.zh }}</div>
        </div>
      </div>

      <!-- 词汇表 -->
      <div class="vocab-section" v-if="currentEpisode">
        <h3>📝 重点词汇</h3>
        <div class="vocab-list">
          <span class="vocab-item" v-for="v in currentEpisode.vocabulary" :key="v.word">
            <b>{{ v.word }}</b> {{ v.meaning }}
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
}
.title-zh {
  margin: 4px 0 0;
  font-size: 14px;
  color: #999;
}

.sentence-list {
  margin-top: 12px;
}
.sentence-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.sentence-item:active { background: #f0f0f0; }
.sentence-en {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}
.sentence-num {
  display: inline-block;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  background: #1989fa;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  margin-right: 6px;
  vertical-align: middle;
}
.sentence-zh {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
  padding-left: 30px;
  line-height: 1.5;
}

.vocab-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.vocab-section h3 { margin: 0 0 10px; font-size: 15px; }
.vocab-list { display: flex; flex-wrap: wrap; gap: 8px; }
.vocab-item {
  background: #f0f9ff;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  color: #555;
}

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
