import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes, { recordServerOrder, confirmServerOrderPayment } from './src/server/auth-backend.ts';

// Load .env first, fallback to .env.example if variables are missing
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.example') });

const app = express();
const PORT = 3000;

app.set('trust proxy', 1);
app.use(express.json({ limit: '32kb' }));

// Helmet с безопасными правилами для загрузки ресурсов и работы во фрейме/Vite
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: false,
  })
);

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Canonical domain redirect only for www -> non-www on the actual domain
app.use((req, res, next) => {
  if (req.hostname.toLowerCase() === 'www.egenetwork11.com') {
    const requestPath = req.originalUrl.startsWith('/') ? req.originalUrl : `/${req.originalUrl}`;
    return res.redirect(308, `https://egenetwork11.com${requestPath}`);
  }
  next();
});

// Debug: Check if authRoutes is loaded
console.log('[Auth] Registering auth routes at /api/auth');
console.log('[Auth] authRoutes type:', typeof authRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/settings', (req, res, next) => {
  req.url = '/settings';
  authRoutes(req, res, next);
});
app.post('/api/settings', (req, res, next) => {
  req.url = '/settings';
  authRoutes(req, res, next);
});

// API route: Check UrlPay Configuration Status
app.get('/api/payment-config-status', (req, res) => {
  const apiKey = process.env.URLPAY_API_KEY;
  const secretKey = process.env.URLPAY_SECRET_KEY;
  const shopId = process.env.URLPAY_SHOP_ID;

  res.json({
    configured: Boolean(apiKey && secretKey && shopId),
    hasApiKey: Boolean(apiKey),
    hasSecretKey: Boolean(secretKey),
    hasShopId: Boolean(shopId),
    shopId: shopId || null,
  });
});

