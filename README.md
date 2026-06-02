# PixelFlow AI ⚡
> **Slogan:** *“Transforme imagens IA em conteúdo mais natural para redes sociais.”*

PixelFlow AI é um software SaaS moderno e completo projetado para criadores, gestores de tráfego e designers de redes sociais. O sistema permite que fotos geradas artificialmente (Midjourney, Stable Diffusion, DALL-E) passem por um processo profissional de "des-artificialização". 

Através de algoritmos rodando em canvas de altíssima performance local, as mídias têm seus metadados de IA expurgados, os arranjos numéricos de pixels sutilmente modificados para desviar de crawlers de redes sociais, recebem textura cinematográfica de grão de prata fotográfica e compressão inteligente de alta fidelidade cromática.

---

## 🎨 Design & Estética
A interface foi projetada sob o conceito de **American Tech Startup Aesthetics**:
- **Paleta de Negócio:** Azul espacial profundo (`#070913` / `#0d1024`), contraste branco neve e detalhes dourados (`#eab308`).
- **Construção Clássica:** Design minimalista focado em tipografia refinada e espaçamento ideal para telas Retina/Desktop e Mobile.
- **Micro-animações:** Movimentos sutis guiados pelo motor de animações `motion` (extensão para React 19).

---

## 🚀 Funcionalidades Principais
1. **Painel do Usuário:** Workstation completa contendo drag-and-drop de arquivos para upload.
2. **Ghost EXIF Pruner:** Remove instantaneamente hashes invisíveis, prompts de geração e assinaturas digitais de softwares terceiros.
3. **Sub-Pixel Jitter:** Injeta modulações térmicas sub-pixeladas imperceptíveis ao olho humano que desestruturam detectores automáticos de imagens artificiais.
4. **Acabamento de Grão Analógico:** Adiciona textura cinematográfica analógica ajustável com densidade e opacidade 4K.
5. **Gateway de Checkout Stripe (Sandbox):** Fluxo simulado completo conectado com o Firestore para gerenciar assinaturas.
6. **Sistema de Créditos:** Regulação dinâmica de uso (limite de 5 imagens no plano Free, créditos automáticos Pro e Business).
7. **Dashboard Admin:** Painel analítico de uso de usuários, auditoria cronológica de logs de mutações de crédito e injeção de bônus administrativos.

---

## 🛠️ Stack Tecnológica
- **Workspace:** React 19 + TypeScript + Vite.
- **Visual:** Tailwind CSS v4 + Lucide Icons + Motion.
- **Autenticação:** Google Firebase Authentication (Popup flow seguro).
- **Banco de Dados:** Google Cloud Firestore (Modo Zero-Trust attribute-based access).
- **Armazenamento:** Firebase Storage (Regulamentado por regras customizadas).

---

## ⚙️ Configuração Local do Firebase
O projeto é integrado nativamente com o Firebase. O arquivo `/firebase-applet-config.json` inicializa a base de dados em desenvolvimento. Se for migrar para uma conta Firebase pessoal, configure os dados conforme a seção abaixo:

1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Crie um novo projeto com o nome **PixelFlow AI**.
3. Ative o **Authentication** e selecione o método de login **Google**.
4. Ative o **Cloud Firestore** no modo de produção.
5. Ative o **Cloud Storage** em produção.
6. Registre um aplicativo Web e substitua as credenciais no arquivo `firebase-applet-config.json` no diretório raiz:

```json
{
  "apiKey": "SUA_API_KEY",
  "authDomain": "SEU_APP.firebaseapp.com",
  "databaseURL": "https://SEU_APP.firebaseio.com",
  "projectId": "SEU_PROJETO_ID",
  "storageBucket": "SEU_APP.appspot.com",
  "messagingSenderId": "SEU_SENDER_ID",
  "appId": "SEU_APP_ID",
  "measurementId": "Sua_Id_Analytics",
  "firestoreDatabaseId": "(default)"
}
```

