# Warranty Wallet

Aplicación móvil para gestionar garantías de productos. Sube fotos de tus tickets de compra y mantén un registro de todas tus garantías.

## Características

- **Login seguro** con datos cifrados (AES-256)
- **Multi-tenant** con aislamiento de datos por usuario
- **Captura de tickets** mediante cámara o galería
- **OCR** para extracción automática de datos
- **Temporizador de garantía** de 3 años con visualización en tiempo real
- **Dashboard** con estadísticas de garantías activas, por vencer y expiradas
- **Diseño responsive** para móviles y tablets

## Credenciales Demo

- **Usuario:** admin
- **Contraseña:** 1234

## Tecnologías

- React Native / Expo
- TypeScript
- Cifrado AES-256 (CryptoJS)
- AsyncStorage para persistencia local
- React Navigation

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

## Compilar APK

### Con EAS Build (recomendado)
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile apk
```

### Compilación local
```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

El APK se generará en `android/app/build/outputs/apk/release/`

## GitHub Actions con EAS Build

El proyecto incluye un workflow de GitHub Actions que inicia automáticamente una compilación con EAS Build en cada push a las ramas `main`, `master` o `claude/**`.

**Características del workflow:**
- ✅ Usa EAS Build (infraestructura en la nube de Expo)
- ✅ Se ejecuta automáticamente en cada push
- ✅ Compilación confiable y optimizada
- ✅ Tiempo estimado: 10-15 minutos

**Cómo descargar la APK:**
1. Ve a **https://expo.dev** e inicia sesión
2. Selecciona tu proyecto "warranty-wallet"
3. Ve a la sección "Builds"
4. Descarga el APK cuando el build esté completo (verás status verde ✅)

**Alternativa - Build manual con EAS CLI:**
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile apk
```

## Estructura del Proyecto

```
warranty_wallet/
├── App.tsx                 # Punto de entrada
├── src/
│   ├── components/         # Componentes reutilizables
│   │   └── WarrantyCard.tsx
│   ├── context/            # Contextos de React
│   │   └── AuthContext.tsx
│   ├── navigation/         # Configuración de navegación
│   │   └── AppNavigator.tsx
│   ├── screens/            # Pantallas de la app
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── AddTicketScreen.tsx
│   │   └── TicketDetailScreen.tsx
│   ├── services/           # Servicios y lógica de negocio
│   │   ├── auth.ts
│   │   ├── ocr.ts
│   │   └── storage.ts
│   ├── types/              # Definiciones de TypeScript
│   │   └── index.ts
│   └── utils/              # Utilidades
│       └── encryption.ts
├── assets/                 # Imágenes y recursos
└── .github/workflows/      # CI/CD
    └── build-android.yml
```

## Seguridad

- Contraseñas hasheadas con SHA-256 + salt
- Datos del usuario cifrados con AES-256
- Cada usuario tiene su propio tenant ID para aislamiento de datos
- Claves derivadas por tenant usando PBKDF2

## Licencia

MIT
