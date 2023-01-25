import Head from "next/head"
import { ReactNode } from "react"

import { default as LayoutView, LayoutProps as LayoutViewProps } from "app/core/components/Layout"

interface LayoutProps extends LayoutViewProps {
  title?: string
  children: ReactNode
  hideNavigation?: boolean
}

const Layout = ({ title, children, ...props }: LayoutProps) => (
  <>
    <Head>
      <title>{title || "Seconds"}</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <LayoutView {...props}>{children}</LayoutView>
  </>
)

export default Layout
