import { ref } from 'vue'

export function useTTS() {
  const isSpeaking = ref(false)
  const rate = ref(1.0)
  const voiceName = ref('')

  function getVoice(): SpeechSynthesisVoice | null {
    const voices = speechSynthesis.getVoices()
    // 优先英式女声
    let voice = voices.find(v => v.lang.startsWith('en-GB') && v.name.includes('Female'))
    if (!voice) voice = voices.find(v => v.lang.startsWith('en-GB'))
    if (!voice) voice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Female'))
    if (!voice) voice = voices.find(v => v.lang.startsWith('en-US'))
    if (!voice) voice = voices.find(v => v.lang.startsWith('en'))
    return voice || null
  }

  function speak(text: string) {
    // iOS Safari: 必须先取消之前的播放
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = getVoice()
    if (voice) {
      utterance.voice = voice
      voiceName.value = voice.name
    }
    utterance.rate = rate.value
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // iOS Safari keep-alive: 防止自动暂停
    let keepAlive: ReturnType<typeof setInterval> | null = null

    utterance.onstart = () => {
      isSpeaking.value = true
      keepAlive = setInterval(() => {
        if (isSpeaking.value && !speechSynthesis.speaking) {
          speechSynthesis.resume()
        }
      }, 5000)
    }

    utterance.onend = () => {
      isSpeaking.value = false
      if (keepAlive) clearInterval(keepAlive)
    }

    utterance.onerror = (e) => {
      isSpeaking.value = false
      if (keepAlive) clearInterval(keepAlive)
      console.warn('TTS error:', e)
    }

    speechSynthesis.speak(utterance)
  }

  function stop() {
    speechSynthesis.cancel()
    isSpeaking.value = false
  }

  function setRate(r: number) {
    rate.value = r
  }

  return { isSpeaking, rate, voiceName, speak, stop, setRate }
}
