import "./globals.css"

export const metadata = {
  title: "Python Quiz Pro",
  description: "Python 期末刷题系统",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}