---

## 🔒 Regras de Segurança (Firestore & Storage)

### Firestore (`firestore.rules`)
Nossas regras implementam os 8 Pilares de Segurança sugeridos pelo protocolo do Firebase:
- Bloqueia leitura/escrita global por padrão.
- Usuários comuns apenas acessam, leem e editam seus próprios dados sensíveis (`userId == request.auth.uid`).
- Administradores autenticados ou o e-mail administrador centralizado (`santwomusic@gmail.com`) têm visibilidade de logs globais e adição de créditos.
- Validação estrita de cada propriedade de payload, tamanhos de string (`size() <= 128`), e mutações de data baseadas nos servidores temporais (`request.time`).

Para implantar manualmente via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### Storage (`storage.rules`)
Garante imunidade contra injeção de malware e sobrecarga de wallet de faturamento:
- Leituras públicas para que as mídias possam ser processadas em mídias sociais.
- Gravações restritas a usuários logados contendo arquivos sob o teto estrito de 10MB (`request.resource.size < 10 * 1024 * 1024`).

Para implantar:
```bash
firebase deploy --only storage:rules
```

---

## 📦 Arquitetura de Implantação em Produção (Vercel + Render) ⚡

Para garantir robustez e contornar os limites de execução de 10s das funções Serverless da Vercel (ideais para o frontend, mas insuficientes para processar e texturizar fotos com Sharp de até 20MB), o PixelFlow AI é dividido em:
1. **Frontend (Vercel):** Hospitante estático de altíssima velocidade sob CDN global.
2. **Backend (Render):** Servidor dedicado Node/Express que processa e purifica imagens de forma estável sem interrupção de timeout.

---

### 🌐 Deploy do Frontend (Vercel)

1. Conecte seu repositório Git no painel da [Vercel](https://vercel.com).
2. Adicione as seguintes Variáveis de Ambiente no painel da Vercel:
   - `NEXT_PUBLIC_API_URL`: O endpoint HTTPS do seu backend rodando no Render (ex: `https://pixelflow-backend.onrender.com`).
   - `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`: `APP_USR-b3b34832-d8ea-4493-b87b-94514c669de6`
   - `VITE_FIREBASE_API_KEY`: Credencial do seu Firebase Web App.
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. Defina os comandos padrão (Build Command: `next build`).
4. Clique em **Deploy**.
5. **Atenção:** Copie a URL gerada pela Vercel e adicione-a como domínio autorizado no Console do Firebase (**Authentication -> Settings -> Authorized Domains**).

---

### 🚀 Deploy do Backend (Render)

1. Crie um novo serviço web no painel do [Render](https://render.com) (Web Service).
2. Conecte o mesmo repositório Git.
3. Configure as propriedades do serviço:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start:backend`
4. Na aba **Environment Variables**, adicione as seguintes chaves de segurança:
   - `FRONTEND_URL`: Endereço HTTPS público da sua Vercel (essencial para regulação segura de políticas CORS de produção).
   - `MERCADOPAGO_ACCESS_TOKEN`: `APP_USR-6849257751380021-052922-abd88e74338a975c52c9e547ae7ac7d3-3436965718`
   - `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`: `APP_USR-b3b34832-d8ea-4493-b87b-94514c669de6`
   - `VITE_FIREBASE_API_KEY` (Sincronização de usuário e balanceamento seguro do Firestore)
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Clique em **Create Web Service**. O Render iniciará o servidor Node/Express em ambiente sandbox isolado e escalável!

---

## ⚙️ Execução Local de Desenvolvimento

Instale as dependências e inicie o motor de desenvolvimento local rodando na porta `3000`:

```bash
# 1. Instalar dependências
npm install

# 2. Abrir ambiente de desenvolvimento
npm run dev
```

Abra o endereço [http://localhost:3000](http://localhost:3000) no seu navegador habitual para testar.
Para gerar a build estática profissional de produção:
```bash
npm run build
```
