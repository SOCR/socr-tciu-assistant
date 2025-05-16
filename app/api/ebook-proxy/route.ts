import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetUrlString = searchParams.get('url');

  if (!targetUrlString) {
    return new NextResponse('Missing target URL', { status: 400 });
  }

  try {
    const targetUrl = new URL(targetUrlString);
    const response = await fetch(targetUrl.href, { // Use .href to ensure the full URL is fetched
      headers: {
        // It's good practice to forward some headers or set a specific User-Agent
        // if the target site requires it, but start simple.
        'User-Agent': 'TCIU-Ebook-Proxy/1.0',
      },
    });

    if (!response.ok) {
      return new NextResponse(`Error fetching from target: ${response.status} ${response.statusText}`, {
        status: response.status,
      });
    }

    let htmlContent = await response.text();

    // Inject base tag (important to do this *before* stripping potentially related scripts)
    const basePath = targetUrl.protocol + '//' + targetUrl.host + targetUrl.pathname.substring(0, targetUrl.pathname.lastIndexOf('/') + 1);
    const baseTag = `<base href="${basePath}">`;
    if (htmlContent.includes('<head>')) {
      htmlContent = htmlContent.replace('<head>', '<head>\n' + baseTag);
    } else if (htmlContent.includes('<HEAD>')) {
      htmlContent = htmlContent.replace('<HEAD>', '<HEAD>\n' + baseTag);
    } else {
      htmlContent = baseTag + '\n' + htmlContent;
    }

    // Add MathJax script
    const mathJaxScript = `<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-AMS_CHTML"></script>`;
    
    // --- Re-enabled Experimental Stripping for Testing --- 
    // First, strip ALL scripts
    htmlContent = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // htmlContent = htmlContent.replace(/<img[^>]*>/gi, '');
    // ---------------------------------------------------- 

    // Now add MathJax script after stripping all others
    if (htmlContent.includes('</head>')) {
      console.log('[EBOOK_PROXY] Adding MathJax to </head>');
      htmlContent = htmlContent.replace('</head>', mathJaxScript + '\n</head>');
    } else if (htmlContent.includes('</HEAD>')) {
      console.log('[EBOOK_PROXY] Adding MathJax to </HEAD>');
      htmlContent = htmlContent.replace('</HEAD>', mathJaxScript + '\n</HEAD>');
    } else {
      // If no head tag, add at the beginning of the body or HTML document
      if (htmlContent.includes('<body>')) {
        console.log('[EBOOK_PROXY] Adding MathJax to <body>');
        htmlContent = htmlContent.replace('<body>', '<body>\n' + mathJaxScript);
      } else if (htmlContent.includes('<BODY>')) {
        console.log('[EBOOK_PROXY] Adding MathJax to <BODY>');
        htmlContent = htmlContent.replace('<BODY>', '<BODY>\n' + mathJaxScript);
      } else {
        console.log('[EBOOK_PROXY] Adding MathJax to beginning of HTML');
        htmlContent = mathJaxScript + '\n' + htmlContent;
      }
    }

    // Add MathJax configuration to support LaTeX
    const mathJaxConfig = `
    <script type="text/x-mathjax-config">
      MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [['$','$'], ['\\\\(','\\\\)']],
          displayMath: [['$$','$$'], ['\\\\[','\\\\]']],
          processEscapes: true
        }
      });
    </script>`;
    
    // Add the config before MathJax is loaded
    htmlContent = htmlContent.replace(mathJaxScript, mathJaxConfig + '\n' + mathJaxScript);

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400'
        // s-maxage=3600: Tells CDNs (like Vercel) to cache for 1 hour (3600 seconds).
        // stale-while-revalidate=86400: Allows CDN to serve stale content for 1 day while revalidating.
      },
    });
  } catch (error: any) {
    console.error('[EBOOK_PROXY_ERROR]', error);
    let errorMessage = 'Internal Server Error while proxying request';
    if (error.code === 'ERR_INVALID_URL') {
        errorMessage = 'Invalid target URL provided.';
        return new NextResponse(errorMessage, { status: 400 });
    }
    return new NextResponse(errorMessage, { status: 500 });
  }
} 