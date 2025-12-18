# Instrucciones para Windows PowerShell

## Paso 1: Limpiar dependencias
```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
```

## Paso 2: Instalar dependencias
```powershell
npm install
```

## Paso 3: Iniciar la app móvil
```powershell
npx expo start
```

## Paso 4: Abrir en tu dispositivo
- Escanea el QR con la app Expo Go (Android/iOS)
- O presiona 'w' para abrir en navegador web
- O presiona 'a' para Android emulator
- O presiona 'i' para iOS simulator

## Credenciales de prueba
- Email: demo@warrantywallet.com
- Password: password123

## Backend ya está corriendo en:
http://localhost:3000

---

## Si prefieres usar CMD en lugar de PowerShell:
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
npx expo start
```
