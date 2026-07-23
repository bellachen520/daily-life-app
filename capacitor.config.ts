import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.dailylife.app',
  appName: '生活打卡助手',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_notification',
      iconColor: '#FF8C69',
    },
  },
}

export default config
