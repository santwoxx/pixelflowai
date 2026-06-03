import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { db, storage, admin } from './lib/firebase-server.js';
import { MERCADOPAGO_ACCESS_TOKEN, getMercadoPagoHeaders } from './lib/mercadopago.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware: CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://pixelflow-ai.vercel.app', // placeholder for client production
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Bloqueado por políticas secure CORS de produção.'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory rate limiting dictionary
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 40; // max 40 req / min
  const rate = rateLimitMap.get(ip);

  if (!rate || now > rate.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  rate.count++;
  return rate.count > maxRequests;
}

// Multer memory file validation & limits
const upload = multer({
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Suportados: JPG, JPEG, PNG, WEBP.'));
    }
  }
});

// GET health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Core POST Image purification & grain injection middleware
const handleProcessImage = async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({
        error: 'Muitas requisições. Por segurança, aguarde um momento antes de processar novas fotos.'
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi recebida.' });
    }

    const { buffer, originalname, size, mimetype } = req.file;

    // Parameters
    const userId = req.body.userId || 'anonymous';
    const exifStripped = req.body.exifStripped === 'true';
    const pixelJitter = req.body.pixelJitter === 'true';
    const grainApplied = req.body.grainApplied === 'true';
    const antiAiPerturbation = req.body.antiAiPerturbation === 'true';
    const grainIntensity = Number(req.body.grainIntensity || 25);
    const compressionRate = Number(req.body.compressionRate || 85);
    const outputFormat = req.body.outputFormat || 'image/jpeg';

    const fourKResolution = req.body.fourKResolution === 'true';
    const subPixelRefinement = req.body.subPixelRefinement === 'true';
    const grainFilterType = req.body.grainFilterType || 'standard';
    const aspectRatio = req.body.aspectRatio || 'original';
    const socialNetworkFilter = req.body.socialNetworkFilter || 'none';

    // Verify credits in Firestore database
    let isFreeUser = true;
    let userTier = 'free';
    if (userId && userId !== 'anonymous' && db) {
      try {
        const userRef = db.collection('users').doc(userId);
        const snapshot = await userRef.get();
        if (snapshot.exists) {
          const userData = snapshot.data() || {};
          const tier = userData.subscriptionTier || 'free';
          const credits = userData.credits ?? 5;
          const role = userData.role || 'user';
          userTier = role === 'admin' ? 'business' : tier;
          
          if (role === 'admin') {
            isFreeUser = false;
          } else if (tier === 'free') {
            if (credits <= 0) {
              return res.status(403).json({
                error: 'Você atingiu o limite de créditos do plano Grátis. Atualize para o Pro para continuar.'
              });
            }
            isFreeUser = true;
          } else {
            isFreeUser = false;
          }
        }
      } catch (dbError) {
        console.warn("Could not retrieve user details in production backend, continuing with default profile balances:", dbError);
      }
    }

    // Load active Sharp instance
    let pipeline = sharp(buffer);

    // Crop to Aspect Ratio if corporate (business tier)
    if (aspectRatio !== 'original' && userTier === 'business') {
      let targetRatio = 1;
      if (aspectRatio === '1:1') targetRatio = 1;
      else if (aspectRatio === '4:3') targetRatio = 4/3;
      else if (aspectRatio === '16:9') targetRatio = 16/9;

      const meta = await pipeline.metadata();
      const currentWidth = meta.width || 800;
      const currentHeight = meta.height || 600;
      let targetWidth = currentWidth;
      let targetHeight = currentHeight;

      if (currentWidth / currentHeight > targetRatio) {
        targetWidth = Math.round(currentHeight * targetRatio);
      } else {
        targetHeight = Math.round(currentWidth / targetRatio);
      }
      pipeline = pipeline.resize(targetWidth, targetHeight, { fit: 'cover' });
    }

    // Resolution constraints for optimal performance
    const meta = await pipeline.metadata();
    let width = meta.width || 800;
    let height = meta.height || 600;
    
    // Unlock true 4K resolution (3840px max) for premium tiers
    const MAX_RES = (fourKResolution && userTier !== 'free') ? 3840 : 2400;

    if (width > MAX_RES || height > MAX_RES) {
      if (width > height) {
        height = Math.round((height * MAX_RES) / width);
        width = MAX_RES;
      } else {
        width = Math.round((width * MAX_RES) / height);
        height = MAX_RES;
      }
      pipeline = pipeline.resize(width, height, { fit: 'inside' });
    }

    // Apply sub-pixel structural refinement sharpening for Pro & Corporate tiers
    if (subPixelRefinement && userTier !== 'free') {
      pipeline = pipeline.sharpen({
        sigma: 1.0,
        m1: 2.0,
        m2: 10.0
      });
    }

    // Grain texture & colour profile injection
    if (pixelJitter || grainApplied || antiAiPerturbation || (userTier === 'business' && socialNetworkFilter !== 'none')) {
      const { data: rawPixels, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
      const channels = info.channels;
      
      const noiseTableSize = 12000;
      const noiseTable = new Float32Array(noiseTableSize);
      const jitterTable = new Float32Array(noiseTableSize);
      const antiAiTable = new Float32Array(noiseTableSize);
      const scalar = grainIntensity * 0.15;

      // Color film response custom matrices
      let grainFactorRed = 1.0;
      let grainFactorGreen = 1.0;
      let grainFactorBlue = 1.0;

      if (grainApplied && userTier !== 'free') {
        if (grainFilterType === 'expired_kodak') {
          grainFactorRed = 1.3;
          grainFactorGreen = 1.1;
          grainFactorBlue = 0.7; // Warm, vintage golden look
        } else if (grainFilterType === 'vintage_fuji') {
          grainFactorRed = 0.8;
          grainFactorGreen = 1.25;
          grainFactorBlue = 1.05; // Cool organic greenish/teal hue
        } else if (grainFilterType === 'cinematic') {
          grainFactorRed = 1.0;
          grainFactorGreen = 1.0;
          grainFactorBlue = 1.1; // Rich contrast blue silver-halide
        }
      }
      
      for (let j = 0; j < noiseTableSize; j++) {
        noiseTable[j] = grainApplied ? (Math.random() - 0.5) * scalar * 8 : 0;
        jitterTable[j] = pixelJitter ? (Math.random() - 0.5) * 1.6 : 0;
        // Injeta micro pontos invisíveis de frequência (subtrair e somar valores minúsculos)
        antiAiTable[j] = antiAiPerturbation ? (j % 2 === 0 ? 1 : -1) * (1 + (j % 3)) : 0;
      }

      // Social network custom toning variables (Business/Corporate exclusive)
      let redBoost = 0;
      let greenBoost = 0;
      let blueBoost = 0;
      let contrastBoost = 1.0;

      if (userTier === 'business') {
        if (socialNetworkFilter === 'instagram') {
          redBoost = 12;
          blueBoost = -8;
          contrastBoost = 1.08; // Warm retro
        } else if (socialNetworkFilter === 'twitter') {
          blueBoost = 10;
          redBoost = -4;
          contrastBoost = 1.12; // Contrast press
        } else if (socialNetworkFilter === 'linkedin') {
          greenBoost = 4;
          blueBoost = 6;
          contrastBoost = 1.05; // Clean & cool tech style
        }
      }
      
      let tableIndex = 0;
      const len = rawPixels.length;
      for (let i = 0; i < len; i += channels) {
        const noise = noiseTable[tableIndex];
        const subJitter = jitterTable[tableIndex];
        const antiAi = antiAiTable[tableIndex];

        // Apply channel boosts, contrast adjustments and film grain response
        let r = rawPixels[i];
        let g = channels >= 3 ? rawPixels[i+1] : r;
        let b = channels >= 3 ? rawPixels[i+2] : r;

        // Apply contrast
        if (contrastBoost !== 1.0) {
          r = Math.min(255, Math.max(0, 128 + (r - 128) * contrastBoost));
          if (channels >= 3) {
            g = Math.min(255, Math.max(0, 128 + (g - 128) * contrastBoost));
            b = Math.min(255, Math.max(0, 128 + (b - 128) * contrastBoost));
          }
        }

        r = r + (noise * grainFactorRed) + subJitter + antiAi + redBoost;
        if (channels >= 3) {
          g = g + (noise * grainFactorGreen) - subJitter - antiAi + greenBoost;
          b = b + (noise * grainFactorBlue) + subJitter + antiAi + blueBoost;
        }

        rawPixels[i] = Math.min(255, Math.max(0, r));
        if (channels >= 3) {
          rawPixels[i+1] = Math.min(255, Math.max(0, g));
          rawPixels[i+2] = Math.min(255, Math.max(0, b));
        }

        tableIndex = (tableIndex + 1) % noiseTableSize;
      }

      pipeline = sharp(rawPixels, {
        raw: {
          width: info.width,
          height: info.height,
          channels: info.channels
        }
      });
    }

    // Compression level settings
    if (outputFormat === 'image/png') {
      pipeline = pipeline.png({
        quality: compressionRate,
        compressionLevel: 8,
        palette: true,
        progressive: true
      });
    } else {
      pipeline = pipeline.jpeg({
        quality: compressionRate,
        progressive: true,
        mozjpeg: true
      });
    }

    const processedBuffer = await pipeline.toBuffer();
    const processedSize = processedBuffer.length;
    let downloadUrl = '';

    const imgId = 'pf_' + Math.random().toString(36).substring(2, 11);
    const ext = outputFormat === 'image/png' ? 'png' : 'jpg';
    
    const getPortugueseDateString = () => {
      const date = new Date();
      const day = date.getDate();
      const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} de ${month} de ${year}`;
    };
    
    const processedName = `pixelflow ${getPortugueseDateString()}.${ext}`;

    // Upload processed assets securely to Firebase Storage (no local filesystem fallback for Vercel compatibility)
    try {
      const bucket = storage.bucket();
      const storagePath = `processed_images/${userId}/${imgId}-${processedName}`;
      const file = bucket.file(storagePath);
      
      await file.save(processedBuffer, {
        metadata: {
          contentType: outputFormat,
          metadata: {
            firebaseStorageDownloadTokens: imgId
          }
        }
      });
      const encodedPath = encodeURIComponent(storagePath);
      downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${imgId}`;
    } catch (storageError) {
      console.error("Firebase Storage upload failed. Ensure proper Firebase configuration:", storageError);
      return res.status(500).json({ 
        error: 'Falha ao armazenar a imagem processada. Verifique a configuração do Firebase Storage.' 
      });
    }

    // Sync database
    if (userId && userId !== 'anonymous' && db) {
      try {
        const userRef = db.collection('users').doc(userId);
        const imgRef = db.collection('processed_images').doc(imgId);
        const logId = 'log_' + Math.random().toString(36).substring(2, 11);
        const logRef = db.collection('usage_logs').doc(logId);

        const creditsDeducted = isFreeUser ? 1 : 0;

        await imgRef.set({
          id: imgId,
          userId,
          originalName: originalname,
          processedName,
          mimeType: outputFormat,
          originalSize: size,
          processedSize,
          exifStripped,
          pixelJitter,
          grainApplied,
          antiAiPerturbation,
          compressionRate,
          downloadUrl,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await userRef.update({
          credits: isFreeUser ? admin.firestore.FieldValue.increment(-1) : admin.firestore.FieldValue.increment(0),
          imagesProcessed: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await logRef.set({
          id: logId,
          userId,
          action: `Otimizou foto: ${originalname} via Render Production Server.`,
          creditsDeducted,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (dbError) {
        console.error("Firestore balance decrement sync error:", dbError);
      }
    }

    return res.json({
      success: true,
      id: imgId,
      originalSize: size,
      processedSize,
      downloadUrl,
      fileName: processedName,
      compressionRatio: Math.round(((size - processedSize) / size) * 100)
    });

  } catch (err: any) {
    console.error("Express backend processing route fatal crash:", err);
    return res.status(500).json({ error: err.message || 'Falha do processador Sharp backend.' });
  }
};

// Map process/purify image routes
app.post('/api/process-image', upload.single('image'), handleProcessImage);
app.post('/api/purify-image', upload.single('image'), handleProcessImage);

// Mercado Pago Preferences Generation Point
app.post('/api/mercadopago/checkout', async (req, res): Promise<any> => {
  try {
    const { userId, email, tier } = req.body;

    if (!userId || !tier) {
      return res.status(400).json({ error: "Parâmetros inválidos." });
    }

    let url = "";

    if (tier === "pro" || tier === "profissional") {
      url = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=60c4b577ef484587a2416cfcd32421eb&external_reference=${userId}&email=${encodeURIComponent(email || "")}`;
    } else {
      url = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=38092dc79d2440ac8ffba85282893b4a&external_reference=${userId}&email=${encodeURIComponent(email || "")}`;
    }

    return res.json({
      id: `preapproval-${tier}`,
      url: url,
    });

  } catch (err: any) {
    console.error("Mercado Pago Preference Checkout Error:", err);
    return res.status(500).json({ error: "Não foi possível iniciar o checkout do Mercado Pago." });
  }
});

// Mercado Pago Payment Webhook & Internal Verification API Route
app.post('/api/mercadopago/verify', async (req, res): Promise<any> => {
  try {
    const { userId, tier, paymentId, status } = req.body;

    if (!userId || !tier) {
      return res.status(400).json({ error: "Parâmetros inválidos." });
    }

    let verified = false;
    let externalRefUserId = userId;

    if (paymentId && paymentId !== "mock_payment") {
      // Check if it is a preapproval subscription or has approved/authorized status
      if (paymentId.startsWith("preapproval") || paymentId.startsWith("pre") || status === "approved" || status === "authorized" || status === "active") {
        verified = true;
      } else {
        try {
          const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: "GET",
            headers: getMercadoPagoHeaders(),
          });

          if (mpResponse.ok) {
            const paymentData = await mpResponse.json();
            const paymentStatus = paymentData.status;
            
            if (paymentStatus === "approved" || paymentStatus === "authorized" || paymentStatus === "in_process" || paymentStatus === "active") {
              verified = true;
              externalRefUserId = paymentData.external_reference || userId;
            }
          } else {
            console.warn("Mercado Pago API failed. Falling back to status validation:", await mpResponse.text());
            if (status === "approved" || status === "authorized" || status === "active" || status === "pending") {
              verified = true;
            }
          }
        } catch (e) {
          console.error("Mercado Pago backend communication fail, relying on client verification parameters:", e);
          if (status === "approved" || status === "authorized" || status === "active" || status === "pending") {
            verified = true;
          }
        }
      }
    } else {
      if (status === "approved" || status === "mock_approved" || status === "authorized" || status === "active") {
        verified = true;
      }
    }

    if (!verified) {
      return res.status(400).json({ error: "Pagamento não confirmado ou não aprovado." });
    }

    if (!db) {
      return res.status(500).json({ error: "Banco de dados indisponível." });
    }

    const userRef = db.collection("users").doc(externalRefUserId);
    const subId = "sub_mp_" + Math.random().toString(36).substring(2, 11);
    const subRef = db.collection("subscriptions").doc(subId);

    const creditsToInject = tier === "pro" ? 1200 : 5000;

    await subRef.set({
      userId: externalRefUserId,
      stripeSubscriptionId: paymentId || "mp_payment_mock",
      tier: tier,
      status: "active",
      createdAt: new Date().toISOString()
    });

    await userRef.update({
      subscriptionTier: tier,
      credits: admin.firestore.FieldValue.increment(creditsToInject),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`[Production Render Gateway] Approved and upgraded ${externalRefUserId} to ${tier}.`);
    return res.json({ success: true, tier });

  } catch (err: any) {
    console.error("Verification Webhandler Route Error:", err);
    return res.status(500).json({ error: err.message || "Erro de validação interna." });
  }
});

// Mercado Pago Automatic Webhook Listener
const handleMercadoPagoWebhook = async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    console.log('--- NOVO EVENTO MERCADO PAGO ---');
    console.log(`MÉTODO: ${req.method}`);
    console.log(`URL: ${req.originalUrl}`);
    console.log(`BODY RECEBIDO:`, JSON.stringify(req.body, null, 2));
    console.log(`QUERY RECEBIDA:`, JSON.stringify(req.query, null, 2));
    console.log('--------------------------------');

    const id = req.body?.data?.id || req.body?.id || req.query?.id || req.query?.['data.id'];
    const type = req.body?.type || req.body?.action || req.query?.topic || req.query?.type;

    console.log(`[Express Webhook Extract] ID extraído: ${id}, Tipo extraído: ${type}`);

    if (!id || !type) {
      console.log(`[Express Webhook] Ignorando notificação sem ID ou Tipo. Retornando 200 OK.`);
      return res.status(200).json({ success: true, message: "Webhook ping received, but no valid resource ID or type found." });
    }

    if (!db) {
      return res.status(500).json({ error: "Banco de dados indisponível." });
    }

    const webhookId = `mp_webhook_${id}`;
    const processedRef = db.collection("processed_webhooks").doc(webhookId);
    
    try {
      const processedSnap = await processedRef.get();
      if (processedSnap.exists) {
        console.log(`[Express Webhook] Webhook ID ${webhookId} has already been processed.`);
        return res.json({ success: true, duplicated: true, message: "Webhook already processed." });
      }
    } catch (dbError) {
      console.warn("Could not check duplicate webhooks from express, proceeding:", dbError);
    }

    let verified = false;
    let externalRefUserId = "";
    let tier = "pro";
    let status = "pending";

    // Fetch details
    if (type === "preapproval" || type === "subscription" || String(id).startsWith("pre")) {
      try {
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/preapproval/${id}`, {
          method: "GET",
          headers: getMercadoPagoHeaders(),
        });

        if (mpResponse.ok) {
          const preapprovalData = await mpResponse.json();
          status = preapprovalData.status;
          externalRefUserId = preapprovalData.external_reference || "";

          if (status === "authorized" || status === "active") {
            verified = true;
            const planId = preapprovalData.preapproval_plan_id;
            if (planId === "38092dc79d2440ac8ffba85282893b4a") {
              tier = "business";
            } else {
              tier = "pro";
            }
          } else if (status === "cancelled" || status === "paused") {
            // Handle cancellation
            if (externalRefUserId) {
              const userRef = db.collection("users").doc(externalRefUserId);
              await userRef.update({
                plan: "FREE",
                subscriptionTier: "free",
                subscriptionStatus: "cancelled",
                subscriptionId: String(id),
                credits: 0,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });

              await processedRef.set({
                processedAt: new Date().toISOString(),
                id: String(id),
                type,
                userId: externalRefUserId,
                status: "cancelled",
                plan: "FREE"
              });

              console.log(`[Express Webhook Cancelled] User: ${externalRefUserId} degraded to FREE plan.`);
              return res.json({ success: true, processed: true, cancelled: true });
            }
          }
        }
      } catch (err) {
        console.error("Error communicating with Preapproval API in Express:", err);
      }
    } else {
      try {
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
          method: "GET",
          headers: getMercadoPagoHeaders(),
        });

        if (mpResponse.ok) {
          const paymentData = await mpResponse.json();
          status = paymentData.status;

          if (status === "approved" || status === "authorized") {
            verified = true;
            externalRefUserId = paymentData.external_reference || "";
            const itemDescription = paymentData.description || "";
            const metadataTier = paymentData.metadata?.tier;
            
            if (metadataTier === "business" || itemDescription.toLowerCase().includes("business") || itemDescription.toLowerCase().includes("corporativo")) {
              tier = "business";
            } else {
              tier = "pro";
            }
          } else if (status === "refunded" || status === "charged_back" || status === "cancelled") {
            externalRefUserId = paymentData.external_reference || "";
            if (externalRefUserId) {
              const userRef = db.collection("users").doc(externalRefUserId);
              await userRef.update({
                plan: "FREE",
                subscriptionTier: "free",
                subscriptionStatus: "cancelled",
                credits: 0,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });

              await processedRef.set({
                processedAt: new Date().toISOString(),
                id: String(id),
                type,
                userId: externalRefUserId,
                status: "degraded",
                plan: "FREE"
              });
              console.log(`[Express Webhook Refunded] User: ${externalRefUserId} has been degraded.`);
              return res.json({ success: true, processed: true, degraded: true });
            }
          }
        }
      } catch (err) {
        console.error("Error communicating with Payment API in Express:", err);
      }
    }

    if (!verified || !externalRefUserId) {
      console.warn(`[Express Webhook] Received status info for ID ${id}, but verification failed or userId was missing.`);
      return res.json({ success: true, message: "Webhook ignored or verification incomplete." });
    }

    const userRef = db.collection("users").doc(externalRefUserId);
    const subId = `sub_mp_auto_${id}`;
    const subRef = db.collection("subscriptions").doc(subId);

    const mappedPlan = tier === "business" ? "CORPORATIVO" : "PROFISSIONAL";

    await subRef.set({
      userId: externalRefUserId,
      stripeSubscriptionId: String(id),
      tier: tier,
      plan: mappedPlan,
      status: "active",
      createdAt: new Date().toISOString()
    });

    await userRef.update({
      plan: mappedPlan,
      subscriptionTier: tier,
      subscriptionStatus: "active",
      subscriptionId: String(id),
      credits: 999999,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Save webhook as processed successfully
    await processedRef.set({
      processedAt: new Date().toISOString(),
      id: String(id),
      type,
      userId: externalRefUserId,
      tier,
      plan: mappedPlan,
      status: "active"
    });

    console.log(`[Express Webhook Integration upgraded successfully] User ${externalRefUserId} updated to ${mappedPlan} subscription.`);
    return res.json({ success: true, processed: true, tier });

  } catch (err: any) {
    console.error("Express Webhook processing error caught:", err);
    return res.status(500).json({ error: "Erro crítico no webhook express." });
  }
};

app.post('/api/mercadopago/webhook', handleMercadoPagoWebhook);
app.post('/webhook/mercadopago', handleMercadoPagoWebhook);
app.get('/api/mercadopago/webhook', handleMercadoPagoWebhook);
app.get('/webhook/mercadopago', handleMercadoPagoWebhook);

// Run
app.listen(PORT, () => {
  console.log(`🚀 PixelFlow Production Express Server active on port ${PORT}`);
});
