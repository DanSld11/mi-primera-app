import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/src/constants/colors';
import { StatusBar } from 'expo-status-bar';

const { height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Hero Section with Background Image */}
      <View style={styles.heroSection}>
        <ImageBackground 
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTTw93CAbucRCCTJigUyQhLNMxCW2Ar5fKFmlJpwO6xdYDbbsonG9QOgEdAaYS2FhSC368aRS9U7aOFWwKfUvbD19h1YPyAwc8fmc6I8nxJ4EuuvMLApdlKoSXPspit2crA7M5Qhsttg6A9UG0ylRtNqSTexWMrDm-vMjwGDfAWn6uq9F6BhRCjHIoyRUDmptqFU6nr5jZ7iIruEKFwVno1ckd2IsZGQ4tc7CMnyfxqbj-cmQSCsmMQrUD3hHNXYb_4qtp90Qc7Hc' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Gradient Overlay Mock */}
          <View style={styles.gradientMock1} />
          <View style={styles.gradientMock2} />
          <View style={styles.gradientMock3} />

          {/* Brand Logo Floating */}
          <SafeAreaView>
            <View style={styles.brandContainer}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="directions-bike" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.brandText}>San Borja en Bici</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      {/* Content Canvas */}
      <View style={styles.contentSection}>
        
        {/* Value Proposition Card */}
        <View style={styles.glassCard}>
          <Text style={styles.titleText}>
            Mueve la ciudad con energía limpia.
          </Text>
          <Text style={styles.subtitleText}>
            Únete a la red de transporte más eficiente y ecológica de San Borja. Accede a cientos de bicicletas y transforma tu rutina diaria.
          </Text>

          {/* Features List (Bento-lite) */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <MaterialIcons name="favorite" size={20} color={Colors.secondary} style={styles.featureIcon} />
              <Text style={styles.featureText}>Vida Saludable</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="nature-people" size={20} color={Colors.secondary} style={styles.featureIcon} />
              <Text style={styles.featureText}>Sostenibilidad</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons Container */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => router.push('/registro' as any)}
          >
            <Text style={styles.primaryButtonText}>Registrarse</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => router.push('/login' as any)}
          >
            <Text style={styles.secondaryButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Al continuar, aceptas nuestros <Text style={styles.termsLink}>Términos y Condiciones</Text>
          </Text>
        </View>
        
      </View>

      {/* Visual Accent Elements (Decorative) */}
      <View style={styles.accentCircle1} />
      <View style={styles.accentCircle2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    height: height * 0.55,
    width: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientMock1: {
    position: 'absolute',
    left: 0, right: 0, bottom: '20%', height: '15%',
    backgroundColor: 'rgba(248, 249, 255, 0.4)',
  },
  gradientMock2: {
    position: 'absolute',
    left: 0, right: 0, bottom: '10%', height: '10%',
    backgroundColor: 'rgba(248, 249, 255, 0.7)',
  },
  gradientMock3: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0, height: '10%',
    backgroundColor: Colors.background,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginLeft: 24,
    gap: 8,
  },
  iconContainer: {
    backgroundColor: Colors.primaryContainer,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -40,
    zIndex: 10,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
  },
  titleText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 12,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    lineHeight: 24,
    opacity: 0.9,
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  featureItem: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 16,
    borderColor: 'rgba(191, 201, 195, 0.3)',
    borderWidth: 1,
  },
  featureIcon: {
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
    letterSpacing: 0.5,
  },
  actionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 48,
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: Colors.primaryContainer,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(6, 78, 59, 0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Colors.primaryContainer,
    fontSize: 16,
    fontWeight: '700',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.outline,
    marginTop: 12,
  },
  termsLink: {
    color: Colors.primaryContainer,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  accentCircle1: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(178, 247, 70, 0.15)', // secondaryContainer
    borderRadius: 64,
    zIndex: -1,
  },
  accentCircle2: {
    position: 'absolute',
    top: '40%',
    left: -20,
    width: 96,
    height: 96,
    backgroundColor: 'rgba(6, 78, 59, 0.05)', // primaryContainer
    borderRadius: 48,
    zIndex: -1,
  },
});
