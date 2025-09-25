import { marked } from 'marked'

function computeSandboxLinks() {
  const reactPort = '3000'
  const vuePort = '5173'
  const overviewPort = '5174'

  const { protocol, host } = window.location
  let reactUrl = `${protocol}//localhost:${reactPort}`
  let vueUrl = `${protocol}//localhost:${vuePort}`

  const reactBtn = document.querySelector<HTMLAnchorElement>('a[href^="http://localhost:3000"], a[href^="https://localhost:3000"]')
  const vueBtn = document.querySelector<HTMLAnchorElement>('a[href^="http://localhost:5173"], a[href^="https://localhost:5173"]')

  const match = host.match(/^(.*)-(\d+)(\..*)$/)
  if (match) {
    const [, base, , rest] = match
    reactUrl = `${protocol}//${base}-${reactPort}${rest}`
    vueUrl = `${protocol}//${base}-${vuePort}${rest}`
  }

  if (reactBtn) reactBtn.href = reactUrl
  if (vueBtn) vueBtn.href = vueUrl
}

async function loadMarkdown() {
  const res = await fetch('/poc-report.md').catch(() => null)
  let md = '# POC Report\n\nUnable to load markdown file.'
  if (res && res.ok) {
    md = await res.text()
  }
  const container = document.getElementById('app')!
  container.innerHTML = marked.parse(md)
}

computeSandboxLinks()
loadMarkdown()
