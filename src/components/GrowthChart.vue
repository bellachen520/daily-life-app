<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend)

const props = defineProps<{
  records: { date: string; height: number; weight: number }[]
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const labels = computed(() => props.records.map(r => r.date))
const heights = computed(() => props.records.map(r => r.height))
const weights = computed(() => props.records.map(r => r.weight))

function renderChart() {
  if (!chartRef.value || props.records.length === 0) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: labels.value,
      datasets: [
        {
          label: '身高 (cm)',
          data: heights.value,
          borderColor: '#FF8C69',
          backgroundColor: 'rgba(255, 140, 105, 0.1)',
          yAxisID: 'y',
          tension: 0.3,
          pointBackgroundColor: '#FF8C69',
          pointRadius: 4,
          fill: true,
        },
        {
          label: '体重 (kg)',
          data: weights.value,
          borderColor: '#679B9B',
          backgroundColor: 'rgba(103, 155, 155, 0.1)',
          yAxisID: 'y1',
          tension: 0.3,
          pointBackgroundColor: '#679B9B',
          pointRadius: 4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
      },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: '身高 (cm)',
          },
          grid: {
            color: 'rgba(0,0,0,0.04)',
          },
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: '体重 (kg)',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  })
}

onMounted(() => {
  renderChart()
})
</script>

<template>
  <div class="chart-container">
    <div v-if="records.length === 0" class="chart-empty">
      <van-icon name="chart-trending-o" size="40" color="#D9D9D9" />
      <p>暂无数据，快去记录吧</p>
    </div>
    <div v-else class="chart-wrapper">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.chart-wrapper {
  height: 280px;
  width: 100%;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  gap: var(--spacing-sm);
}
</style>
