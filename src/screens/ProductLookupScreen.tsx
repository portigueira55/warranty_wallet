import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductLookupService } from '../services/productLookupService';
import { ProductInfo } from '../types';

interface ProductLookupScreenProps {
  navigation: any;
}

export const ProductLookupScreen: React.FC<ProductLookupScreenProps> = ({
  navigation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'ean' | 'asin' | 'name'>('ean');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<ProductInfo | null>(null);
  const [searchResults, setSearchResults] = useState<ProductInfo[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Introduce un código o nombre para buscar');
      return;
    }

    setSearching(true);
    setSearchResult(null);
    setSearchResults([]);

    try {
      if (searchType === 'ean') {
        const result = await ProductLookupService.lookupByEAN(searchQuery);
        if (result) {
          setSearchResult(result);
        } else {
          Alert.alert('No encontrado', 'No se encontró ningún producto con ese código EAN');
        }
      } else if (searchType === 'asin') {
        const result = await ProductLookupService.lookupByASIN(searchQuery);
        if (result) {
          setSearchResult(result);
        } else {
          Alert.alert('No encontrado', 'No se encontró ningún producto con ese código ASIN');
        }
      } else {
        const results = await ProductLookupService.searchByName(searchQuery);
        if (results.length > 0) {
          setSearchResults(results);
        } else {
          Alert.alert('No encontrado', 'No se encontraron productos con ese nombre');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
    } finally {
      setSearching(false);
    }
  };

  const handleScanBarcode = async () => {
    Alert.alert(
      'Escanear código',
      'Esta función usará la cámara para escanear códigos de barras',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Escanear',
          onPress: async () => {
            // Simular escaneo
            setSearching(true);
            try {
              const scanResult = await ProductLookupService.scanBarcode('mock-image-uri');
              if (scanResult.value) {
                setSearchQuery(scanResult.value);
                setSearchType('ean');
                // Auto-search
                const result = await ProductLookupService.lookupByEAN(scanResult.value);
                if (result) {
                  setSearchResult(result);
                } else {
                  Alert.alert('No encontrado', 'Producto no reconocido');
                }
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo escanear el código');
            } finally {
              setSearching(false);
            }
          }
        }
      ]
    );
  };

  const searchTypes = [
    { value: 'ean', label: 'Código EAN', icon: 'barcode-outline' },
    { value: 'asin', label: 'Amazon ASIN', icon: 'cart-outline' },
    { value: 'name', label: 'Nombre', icon: 'search-outline' }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar Producto</Text>
        <TouchableOpacity onPress={handleScanBarcode}>
          <Ionicons name="scan" size={24} color="#1a73e8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Search Type Selector */}
        <View style={styles.typeSelector}>
          {searchTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                searchType === type.value && styles.typeButtonActive
              ]}
              onPress={() => setSearchType(type.value as any)}
            >
              <Ionicons
                name={type.icon as any}
                size={20}
                color={searchType === type.value ? '#fff' : '#666'}
              />
              <Text style={[
                styles.typeButtonText,
                searchType === type.value && styles.typeButtonTextActive
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder={
                searchType === 'ean' ? 'Ej: 8806094308563' :
                searchType === 'asin' ? 'Ej: B0BDK62PDX' :
                'Ej: Samsung Galaxy'
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setSearchResult(null);
                setSearchResults([]);
              }}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Single Result */}
        {searchResult && (
          <View style={styles.resultCard}>
            {searchResult.imageUrl && (
              <Image
                source={{ uri: searchResult.imageUrl }}
                style={styles.productImage}
                resizeMode="contain"
              />
            )}

            <View style={styles.productDetails}>
              <Text style={styles.productName}>{searchResult.name}</Text>
              <Text style={styles.productBrand}>{searchResult.brand}</Text>

              {searchResult.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{searchResult.category}</Text>
                </View>
              )}

              {searchResult.averagePrice && (
                <Text style={styles.productPrice}>
                  Precio promedio: €{searchResult.averagePrice.toFixed(2)}
                </Text>
              )}

              {/* Codes */}
              <View style={styles.codesSection}>
                {searchResult.ean && (
                  <View style={styles.codeRow}>
                    <Ionicons name="barcode-outline" size={16} color="#666" />
                    <Text style={styles.codeText}>EAN: {searchResult.ean}</Text>
                  </View>
                )}
                {searchResult.asin && (
                  <View style={styles.codeRow}>
                    <Ionicons name="cart-outline" size={16} color="#666" />
                    <Text style={styles.codeText}>ASIN: {searchResult.asin}</Text>
                  </View>
                )}
              </View>

              {/* Manufacturer Info */}
              {searchResult.manufacturer && (
                <View style={styles.manufacturerSection}>
                  <Text style={styles.sectionTitle}>Fabricante</Text>
                  <View style={styles.manufacturerCard}>
                    {searchResult.manufacturer.logo && (
                      <Image
                        source={{ uri: searchResult.manufacturer.logo }}
                        style={styles.manufacturerLogo}
                      />
                    )}
                    <View style={styles.manufacturerInfo}>
                      <Text style={styles.manufacturerName}>
                        {searchResult.manufacturer.name}
                      </Text>
                      {searchResult.manufacturer.contactPhone && (
                        <View style={styles.contactRow}>
                          <Ionicons name="call-outline" size={14} color="#666" />
                          <Text style={styles.contactText}>
                            {searchResult.manufacturer.contactPhone}
                          </Text>
                        </View>
                      )}
                      {searchResult.manufacturer.supportEmail && (
                        <View style={styles.contactRow}>
                          <Ionicons name="mail-outline" size={14} color="#666" />
                          <Text style={styles.contactText}>
                            {searchResult.manufacturer.supportEmail}
                          </Text>
                        </View>
                      )}
                      {searchResult.manufacturer.warrantyInfo && (
                        <View style={styles.warrantyInfo}>
                          <Ionicons name="shield-checkmark" size={14} color="#4caf50" />
                          <Text style={styles.warrantyText}>
                            {searchResult.manufacturer.warrantyInfo}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Manual Link */}
              {searchResult.manualUrl && (
                <TouchableOpacity
                  style={styles.manualButton}
                  onPress={() => Alert.alert('Manual', 'Abriendo manual del producto...')}
                >
                  <Ionicons name="document-text" size={20} color="#1a73e8" />
                  <Text style={styles.manualButtonText}>Ver manual del usuario</Text>
                  <Ionicons name="open-outline" size={16} color="#1a73e8" />
                </TouchableOpacity>
              )}

              {/* Use Product Button */}
              <TouchableOpacity
                style={styles.useProductButton}
                onPress={() => {
                  Alert.alert(
                    'Usar producto',
                    '¿Deseas usar esta información para crear una nueva garantía?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Usar',
                        onPress: () => {
                          // Navigate to new warranty screen with pre-filled data
                          navigation.navigate('NewTicket', { productInfo: searchResult });
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.useProductButtonText}>Usar este producto</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Multiple Results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
            </Text>

            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultListItem}
                onPress={() => {
                  setSearchResult(result);
                  setSearchResults([]);
                }}
              >
                {result.imageUrl && (
                  <Image
                    source={{ uri: result.imageUrl }}
                    style={styles.resultThumbnail}
                    resizeMode="contain"
                  />
                )}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  <Text style={styles.resultBrand}>{result.brand}</Text>
                  {result.averagePrice && (
                    <Text style={styles.resultPrice}>
                      €{result.averagePrice.toFixed(2)}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Info Card */}
        {!searchResult && searchResults.length === 0 && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={40} color="#1a73e8" />
            <Text style={styles.infoTitle}>Busca productos fácilmente</Text>
            <Text style={styles.infoText}>
              • Escanea el código de barras{'\n'}
              • Introduce el código EAN o ASIN{'\n'}
              • Busca por nombre del producto
            </Text>
            <Text style={styles.infoSubtext}>
              Obtendrás información detallada, manuales y datos del fabricante
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  content: {
    flex: 1
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  typeButtonActive: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8'
  },
  typeButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600'
  },
  typeButtonTextActive: {
    color: '#fff'
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a'
  },
  searchButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  resultCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f7fa'
  },
  productDetails: {
    padding: 16
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4
  },
  productBrand: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a73e8'
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4caf50',
    marginBottom: 16
  },
  codesSection: {
    gap: 8,
    marginBottom: 16
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  codeText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'monospace'
  },
  manufacturerSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12
  },
  manufacturerCard: {
    flexDirection: 'row',
    gap: 12
  },
  manufacturerLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f5f7fa'
  },
  manufacturerInfo: {
    flex: 1,
    gap: 4
  },
  manufacturerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  contactText: {
    fontSize: 13,
    color: '#666'
  },
  warrantyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  warrantyText: {
    fontSize: 13,
    color: '#4caf50',
    fontWeight: '600'
  },
  manualButton: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16
  },
  manualButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a73e8',
    flex: 1
  },
  useProductButton: {
    flexDirection: 'row',
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12
  },
  useProductButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  resultsSection: {
    padding: 16
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12
  },
  resultListItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    gap: 12
  },
  resultThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#f5f7fa'
  },
  resultInfo: {
    flex: 1
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2
  },
  resultBrand: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4caf50'
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 32,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center'
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 12
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'center'
  },
  infoSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18
  }
});
