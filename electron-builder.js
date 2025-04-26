/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  appId: "com.video.editor",
  productName: "video helper",
  files: [
    "out/**/*",
    "package.json"
  ],
  directories: {
    output: "out",
    buildResources: "public"
  },
  extraResources: [
    {
      from: "public",
      to: "public",
      filter: [
        "**/*"
      ]
    },
    {
      from: "package.json",
      to: "package.json",
      filter: [
        "**/*"
      ]
    },
    {
      from: "scripts",
      to: "scripts",
      filter: [
        "**/*"
      ]
    }
  ],
  asar: true,
  win: {
    target: [
      "nsis"
    ],
    icon: "public/icon.png"
  },
  mac: {
    target: [
      "dmg"
    ],
    icon: "public/icon.png"
  },
  linux: {
    target: [
      "AppImage",
      "deb"
    ],
    icon: "public/icon.png"
  }
}

module.exports = config 