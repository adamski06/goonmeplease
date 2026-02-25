#!/bin/bash

echo "📥 Pullar senaste från GitHub..."
git pull origin main

echo "📦 Installerar dependencies..."
npm install

echo "🔒 Fixar säkerhetsproblem..."
npm audit fix

# Kolla om Capacitor redan är installerat
if [ ! -d "ios" ]; then
    echo "🆕 Första gången! Sätter upp Capacitor..."
    
    # Installera Capacitor
    npm install @capacitor/core @capacitor/cli @capacitor/ios
    
    # Initiera Capacitor (byt ut namn om du vill)
    npx cap init goonmeplease com.adam.goonmeplease --web-dir=dist
    
    # Lägg till iOS
    npx cap add ios
    
    echo "✅ Capacitor iOS tillagt!"
else
    echo "✅ iOS finns redan, skippar setup"
fi

echo "🏗️  Bygger projektet..."
npm run build

echo "📱 Synkar till iOS..."
npx cap sync

echo "🎉 Klart! Öppnar Xcode..."
npx cap open ios

