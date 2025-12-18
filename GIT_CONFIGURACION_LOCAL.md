# 🔧 Configurar Git en Local - Mario1988123

## Tu situación:
- Tu usuario GitHub: **Mario1988123**
- Repositorio: **portigueira55/warranty_wallet** (eres colaborador)
- Local: `C:\Users\mario\APP CON IA\warranty_wallet`

## ✅ Configuración correcta (Copia y pega en PowerShell):

### 1. Navega a tu proyecto
```powershell
cd "C:\Users\mario\APP CON IA\warranty_wallet"
```

### 2. Verifica tu configuración actual
```powershell
git config user.name
git config user.email
git remote -v
```

### 3. Configura tu identidad (si no está configurada)
```powershell
git config user.name "Mario1988123"
git config user.email "tu-email@gmail.com"  # Cambia por tu email de GitHub
```

### 4. Verifica el remote (debe apuntar a portigueira55/warranty_wallet)
```powershell
git remote -v
```

Debería mostrar:
```
origin  https://github.com/portigueira55/warranty_wallet.git (fetch)
origin  https://github.com/portigueira55/warranty_wallet.git (push)
```

### 5. Si el remote NO es correcto, cámbialo:
```powershell
git remote set-url origin https://github.com/portigueira55/warranty_wallet.git
```

---

## 🚀 Cómo hacer PUSH de tus cambios locales:

### Paso 1: Ver qué archivos cambiaron
```powershell
git status
```

### Paso 2: Añadir todos los cambios
```powershell
git add .
```

### Paso 3: Hacer commit
```powershell
git commit -m "Cambios desde local - login y profile"
```

### Paso 4: Hacer PUSH
```powershell
git push origin claude/fix-ticket-recognition-01WUBHBp5sE3MaHF9GQpGH5X
```

**Nota:** La primera vez te pedirá credenciales de GitHub:
- Usuario: `Mario1988123`
- Password: Usa un **Personal Access Token** (NO tu contraseña normal)

---

## 🔑 Si te pide contraseña: Crea un Personal Access Token

### En GitHub.com:
1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Dale un nombre: `warranty-wallet-local`
4. Marca el scope: `repo` (todos los permisos de repositorio)
5. Click en **"Generate token"**
6. **COPIA EL TOKEN** (solo se muestra una vez)
7. Usa ese token como contraseña en git

---

## 🔄 Cómo hacer PULL (traer cambios del repositorio):

```powershell
git pull origin claude/fix-ticket-recognition-01WUBHBp5sE3MaHF9GQpGH5X
```

---

## 📝 Resumen rápido:

### Para SUBIR tus cambios:
```powershell
git add .
git commit -m "Descripción de cambios"
git push origin claude/fix-ticket-recognition-01WUBHBp5sE3MaHF9GQpGH5X
```

### Para BAJAR cambios:
```powershell
git pull origin claude/fix-ticket-recognition-01WUBHBp5sE3MaHF9GQpGH5X
```

---

## ⚠️ Errores comunes:

**Error: "Permission denied"**
→ Necesitas crear un Personal Access Token (ver arriba)

**Error: "refusing to merge unrelated histories"**
```powershell
git pull origin claude/fix-ticket-recognition-01WUBHBp5sE3MaHF9GQpGH5X --allow-unrelated-histories
```

**Error: "Your branch is behind"**
→ Primero haz pull, luego push:
```powershell
git pull origin claude/fix-ticket-recognition-01WUBHBp5sE3MaHF9GQpGH5X
git push origin claude/fix-ticket-recognition-01WUBHBp5sE3MaHF9GQpGH5X
```
