<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEnglishProgress } from '@/composables/useDB'
import { useTTS } from '@/composables/useTTS'
import { englishArticles } from '@/db/seeds'
import ArticleCard from '@/components/ArticleCard.vue'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
dayjs.extend(dayOfYear)

const router = useRouter()
const { getByDate, markCompleted } = useEnglishProgress()
const tts = useTTS()

const today = dayjs().format('YYYY-MM-DD')
const showTranslation = ref(false)
const todayProgress = ref<any>(null)
const score = ref(0)

const todayArticle = computed(() => {
  const dayOfYear = dayjs().dayOfYear()
  return englishArticles[dayOfYear % englishArticles.length]
})

const isDone = computed(() => !!todayProgress.value?.completed)

async function loadProgress() {
  todayProgress.value = await getByDate(today)
  if (todayProgress.value?.score) {
    score.value = todayProgress.value.score
  }
}

function toggleTranslation() {
  showTranslation.value = !showTranslation.value
}

function handleSpeak() {
  if (tts.isSpeaking.value) {
    tts.stop()
  } else {
    tts.speak(todayArticle.value.content)
  }
}

async function handleComplete() {
  score.value = score.value || 3
  await markCompleted(todayArticle.value.id, score.value)
  loadProgress()
}

function goBack() {
  router.back()
}

onMounted(loadProgress)
</script>

<template>
  <div>
    <van-nav-bar title="英语跟练" left-arrow @click-left="goBack" />
    <div class="page-container">
      <!-- 完成状态 -->
      <div v-if="isDone" class="done-banner">
        <van-icon name="success" color="#fff" size="20" />
        <span>今日跟练已完成 🎉</span>
        <span class="done-score">自评：{{ '⭐'.repeat(score) }}</span>
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
          {{ tts.isSpeaking.value ? '停止' : '朗读' }}
        </van-button>
        <van-button size="small" round plain @click="toggleTranslation">
          {{ showTranslation ? '隐藏翻译' : '显示翻译' }}
        </van-button>
        <div class="rate-control">
          <span class="rate-label">语速</span>
          <van-stepper
            v-model="tts.rate.value"
            :min="0.5"
            :max="2"
            :step="0.1"
            :decimal-length="1"
            theme="round"
            button-size="22"
            @change="tts.setRate(tts.rate.value)"
          />
        </div>
      </div>

      <!-- 文章内容 -->
      <ArticleCard
        :article="todayArticle"
        :show-translation="showTranslation"
      />

      <!-- 完成打卡 -->
      <div v-if="!isDone" class="complete-section">
        <div class="score-row">
          <span class="score-label">自我评价：</span>
          <van-rate v-model="score" :count="5" color="#FF8C69" void-color="#F0E8E4" />
        </div>
        <van-button type="primary" block round size="large" @click="handleComplete">
          完成今日跟练
        </van-button>
      </div>

      <!-- 进度统计 -->
      <div class="stats-section">
        <h4 class="section-subtitle">跟练记录</h4>
        <div v-if="!todayProgress" class="no-history">
          今天还没完成跟练哦
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.done-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: linear-gradient(135deg, #52C41A, #73D13D);
  color: white;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.done-score {
  margin-left: auto;
  font-size: var(--font-size-xs);
}

.action-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.rate-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-left: auto;
}

.rate-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.complete-section {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-card);
  border-radius: var(--radius-md);
}

.score-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.score-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stats-section {
  margin-top: var(--spacing-xl);
}

.section-subtitle {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.no-history {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  text-align: center;
  padding: var(--spacing-xl);
}
</style>
