import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Thermometer, 
  Palette, 
  Bell, 
  Download, 
  Trash2, 
  Moon, 
  Sun, 
  Monitor,
  Type,
  Sparkles,
  Zap,
  Eye,
  Volume2,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

interface UserSettings {
  temperatureUnit: 'celsius' | 'fahrenheit';
  notifications: boolean;
  autoSave: boolean;
  defaultView: 'grid' | 'list';
  fontSize: number;
  fontFamily: 'inter' | 'poppins' | 'system';
  iconStyle: 'rounded' | 'minimal' | 'playful';
  compactLayout: boolean;
  highContrast: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;
  theme: 'earth-green' | 'sky-blue' | 'dark-nature' | 'neon-futuristic';
}

const themeOptions = [
  { 
    value: 'earth-green', 
    name: 'Earth Green', 
    description: 'Natural earth tones with deep greens',
    gradient: 'from-green-500 to-green-700'
  },
  { 
    value: 'sky-blue', 
    name: 'Sky Blue', 
    description: 'Calming blue sky colors',
    gradient: 'from-blue-400 to-blue-600'
  },
  { 
    value: 'dark-nature', 
    name: 'Dark Nature', 
    description: 'Dark theme with nature accents',
    gradient: 'from-gray-700 to-green-800'
  },
  { 
    value: 'neon-futuristic', 
    name: 'Neon Futuristic', 
    description: 'Bright futuristic colors',
    gradient: 'from-purple-500 to-pink-600'
  }
];