// API route: Create UrlPay Payment according to UrlPay API V1 spec
app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, description, items, userId, userTelegramId, userName } = req.body;

    const apiKey = process.env.URLPAY_API_KEY;
    const secretKey = process.env.URLPAY_SECRET_KEY;
    const shopId = process.env.URLPAY_SHOP_ID;
    let apiUrl = process.env.URLPAY_API_URL || 'https://urlpay.net/api/v2/payments';
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Некорректная сумма платежа' });
    }

    // Check if real UrlPay credentials exist
    if (!apiKey || !secretKey || !shopId) {
      console.warn('[UrlPay] Missing environment variables. Returning simulation response.');
      
      // Still record simulated order in SQLite as pending
      const simUuid = `inv-sim-${Date.now()}`;
      let dbOrder;
      try {
        dbOrder = recordServerOrder({
          id: simUuid,
          userId,
          userTelegramId,
          userName,
          items: Array.isArray(items) ? items : [],
          totalAmount: Number(amount),
          paymentMethod: 'urlpay_sim',
          paymentId: simUuid,
          status: 'pending',
          notes: description || 'Оплата заказа (эмуляция)'
        });
      } catch (e) {
        console.warn('[DB] Failed to record simulated order:', e);
      }

      return res.json({
        success: true,
        isSimulation: true,
        message: 'UrlPay ключи не найдены в .env. Для реальной оплаты укажите URLPAY_API_KEY, URLPAY_SECRET_KEY и URLPAY_SHOP_ID.',
        simulatedOrder: {
          uuid: simUuid,
          amount,
          description: description || 'Оплата заказа',
        },
      });
    }

    const currency = 'rub';
    const uuid = `inv-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Save pending order to SQLite database
    let dbOrder;
    try {
      dbOrder = recordServerOrder({
        id: uuid,
        userId,
        userTelegramId,
        userName,
        items: Array.isArray(items) ? items : [],
        totalAmount: Number(amount),
        paymentMethod: 'urlpay',
        paymentId: uuid,
        status: 'pending',
        notes: description || 'Оплата обучения EGE Network'
      });
    } catch (e) {
      console.warn('[DB] Failed to record pending order:', e);
    }

    const formattedAmount = Number(amount).toFixed(2);

    // UrlPay signature calculation: sha1(currency + amount + shopId + secretKey)
    const signString = `${currency}${formattedAmount}${shopId}${secretKey}`;
    const sign = crypto.createHash('sha1').update(signString).digest('hex');

    const paymentPayload = {
      currency,
      amount: formattedAmount,
      uuid,
      order_id: uuid,
      shopId: Number(shopId),
      shop_id: Number(shopId),
      apiKey: apiKey,
      api_key: apiKey,
      description: description || 'Оплата обучения EGE Network',
      website_url: appUrl,
      subscribe: null,
      holdTime: null,
      language: 'ru',
      items: Array.isArray(items) && items.length > 0
        ? items.map((item: any) => ({
            name: String(item.title || item.name || 'Обучающий курс'),
            price: Number(item.price || amount),
            count: 1,
          }))
        : [
            {
              name: description || 'Оплата заказа',
              price: Number(formattedAmount),
              count: 1,
            },
          ],
      sign,
      signature: sign,
    };

    const extractPaymentUrl = (data: any) => {
      if (!data || typeof data !== 'object') return null;
      return data.paymentUrl || data.payment_url || data.url || data.link ||
        data.data?.paymentUrl || data.data?.payment_url || data.data?.url || data.data?.link || null;
    };

    console.log('[UrlPay Request Payload]:', JSON.stringify(paymentPayload, null, 2));

    let response: Response;
    let responseText = '';
    let responseData: any = null;
    let resolvedPaymentUrl: string | null = null;

    const urlsToTry: string[] = [];
    if (apiUrl) urlsToTry.push(apiUrl);
    
    // Add domain fallbacks for urlpay.net and urlpay.io
    if (apiUrl.includes('urlpay.io')) {
      urlsToTry.push(apiUrl.replace('urlpay.io', 'urlpay.net'));
    } else if (apiUrl.includes('urlpay.net')) {
      urlsToTry.push(apiUrl.replace('urlpay.net', 'urlpay.io'));
    }
    // Also try v1 if v2 is specified
    if (!urlsToTry.some(u => u.includes('/v1/'))) {
      urlsToTry.push('https://urlpay.net/api/v1/payments');
    }

    let lastErrorMsg = '';

    for (const targetUrl of urlsToTry) {
      try {
        console.log(`[UrlPay] Sending request to: ${targetUrl}`);
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'api-key': apiKey,
            'x-api-key': apiKey,
            'x-shop-id': shopId,
            'X-Shop-Id': shopId,
          },
          body: JSON.stringify(paymentPayload),
          signal: AbortSignal.timeout(6000), // 6 second timeout
        });

        responseText = await response.text();

        try {
          responseData = JSON.parse(responseText);
          resolvedPaymentUrl = extractPaymentUrl(responseData);
          if (responseData && (responseData.success || responseData.data?.success || resolvedPaymentUrl)) {
            // Successfully parsed a valid payment response
            break;
          }
          lastErrorMsg = responseData?.message || responseData?.error || `HTTP ${response.status}`;
        } catch (jsonErr) {
          console.warn(`[UrlPay] Non-JSON response from ${targetUrl}:`, responseText.substring(0, 200));
          lastErrorMsg = `Сервер ${targetUrl} вернул HTML/текст вместо JSON`;
        }
      } catch (fetchErr: any) {
        console.error(`[UrlPay] Fetch error for ${targetUrl}:`, fetchErr);
        lastErrorMsg = fetchErr.message || 'Ошибка подключения к сети UrlPay';
      }
    }

    if (!responseData) {
      return res.status(502).json({
        success: false,
        error: `Не удалось получить отклик от API UrlPay (${lastErrorMsg}). Проверьте правильность URLPAY_API_URL и доступ к хосту.`,
      });
    }

    console.log('[UrlPay Response]:', responseData);

    if (responseData && (responseData.success || responseData.data?.success || resolvedPaymentUrl)) {
      return res.json({
        success: true,
        paymentUrl: resolvedPaymentUrl || responseData.paymentUrl,
        paymentId: responseData.id || responseData.data?.id,
        uuid,
        rawResponse: responseData,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: responseData.message || responseData.error || 'Ошибка при вызове UrlPay API',
        details: responseData,
      });
    }
  } catch (error: any) {
    console.error('[UrlPay Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Внутренняя ошибка сервера при создании платежа',
    });
  }
});

// API Route: UrlPay Webhook Callback
app.post('/api/urlpay/callback', (req, res) => {
  try {
    const { id, amount, currency, uuid, payment_status } = req.body;
    console.log('[UrlPay Callback Received]:', { id, amount, currency, uuid, payment_status });

    if (payment_status === 'success' || payment_status === 'paid' || payment_status === 'completed') {
      // Payment confirmed via UrlPay - automatically mark order as paid & grant courses in SQLite
      const targetId = uuid || id;
      if (targetId) {
        confirmServerOrderPayment(targetId);
      }
      return res.json({ success: true, message: 'Payment confirmed and access granted' });
    }

    return res.json({ success: true, message: 'Callback received' });
  } catch (err: any) {
    console.error('[UrlPay Callback Error]:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
});

// AliceEge Partner OAuth2 Configuration & Token Cache
const ALICEEGE_ID_TOKEN_URL = process.env.ALICEEGE_ID_TOKEN_URL || 'https://id.aliceege.site/realms/aliceege/protocol/openid-connect/token';
const ALICEEGE_API_URL = (process.env.ALICEEGE_API_URL || 'https://new-admin.aliceege.site').replace(/\/+$/, '');
const ALICEEGE_ID_CLIENT_ID = process.env.ALICEEGE_ID_CLIENT_ID || '';
const ALICEEGE_ID_CLIENT_SECRET = process.env.ALICEEGE_ID_CLIENT_SECRET || '';

interface AliceEgeTokenCache {
  token: string;
  expiresAt: number;
}
let aliceTokenCache: AliceEgeTokenCache | null = null;

async function getAliceEgeAccessToken(req?: express.Request): Promise<string | null> {
  const clientId = (req?.headers['x-alice-client-id'] as string) || (req?.query?.aliceClientId as string) || ALICEEGE_ID_CLIENT_ID;
  const clientSecret = (req?.headers['x-alice-client-secret'] as string) || (req?.query?.aliceClientSecret as string) || ALICEEGE_ID_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const now = Date.now();
  // Check cached token with 30s leeway
  if (aliceTokenCache && aliceTokenCache.expiresAt > now + 30000) {
    return aliceTokenCache.token;
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(ALICEEGE_ID_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }).toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[AliceEge OAuth2 Error] Status: ${response.status}`, errText);
      return null;
    }

    const tokenData = (await response.json()) as any;
    if (tokenData?.access_token) {
      const expiresInSec = Number(tokenData.expires_in) || 300;
      aliceTokenCache = {
        token: tokenData.access_token,
        expiresAt: now + expiresInSec * 1000,
      };
      return tokenData.access_token;
    }
    return null;
  } catch (err) {
    console.error('[AliceEge OAuth2 Fetch Error]:', err);
    return null;
  }
}

