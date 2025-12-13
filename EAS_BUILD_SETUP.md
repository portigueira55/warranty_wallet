# Configuración de EAS Build para Warranty Wallet

## ⚠️ Problema Actual

El build de EAS está fallando porque el proyecto necesita ser autenticado y vinculado con una cuenta de Expo.

## 🔧 Solución - Configurar EAS Build

### Opción 1: Configuración Local (Recomendada)

1. **Instalar EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Iniciar sesión en Expo**:
   ```bash
   eas login
   ```

   Si no tienes cuenta, créala en: https://expo.dev/signup

3. **Configurar el proyecto**:
   ```bash
   eas build:configure
   ```

   Esto actualizará automáticamente el `projectId` en `app.json` con un ID válido de Expo.

4. **Hacer el primer build**:
   ```bash
   eas build --platform android --profile apk
   ```

5. **Obtener el token para CI/CD** (opcional, para GitHub Actions):
   ```bash
   eas whoami
   # Luego en: https://expo.dev/accounts/[your-username]/settings/access-tokens
   # Crear un nuevo token
   ```

6. **Configurar el token en GitHub**:
   - Ve a: Settings → Secrets and variables → Actions
   - Añade un nuevo secret: `EXPO_TOKEN` con el valor del token

### Opción 2: Compilación Local (Sin EAS)

Si prefieres no usar EAS Build, puedes compilar localmente:

1. **Asegúrate de tener el prebuild hecho**:
   ```bash
   npx expo prebuild --platform android --clean
   ```

2. **Compilar con Gradle**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. **El APK estará en**:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### Opción 3: Usar Expo Go (Para desarrollo)

Para pruebas rápidas sin compilar:

```bash
npm start
```

Luego escanea el QR con la app Expo Go desde tu móvil.

## 📝 Configuración Actual

El proyecto ya tiene:
- ✅ `eas.json` configurado con perfiles de build
- ✅ `app.json` con configuración básica
- ✅ UUID generado temporalmente (necesita ser reemplazado por uno de Expo)
- ✅ Assets PNG válidos para los iconos

## 🔑 Variables de Entorno para CI/CD

Si usas GitHub Actions, necesitas estos secrets:

- `EXPO_TOKEN`: Token de acceso de Expo (obtenerlo en expo.dev)

## 🚀 Comandos Útiles

```bash
# Verificar configuración
eas whoami

# Build de desarrollo (APK)
eas build --platform android --profile apk

# Build de producción (AAB para Play Store)
eas build --platform android --profile production

# Ver builds anteriores
eas build:list

# Descargar último build
eas build:download
```

## ⚙️ Perfiles de Build Configurados

- **development**: Build con cliente de desarrollo
- **preview**: Build APK para pruebas internas
- **apk**: Build APK optimizado
- **production**: Build AAB para Google Play Store

## 📱 Testing

Después del build:

1. Descarga el APK desde EAS
2. Instala en tu dispositivo Android
3. Prueba todas las funcionalidades:
   - Login
   - Captura de tickets con OCR
   - Añadir productos manualmente
   - Visualizar garantías
   - Cargar datos de ejemplo

## 🐛 Troubleshooting

### Error: "Invalid UUID appId"
→ Ejecuta `eas build:configure` para obtener un projectId válido

### Error: "GraphQL request failed"
→ Verifica que estás logueado: `eas whoami`

### Error: "cli.appVersionSource is not set"
→ Ya está configurado en `eas.json` con valor "remote"

### Build falla en CI/CD
→ Verifica que el secret `EXPO_TOKEN` esté configurado en GitHub

## 📚 Recursos

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Build GitHub Actions](https://docs.expo.dev/build/building-on-ci/)
- [Expo Account Settings](https://expo.dev/accounts)