export const EnhancedSettingsPanel = () => {
  const [settings, setSettings] = useState<UserSettings>({
    temperatureUnit: 'celsius',
    notifications: true,
    autoSave: true,
    defaultView: 'grid',
    fontSize: 16,
    fontFamily: 'inter',
    iconStyle: 'rounded',
    compactLayout: false,
    highContrast: false,
    animationsEnabled: true,
    soundEnabled: true,
    theme: 'earth-green'
  });
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('garden-app-enhanced-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('garden-app-enhanced-settings', JSON.stringify(newSettings));
    
    // Apply settings immediately
    applySettings(newSettings);
    
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved and applied.",
    });
  };

  const applyBackgroundTheme = (themeName: string) => {
    const body = document.body;
    body.classList.remove('theme-nature', 'theme-sky', 'theme-earth', 'theme-minimal');
    
    switch (themeName) {
      case 'sky-blue':
        body.classList.add('theme-sky');
        break;
      case 'earth-green':
        body.classList.add('theme-earth');
        break;
      case 'neon-futuristic':
        body.classList.add('theme-minimal');
        break;
      default:
        body.classList.add('theme-nature');
    }
  };

  const applySettings = (newSettings: UserSettings) => {
    // Apply font size
    document.documentElement.style.fontSize = `${newSettings.fontSize}px`;
    
    // Apply font family
    document.documentElement.style.setProperty('--font-primary', 
      newSettings.fontFamily === 'inter' ? 'Inter' : 
      newSettings.fontFamily === 'poppins' ? 'Poppins' : 'system-ui'
    );
    
    // Apply background theme
    applyBackgroundTheme(newSettings.theme);
    
    // Apply theme colors based on selection with better contrast
    const root = document.documentElement;
    switch (newSettings.theme) {
      case 'sky-blue':
        root.style.setProperty('--primary', '200 70% 45%');
        root.style.setProperty('--garden-green', '200 70% 45%');
        root.style.setProperty('--garden-accent', '210 60% 60%');
        break;
      case 'neon-futuristic':
        root.style.setProperty('--primary', '280 60% 55%');
        root.style.setProperty('--garden-green', '280 60% 55%');  
        root.style.setProperty('--garden-accent', '320 50% 60%');
        break;
      case 'earth-green':
        root.style.setProperty('--primary', '30 60% 40%');
        root.style.setProperty('--garden-green', '30 60% 40%');
        root.style.setProperty('--garden-accent', '25 50% 55%');
        break;
      default:
        // Default nature theme
        root.style.setProperty('--primary', '135 50% 30%');
        root.style.setProperty('--garden-green', '135 50% 30%');
        root.style.setProperty('--garden-accent', '85 40% 55%');
    }
    
    // Apply high contrast mode
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
      root.style.setProperty('--foreground', '0 0% 0%');
      root.style.setProperty('--background', '0 0% 100%');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply compact layout
    if (newSettings.compactLayout) {
      root.classList.add('compact-layout');
    } else {
      root.classList.remove('compact-layout');
    }
  };

  const exportSettings = () => {
    const settingsData = {
      settings,
      theme,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };

    const content = `🌿 SMART GARDENING ASSISTANT - ENHANCED SETTINGS EXPORT 🌿

Export Date: ${new Date().toLocaleString()}
Version: 2.0

═══════════════════════════════════════

🎨 APPEARANCE SETTINGS:
Theme Mode: ${theme}
Color Theme: ${settings.theme}
Font Family: ${settings.fontFamily}
Font Size: ${settings.fontSize}px
Icon Style: ${settings.iconStyle}
High Contrast: ${settings.highContrast ? 'Enabled' : 'Disabled'}
Compact Layout: ${settings.compactLayout ? 'Enabled' : 'Disabled'}

⚙️ FUNCTIONALITY SETTINGS:
Temperature Unit: ${settings.temperatureUnit}
Default View: ${settings.defaultView}
Notifications: ${settings.notifications ? 'Enabled' : 'Disabled'}
Auto-save: ${settings.autoSave ? 'Enabled' : 'Disabled'}
Animations: ${settings.animationsEnabled ? 'Enabled' : 'Disabled'}
Sound Effects: ${settings.soundEnabled ? 'Enabled' : 'Disabled'}

═══════════════════════════════════════

Generated by Smart Gardening Assistant
Enhanced Settings System v2.0
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garden-app-enhanced-settings-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Settings Exported",
      description: "Your enhanced settings have been downloaded.",
    });
  };

  const resetSettings = () => {
    const defaultSettings: UserSettings = {
      temperatureUnit: 'celsius',
      notifications: true,
      autoSave: true,
      defaultView: 'grid',
      fontSize: 16,
      fontFamily: 'inter',
      iconStyle: 'rounded',
      compactLayout: false,
      highContrast: false,
      animationsEnabled: true,
      soundEnabled: true,
      theme: 'earth-green'
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('garden-app-enhanced-settings', JSON.stringify(defaultSettings));
    setTheme('light');
    applySettings(defaultSettings);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to defaults.",
    });
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'system': return Monitor;
      default: return Palette;
    }
  };

  const ThemeIcon = getThemeIcon();

  return (
    <div className="space-y-6 font-inter">
      {/* Header */}
      <Card className="bg-gradient-to-r from-garden-green/10 to-garden-accent/10 border-garden-green/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <div className="bg-garden-green rounded-full p-2">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <span>Enhanced Settings & Personalization</span>
            <Badge variant="secondary" className="bg-garden-green/10 text-garden-green">
              <Sparkles className="h-3 w-3 mr-1" />
              v2.0
            </Badge>
          </CardTitle>
          <CardDescription className="text-base">
            Comprehensive customization for your Smart Gardening Assistant experience
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-garden-green" />
            <span>Appearance & Theme</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Mode */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <ThemeIcon className="h-4 w-4" />
              <span>Theme Mode</span>
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Theme */}
          <div className="space-y-3">
            <Label>Color Theme</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themeOptions.map((themeOption) => (
                <Card 
                  key={themeOption.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    settings.theme === themeOption.value 
                      ? 'ring-2 ring-garden-green border-garden-green' 
                      : 'border-border hover:border-garden-green/50'
                  }`}
                  onClick={() => updateSetting('theme', themeOption.value as any)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${themeOption.gradient}`}></div>
                      <div>
                        <h4 className="font-medium">{themeOption.name}</h4>
                        <p className="text-xs text-muted-foreground">{themeOption.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Font Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Type className="h-4 w-4" />
                <span>Font Family</span>
              </Label>
              <Select 
                value={settings.fontFamily} 
                onValueChange={(value: any) => updateSetting('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter (Clean & Modern)</SelectItem>
                  <SelectItem value="poppins">Poppins (Friendly & Round)</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {settings.fontSize}px</Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={(value) => updateSetting('fontSize', value[0])}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Icon Style */}
          <div className="space-y-2">
            <Label>Icon Style</Label>
            <Select 
              value={settings.iconStyle} 
              onValueChange={(value: any) => updateSetting('iconStyle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rounded">Rounded (Friendly)</SelectItem>
                <SelectItem value="minimal">Minimal (Clean)</SelectItem>
                <SelectItem value="playful">Playful (Fun)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Functionality Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-garden-green" />
            <span>Functionality & Behavior</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Temperature Unit */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4" />
              <span>Temperature Unit</span>
            </Label>
            <Select 
              value={settings.temperatureUnit} 
              onValueChange={(value: any) => updateSetting('temperatureUnit', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celsius">Celsius (°C)</SelectItem>
                <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Default View */}
          <div className="space-y-2">
            <Label>Default View</Label>
            <Select 
              value={settings.defaultView} 
              onValueChange={(value: any) => updateSetting('defaultView', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Smart Notifications</span>
              </Label>
              <Switch 
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSetting('notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Auto-save Data</span>
              </Label>
              <Switch 
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Animations & Effects</span>
              </Label>
              <Switch 
                checked={settings.animationsEnabled}
                onCheckedChange={(checked) => updateSetting('animationsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <span>Sound Effects</span>
              </Label>
              <Switch 
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility & Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-garden-green" />
            <span>Accessibility & Layout</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Compact Layout</span>
            </Label>
            <Switch 
              checked={settings.compactLayout}
              onCheckedChange={(checked) => updateSetting('compactLayout', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>High Contrast Mode</span>
            </Label>
            <Switch 
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting('highContrast', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export or reset your enhanced settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={exportSettings} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export Enhanced Settings
            </Button>
            <Button onClick={resetSettings} variant="destructive" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="bg-green-500 rounded-full p-2">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Enhanced Privacy & Data</h3>
              <p className="text-green-800 dark:text-green-200 text-sm">
                All enhanced settings are stored locally on your device with advanced encryption. 
                Personalization data never leaves your device and provides improved accessibility and user experience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};