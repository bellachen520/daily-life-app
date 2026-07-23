import { ref, onMounted } from 'vue'
import { useAppMeta } from './useDB'

export function useNotification() {
  const isSupported = ref(false)
  const isScheduled = ref(false)
  const remindTime = ref('20:00')
  const { get, set } = useAppMeta()

  onMounted(async () => {
    // 检测 Capacitor 环境
    try {
      const { Capacitor } = await import('@capacitor/core')
      isSupported.value = Capacitor.isNativePlatform()
    } catch {
      isSupported.value = false
    }

    // 加载设置
    const savedTime = await get('remindTime')
    if (savedTime) remindTime.value = savedTime
    const saved = await get('notificationScheduled')
    isScheduled.value = saved === true
  })

  async function scheduleNotification() {
    if (!isSupported.value) return

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')

      // 先取消已有的
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] })

      const [hours, minutes] = remindTime.value.split(':').map(Number)

      await LocalNotifications.schedule({
        notifications: [{
          id: 1,
          title: '生活打卡助手',
          body: '今天的打卡还没完成哦，别忘了记录～',
          schedule: {
            on: { hour: hours, minute: minutes },
            repeats: true,
            allowWhileIdle: true,
          },
          sound: 'default',
          smallIcon: 'ic_notification',
        }],
      })

      isScheduled.value = true
      await set('notificationScheduled', true)
    } catch (e) {
      console.error('Failed to schedule notification:', e)
    }
  }

  async function cancelNotification() {
    if (!isSupported.value) return

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] })
      isScheduled.value = false
      await set('notificationScheduled', false)
    } catch (e) {
      console.error('Failed to cancel notification:', e)
    }
  }

  async function updateRemindTime(time: string) {
    remindTime.value = time
    await set('remindTime', time)
    if (isScheduled.value) {
      await scheduleNotification()
    }
  }

  return {
    isSupported,
    isScheduled,
    remindTime,
    scheduleNotification,
    cancelNotification,
    updateRemindTime,
  }
}