function localPlaylistUri(uri: string, videoId?: string | number): string {
  try {
    if (uri.includes('/api/external/videos/')) {
      const parsed = new URL(uri, 'http://localhost');
      const newPath = parsed.pathname.replace('/api/external/videos/', '/api/player/videos/');
      const search = parsed.search || '';
      const hash = parsed.hash || '';
      return `${newPath}${search}${hash}`;
    }
    if (videoId && uri.endsWith('.m3u8') && !uri.startsWith('http') && !uri.startsWith('/')) {
      return `/api/player/videos/${videoId}/playback?path=${encodeURIComponent(uri)}`;
    }
    return uri;
  } catch {
    return uri.replace('/api/external/videos/', '/api/player/videos/');
  }
}

function rewriteM3u8Manifest(manifestText: string, videoId: string | number): string {
  const lines = manifestText.split('\n');
  const rewritten = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    if (trimmed.startsWith('#EXT-X-MEDIA:') && trimmed.includes('URI="')) {
      return line.replace(/URI="([^"]+)"/, (_, uri) => `URI="${localPlaylistUri(uri, videoId)}"`);
    }
    if (trimmed.startsWith('#EXT-X-I-FRAME-STREAM-INF:') && trimmed.includes('URI="')) {
      return line.replace(/URI="([^"]+)"/, (_, uri) => `URI="${localPlaylistUri(uri, videoId)}"`);
    }
    if (trimmed.startsWith('#')) {
      return line;
    }
    if (trimmed.includes('.m3u8') || trimmed.includes('/playback')) {
      return localPlaylistUri(trimmed, videoId);
    }
    // Video segments (.ts / .m4s) from CDN assets.aliceege.site remain intact
    return line;
  });
  return rewritten.join('\n');
}

