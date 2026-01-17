import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos parecidos a CSS pero para PDF
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 },
  companyInfo: { textAlign: 'right' },
  logo: { width: 100, height: 50, objectFit: 'contain' }, 
  title: { fontSize: 18, fontWeight: 'bold', color: '#2563EB', marginBottom: 10 },
  section: { marginVertical: 10 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5, backgroundColor: '#f3f4f6', padding: 4 },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: '30%', fontWeight: 'bold' },
  value: { width: '70%' },
  priceBox: { marginTop: 20, padding: 10, border: '1px solid #2563EB', alignItems: 'center' },
  priceText: { fontSize: 20, fontWeight: 'bold', color: '#2563EB' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, textAlign: 'center', color: '#999', borderTop: '1px solid #eee', paddingTop: 10 }
});

const QuoteDocument = ({ quote, company }) => {

  // --- SOLUCIÓN DEL PROBLEMA DE IMAGEN ---
  // Esta función convierte rutas relativas ("/logo.png") en absolutas ("http://localhost.../logo.png")
  // para que el motor de PDF pueda encontrarlas.
  const constructLogoUrl = (url) => {
    if (!url) return null;
    // Si ya es una URL web completa (ej: https://imgur.com/...), la dejamos igual
    if (url.startsWith('http')) return url;
    
    // Si es una ruta relativa (ej: /logo.png), le pegamos el dominio actual
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`; 
    }
    return url;
  };

  const finalLogoUrl = constructLogoUrl(company?.logo);
  // ----------------------------------------

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER: Logo y Datos Empresa */}
        <View style={styles.header}>
          <View>
              {/* Usamos la variable finalLogoUrl corregida */}
              {finalLogoUrl ? (
                  <Image style={styles.logo} src={finalLogoUrl} />
              ) : (
                  <Text style={{fontSize: 14, fontWeight:'bold'}}>{company?.name || 'EMPRESA'}</Text>
              )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={{fontWeight: 'bold'}}>{company?.name}</Text>
            <Text>{company?.address}</Text>
            <Text>RUT: {company?.rut}</Text>
            <Text>{company?.email}</Text> {/* Nota: en tu API lo llamamos 'email', no 'email_contact' */}
            <Text>{company?.phone}</Text>
          </View>
        </View>

        <Text style={styles.title}>COTIZACIÓN N° {String(quote.id).padStart(6, '0')}</Text>
        <Text>Fecha: {quote.date} | Válido hasta: {quote.valid_until}</Text>

        {/* DATOS DEL CLIENTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DEL CLIENTE</Text>
          <View style={styles.row}><Text style={styles.label}>Nombre:</Text><Text style={styles.value}>{quote.client_name}</Text></View>
          {/* Si quieres mostrar el RUT del cliente, asegúrate de traerlo en la API */}
        </View>

        {/* DATOS DEL VEHÍCULO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VEHÍCULO COTIZADO</Text>
          <View style={styles.row}><Text style={styles.label}>Vehículo:</Text><Text style={styles.value}>{quote.vehicle_text}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Marca:</Text><Text style={styles.value}>{quote.make}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Modelo:</Text><Text style={styles.value}>{quote.model}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Año:</Text><Text style={styles.value}>{quote.year}</Text></View>
        </View>

        {/* PRECIO */}
        <View style={styles.priceBox}>
          <Text>PRECIO FINAL OFERTADO</Text>
          <Text style={styles.priceText}>$ {Number(quote.price).toLocaleString()}</Text>
        </View>

        {/* NOTAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OBSERVACIONES</Text>
          <Text>{quote.notes || 'Sin observaciones adicionales.'}</Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Documento generado electrónicamente por AutoERP.</Text>
          <Text>Este documento no constituye una factura de venta.</Text>
        </View>

      </Page>
    </Document>
  );
};

export default QuoteDocument;