import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { db, storage } from '@/lib/firebase-server';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// In-memory rate limiting dictionary
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30; // Limit to 30 process request / minute
  const rate = rateLimitMap.get(ip);

  if (!rate || now > rate.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  rate.count++;
  if (rate.count > maxRequests) {
    return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP extraction and Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Por segurança, aguarde um momento antes de processar novas fotos.' },
        { status: 429 }
      );
    }

    // 2. Form Data processing
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    
    if (!imageFile) {
      return NextResponse.json({ error: 'Nenhuma imagem foi recebida.' }, { status: 400 });
    }

    // 3. Complete MIME type safety and Size Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Suportados: JPG, JPEG, PNG, WEBP.' },
        { status: 400 }
      );
    }

    // Enforce 20MB maximum size limit
    if (imageFile.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'A imagem excede o tamanho limite de 20MB.' },
        { status: 400 }
      );
    }

    // Extract parsing parameters from form
    const userId = (formData.get('userId') as string) || 'anonymous';
    const exifStripped = formData.get('exifStripped') === 'true';
    const pixelJitter = formData.get('pixelJitter') === 'true';
    const grainApplied = formData.get('grainApplied') === 'true';
    const antiAiPerturbation = formData.get('antiAiPerturbation') === 'true';
    const grainIntensity = Number(formData.get('grainIntensity') || 25);
    const compressionRate = Number(formData.get('compressionRate') || 85);
    const outputFormat = (formData.get('outputFormat') as string) || 'image/jpeg';

    // Check credits before expensive processing
    let isAdmin = false;
    let userTier = 'free';
    if (userId && userId !== 'anonymous' && db) {
      try {
        const userRef = doc(db, 'users', userId);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.data();
          const tier = userData.subscriptionTier || 'free';
          const credits = userData.credits ?? 5;
          const email = userData.email || '';
          const isAdminEmail = email === 'santwomusic@gmail.com' || email === 'brisasofc@gmail.com' || email === 'admin@pixelflow.ai';
          let role = userData.role || 'user';

          if (isAdminEmail && role !== 'admin') {
            role = 'admin';
            try {
              await updateDoc(userRef, { role: 'admin' });
            } catch (upgErr) {
              console.error("Erro ao atualizar papel do admin no endpoint de process-image:", upgErr);
            }
          }
          
          userTier = tier;
          if (role === 'admin') {
            isAdmin = true;
          }
          
          if (!isAdmin) {
            if (credits <= 0) {
              if (tier === 'free') {
                return NextResponse.json(
                  { error: 'Você atingiu o limite de 5 créditos do plano Grátis. Inscreva-se em um plano para continuar.' },
                  { status: 403 }
                );
              } else {
                return NextResponse.json(
                  { error: 'Você esgotou os créditos da sua assinatura. Renove ou adquira mais créditos para continuar.' },
                  { status: 403 }
                );
              }
            }
          }
        }
      } catch (dbError) {
        console.warn("Could not check credits from db prior to processing, continuing:", dbError);
      }
    }

    // 4. File reading to complete node buffer conversion
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imgId = 'pf_' + Math.random().toString(36).substring(2, 11);
    const ext = outputFormat === 'image/png' ? 'png' : 'jpg';
    const originalName = imageFile.name || 'document.' + ext;
    
    // Generates Portuguese Date String for file names, e.g. "29 de mai. de 2026"
    const getPortugueseDateString = () => {
      const date = new Date();
      const day = date.getDate();
      const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} de ${month} de ${year}`;
    };
    
    const processedName = `pixelflow ${getPortugueseDateString()}.${ext}`;

    // Load active Sharp instance
    let pipeline = sharp(buffer);

    // Dynamic scale to restrict resolution within maximum display size limits
    const meta = await pipeline.metadata();
    let width = meta.width || 800;
    let height = meta.height || 600;
    const MAX_RES = 2400;

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

    // 5. Film grain texturization and pixel structure micro-alterations
    if (pixelJitter || grainApplied || antiAiPerturbation) {
      const { data: rawPixels, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
      const channels = info.channels;
      
      // Performance optimization: pre-allocate noise tables to avoid millions of Math.random() calls.
      const noiseTableSize = 8000;
      const noiseTable = new Float32Array(noiseTableSize);
      const jitterTable = new Float32Array(noiseTableSize);
      const antiAiTable = new Float32Array(noiseTableSize);
      const scalar = grainIntensity * 0.15;
      
      for (let j = 0; j < noiseTableSize; j++) {
        noiseTable[j] = grainApplied ? (Math.random() - 0.5) * scalar * 8 : 0;
        jitterTable[j] = pixelJitter ? (Math.random() - 0.5) * 1.6 : 0;
        // Injeta micro pontos invisíveis de frequência (subtrair e somar valores minúsculos)
        antiAiTable[j] = antiAiPerturbation ? (j % 2 === 0 ? 1 : -1) * (1 + (j % 3)) : 0;
      }
      
      let tableIndex = 0;
      const len = rawPixels.length;
      for (let i = 0; i < len; i += channels) {
        const noise = noiseTable[tableIndex];
        const subJitter = jitterTable[tableIndex];
        const antiAi = antiAiTable[tableIndex];

        rawPixels[i] = Math.min(255, Math.max(0, rawPixels[i] + noise + subJitter + antiAi));
        if (channels >= 3) {
          rawPixels[i+1] = Math.min(255, Math.max(0, rawPixels[i+1] + noise - subJitter - antiAi));
          rawPixels[i+2] = Math.min(255, Math.max(0, rawPixels[i+2] + noise + subJitter + antiAi));
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

    // Compress & build according to output format choice
    // Web Standards metadata is cleaned / EXIF is trimmed naturally by not copying source headers
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

    // 6. Double storage layer: attempt Firebase Storage first with graceful local uploads directory fallback
    try {
      const storagePath = `processed_images/${userId}/${imgId}-${processedName}`;
      const storageRef = ref(storage, storagePath);
      
      const snapshot = await uploadBytes(storageRef, processedBuffer, {
        contentType: outputFormat
      });
      downloadUrl = await getDownloadURL(snapshot.ref);
    } catch (storageError) {
      console.warn("Firebase Storage fallback applied. Storing base64 encoded data url fallback for serverless safety.", storageError);
      
      // Complete backup fallback avoiding disk writes:
      // Base64 encoded Data URL functions perfectly on all systems and serverless environments.
      downloadUrl = `data:${outputFormat};base64,${processedBuffer.toString('base64')}`;
    }

    // 7. Sync transactional logs and account balances to Firestore
    if (userId && userId !== 'anonymous' && db) {
      try {
        const userRef = doc(db, 'users', userId);
        const imgRef = doc(db, 'processed_images', imgId);
        const logId = 'log_' + Math.random().toString(36).substring(2, 11);
        const logRef = doc(db, 'usage_logs', logId);

        // Account balance credit change calculations (deduct 1 if not admin)
        const creditsDeducted = isAdmin ? 0 : 1;

        await setDoc(imgRef, {
          id: imgId,
          userId,
          originalName,
          processedName,
          mimeType: outputFormat,
          originalSize: imageFile.size,
          processedSize,
          exifStripped,
          pixelJitter,
          grainApplied,
          antiAiPerturbation,
          compressionRate,
          downloadUrl,
          createdAt: serverTimestamp()
        });

        // Update the user's credits and total imagesProcessed count
        await updateDoc(userRef, {
          credits: isAdmin ? increment(0) : increment(-1),
          imagesProcessed: increment(1),
          updatedAt: serverTimestamp()
        });

        await setDoc(logRef, {
          id: logId,
          userId,
          action: `Otimizou foto: ${originalName} para canais de altíssimo engajamento visual.`,
          creditsDeducted,
          createdAt: serverTimestamp()
        });
      } catch (dbError) {
        console.error("Firestore database accounting exception caught:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      id: imgId,
      originalSize: imageFile.size,
      processedSize,
      downloadUrl,
      fileName: processedName,
      compressionRatio: Math.round(((imageFile.size - processedSize) / imageFile.size) * 100)
    });

  } catch (error: any) {
    console.error("Error purifying image in Next.js Route Handler:", error);
    return NextResponse.json(
      { error: error?.message || 'Falha crítica no processamento da imagem do servidor.' },
      { status: 500 }
    );
  }
}
