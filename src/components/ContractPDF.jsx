import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Estilos (CSS-in-JS para PDF)
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', lineHeight: 1.5 },
  header: { fontSize: 18, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  section: { marginBottom: 10 },
  title: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, marginTop: 10 },
  row: { flexDirection: 'row', marginBottom: 2 },
  label: { width: 120, fontWeight: 'bold' },
  value: { flex: 1 },
  footer: { marginTop: 50, flexDirection: 'row', justifyContent: 'space-between' },
  signature: { borderTopWidth: 1, width: 200, textAlign: 'center', paddingTop: 5, marginTop: 40 },
  legalText: { textAlign: 'justify', marginBottom: 10, fontSize: 10, color: '#333' }
});

// El componente recibe los datos de la venta y del vehículo
const ContractPDF = ({ saleData, vehicle }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* TÍTULO */}
      <Text style={styles.header}>CONTRATO DE COMPRAVENTA DE VEHÍCULO</Text>

      {/* FECHA Y LUGAR */}
      <Text style={{ textAlign: 'right', marginBottom: 20 }}>
        En {saleData.client_city}, a {new Date(saleData.sale_date).toLocaleDateString('es-CL')}
      </Text>

      {/* TEXTO LEGAL INTRODUCTORIO */}
      <Text style={styles.legalText}>
        Entre la AUTOMOTORA (VENDEDOR), y por otra parte don/doña {saleData.client_name.toUpperCase()}, 
        RUT {saleData.client_rut}, con domicilio en {saleData.client_address}, en adelante "EL COMPRADOR", 
        se ha convenido el siguiente contrato de compraventa:
      </Text>

      {/* DATOS DEL VEHÍCULO */}
      <View style={styles.section}>
        <Text style={styles.title}>PRIMERO: OBJETO DE LA VENTA</Text>
        <Text style={styles.legalText}>
          El Vendedor vende, cede y transfiere al Comprador el vehículo usado que se detalla a continuación:
        </Text>
        
        <View style={styles.row}><Text style={styles.label}>Marca:</Text><Text style={styles.value}>{vehicle.make}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Modelo:</Text><Text style={styles.value}>{vehicle.model}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Año:</Text><Text style={styles.value}>{vehicle.year}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Patente:</Text><Text style={styles.value}>{vehicle.plate}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Color:</Text><Text style={styles.value}>{vehicle.color || 'No especificado'}</Text></View>
      </View>

      {/* DATOS DEL PAGO */}
      <View style={styles.section}>
        <Text style={styles.title}>SEGUNDO: PRECIO Y FORMA DE PAGO</Text>
        <Text style={styles.legalText}>
          El precio total de la compraventa asciende a la suma de ${parseInt(saleData.sale_price).toLocaleString('es-CL')}, 
          el cual se paga mediante {saleData.payment_method}.
        </Text>
      </View>

      {/* NOTAS ADICIONALES */}
      {saleData.notes && (
        <View style={styles.section}>
          <Text style={styles.title}>TERCERO: OBSERVACIONES</Text>
          <Text style={styles.legalText}>{saleData.notes}</Text>
        </View>
      )}

      <Text style={styles.legalText}>
        El vehículo se entrega en el estado en que se encuentra, el cual es conocido y aceptado por el comprador.
      </Text>

      {/* FIRMAS */}
      <View style={styles.footer}>
        <View>
            <Text style={styles.signature}>FIRMA AUTOMOTORA</Text>
        </View>
        <View>
            <Text style={styles.signature}>FIRMA COMPRADOR</Text>
            <Text style={{ textAlign: 'center', fontSize: 9 }}>{saleData.client_rut}</Text>
        </View>
      </View>

    </Page>
  </Document>
);

export default ContractPDF;