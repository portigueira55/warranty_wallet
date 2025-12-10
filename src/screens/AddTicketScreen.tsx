import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { TicketStorage } from '../services/storage';
import { OCRService } from '../services/ocr';
import { Ticket, Product } from '../types';
import { generateUniqueId } from '../utils/encryption';

const { width } = Dimensions.get('window');

export const AddTicketScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Datos del ticket
  const [ticketNumber, setTicketNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseTime, setPurchaseTime] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');

  // Productos
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductQty, setNewProductQty] = useState('1');
  const [newProductPrice, setNewProductPrice] = useState('');

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permisos', 'Se necesitan permisos de cámara');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permisos', 'Se necesitan permisos de galería');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8
        });
      }

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const processImage = async (uri: string) => {
    setIsProcessing(true);
    try {
      const ocrResult = await OCRService.processTicketImage(uri);

      // Rellenar campos con datos extraídos
      if (ocrResult.purchaseDate) setPurchaseDate(ocrResult.purchaseDate);
      if (ocrResult.ticketNumber) setTicketNumber(ocrResult.ticketNumber);
      if (ocrResult.purchaseTime) setPurchaseTime(ocrResult.purchaseTime);
      if (ocrResult.storeName) setStoreName(ocrResult.storeName);
      if (ocrResult.storeAddress) setStoreAddress(ocrResult.storeAddress);

      // Añadir productos detectados
      if (ocrResult.products && ocrResult.products.length > 0) {
        const newProducts: Product[] = ocrResult.products.map(p => ({
          id: generateUniqueId(),
          sku: p.sku || generateUniqueId().substring(0, 8).toUpperCase(),
          name: p.name || 'Producto',
          quantity: p.quantity || 1,
          unitPrice: p.unitPrice || 0,
          totalPrice: p.totalPrice || 0
        }));
        setProducts(prev => [...prev, ...newProducts]);
      }

      Alert.alert('OCR Completado', 'Revisa los datos extraídos y completa los campos necesarios');
    } catch (error) {
      console.error('Error procesando OCR:', error);
      Alert.alert('Aviso', 'No se pudieron extraer datos automáticamente. Por favor, ingresa los datos manualmente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addProduct = () => {
    if (!newProductName.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }

    const price = parseFloat(newProductPrice.replace(',', '.')) || 0;
    const qty = parseInt(newProductQty) || 1;

    const product: Product = {
      id: generateUniqueId(),
      sku: newProductSku || generateUniqueId().substring(0, 8).toUpperCase(),
      name: newProductName.trim(),
      quantity: qty,
      unitPrice: price,
      totalPrice: price * qty
    };

    setProducts([...products, product]);
    setNewProductName('');
    setNewProductSku('');
    setNewProductQty('1');
    setNewProductPrice('');
  };

  const removeProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const saveTicket = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión');
      return;
    }

    if (!imageUri) {
      Alert.alert('Error', 'Debes añadir una foto del ticket');
      return;
    }

    if (!storeName.trim()) {
      Alert.alert('Error', 'El nombre de la tienda es obligatorio');
      return;
    }

    if (!purchaseDate) {
      Alert.alert('Error', 'La fecha de compra es obligatoria');
      return;
    }

    setIsSaving(true);
    try {
      const warrantyEndDate = OCRService.calculateWarrantyEndDate(purchaseDate);

      const ticket: Ticket = {
        id: generateUniqueId(),
        userId: user.id,
        tenantId: user.tenantId,
        imageUri,
        purchaseDate,
        ticketNumber: ticketNumber || generateUniqueId().substring(0, 10),
        purchaseTime: purchaseTime || new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        storeName: storeName.trim(),
        storeAddress: storeAddress.trim(),
        products,
        warrantyEndDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await TicketStorage.saveTicket(ticket);

      Alert.alert(
        'Éxito',
        'Ticket guardado correctamente. La garantía expirará el ' +
        new Date(warrantyEndDate).toLocaleDateString('es-ES'),
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error guardando ticket:', error);
      Alert.alert('Error', 'No se pudo guardar el ticket');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.title}>Añadir Ticket</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Imagen del ticket */}
        <View style={styles.imageSection}>
          {imageUri ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: imageUri }} style={styles.ticketImage} />
              {isProcessing && (
                <View style={styles.processingOverlay}>
                  <ActivityIndicator size="large" color="#1a73e8" />
                  <Text style={styles.processingText}>Procesando OCR...</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={() => setImageUri(null)}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>Foto del ticket</Text>
              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => pickImage(true)}
                >
                  <Ionicons name="camera" size={24} color="#1a73e8" />
                  <Text style={styles.imageButtonText}>Cámara</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => pickImage(false)}
                >
                  <Ionicons name="images" size={24} color="#1a73e8" />
                  <Text style={styles.imageButtonText}>Galería</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Datos del ticket */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Datos del Ticket</Text>

          <View style={styles.row}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Nº Ticket</Text>
              <TextInput
                style={styles.input}
                value={ticketNumber}
                onChangeText={setTicketNumber}
                placeholder="12345678"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Fecha compra *</Text>
              <TextInput
                style={styles.input}
                value={purchaseDate}
                onChangeText={setPurchaseDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Hora</Text>
              <TextInput
                style={styles.input}
                value={purchaseTime}
                onChangeText={setPurchaseTime}
                placeholder="HH:MM"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <Text style={styles.label}>Nombre tienda *</Text>
          <TextInput
            style={styles.input}
            value={storeName}
            onChangeText={setStoreName}
            placeholder="Ej: MediaMarkt"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Dirección tienda</Text>
          <TextInput
            style={styles.input}
            value={storeAddress}
            onChangeText={setStoreAddress}
            placeholder="Ej: C/ Mayor 123, Madrid"
            placeholderTextColor="#999"
          />
        </View>

        {/* Productos */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Productos</Text>

          {products.map((product) => (
            <View key={product.id} style={styles.productItem}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDetails}>
                  SKU: {product.sku} | Cant: {product.quantity} | {product.totalPrice.toFixed(2)}€
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeProduct(product.id)}>
                <Ionicons name="trash-outline" size={20} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addProductForm}>
            <TextInput
              style={[styles.input, styles.productInput]}
              value={newProductName}
              onChangeText={setNewProductName}
              placeholder="Nombre producto"
              placeholderTextColor="#999"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputThird]}
                value={newProductSku}
                onChangeText={setNewProductSku}
                placeholder="SKU"
                placeholderTextColor="#999"
              />
              <TextInput
                style={[styles.input, styles.inputThird]}
                value={newProductQty}
                onChangeText={setNewProductQty}
                placeholder="Cant"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <TextInput
                style={[styles.input, styles.inputThird]}
                value={newProductPrice}
                onChangeText={setNewProductPrice}
                placeholder="Precio"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.addProductButton} onPress={addProduct}>
              <Ionicons name="add" size={20} color="#1a73e8" />
              <Text style={styles.addProductText}>Añadir producto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={saveTicket}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Guardar Ticket</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info garantía */}
        <View style={styles.warrantyInfo}>
          <Ionicons name="shield-checkmark" size={20} color="#1a73e8" />
          <Text style={styles.warrantyText}>
            La garantía se calculará automáticamente (3 años desde la fecha de compra)
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  scrollContent: {
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  imageSection: {
    padding: 16
  },
  imagePlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center'
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 20
  },
  imageButton: {
    alignItems: 'center',
    padding: 12
  },
  imageButtonText: {
    color: '#1a73e8',
    marginTop: 4,
    fontSize: 12
  },
  imagePreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden'
  },
  ticketImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover'
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  processingText: {
    marginTop: 8,
    color: '#1a73e8',
    fontSize: 14
  },
  changeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8
  },
  formSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginTop: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fafafa'
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  inputHalf: {
    flex: 1
  },
  inputThird: {
    flex: 1
  },
  productInput: {
    marginBottom: 8
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a'
  },
  productDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  addProductForm: {
    marginTop: 8
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a73e8',
    borderRadius: 8,
    marginTop: 8
  },
  addProductText: {
    color: '#1a73e8',
    marginLeft: 8,
    fontWeight: '500'
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a73e8',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginTop: 8
  },
  saveButtonDisabled: {
    opacity: 0.7
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  warrantyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  warrantyText: {
    color: '#1a73e8',
    fontSize: 12,
    marginLeft: 8,
    flex: 1
  }
});
