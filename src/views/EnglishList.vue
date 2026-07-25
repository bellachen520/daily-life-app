<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { bbcEpisodes } from '@/db/bbc'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'

dayjs.extend(dayOfYear)

const router = useRouter()
const today = dayjs().format('YYYY年M月D日 dddd')

// 今日推荐：按天轮换
const todayArticle = computed(() => {
  const doy = dayjs().dayOfYear()
  return bbcEpisodes[doy % bbcEpisodes.length]
})

// 每日推送池（不包含今日推荐）
const otherArticles = computed(() => {
  return bbcEpisodes.filter(ep => ep.id !== todayArticle.value.id)
})

function goDetail(id: number) {
  router.push(`/life/english/${id}`)
}
</script>

<template>
  <div class="english-list-page">
    <!-- 顶部栏 -->
    <div class="top-bar">
      <van-icon name="arrow-left" size="20" @click="router.push('/life')" />
      <span class="page-title">英语学习</span>
      <span class="page-date">{{ today }}</span>
    </div>

    <div class="scroll-area">
      <!-- 头部介绍 -->
      <div class="intro-card">
        <div class="intro-title">
          <span class="globe">🌍</span>
          <span>英语学习 · BBC 随身英语</span>
        </div>
        <p class="intro-desc">
          每天 30 分钟盲听练习。选一篇文章，用「阅读模式」切换译文，用底部播放器逐句朗读、调倍速、做单词训练。
        </p>
      </div>

      <!-- 今日推荐 -->
      <div class="today-banner">
        <div class="banner-title">
          <span class="banner-icon">⭐</span>
          <span>今日推荐</span>
          <span class="banner-date">{{ dayjs().format('M月D日') }}</span>
        </div>
        <div class="banner-card" @click="goDetail(todayArticle.id)">
          <div class="card-title-row">
            <h3 class="card-title">{{ todayArticle.title }}</h3>
            <span class="bbc-tag">BBC</span>
          </div>
          <p class="card-subtitle">{{ todayArticle.titleZh }}</p>
          <div class="card-meta">
            <span class="meta-item">📝 {{ todayArticle.wordCount }} 词</span>
            <span class="meta-sep">|</span>
            <span class="meta-item">⏱ {{ todayArticle.duration }}</span>
            <span class="meta-sep">|</span>
            <span class="meta-item">🎯 词汇量 {{ todayArticle.vocabLevel }}</span>
          </div>
          <div class="banner-cta">开始盲听 →</div>
        </div>
      </div>

      <!-- 全部文章列表 -->
      <div class="list-header">
        <span class="list-bar"></span>
        <span>全部文章 ({{ otherArticles.length }} 篇)</span>
      </div>

      <div class="article-list">
        <div
          class="article-card"
          v-for="ep in otherArticles"
          :key="ep.id"
          @click="goDetail(ep.id)"
        >
          <div class="card-title-row">
            <h3 class="card-title">{{ ep.title }}</h3>
            <span class="bbc-tag">BBC</span>
          </div>
          <p class="card-subtitle">{{ ep.titleZh }}</p>
          <div class="card-meta">
            <span class="meta-item">📝 {{ ep.wordCount }} 词</span>
            <span class="meta-sep">|</span>
            <span class="meta-item">⏱ {{ ep.duration }}</span>
            <span class="meta-sep">|</span>
            <span class="meta-item">🎯 词汇量 {{ ep.vocabLevel }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.english-list-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  overflow: hidden;
}

.top-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  gap: 12px;
}
.page-title {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
}
.page-date {
  font-size: 13px;
  color: #999;
}

.scroll-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 12px 16px 80px;
}

.intro-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}
.intro-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}
.globe {
  font-size: 20px;
}
.intro-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 今日推荐 */
.today-banner {
  margin-bottom: 16px;
}
.banner-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #ff976a;
}
.banner-icon {
  font-size: 18px;
}
.banner-date {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: #999;
}
.banner-card {
  background: linear-gradient(135deg, #fff8e6 0%, #ffeac9 100%);
  border: 2px solid #ffd591;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}
.banner-card:active {
  transform: scale(0.98);
  opacity: 0.9;
}
.banner-cta {
  margin-top: 10px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #ff976a;
  padding: 6px 0;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.list-bar {
  width: 4px;
  height: 16px;
  background: #07c160;
  border-radius: 2px;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.article-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.15s;
}
.article-card:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}
.card-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}
.bbc-tag {
  font-size: 12px;
  color: #07c160;
  background: #f0f9f0;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
  flex-shrink: 0;
}

.card-subtitle {
  margin: 0 0 8px;
  font-size: 13px;
  color: #666;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.meta-item {
  font-size: 12px;
  color: #999;
}
.meta-sep {
  font-size: 12px;
  color: #ddd;
}
</style>
