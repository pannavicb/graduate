import React from 'react'
import 'antd/dist/reset.css' // สำหรับ antd v5+
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import App from './App'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <MantineProvider
    withGlobalStyles
    withNormalizeCSS
    theme={{
      /** ปรับแต่งธีมตรงนี้ได้ เช่น สี ฟอนต์ */
      colorScheme: 'light', // หรือ 'dark'
      primaryColor: 'indigo',
    }}
  >
    <App />
  </MantineProvider>
)
