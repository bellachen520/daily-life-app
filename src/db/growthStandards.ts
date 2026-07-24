// 中国7岁以下儿童身高/体重标准 (WS/T 423-2022)
// 数据来源: 国家卫生健康委员会

export interface GrowthStandard {
  age: number // 年龄(岁)
  P3: number   // 第3百分位
  P25: number  // 第25百分位
  P50: number  // 第50百分位(中位数)
  P75: number  // 第75百分位
  P97: number  // 第97百分位
}

// 男童身高标准 (cm)
const boyHeight: GrowthStandard[] = [
  { age: 2, P3: 82.1, P25: 85.7, P50: 88.5, P75: 91.4, P97: 95.0 },
  { age: 3, P3: 89.8, P25: 93.6, P50: 96.8, P75: 100.0, P97: 104.1 },
  { age: 4, P3: 96.3, P25: 100.4, P50: 104.1, P75: 107.9, P97: 112.4 },
  { age: 5, P3: 102.2, P25: 106.7, P50: 111.3, P75: 115.7, P97: 120.7 },
  { age: 6, P3: 107.7, P25: 112.7, P50: 117.7, P75: 122.5, P97: 127.9 },
  { age: 7, P3: 113.4, P25: 118.6, P50: 124.0, P75: 129.1, P97: 135.0 },
  { age: 8, P3: 118.5, P25: 124.1, P50: 130.0, P75: 135.6, P97: 142.0 },
  { age: 9, P3: 123.2, P25: 129.2, P50: 135.4, P75: 141.5, P97: 148.3 },
  { age: 10, P3: 127.9, P25: 134.2, P50: 140.2, P75: 146.8, P97: 154.3 },
  { age: 11, P3: 132.9, P25: 139.8, P50: 145.3, P75: 152.7, P97: 161.0 },
  { age: 12, P3: 138.1, P25: 145.8, P50: 151.9, P75: 159.8, P97: 169.0 },
]

// 女童身高标准 (cm)
const girlHeight: GrowthStandard[] = [
  { age: 2, P3: 80.9, P25: 84.4, P50: 87.2, P75: 90.2, P97: 93.9 },
  { age: 3, P3: 88.6, P25: 92.4, P50: 95.6, P75: 98.9, P97: 102.9 },
  { age: 4, P3: 95.0, P25: 99.2, P50: 103.1, P75: 106.9, P97: 111.3 },
  { age: 5, P3: 100.9, P25: 105.5, P50: 110.2, P75: 114.6, P97: 119.6 },
  { age: 6, P3: 106.5, P25: 111.5, P50: 116.6, P75: 121.4, P97: 126.9 },
  { age: 7, P3: 112.2, P25: 117.3, P50: 122.5, P75: 127.6, P97: 133.3 },
  { age: 8, P3: 117.4, P25: 122.9, P50: 128.5, P75: 134.0, P97: 140.3 },
  { age: 9, P3: 122.5, P25: 128.4, P50: 134.1, P75: 140.2, P97: 147.0 },
  { age: 10, P3: 127.8, P25: 134.0, P50: 140.1, P75: 146.8, P97: 154.0 },
  { age: 11, P3: 133.6, P25: 140.2, P50: 146.6, P75: 153.7, P97: 161.5 },
  { age: 12, P3: 139.5, P25: 146.3, P50: 152.4, P75: 159.3, P97: 167.0 },
]

