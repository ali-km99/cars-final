import type { App } from 'vue'
import { MotionPlugin } from '@vueuse/motion'

export function setupMotion(app: App) {
  app.use(MotionPlugin)
}
