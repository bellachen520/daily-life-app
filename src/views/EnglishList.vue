<script setup lang="ts">
import { useRouter } from 'vue-router'
import { bbcEpisodes } from '@/db/bbc'
import dayjs from 'dayjs'

const router = useRouter()
const today = dayjs().format('YYYY年M月D日 dddd')

function goDetail(id: number) {
  router.push(`/life/english/${id}`)
}
</script>

<template>
  <div class="english-list-page">
    <!-- 顶部栏 -->
    <div class="top-bar">
      <van-icon name="bars" size="20" />
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

      <!-- 文章列表 -->
      <div class="list-header">
        <span class="list-bar"></span>
        <span>共 {{ bbcEpisodes.length }} 篇文章，点选一篇开始盲听</span>
      </div>

      <div class="article-list">
        <div
          class="article-card"
          v-for="ep in bbcEpisodes"
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
            <span class="meta-sep">|</span>
            <span class="meta-item listen-count">已听 0 次</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.english-list-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.top-bar {
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
  overflow-y: auto;
  padding: 12px 16px 24px;
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
}
.bbc-tag {
  font-size: 12px;
  color: #07c160;
  background: #f0f9f0;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
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
.listen-count {
  color: #ff976a;
}
</style>
