const { createServer } = require('bedrock-protocol')
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const server = createServer({
  host: '0.0.0.0',
  port: 19132,
  offline: false,
  encryption: true
})

console.log('SkinGetBE Server listening')

server.on('connect', (client) => {
  client.on('join', () => {
    const name = client.profile.name
    const skin = client.skinData

    if (!skin?.SkinData) {
      console.log('No skin data')
      client.disconnect('Done')
      return
    }

    fs.mkdirSync('skin', { recursive: true })
    fs.mkdirSync('cape', { recursive: true })

    /* ---------- Skin ---------- */
    const skinRaw = Buffer.from(skin.SkinData, 'base64')
    const skinPng = new PNG({
      width: skin.SkinImageWidth,
      height: skin.SkinImageHeight
    })

    skinRaw.copy(skinPng.data)

    skinPng.pack().pipe(
      fs.createWriteStream(path.join('skin', `${name}.png`))
    )

    console.log(`Skin saved: skin/${name}.png`)

    /* ---------- Cape (optional) ---------- */
    if (skin.CapeData && skin.CapeData.length > 0) {
      const capeRaw = Buffer.from(skin.CapeData, 'base64')
      const capePng = new PNG({
        width: skin.CapeImageWidth,
        height: skin.CapeImageHeight
      })

      capeRaw.copy(capePng.data)

      capePng.pack().pipe(
        fs.createWriteStream(path.join('cape', `${name}.png`))
      )

      console.log(`Cape saved: cape/${name}.png`)
    }

    client.disconnect('Done')
  })
})