// 男童体重标准 (kg)
const boyWeight: GrowthStandard[] = [
  { age: 2, P3: 10.1, P25: 11.3, P50: 12.5, P75: 13.9, P97: 15.5 },
  { age: 3, P3: 11.8, P25: 13.1, P50: 14.7, P75: 16.3, P97: 18.3 },
  { age: 4, P3: 13.1, P25: 14.6, P50: 16.6, P75: 18.6, P97: 21.1 },
  { age: 5, P3: 14.4, P25: 16.2, P50: 18.7, P75: 21.1, P97: 24.3 },
  { age: 6, P3: 15.8, P25: 17.9, P50: 21.0, P75: 23.9, P97: 27.8 },
  { age: 7, P3: 17.5, P25: 20.0, P50: 23.7, P75: 27.2, P97: 32.0 },
  { age: 8, P3: 19.3, P25: 22.2, P50: 26.7, P75: 30.8, P97: 36.7 },
  { age: 9, P3: 21.2, P25: 24.5, P50: 29.8, P75: 34.7, P97: 41.8 },
  { age: 10, P3: 23.3, P25: 27.1, P50: 33.3, P75: 39.2, P97: 47.5 },
  { age: 11, P3: 25.8, P25: 30.1, P50: 37.2, P75: 44.3, P97: 54.2 },
  { age: 12, P3: 28.6, P25: 33.5, P50: 41.5, P75: 49.9, P97: 61.3 },
]

// 女童体重标准 (kg)
const girlWeight: GrowthStandard[] = [
  { age: 2, P3: 9.6, P25: 10.8, P50: 12.0, P75: 13.3, P97: 14.9 },
  { age: 3, P3: 11.2, P25: 12.6, P50: 14.1, P75: 15.7, P97: 17.6 },
  { age: 4, P3: 12.6, P25: 14.1, P50: 15.9, P75: 17.8, P97: 20.3 },
  { age: 5, P3: 13.8, P25: 15.6, P50: 17.8, P75: 20.2, P97: 23.3 },
  { age: 6, P3: 15.1, P25: 17.1, P50: 19.8, P75: 22.7, P97: 26.5 },
  { age: 7, P3: 16.5, P25: 18.9, P50: 22.3, P75: 25.8, P97: 30.5 },
  { age: 8, P3: 18.1, P25: 20.9, P50: 25.0, P75: 29.2, P97: 34.9 },
  { age: 9, P3: 19.9, P25: 23.1, P50: 28.0, P75: 33.0, P97: 39.9 },
  { age: 10, P3: 22.0, P25: 25.7, P50: 31.5, P75: 37.4, P97: 45.6 },
  { age: 11, P3: 24.5, P25: 28.8, P50: 35.7, P75: 42.7, P97: 52.4 },
  { age: 12, P3: 27.3, P25: 32.2, P50: 40.2, P75: 48.5, P97: 59.6 },
]

export function getAgeStandard(age: number, gender: 'boy' | 'girl', type: 'height' | 'weight'): GrowthStandard | null {
  const data = type === 'height'
    ? (gender === 'boy' ? boyHeight : girlHeight)
    : (gender === 'boy' ? boyWeight : girlWeight)
  return data.find(d => d.age === age) || null
}

export type GrowthLevel = '下等' | '中下' | '中等' | '中上' | '上等'

export function evaluateGrowth(value: number, standard: GrowthStandard): GrowthLevel {
  if (value < standard.P3) return '下等'
  if (value < standard.P25) return '中下'
  if (value <= standard.P75) return '中等'
  if (value <= standard.P97) return '中上'
  return '上等'
}

export function levelInfo(level: GrowthLevel) {
  switch (level) {
    case '下等': return { color: '#ee0a24', emoji: '🔴', label: '下等', desc: '低于同龄儿童正常范围，建议咨询医生' }
    case '中下': return { color: '#ff976a', emoji: '🟠', label: '中下', desc: '偏低，注意营养均衡和充足睡眠' }
    case '中等': return { color: '#07c160', emoji: '🟢', label: '中等', desc: '生长发育良好，处于正常范围' }
    case '中上': return { color: '#1989fa', emoji: '🔵', label: '中上', desc: '发育较好，继续保持健康习惯' }
    case '上等': return { color: '#7232dd', emoji: '🟣', label: '上等', desc: '发育优秀，身高体重在同龄中偏高' }
  }
}

export function calcAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return Math.max(2, Math.min(12, age))
}
