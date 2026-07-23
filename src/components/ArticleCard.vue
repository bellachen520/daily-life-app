<script setup lang="ts">
defineProps<{
  article: {
    id: number
    title: string
    content: string
    translation: string
    difficulty: string
    topic: string
    vocabulary: { word: string; meaning: string }[]
  }
  showTranslation?: boolean
}>()

const difficultyColors: Record<string, string> = {
  easy: '#52C41A',
  medium: '#FAAD14',
  hard: '#FF4D4F',
}

const difficultyLabels: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}
</script>

<template>
  <div class="article-card">
    <div class="article-header">
      <div class="article-meta">
        <span class="article-topic">{{ article.topic }}</span>
        <span
          class="article-difficulty"
          :style="{ background: difficultyColors[article.difficulty] + '1A', color: difficultyColors[article.difficulty] }"
        >
          {{ difficultyLabels[article.difficulty] }}
        </span>
      </div>
      <h2 class="article-title">{{ article.title }}</h2>
    </div>

    <div class="article-body">
      <p
        v-for="(para, i) in article.content.split('\n\n')"
        :key="i"
        class="article-paragraph"
      >
        {{ para.trim() }}
      </p>
    </div>

    <div v-if="showTranslation" class="article-translation">
      <div class="translation-label">中文翻译</div>
      <p
        v-for="(para, i) in article.translation.split('\n\n')"
        :key="i"
        class="translation-paragraph"
      >
        {{ para.trim() }}
      </p>
    </div>

    <div v-if="article.vocabulary.length" class="article-vocabulary">
      <div class="vocabulary-label">词汇注释</div>
      <div class="vocabulary-list">
        <div v-for="item in article.vocabulary" :key="item.word" class="vocabulary-item">
          <span class="vocab-word">{{ item.word }}</span>
          <span class="vocab-meaning">{{ item.meaning }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-card {
  background: var(--color-card);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.article-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-divider);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.article-topic {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.article-difficulty {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.article-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.4;
}

.article-body {
  padding: var(--spacing-lg);
}

.article-paragraph {
  font-size: var(--font-size-md);
  line-height: 1.8;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.article-paragraph:last-child {
  margin-bottom: 0;
}

.article-translation {
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-divider);
}

.translation-label,
.vocabulary-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.translation-paragraph {
  font-size: var(--font-size-sm);
  line-height: 1.8;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.article-vocabulary {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-divider);
}

.vocabulary-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.vocabulary-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.vocab-word {
  font-weight: 600;
  color: var(--color-primary);
}

.vocab-meaning {
  color: var(--color-text-secondary);
}
</style>
