const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir:"./tests",
  timeout:30000,
  expect:{timeout:15000},
  use:{
    baseURL:process.env.PLAYWRIGHT_BASE_URL||"http://127.0.0.1:4173",
    screenshot:"only-on-failure",
    trace:"retain-on-failure"
  },
  projects:[
    {name:"desktop-chromium",use:{...devices["Desktop Chrome"]}},
    {name:"mobile-chromium",use:{...devices["Pixel 7"],browserName:"chromium"}}
  ]
});
