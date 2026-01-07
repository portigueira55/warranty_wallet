import { useState } from 'react';
import { Moon, Sun, Bell, Globe, Shield, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export function Settings() {
  const { theme, language, notifications, setTheme, setLanguage, setNotifications } =
    useSettingsStore();
  const { user } = useAuthStore();
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const handleNotificationToggle = async () => {
    if (!('Notification' in window)) {
      toast.error('Tu navegador no soporta notificaciones');
      return;
    }

    if (Notification.permission === 'denied') {
      toast.error('Has bloqueado las notificaciones. Actívalas en la configuración del navegador.');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        setNotifications(true);
        toast.success('Notificaciones activadas');
        new Notification('Warranty Wallet', {
          body: '¡Notificaciones activadas correctamente!',
          icon: '/pwa-192x192.png',
        });
      }
    } else {
      setNotifications(!notifications);
      toast.success(notifications ? 'Notificaciones desactivadas' : 'Notificaciones activadas');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    toast.success(`Tema cambiado a ${newTheme === 'light' ? 'claro' : newTheme === 'dark' ? 'oscuro' : 'sistema'}`);
  };

  const handleLanguageChange = (newLang: 'es' | 'en') => {
    setLanguage(newLang);
    toast.success(`Idioma cambiado a ${newLang === 'es' ? 'Español' : 'English'}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Personaliza tu experiencia en Warranty Wallet
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Información de Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
            <p className="mt-1 text-lg font-semibold">{user?.email}</p>
          </div>
          {user?.name && (
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre</label>
              <p className="mt-1 text-lg font-semibold">{user.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tema
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`rounded-lg border-2 p-3 transition-all ${
                    theme === 'light'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <Sun className="mx-auto h-6 w-6" />
                  <p className="mt-2 text-sm font-medium">Claro</p>
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`rounded-lg border-2 p-3 transition-all ${
                    theme === 'dark'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <Moon className="mx-auto h-6 w-6" />
                  <p className="mt-2 text-sm font-medium">Oscuro</p>
                </button>

                <button
                  onClick={() => handleThemeChange('system')}
                  className={`rounded-lg border-2 p-3 transition-all ${
                    theme === 'system'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <div className="mx-auto flex h-6 w-6 items-center justify-center">
                    <Sun className="h-4 w-4" />
                    <Moon className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-sm font-medium">Sistema</p>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Idioma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleLanguageChange('es')}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                language === 'es'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
              }`}
            >
              <p className="text-2xl">🇪🇸</p>
              <p className="mt-2 font-medium">Español</p>
            </button>

            <button
              onClick={() => handleLanguageChange('en')}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                language === 'en'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
              }`}
            >
              <p className="text-2xl">🇬🇧</p>
              <p className="mt-2 font-medium">English</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones Push
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                Recordatorios de garantías
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Recibe notificaciones cuando una garantía esté por vencer
              </p>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications && notificationPermission === 'granted'
                  ? 'bg-primary-600'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications && notificationPermission === 'granted'
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {notificationPermission === 'denied' && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-950">
              <p className="text-sm text-red-800 dark:text-red-200">
                Has bloqueado las notificaciones. Para activarlas, ve a la configuración de tu
                navegador.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Información de la App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Versión</span>
            <span className="font-medium">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tipo</span>
            <span className="font-medium">Progressive Web App (PWA)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Modo Offline</span>
            <span className="font-medium text-green-600">✓ Habilitado</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
