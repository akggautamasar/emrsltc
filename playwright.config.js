import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',timeout:120000,expect:{timeout:10000},
 use:{baseURL:'http://127.0.0.1:4173',...devices['Desktop Chrome'],acceptDownloads:true},
 webServer:{command:'npm run preview -- --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI,timeout:60000},
 reporter:[['list'],['html',{open:'never'}]]
});