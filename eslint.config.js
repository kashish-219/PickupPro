import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        // Node.js globals
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        // Browser globals for frontend
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        alert: "readonly",
        confirm: "readonly",
        FormData: "readonly",
        URLSearchParams: "readonly",
        history: "readonly",
        location: "readonly",
        Event: "readonly",
        CustomEvent: "readonly",
        HTMLElement: "readonly",
        NodeList: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      semi: ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }],
      indent: ["error", 2],
      "comma-dangle": ["error", "always-multiline"],
      "no-multiple-empty-lines": ["error", { max: 2 }],
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
    },
  },
  {
    ignores: ["node_modules/", "dist/", "*.min.js"],
  },
];