// 1. Partner API: Courses list
app.get('/api/partner/courses', async (req, res) => {
  try {
    const token = await getAliceEgeAccessToken(req);
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      const apiKey = (req.query.apiKey as string) || (req.headers['x-api-key'] as string) || '8d80584f02d604759a5fad01db47f2e488de412cb6cb5237';
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(`${ALICEEGE_API_URL}/api/external/courses`, { headers });
    res.status(response.status);
    for (const [name, val] of response.headers.entries()) {
      if (['content-type', 'cache-control'].includes(name.toLowerCase())) {
        res.setHeader(name, val);
      }
    }
    const body = await response.text();
    return res.send(body);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Courses fetch error' });
  }
});

// 2. Partner API: Course Module Materials
app.get('/api/partner/courses/:course_id/modules/:module_id/materials', async (req, res) => {
  try {
    const { course_id, module_id } = req.params;
    const token = await getAliceEgeAccessToken(req);
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      const apiKey = (req.query.apiKey as string) || (req.headers['x-api-key'] as string) || '8d80584f02d604759a5fad01db47f2e488de412cb6cb5237';
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(`${ALICEEGE_API_URL}/api/external/courses/${course_id}/modules/${module_id}/materials`, {
      headers,
    });

    if (!response.ok) {
      res.status(response.status);
      const text = await response.text();
      return res.send(text);
    }

    const materials = (await response.json()) as any;
    if (materials && Array.isArray(materials.videos)) {
      materials.videos = materials.videos.map((uri: string) => localPlaylistUri(uri, course_id));
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.json(materials);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Materials fetch error' });
  }
});

// 3. Player API: Video Playback manifest with nested playlist rewriting
app.get('/api/player/videos/:video_id/playback', async (req, res) => {
  try {
    const videoId = req.params.video_id;
    const pathQuery = (req.query.path as string) || 'master.m3u8';

    if (!/^[A-Za-z0-9._/-]+\.m3u8$/.test(pathQuery)) {
      return res.status(400).send('Invalid path parameter');
    }

    const token = await getAliceEgeAccessToken(req);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      const apiKey = (req.query.apiKey as string) || (req.headers['x-api-key'] as string) || '8d80584f02d604759a5fad01db47f2e488de412cb6cb5237';
      headers['X-API-Key'] = apiKey;
    }

    const targetUrl = `${ALICEEGE_API_URL}/api/external/videos/${videoId}/playback?path=${encodeURIComponent(pathQuery)}`;
    const response = await fetch(targetUrl, { headers });

    if (!response.ok) {
      res.status(response.status);
      for (const [name, val] of response.headers.entries()) {
        if (['content-type', 'cache-control'].includes(name.toLowerCase())) {
          res.setHeader(name, val);
        }
      }
      const text = await response.text();
      return res.send(text);
    }

    const manifestText = await response.text();
    const rewrittenManifest = rewriteM3u8Manifest(manifestText, videoId);

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.send(rewrittenManifest);
  } catch (err: any) {
    return res.status(500).send(err.message || 'Playback error');
  }
});

