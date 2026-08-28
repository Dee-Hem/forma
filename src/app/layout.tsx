import type {Metadata} from 'next';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'FormaText - Professional Markdown & reStructuredText Editor',
  description: 'A clean, minimal, and high-fidelity editor for modern writers.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Bulk loading professional fonts and Word-compatible equivalents */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400;1,700&family=Fira+Code:wght@300..700&family=Inter:wght@300..800&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Gelasio:ital,wght@0,400..700;1,400..700&family=Arimo:ital,wght@0,400..700;1,400..700&family=Caladea:ital,wght@0,400;0,700;1,400;1,700&family=Spectral:ital,wght@0,200..800;1,200..800&family=Varela+Round&family=Hind:wght@300..700&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Cousine:ital,wght@0,400;0,700;1,400;1,700&family=Libre+Franklin:ital,wght@0,100..900;1,100..900&family=Caveat:wght@400..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Arvo:ital,wght@0,400;0,700;1,400;1,700&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Pacifico&family=Sacramento&family=Anton&family=Cinzel:wght@400..900&family=Roboto+Condensed:ital,wght@0,300..700;1,300..700&display=swap" 
          rel="stylesheet" 
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.MathJax = {
                tex: {
                  inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                  displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
                },
                svg: {
                  fontCache: 'global'
                }
              };
            `,
          }}
        />
        <script
          id="mathjax-script"
          async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        ></script>
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
