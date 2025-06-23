import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const App = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [scannedImage, setScannedImage] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showSynthesis, setShowSynthesis] = useState(false);
  const [synthesis, setSynthesis] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const resetToHome = () => {
    setShowFeatures(false);
    setShowOptions(false);
    setScannedImage(null);
    setExtractedText('');
    setSynthesis('');
    setShowSynthesis(false);
  };

  const handleScanPress = () => {
    if (Platform.OS === 'web') {
      setShowOptions(true);
    } else {
      Alert.alert(
        'Scanner',
        'Choisissez une option',
        [
          {
            text: 'Prendre une photo',
            onPress: takePhoto,
          },
          {
            text: 'Importer une photo',
            onPress: pickImage,
          },
          {
            text: 'Importer un PDF',
            onPress: pickDocument,
          },
          {
            text: 'Annuler',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const takePhoto = async () => {
    setShowOptions(false);
    
    if (Platform.OS === 'web') {
      console.log('Caméra non disponible sur le web');
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission requise', 'Permission d\'accès à la caméra nécessaire');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setScannedImage(result.assets[0].uri);
      extractTextFromImage(result.assets[0].uri);
      setShowFeatures(true);
      console.log('Photo prise:', result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    setShowOptions(false);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setScannedImage(result.assets[0].uri);
      extractTextFromImage(result.assets[0].uri);
      setShowFeatures(true);
      console.log('Image sélectionnée:', result.assets[0].uri);
    }
  };

  const pickDocument = async () => {
    setShowOptions(false);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setScannedImage(result.assets[0].uri);
        extractTextFromPDF(result.assets[0]);
        setShowFeatures(true);
        console.log('PDF sélectionné:', result.assets[0].name);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du PDF:', error);
    }
  };

  const extractTextFromImage = async (imageUri) => {
    // Simulation d'extraction de texte à partir d'une image
    // En réalité, on utiliserait une API OCR comme Google Vision API ou Tesseract
    const mockText = `
    Chapitre 1: Introduction aux bases de données
    
    Une base de données est un ensemble organisé d'informations structurées, généralement stockées électroniquement dans un système informatique. 
    
    Les bases de données relationnelles utilisent des tables pour organiser les données. Chaque table contient des lignes (enregistrements) et des colonnes (champs).
    
    Concepts importants:
    - Clé primaire: identifie de manière unique chaque enregistrement
    - Clé étrangère: établit des relations entre les tables
    - Normalisation: processus d'organisation des données pour réduire la redondance
    
    Les systèmes de gestion de base de données (SGBD) comme MySQL, PostgreSQL, et SQLite permettent de créer, modifier et interroger les bases de données.
    `;
    
    setExtractedText(mockText.trim());
  };

  const extractTextFromPDF = async (pdfFile) => {
    // Simulation d'extraction de texte à partir d'un PDF
    // En réalité, on utiliserait une librairie comme pdf-parse ou pdfjs
    const mockText = `
    Cours de Mathématiques - Analyse Fonctionnelle
    
    1. Espaces vectoriels normés
    Un espace vectoriel normé est un espace vectoriel E muni d'une norme ||.||.
    
    2. Convergence
    Une suite (xn) converge vers x si lim ||xn - x|| = 0
    
    3. Continuité
    Une application f: E → F est continue en a si pour tout ε > 0, il existe δ > 0 tel que ||x - a|| < δ implique ||f(x) - f(a)|| < ε
    
    4. Théorèmes fondamentaux
    - Théorème de Banach-Steinhaus
    - Théorème de l'application ouverte
    - Théorème du graphe fermé
    
    Applications: optimisation, équations différentielles, traitement du signal
    `;
    
    setExtractedText(mockText.trim());
  };

  const generateSynthesis = async () => {
    if (!extractedText) {
      Alert.alert('Erreur', 'Aucun texte extrait du document');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Appel à l'API OpenAI pour générer une synthèse
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_OPENAI_API_KEY', // À remplacer par votre clé API
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant qui crée des synthèses de cours académiques. Génère une synthèse structurée avec des emojis, des points clés, et des sections claires.'
            },
            {
              role: 'user',
              content: `Crée une synthèse structurée de ce cours:\n\n${extractedText}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur API OpenAI');
      }

      const data = await response.json();
      const generatedSynthesis = data.choices[0].message.content;
      
      setSynthesis(generatedSynthesis);
      setShowSynthesis(true);
      
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      
      // Synthèse de fallback basée sur le texte extrait
      const fallbackSynthesis = generateFallbackSynthesis(extractedText);
      setSynthesis(fallbackSynthesis);
      setShowSynthesis(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackSynthesis = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const title = lines[0] || 'Document analysé';
    
    return `📚 SYNTHÈSE: ${title}

🎯 Points principaux identifiés:
${lines.slice(1, 4).map(line => `• ${line.trim()}`).join('\n')}

📝 Résumé:
${text.substring(0, 300)}...

🔑 Concepts clés:
• Éléments théoriques importants
• Applications pratiques
• Méthodologies présentées

💡 À retenir:
Cette synthèse est générée automatiquement à partir du contenu scanné. Pour une analyse plus approfondie, consultez le document original.`;
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>📚 StudyScan</Text>
            <Text style={styles.subtitle}>Transformez vos cours en synthèses et quiz intelligents</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badge}>✨ Propulsé par l'IA</Text>
            </View>
          </View>
          
          {showFeatures ? (
            <TouchableOpacity style={styles.homeButton} onPress={resetToHome}>
              <Text style={styles.homeIconLarge}>🏠</Text>
              <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
              <Text style={styles.homeButtonSubtext}>Scanner un nouveau document</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
              <Text style={styles.scanIconLarge}>📖</Text>
              <Text style={styles.scanButtonText}>Scanner un document</Text>
              <Text style={styles.scanButtonSubtext}>Photo • PDF • Document</Text>
            </TouchableOpacity>
          )}
          
          {showOptions && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
                <Text style={styles.iconText}>📷</Text>
                <Text style={styles.optionText}>Prendre une photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
                <Text style={styles.iconText}>🖼️</Text>
                <Text style={styles.optionText}>Importer une photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={pickDocument}>
                <Text style={styles.iconText}>📄</Text>
                <Text style={styles.optionText}>Importer un PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.optionButton, styles.cancelButton]} 
                onPress={() => setShowOptions(false)}
              >
                <Text style={styles.iconText}>❌</Text>
                <Text style={[styles.optionText, styles.cancelText]}>Annuler</Text>
              </TouchableOpacity>
            </View>
          )}

          {showFeatures && (
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>📄 Document scanné !</Text>
              <Text style={styles.featuresSubtitle}>Que souhaitez-vous faire ?</Text>
              
              <TouchableOpacity 
                style={[styles.featureButton, isGenerating && styles.featureButtonDisabled]} 
                onPress={generateSynthesis}
                disabled={isGenerating}
              >
                <Text style={styles.featureIcon}>{isGenerating ? '⏳' : '📝'}</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>
                    {isGenerating ? 'Génération en cours...' : 'Créer une synthèse'}
                  </Text>
                  <Text style={styles.featureDescription}>
                    {isGenerating ? 'IA en train d\'analyser le document' : 'Résumé automatique du contenu'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.featureButton} onPress={() => console.log('Quiz')}>
                <Text style={styles.featureIcon}>🧠</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Générer un quiz</Text>
                  <Text style={styles.featureDescription}>Questions pour tester vos connaissances</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.featureButton} onPress={() => console.log('Fiches')}>
                <Text style={styles.featureIcon}>🗂️</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Fiches de révision</Text>
                  <Text style={styles.featureDescription}>Points clés à retenir</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.featureButton, styles.backFeatureButton]} 
                onPress={resetToHome}
              >
                <Text style={styles.featureIcon}>🔄</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitle, styles.backFeatureText]}>Scanner un nouveau document</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Modal de synthèse */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showSynthesis}
          onRequestClose={() => setShowSynthesis(false)}
        >
          <SafeAreaView style={styles.synthesisContainer}>
            <View style={styles.synthesisHeader}>
              <Text style={styles.synthesisHeaderTitle}>📝 Synthèse générée</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSynthesis(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.synthesisScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.synthesisContent}>
                <Text style={styles.synthesisText}>{synthesis}</Text>
              </View>
            </ScrollView>
            
            <View style={styles.synthesisFooter}>
              <TouchableOpacity
                style={styles.backToDocButton}
                onPress={() => setShowSynthesis(false)}
              >
                <Text style={styles.backToDocButtonText}>Retour au document</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '400',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badge: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 280,
    borderWidth: 2,
    borderColor: 'rgba(30, 58, 138, 0.1)',
  },
  scanIconLarge: {
    fontSize: 48,
    marginBottom: 8,
  },
  scanButtonText: {
    color: '#1e3a8a',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  scanButtonSubtext: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  homeButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 280,
    borderWidth: 2,
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  homeIconLarge: {
    fontSize: 48,
    marginBottom: 8,
  },
  homeButtonText: {
    color: '#1e3a8a',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  homeButtonSubtext: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
  },
  optionsContainer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.1)',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginTop: 10,
  },
  optionText: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    flex: 1,
  },
  cancelText: {
    color: 'white',
  },
  iconText: {
    fontSize: 24,
    width: 32,
  },
  featuresContainer: {
    marginTop: 25,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
    textAlign: 'center',
  },
  featuresSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '400',
  },
  featureButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.08)',
  },
  backFeatureButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 18,
    width: 36,
    textAlign: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  backFeatureText: {
    color: 'white',
  },
  featureDescription: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '400',
    lineHeight: 18,
  },
  featureButtonDisabled: {
    opacity: 0.6,
  },
  synthesisContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  synthesisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 24,
    paddingVertical: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  synthesisHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  synthesisScrollView: {
    flex: 1,
  },
  synthesisContent: {
    padding: 20,
  },
  synthesisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  synthesisFooter: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backToDocButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backToDocButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;