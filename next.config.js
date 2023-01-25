// import SentryWebpackPlugin from "@sentry/webpack-plugin"
// const { SENTRY_DSN, NODE_ENV } = process.env
const { withBlitz } = require("@blitzjs/next")
const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
  },
})

const config = {
  env: {
    SENTRY_DSN: process.env.SENTRY_DSN,
    AUTHORIZE_NET_ENVIRONMENT: process.env.AUTHORIZE_NET_ENVIRONMENT,
    AUTHORIZE_NET_API_LOGIN_ID: process.env.AUTHORIZE_NET_API_LOGIN_ID,
    AUTHORIZE_NET_CLIENT_KEY: process.env.AUTHORIZE_NET_CLIENT_KEY,
    PASSBASE_PUBLISHABLE_API_KEY: process.env.PASSBASE_PUBLISHABLE_API_KEY,
  },

  images: {
    domains: ["127.0.0.1", "localhost", "cdn.seconds.app", "seconds.app"],
  },

  webpack: (config, { isServer }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config

    if (!isServer) {
      config.resolve.alias["@sentry/node"] = "@sentry/browser"
    }

    // if (SENTRY_DSN && NODE_ENV === "production") {
    //   config.plugins.push(
    //     new SentryWebpackPlugin({
    //       include: ".next",
    //       ignore: ["node_modules"],
    //       stripPrefix: ["webpack://_N_E/"],
    //       urlPrefix: `~/_next`,
    //       release: "1.0",
    //       org: "seconds",
    //       project: "seconds",
    //     })
    //   )
    // }

    return config
  },
}

module.exports = withBlitz(
  withMDX({
    ...config,
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  })
)