// Backward-compatible API Route: External Courses List Proxy
app.get('/api/external/courses', async (req, res) => {
  try {
    const token = await getAliceEgeAccessToken(req);
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      const apiKey = (req.query.apiKey as string) || (req.headers['x-api-key'] as string) || '8d80584f02d604759a5fad01db47f2e488de412cb6cb5237';
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(`${ALICEEGE_API_URL}/api/external/courses`, { headers });
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `API вернул ошибку ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('[External API Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Ошибка подключения к внешнему API',
    });
  }
});

// Backward-compatible API Route: External Course Module Materials Proxy
app.get('/api/external/course-materials', async (req, res) => {
  try {
    const courseId = (req.query.courseId as string) || '1';
    const moduleId = (req.query.moduleId as string) || '1';
    const token = await getAliceEgeAccessToken(req);
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      const apiKey = (req.query.apiKey as string) || (req.headers['x-api-key'] as string) || '8d80584f02d604759a5fad01db47f2e488de412cb6cb5237';
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(`${ALICEEGE_API_URL}/api/external/courses/${courseId}/modules/${moduleId}/materials`, {
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `API вернул ошибку ${response.status}`,
        details: errorText,
      });
    }

    const data = (await response.json()) as any;
    if (data && Array.isArray(data.videos)) {
      data.videos = data.videos.map((uri: string) => localPlaylistUri(uri, courseId));
    }

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('[External API Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Ошибка подключения к внешнему API',
    });
  }
});

// API Route: HLS Stream Proxy with Manifest Rewriting
app.get('/api/external/stream-proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url as string;
    const apiKey = (req.query.apiKey as string) || '8d80584f02d604759a5fad01db47f2e488de412cb6cb5237';
    if (!targetUrl) {
      return res.status(400).send('URL required');
    }

    const response = await fetch(targetUrl, {
      headers: {
        'X-API-Key': apiKey,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).send(`Stream fetch error ${response.status}: ${errText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Check if it's an m3u8 playlist
    if (targetUrl.includes('.m3u8') || contentType.includes('mpegurl') || contentType.includes('text/plain')) {
      const text = await response.text();
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

      const parsedUrl = new URL(targetUrl);
      const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
      const pathDir = parsedUrl.pathname.substring(0, parsedUrl.pathname.lastIndexOf('/') + 1);

      const lines = text.split('\n');
      const rewrittenLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          if (trimmed.startsWith('#EXT-X-MAP:') && trimmed.includes('URI="')) {
            return trimmed.replace(/URI="([^"]+)"/, (match, uri) => {
              let absoluteSegmentUrl = uri;
              if (!uri.startsWith('http')) {
                if (uri.startsWith('/')) {
                  absoluteSegmentUrl = `${baseUrl}${uri}`;
                } else {
                  absoluteSegmentUrl = `${baseUrl}${pathDir}${uri}`;
                }
              }
              const proxied = `/api/external/stream-proxy?url=${encodeURIComponent(absoluteSegmentUrl)}&apiKey=${encodeURIComponent(apiKey)}`;
              return `URI="${proxied}"`;
            });
          }
          return line;
        }

        let absoluteSegmentUrl = trimmed;
        if (!trimmed.startsWith('http')) {
          if (trimmed.startsWith('/')) {
            absoluteSegmentUrl = `${baseUrl}${trimmed}`;
          } else {
            absoluteSegmentUrl = `${baseUrl}${pathDir}${trimmed}`;
          }
        }

        return `/api/external/stream-proxy?url=${encodeURIComponent(absoluteSegmentUrl)}&apiKey=${encodeURIComponent(apiKey)}`;
      });

      return res.send(rewrittenLines.join('\n'));
    } else {
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      } else {
        res.setHeader('Content-Type', 'video/mp2t');
      }
      const buffer = await response.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }
  } catch (err: any) {
    console.error('[Stream Proxy Error]:', err);
    return res.status(500).send(err.message || 'Stream proxy error');
  }
});

async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasBuiltDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isStandaloneProduction = process.env.NODE_ENV === 'production' && hasBuiltDist && !process.argv.some(arg => arg.includes('tsx'));

  if (!isStandaloneProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
