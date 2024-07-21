export const metadata = {
  title: 'ORA Jeopardy AI',
  description: 'ORA Jeopardy AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
