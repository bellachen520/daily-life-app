import { ref, onMounted } from 'vue'

export function useTTS() {
  const isSpeaking = ref(false)
  const isPaused = ref(false)
  const voices = ref<SpeechSynthesisVoice[]>([])
  const selectedVoice = ref<SpeechSynthesisVoice | null>(null)
  const rate = ref(0.8)
  const isSupported = ref(false)

  let utterance: SpeechSynthesisUtterance | null = null
  let sentences: string[] = []
  let currentIndex = 0

  function loadVoices() {
    const allVoices = speechSynthesis.getVoices()
    voices.value = allVoices
    // 优先选择英音
    const enGBVoices = allVoices.filter(v => v.lang.startsWith('en-GB'))
    if (enGBVoices.length > 0) {
      selectedVoice.value = enGBVoices.find(v => v.name.includes('Female')) ||
        enGBVoices.find(v => v.name.includes('Susan')) ||
        enGBVoices[0]
    } else {
      // 如果没有英音，尝试用 en-US
      const enUSVoices = allVoices.filter(v => v.lang.startsWith('en-US'))
      if (enUSVoices.length > 0) {
        selectedVoice.value = enUSVoices.find(v => v.name.includes('Female')) || enUSVoices[0]
      }
    }
  }

  onMounted(() => {
    isSupported.value = typeof speechSynthesis !== 'undefined'
    if (isSupported.value) {
      loadVoices()
      speechSynthesis.addEventListener('voiceschanged', loadVoices)
    }
  })

  function splitSentences(text: string): string[] {
    return text
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 0)
  }

  function speak(text: string) {
    if (!isSupported.value) return
    stop()
    sentences = splitSentences(text)
    currentIndex = 0
    speakCurrent()
  }

  function speakCurrent() {
    if (currentIndex >= sentences.length) {
      isSpeaking.value = false
      return
    }
    utterance = new SpeechSynthesisUtterance(sentences[currentIndex])
    utterance.rate = rate.value
    if (selectedVoice.value) {
      utterance.voice = selectedVoice.value
    }
    utterance.onend = () => {
      currentIndex++
      speakCurrent()
    }
    utterance.onerror = () => {
      isSpeaking.value = false
    }
    isSpeaking.value = true
    isPaused.value = false
    speechSynthesis.speak(utterance)
  }

  function pause() {
    if (isSpeaking.value) {
      speechSynthesis.pause()
      isPaused.value = true
    }
  }

  function resume() {
    if (isPaused.value) {
      speechSynthesis.resume()
      isPaused.value = false
    }
  }

  function stop() {
    speechSynthesis.cancel()
    isSpeaking.value = false
    isPaused.value = false
    currentIndex = 0
  }

  function setRate(newRate: number) {
    rate.value = newRate
    if (isSpeaking.value) {
      stop()
      speakCurrent()
    }
  }

  return {
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    rate,
    isSupported,
    speak,
    pause,
    resume,
    stop,
    setRate,
  }
}
