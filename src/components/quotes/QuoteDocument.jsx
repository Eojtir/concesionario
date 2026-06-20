// QuoteDocument.js
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDate } from '../../utils/formatDate';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 },
  companyInfo: { textAlign: 'right' },
  logo: { width: 100, height: 36, objectFit: 'cover' },
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
  const vehicleText = quote.vehicle ? `${quote.vehicle.make} ${quote.vehicle.model} (${quote.vehicle.year})` : '';

  // Helper para construir la URL del logo si es relativa
  const logoSrc = company?.logo_url 
    ? (company.logo_url.startsWith('http') ? company.logo_url : `${window.location.origin}/${company.logo_url.replace(/^\.\//, '')}`)
    : null;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {/* CORREGIDO: Usamos logo_url en lugar de logo */}
            {logoSrc ? (
              <Image style={styles.logo} src={logoSrc} />
            ) : (
              // CORREGIDO: Usamos business_name en lugar de name
              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{company?.business_name || 'EMPRESA'}</Text>
            )}
          </View>
          <View style={styles.companyInfo}>
            {/* CORREGIDO: Propiedades mapeadas según tu JSON */}
            <Text style={{ fontWeight: 'bold' }}>{company?.business_name}</Text>
            <Text>{company?.address || ''}</Text>
            <Text>RUT: {company?.tax_id || 'N/A'}</Text>
            <Text>{company?.contact_email || ''}</Text>
            <Text>{company?.phone || ''}</Text>
            {/* Agregué website ya que viene en tu JSON y suele ir en el encabezado */}
            <Text>{company?.website || ''}</Text>
          </View>
        </View>

        <Text style={styles.title}>COTIZACIÓN N° {String(quote.id || '').padStart(6, '0')}</Text>
        <Text>Fecha: {formatDate(quote.date)} | Válido hasta: {formatDate(quote.valid_until)}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DEL CLIENTE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{quote.client?.name || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{quote.client?.email || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{quote.client?.phone || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VEHÍCULO COTIZADO</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Descripción:</Text>
            <Text style={styles.value}>{vehicleText}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Placa:</Text>
            <Text style={styles.value}>{quote.vehicle?.plate || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>VIN:</Text>
            <Text style={styles.value}>{quote.vehicle?.vin || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Color:</Text>
            <Text style={styles.value}>{quote.vehicle?.color || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.priceBox}>
          <Text>PRECIO FINAL OFERTADO</Text>
          <Text style={styles.priceText}>${Number(quote.price || 0).toLocaleString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OBSERVACIONES</Text>
          <Text>{quote.notes || 'Sin observaciones adicionales.'}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Documento generado electrónicamente por AutoERP.</Text>
          <Text>Este documento no constituye una factura de venta.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default QuoteDocument;