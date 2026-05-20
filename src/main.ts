import { waitForEvenAppBridge, TextContainerProperty, CreateStartUpPageContainer } from '@evenrealities/even_hub_sdk'

const WORKER_URL = 'https://even-calendar.fowlerto.workers.dev/calendar'

const bridge = await waitForEvenAppBridge()

const mainText = new TextContainerProperty({
  xPosition: 0,
  yPosition: 0,
  width: 576,
  height: 288,
  borderWidth: 0,
  paddingLength: 8,
  containerID: 1,
  containerName: 'main',
  content: 'Loading calendar...',
  isEventCapture: 1,
})

await bridge.createStartUpPageContainer(new CreateStartUpPageContainer({
  containerTotalNum: 1,
  textObject: [mainText],
}))

async function fetchAndDisplay() {
  try {
    const res = await fetch(WORKER_URL)
    const data = await res.json() as { events: { title: string; start: string; location: string }[] }
    const events = data.events ?? []

    if (events.length === 0) {
      await bridge.textContainerUpgrade({ containerID: 1, content: 'No events today' })
      return
    }

    const lines = events.map(e => {
      const startTime = e.start.split(' at ')[1] ?? ''
      const endTime = e.end.split(' at ')[1] ?? ''
      const normalize = (s: string) => s.replace(/\s/g, ' ')
      const isAllDay = normalize(startTime).includes('12:00 AM') && normalize(endTime).includes('11:59 PM')
      const label = isAllDay ? 'All Day' : startTime
      return `${label} ${e.title}`
    }).join('\n')
    await bridge.textContainerUpgrade({ containerID: 1, content: lines })
  } catch {
    await bridge.textContainerUpgrade({ containerID: 1, content: 'Could not load calendar' })
  }
}

fetchAndDisplay()
