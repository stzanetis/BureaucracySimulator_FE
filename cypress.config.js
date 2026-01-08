  import { defineConfig } from "cypress";

  export default defineConfig({
    e2e: {
      baseUrl: 'http://localhost:5173',
      viewportWidth: 1280,
      viewportHeight: 720,
      video: false,
      screenshotOnRunFailure: true,
      setupNodeEvents(_on, _config) {
        // implement node event listeners here
      },
      env: {
        apiUrl: 'http://localhost:4000'
      },
      // Retry tests on failure
      retries: {
        runMode: 2,
        openMode: 0
      }
    },

    component: {
      devServer: {
        framework: "react",
        bundler: "vite",
      },
    },
  });
