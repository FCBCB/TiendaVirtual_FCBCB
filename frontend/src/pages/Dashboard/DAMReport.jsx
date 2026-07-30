// src/pages/Dashboard/DAMReport.jsx
import React, { useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Download, FileText, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const DamReport = ({ damData, onClose }) => {
  const reportRef = useRef();
  const modalRef = useRef();

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '0';
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = '';
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // ─── HELPERS ───────────────────────────────────────────────────
  const fmt = (value) => {
    if (!value && value !== 0) return '0.00';
    let clean = String(value).replace(/,/g, '').replace(/\s/g, '');
    const num = parseFloat(clean) || 0;
    return new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const codDesc = (obj) => {
    if (!obj) return '';
    const c = obj.codigo || '';
    const d = obj.descripcion || '';
    if (c && d) return `${c} - ${d}`;
    return d || c || '';
  };

  const getMini  = (minis, key) => minis.find(d => d[key])?.[key] || '';
  const getMiniD = (minis, key) => { const v = minis.find(d => d[key])?.[key]; return v?.descripcion || v || ''; };

  // ─── DATOS ─────────────────────────────────────────────────────
  const id    = damData.datosGenerales?.identificacionDeclaracion || {};
  const ops   = damData.datosGenerales?.operadores || {};
  const lug   = damData.datosGenerales?.lugares || {};
  const tr    = damData.datosGenerales?.transporte || {};
  const emb   = tr.informacionDocumentosEmbarque?.[0] || {};
  const txn   = damData.datosTransacciones?.[0] || {};
  const det   = txn.detalleTransaccion || {};
  const pago  = txn.detallePagoTransaccion || {};
  const prov  = damData.proveedores?.[0] || {};
  const totC  = txn.totalesControl || {};
  const totG  = damData.totalControlDeclaracion || {};
  const mercs = damData.datosMercancias || [];
  const valC  = txn.valoresCostos || {};

  // Datos para Documentos Soporte (L)
  const documentosSoporte = [
    { tipo: "AIR WAYBILL (AWB) - CARTA DE PORTE AÉREO", numero: emb.numeroDocumentoEmbarque || "034-1234567 01234567", emisor: "Guangdong Air Logistics Co., Ltd.", fechaEmision: emb.fechaEmbarque || "09/03/2026", monto: "" },
    { tipo: "FACTURA COMERCIAL", numero: det.numeroFactura || "JJL-EXP-2026-001", emisor: prov.razonSocial || "Guangdong Jiajianle Technology Co., Ltd.", fechaEmision: det.fechaFactura || "09/03/2026", monto: fmt(valC.valorFobTotalUsd || totG.totalFob) },
    { tipo: "LISTA DE EMPAQUE", numero: "JJL-J962-2026-002", emisor: prov.razonSocial || "Guangdong Jiajianle Technology Co., Ltd.", fechaEmision: det.fechaFactura || "09/03/2026", monto: "" },
  ];

// ═══════════════════════════════════════════════════════════════
//  CAPTURA DE PANTALLA - ANCHO AMPLIADO (SIN ROMPER FORMATO)
// ═══════════════════════════════════════════════════════════════
const captureScreenshot = async () => {
  if (!reportRef.current) return;
  
  try {
    const { toPng } = await import('html-to-image');
    
    const button = document.getElementById('capture-btn');
    const originalText = button?.innerHTML || '📸 Capturar Imagen';
    
    if (button) {
      button.innerHTML = '📸 Capturando...';
      button.disabled = true;
    }
    
    const element = reportRef.current;
    
    // 📌 Guardar estilos originales
    const originalStyle = {
      width: element.style.width,
      minWidth: element.style.minWidth,
      maxWidth: element.style.maxWidth,
      overflow: element.style.overflow
    };
    
    // 📌 Obtener el ancho actual y AMPLIARLO
    const currentWidth = element.getBoundingClientRect().width;
    
    // 🔥 AUMENTA ESTE VALOR para más ancho (1.2 = 20% más, 1.5 = 50% más)
    const FACTOR_ANCHO = 1.3;  // ← Prueba con 1.2, 1.3, 1.4, 1.5
    const nuevoAncho = currentWidth * FACTOR_ANCHO;
    
    element.style.width = `${nuevoAncho}px`;
    element.style.minWidth = `${nuevoAncho}px`;
    element.style.maxWidth = `${nuevoAncho}px`;
    element.style.overflow = 'visible';
    
    // Esperar a que se apliquen los estilos
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width: nuevoAncho,
      height: element.scrollHeight,
      cacheBust: true
    });
    
    // Restaurar estilos
    element.style.width = originalStyle.width;
    element.style.minWidth = originalStyle.minWidth;
    element.style.maxWidth = originalStyle.maxWidth;
    element.style.overflow = originalStyle.overflow;
    
    const link = document.createElement('a');
    link.download = `DAM_${id.numeroReferencia || 'UREAL002'}_captura.png`;
    link.href = dataUrl;
    link.click();
    
    if (button) {
      button.innerHTML = originalText;
      button.disabled = false;
    }
    
  } catch (error) {
    console.error('Error al capturar la imagen:', error);
    alert('Error al capturar la imagen. Por favor, intenta de nuevo.');
    
    const button = document.getElementById('capture-btn');
    if (button) {
      button.innerHTML = '📸 Capturar Imagen';
      button.disabled = false;
    }
  }
};
  // ═══════════════════════════════════════════════════════════════
  //  GENERACIÓN PDF
  // ═══════════════════════════════════════════════════════════════
  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const ML = 7;
    const W  = PW - ML * 2;

    const GRAY_HDR = [178, 178, 178];
    const GRAY_LBL = [220, 220, 220];
    const BLACK    = [0, 0, 0];
    const WHITE    = [255, 255, 255];

    let y = ML;
    let pageNum = 1;
    const totalPages = mercs.length + 1;

    const newPage = () => { doc.addPage(); pageNum++; y = ML; drawPageHeader(false); };
    const checkY = (need = 10) => { if (y + need > PH - 10) newPage(); };

    const setLbl = () => { doc.setFont('helvetica', 'bold'); doc.setFontSize(6); doc.setTextColor(...BLACK); };
    const setVal = () => { doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...BLACK); };

    const drawCell = (x, cy, w, h, label, value, fillColor = WHITE) => {
      doc.setFillColor(...fillColor);
      doc.setDrawColor(...BLACK);
      doc.rect(x, cy, w, h, 'FD');
      
      const hasLabel = label && String(label).length > 0;
      const hasValue = value && String(value).length > 0;
      
      if (hasLabel) {
        setLbl();
        const lblLines = doc.splitTextToSize(String(label), w - 2);
        doc.text(lblLines[0] || '', x + 1, cy + 2);
        if (lblLines[1]) doc.text(lblLines[1], x + 1, cy + 3.8);
      }
      if (hasValue) {
        setVal();
        const valStart = hasLabel ? cy + 5.5 : cy + 3;
        const valLines = doc.splitTextToSize(String(value), w - 2);
        valLines.slice(0, 2).forEach((l, li) => doc.text(l, x + 1, valStart + li * 2.2));
      }
    };

    const sectionBand = (label, subLabel = false) => {
      checkY(6);
      doc.setFillColor(...(subLabel ? GRAY_LBL : GRAY_HDR));
      doc.setDrawColor(...BLACK);
      doc.rect(ML, y, W, 5.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(subLabel ? 6 : 7);
      doc.setTextColor(...BLACK);
      doc.text(label, ML + 1.5, y + 3.8);
      y += 5.5;
    };

    const row = (cells, h = 7) => {
      checkY(h);
      let cx = ML;
      cells.forEach(c => {
        drawCell(cx, y, c.w, h, c.label || '', c.value !== undefined ? String(c.value) : '', c.fill || WHITE);
        cx += c.w;
      });
      y += h;
    };

    const drawPageHeader = (isFirst = true) => {
      const logoWidth = 44;
      const logoHeight = 14;
      const logoX = ML + 2;
      const logoY = y + 2;

      doc.setFillColor(...WHITE);
      doc.setDrawColor(...BLACK);
      doc.rect(ML, y, 48, 18, 'FD');

      try {
        const logoImg = 'AN_logo.png';
        doc.addImage(logoImg, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (error) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(180, 0, 0);
        doc.text('Aduana', ML + 2, y + 7);
        doc.setFontSize(12);
        doc.setTextColor(...BLACK);
        doc.text('Nacional', ML + 2, y + 13);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(120, 120, 120);
        doc.text('Trabaja por ti', ML + 2, y + 17);
      }

      const titleX = ML + 48;
      const titleW = W - 48 - 42;
      doc.setFillColor(...WHITE);
      doc.rect(titleX, y, titleW, 18, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...BLACK);
      doc.text('DECLARACIÓN DE ADQUISICIÓN', titleX + titleW / 2, y + 7, { align: 'center' });
      doc.text('DE MERCANCÍAS', titleX + titleW / 2, y + 14, { align: 'center' });

      const rx = PW - ML - 42;
      doc.setFillColor(...WHITE);
      doc.rect(rx, y, 42, 18, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...BLACK);
      doc.text('DAM', rx + 3, y + 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.text(`DAM-${new Date().getFullYear()}-${id.numeroReferencia || ''}`, rx + 2, y + 14);
      doc.text(id.destinoRegimenAduanero?.descripcion?.substring(0, 22) || 'DEPOSITO DE ADUANA', rx + 2, y + 17, { maxWidth: 39 });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text(`Hoja:   ${pageNum} / ${totalPages}`, rx + 2, y + 20.5);

      y += 20;
    };

    // Función para dibujar tabla de Documentos Soporte (L)
    const drawDocumentosSoporte = () => {
      sectionBand('L. Documentos de la declaración');
      
      // Subsección L.1 Documentos soporte
      checkY(10);
      doc.setFillColor(...GRAY_LBL);
      doc.setDrawColor(...BLACK);
      doc.rect(ML, y, W, 5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(...BLACK);
      doc.text('L.1 Documentos soporte', ML + 1.5, y + 3.5);
      y += 5;

      // Encabezados de tabla
      const colW = [10, 35, 35, 35, 25, 20, 15];
      const headers = ['Nº', 'Tipo documento', 'Número', 'Emisor', 'Fecha emisión', 'Monto', 'Documento'];
      
      checkY(8);
      let hx = ML;
      headers.forEach((h, i) => {
        doc.setFillColor(...GRAY_HDR);
        doc.setDrawColor(...BLACK);
        doc.rect(hx, y, colW[i], 6, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        doc.setTextColor(...BLACK);
        doc.text(h, hx + 1, y + 4);
        hx += colW[i];
      });
      y += 6;

      // Filas de documentos
      documentosSoporte.forEach((docItem, idx) => {
        checkY(8);
        let rx = ML;
        const rowData = [
          String(idx + 1),
          docItem.tipo.substring(0, 35),
          docItem.numero,
          docItem.emisor.substring(0, 35),
          docItem.fechaEmision,
          docItem.monto ? `USD ${docItem.monto}` : '',
          ''
        ];
        rowData.forEach((val, i) => {
          doc.setFillColor(...WHITE);
          doc.setDrawColor(...BLACK);
          doc.rect(rx, y, colW[i], 7, 'FD');
          setVal();
          const lines = doc.splitTextToSize(val || '', colW[i] - 2);
          lines.slice(0, 2).forEach((l, li) => doc.text(l, rx + 1, y + 2.5 + li * 2.5));
          rx += colW[i];
        });
        y += 7;
      });
    };

    // Función para dibujar M. Información adicional
    const drawInformacionAdicional = () => {
      sectionBand('M. Información adicional');
      row([{ w: W, label: '', value: 'Mercancía nueva - Importación bajo DAP La Paz, Bolivia. El comprador es responsable de todos los impuestos de importación en Bolivia (IVA 14.94% y aranceles).' }], 8);
    };

    // ════ PÁGINA 1 ════
    drawPageHeader(true);

    // A. IDENTIFICACIÓN
    sectionBand('A. Identificación de la declaración');
    row([
      { w: 50, label: 'A1. N° de declaración', value: id.numeroReferencia || 'DAM-20xx-xx' },
      { w: 50, label: 'A2. Fecha de registro', value: new Date().toLocaleDateString('es-BO') + ' ' + new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) },
      { w: 48, label: 'A3. N° de referencia', value: id.numeroReferencia || 'XXXX' },
      { w: 48, label: `A4. Aduana de despacho ${id.aduanaDespacho?.codigo || '201'} -`, value: id.aduanaDespacho?.descripcion || 'INTERIOR LA PAZ' },
    ], 8);
    row([
      { w: 50, label: 'A5. Forma de envío', value: `${id.formaEnvio?.codigo || ''} - ${id.formaEnvio?.descripcion || ''}` },
      { w: 50, label: 'A5.1 Carga consolidada', value: id.cargaConsolidada?.descripcion || 'SI' },
      { w: 48, label: 'A6. Destino/Régimen aduanero', value: codDesc(id.destinoRegimenAduanero) },
      { w: 48, label: 'A7. Modalidad de régimen', value: codDesc(id.modalidadRegimen) },
    ], 8);
    row([
      { w: 50, label: 'A8. Modalidad de Despacho', value: codDesc(id.modalidadDespacho) },
      { w: 50, label: 'A9. Destino/Régimen Posterior a depósito', value: codDesc(id.destinoRegimenAduanero) },
      { w: 48, label: 'A10. Modalidad de Despacho Posterior a depósito', value: id.modDesPos || '01 - GENERAL' },
      { w: 48, label: 'A11. Emisión de Parte de Recepción', value: codDesc(id.emiParRec) },
    ], 8);

    // B. OPERADORES
    sectionBand('B. Operadores');
    const bW = [20, 28, 32, 52, 24, 40];
    const bH = ['Datos', 'Tipo de documento', 'N° de documento', 'Nombre/Razón social', 'Categoría', '*Domicilio, Ciudad, País, Tel, Fax, Email'];
    checkY(8);
    let bx = ML;
    bH.forEach((h, i) => { drawCell(bx, y, bW[i], 5, '', h, GRAY_LBL); bx += bW[i]; });
    y += 5;

    const opRow = (lbl, tipo, num, nombre, cat, dom) => {
      checkY(8);
      const vals = [lbl, tipo, num, nombre, cat, dom];
      let ox = ML;
      bW.forEach((w, i) => {
        doc.setFillColor(...WHITE); doc.setDrawColor(...BLACK); doc.rect(ox, y, w, 8, 'FD');
        setVal();
        const lines = doc.splitTextToSize(String(vals[i] || ''), w - 2);
        lines.slice(0, 2).forEach((l, li) => doc.text(l, ox + 1, y + 2 + li * 2.2));
        ox += w;
      });
      y += 8;
    };
    opRow('B1. Importador:', ops.importador?.tipoDocumento?.codigo || 'NIT', ops.importador?.numeroDocumento || '', '', '', '');
    opRow('B2. Consignatario:', ops.consignatario?.tipoDocumento?.codigo || 'NIT', ops.consignatario?.numeroDocumento || '', '', '', '');
    opRow('B3. Declarante:', 'NIT', '', 'Despachante', '', '');

    // C. LUGARES
    sectionBand('C. Lugares');
    row([
      { w: 33, label: 'C1. País de exportación', value: codDesc(lug.paisExportacion) },
      { w: 33, label: 'C2. País de procedencia', value: codDesc(lug.paisProcedencia) },
      { w: 33, label: 'C3. País de tránsito', value: codDesc(lug.paisTransito) },
      { w: 33, label: 'C4. Aduana de ingreso', value: codDesc(lug.aduanaIngreso) },
      { w: 32, label: 'C5. Aduana de destino', value: codDesc(lug.aduanaDestino) },
      { w: 32, label: 'C6. Lugar de entrega', value: lug.lugarEntrega || '' },
    ], 8);

    // D. TRANSPORTE
    sectionBand('D. Transporte.');
    row([{ w: W, label: 'D1.1 Tipo de Documento de Embarque', value: codDesc(emb.tipoDocumentoEmbarque) }], 7);
    row([
      { w: 66, label: 'D1.2 N° de documento de embarque', value: emb.numeroDocumentoEmbarque || '' },
      { w: 65, label: '1.3 País de embarque', value: codDesc(emb.paisEmbarque) },
      { w: 65, label: 'D1.4 Lugar de embarque', value: codDesc(emb.lugarEmbarque) },
    ], 8);
    row([
      { w: 33, label: 'D1.5 Fecha de embarque', value: emb.fechaEmbarque || '' },
      { w: 33, label: 'D1.6 Proviene de Zona Franca', value: emb.provieneZonaFranca?.descripcion || 'NO' },
      { w: 66, label: 'D2. Modalidad de transporte hasta frontera', value: codDesc(tr.hastaFrontera) },
      { w: 49, label: 'D3. Modalidad de transporte desde frontera', value: codDesc(tr.desdeFrontera) },
      { w: 15, label: 'D4. Carga peligrosa', value: tr.cargaPeligrosa ? 'SI' : 'NO' },
    ], 8);

    // TOTALES CONTROL DECLARACIÓN
    sectionBand('Totales para control de la declaración');
    row([
      { w: 33, label: 'Total N° de facturas', value: '1' },
      { w: 33, label: 'Total N° de Items', value: totC.totalItems || mercs.length },
      { w: 40, label: 'Valor FOB Total (USD)', value: fmt(valC.valorFobTotalUsd || totG.totalFob) },
      { w: 30, label: 'Total N° de bultos', value: totG.totalBultos || '' },
      { w: 30, label: 'Total peso bruto (kg)', value: fmt(totG.totalPesoBruto) },
      { w: 30, label: 'Total peso neto (kg)', value: fmt(totC.totalPesoNeto) },
    ], 7);

    // E. INFORMACIÓN FACTURA
    sectionBand('E. Información y valores totales de la factura');
    row([{ w: W, label: 'E1. Proveedor:', value: `${prov.razonSocial || ''}, ${prov.domicilio?.calleAvenida || ''} ${prov.domicilio?.numero || ''}, ${prov.domicilio?.barrioZona || ''} ${codDesc(prov.domicilio?.ciudad)}, ${codDesc(prov.domicilio?.pais)}, (${prov.domicilio?.telefonoFax || ''}), ${prov.domicilio?.correoElectronico || ''}` }], 8);
    row([
      { w: 50, label: 'E1.1 Condición', value: codDesc(txn.proveedor?.condicionVendedor) },
      { w: 50, label: 'E2. País de adquisición', value: codDesc(txn.proveedor?.paisAdquisicion) },
      { w: 48, label: 'E6. Lugar de entrega', value: det.incoterms?.lugarEntrega || '' },
      { w: 48, label: 'E7. Naturaleza transacción', value: codDesc(det.naturalezaTransaccion) },
    ], 7);
    row([
      { w: 33, label: 'E3. N° de la factura', value: det.numeroFactura || '' },
      { w: 33, label: 'E4. Fecha de la factura', value: det.fechaFactura || '' },
      { w: 65, label: 'E5. Condición de entrega', value: codDesc(det.incoterms?.condicionEntrega) },
      { w: 33, label: 'E11. Destino de la mercancía', value: codDesc(det.destinoMercancia) },
      { w: 32, label: 'E12. Factura sujeta a descuento', value: det.facturaSujetoDescuento === 'true' ? 'SI' : 'NO' },
    ], 7);
    row([
      { w: 65, label: 'E8. Moneda de transacción', value: codDesc(det.monedaTransaccion) },
      { w: 65, label: 'E9. Valor de transacción', value: fmt(det.valorTransaccion) },
      { w: 66, label: 'E10. T/C moneda de transacción', value: det.tipoCambio === 0 ? '0 (No aplica)' : String(det.tipoCambio || '') },
    ], 7);

    sectionBand('Detalles del pago de la transacción', true);
    row([
      { w: 65, label: 'E13. Forma de pago', value: codDesc(pago.formaPago) },
      { w: 65, label: 'E14. Medio de pago', value: codDesc(pago.medioPago) },
      { w: 33, label: 'E15. Valor FOB total (USD)', value: fmt(valC.valorFobTotalUsd || totG.totalFob) },
      { w: 33, label: 'E16. Valor CIF total (USD)', value: fmt(valC.valorCifTotalUsd || 0) },
    ], 8);

    // F. TOTALES FACTURA
    sectionBand('F. Totales para control de la factura');
    row([
      { w: 65, label: 'F1. Total N° de páginas', value: totC.numeroPaginas || '1' },
      { w: 65, label: 'F2. Total N° de Items', value: totC.totalItems || mercs.length },
      { w: 66, label: 'F3. Total peso neto (kg)', value: fmt(totC.totalPesoNeto) },
    ], 7);

    // G. OBSERVACIONES
    sectionBand('G. Observaciones generales de la factura');
    row([{ w: W, label: '', value: txn.observacionesGenerales || 'MERCANCÍA NUEVA — IMPORTACIÓN PARA CONSUMO' }], 7);

    // ════ PÁGINAS DE ÍTEMS ════
    mercs.forEach((merc, idx) => {
      newPage();
      const id2   = merc.identificacionMercanciaItem || {};
      const vals  = merc.informacionValoresTransaccionItem || {};
      const minis = id2.descripcionMercanciaComercial?.descripcionMinimasMercancias || [];

      sectionBand('H. Identificación de la mercancía por ítem');
      row([
        { w: 16, label: 'H1. N° ítem', value: String(idx + 1) },
        { w: 58, label: 'H3. Subpartida arancelaria', value: id2.subPartidaArancelaria?.codigo || '' },
        { w: 84, label: 'Descripción arancelaria:', value: id2.subPartidaArancelaria?.descripcion || '' },
        { w: 19, label: 'H6. Unidad física', value: (id2.unidadMedida || 'UNIDAD').split('(')[0].trim() },
        { w: 19, label: 'H7. Cantidad física', value: fmt(id2.cantidadUnidadFisica) },
      ], 8);

      sectionBand('H8. Descripción comercial de las mercancías', true);
      sectionBand(`DESCRIPCIONES MÍNIMAS DE LA MERCANCÍA: ${id2.descripcionMercanciaComercial?.tipoMercancia?.descripcion || 'Comunes'}`, true);

      const h8w = [39, 39, 40, 39, 39];
      row([
        { w: h8w[0], label: 'H8.1 Nombre Mercancía', value: getMiniD(minis, 'NombreMercancia') },
        { w: h8w[1], label: 'H8.2 Especifique Nombre Mercancía', value: getMini(minis, 'especifiqueNombreTxt') },
        { w: h8w[2], label: 'H8.3 Marca comercial', value: getMini(minis, 'DescripcionComerciallaMercancia') },
        { w: h8w[3], label: 'H8.4 Tipo', value: getMini(minis, 'Tipo') },
        { w: h8w[4], label: 'H8.5 Clase', value: getMini(minis, 'Clase') },
      ], 11);
      row([
        { w: h8w[0], label: 'H8.6 Modelo', value: getMini(minis, 'Modelo') },
        { w: h8w[1], label: 'H8.7 Cuantitativo 1', value: getMini(minis, 'Cuanti1') || '(-)' },
        { w: h8w[2], label: 'H8.8 Composición', value: getMini(minis, 'Composicion') || getMini(minis, 'Cuanti2') || '' },
        { w: h8w[3], label: 'H8.9 Forma de presentación', value: '' },
        { w: h8w[4], label: 'H8.10 Material', value: getMini(minis, 'Cuanti2') || '' },
      ], 11);
      row([
        { w: h8w[0], label: 'H8.11 Uso', value: getMiniD(minis, 'Uso') },
        { w: h8w[1], label: 'H8.12 Otras características', value: getMini(minis, 'OtrasCaracteristicas') || '-' },
        { w: h8w[2], label: 'H8.13 Año modelo', value: getMini(minis, 'AnoModelo') || '-' },
        { w: 78, label: 'H8.14 Año fabricación', value: getMini(minis, 'AnoFabMer') || '-' },
      ], 9);

      row([
        { w: 39, label: 'H9. Unidad comercial', value: `${id2.unidadComercial?.codigo || 'PCE'} - ${id2.unidadComercial?.descripcion || 'PIEZA'}` },
        { w: 39, label: 'H10. Cantidad comercial', value: fmt(id2.cantidadUnidadComercial) },
        { w: 40, label: 'H11. Precio unitario', value: id2.precioUnitario || '' },
        { w: 39, label: 'H12. País de origen', value: codDesc(id2.paisOrigen) },
        { w: 39, label: 'H13. Acuerdo comercial', value: id2.acuerdoComercial || '' },
      ], 7);
      row([
        { w: 39, label: 'H14. Criterio de origen', value: id2.criterioCalificacionOrigen || '' },
        { w: 39, label: 'H15. Embalaje', value: codDesc(id2.embalaje) },
        { w: 40, label: 'H16. Peso neto (kg)', value: fmt(id2.pesoNeto) },
        { w: 39, label: 'H17. Relación Ítem-N° bulto(s)', value: id2.relacionItemBulto || '' },
        { w: 39, label: 'H18. Marcas en los bultos', value: id2.marcas || '' },
      ], 7);
      row([{ w: W, label: 'H19. Estado', value: codDesc(id2.estado) }], 6);

      sectionBand('I. Información y valores de transacción por ítem');
      row([
        { w: 65, label: 'I1. Valor de transacción ítem', value: fmt(vals.valorTransaccionItemUSD) },
        { w: 65, label: 'I2. Valor FOB del ítem (USD)', value: fmt(vals.valorFOBItemUSD) },
        { w: 66, label: 'I3. Valor FOB unitario (USD)', value: fmt(vals.valorFOBUnitarioUsd) },
      ], 7);

      sectionBand('J. Observaciones del ítem');
      row([
        { w: W / 2, label: '', value: String(merc.observaciones || '') },
        { w: W / 2, label: '', value: '' },
      ], 6);

      // K. ACTUACIONES con QR
      sectionBand('K. Actuaciones');
      checkY(38);
      doc.setFillColor(...WHITE); doc.setDrawColor(...BLACK);
      doc.rect(ML, y, W * 0.55, 35, 'FD');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...BLACK);
      doc.text('Firma Declarante', ML + W * 0.55 / 2, y + 30, { align: 'center' });
      doc.rect(ML + W * 0.55, y, W * 0.45, 35, 'FD');
      drawCell(ML + W * 0.55, y, W * 0.45, 7, '', 'Código de seguridad', GRAY_LBL);
      y += 35;

      // L. DOCUMENTOS SOPORTE y M. INFORMACIÓN ADICIONAL (solo en última página de ítems)
      if (idx === mercs.length - 1) {
        drawDocumentosSoporte();
        drawInformacionAdicional();
      }

      checkY(8);
      doc.setFontSize(5.5); doc.setTextColor(130, 130, 130);
      doc.text(`Generado: ${new Date().toLocaleString('es-BO')} | DAM N°: ${id.numeroReferencia || 'UREAL01'} | v${damData.versionExcel || '2.11'} | Ítem ${idx + 1}/${mercs.length}`, PW / 2, y + 4, { align: 'center' });
      y += 6;
    });

    doc.save(`DAM_${id.numeroReferencia || 'UREAL01'}.pdf`);
  };

  // ═══════════════════════════════════════════════════════════════
  //  VISTA PREVIA
  // ═══════════════════════════════════════════════════════════════
  const GH  = '#b2b2b2';
  const GL  = '#dcdcdc';
  const BRD = '0.5px solid #666';

  const S = {
    band: {
      background: GH, borderLeft: BRD, borderRight: BRD, borderTop: BRD,
      padding: '2px 4px', fontSize: '10px', fontWeight: 'bold', color: '#000',
    },
    subBand: {
      background: GL, borderLeft: BRD, borderRight: BRD, borderTop: BRD,
      padding: '2px 4px', fontSize: '9px', fontWeight: 'bold', color: '#000',
    },
    table: { width: '100%', borderCollapse: 'collapse', border: BRD },
    th: { background: GL, border: BRD, padding: '2px 4px', fontSize: '8px', fontWeight: 'bold', textAlign: 'left', verticalAlign: 'top' },
    td: { border: BRD, padding: '2px 4px', verticalAlign: 'top', background: '#fff' },
    lbl: { fontSize: '8px', fontWeight: 'bold', color: '#333', display: 'block', lineHeight: '1.1' },
    val: { fontSize: '9px', color: '#000', display: 'block', marginTop: '1px' },
  };

  const Band = ({ children, sub = false }) => (
    <div style={sub ? S.subBand : S.band}>{children}</div>
  );

  const TCell = ({ label, value, colSpan = 1, rowSpan = 1, w, style = {} }) => (
    <td colSpan={colSpan} rowSpan={rowSpan} style={{ ...S.td, width: w, ...style }}>
      {label && <span style={S.lbl}>{label}</span>}
      <span style={S.val}>{value ?? '\u00A0'}</span>
    </td>
  );

  const Tbl = ({ children }) => (
    <table style={S.table}><tbody>{children}</tbody></table>
  );

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '12px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        ref={modalRef}
        style={{
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '95vh',
          position: 'relative',
          zIndex: 10000
        }}
      >
        {/* Barra superior */}
        <div style={{ 
          background: '#2c3e50', 
          padding: '12px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderRadius: '8px 8px 0 0',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <FileText size={18} color="#fff" />
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>Declaración Andina de Mercancías (DAM)</span>
            <span style={{ color: '#ccc', fontSize: '11px' }}>
              N°: {id.numeroReferencia || 'UREAL01'} | v{damData.versionExcel || '2.11'}
            </span>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <X size={16} /> Cerrar
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px', 
          background: '#e8e8e8',
          scrollBehavior: 'smooth'
        }}>
          <div 
            ref={reportRef} 
            style={{ 
              background: '#fff', 
              maxWidth: '900px', 
              margin: '0 auto', 
              padding: '12px', 
              border: '1px solid #aaa',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            {/* ENCABEZADO */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0', border: BRD }}>
              <tbody>
                <tr>
<td style={{ width: '22%', border: BRD, padding: '3px', verticalAlign: 'middle', textAlign: 'center' }}>
  <img 
    src="/AN_logo.png" 
    alt="Logo Aduana" 
    style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }}
    onError={(e) => {
      e.target.style.display = 'none';
      e.target.parentNode.innerHTML = `
        <div style="font-weight:bold;font-size:14px;color:#cc0000">Aduana</div>
        <div style="font-weight:bold;font-size:17px;color:#000">Nacional</div>
        <div style="font-size:9px;color:#888">Trabaja por ti</div>
      `;
    }}
  />
</td>
                  <td style={{ border: BRD, padding: '12px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>DECLARACIÓN DE ADQUISICIÓN</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>DE MERCANCÍAS</div>
                  </td>
                  <td style={{ width: '19%', border: BRD, padding: '8px 12px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '24px', lineHeight: '1' }}>DAM</div>
                    <div style={{ fontSize: '8px', marginTop: '6px' }}>DAM-{new Date().getFullYear()}-{id.numeroReferencia || ''}</div>
                    <div style={{ fontSize: '8px' }}>{id.destinoRegimenAduanero?.descripcion || 'DEPOSITO DE ADUANA'}</div>
                    <div style={{ fontSize: '8px', marginTop: '6px' }}>Hoja: &nbsp;&nbsp; 1 / {mercs.length + 1}</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* A. IDENTIFICACIÓN */}
            <Band>A. Identificación de la declaración</Band>
            <Tbl>
              <tr>
                <TCell label="A1. N° de declaración" value={id.numeroReferencia || 'DAM-20xx-xx'} w="22%" />
                <TCell label="A2. Fecha de registro" value={new Date().toLocaleDateString('es-BO') + ' ' + new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })} w="22%" />
                <TCell label="A3. N° de referencia" value={id.numeroReferencia || 'XXXX'} w="18%" />
                <TCell label={`A4. Aduana de despacho ${id.aduanaDespacho?.codigo || '201'} -`} value={id.aduanaDespacho?.descripcion || 'INTERIOR LA PAZ'} />
              </tr>
              <tr>
                <TCell label="A5. Forma de envío" value={`${id.formaEnvio?.codigo || ''} - ${id.formaEnvio?.descripcion || ''}`} />
                <TCell label="A5.1 Carga consolidada" value={id.cargaConsolidada?.descripcion || 'SI'} />
                <TCell label="A6. Destino/Régimen aduanero" value={codDesc(id.destinoRegimenAduanero)} />
                <TCell label="A7. Modalidad de régimen" value={codDesc(id.modalidadRegimen)} />
              </tr>
              <tr>
                <TCell label="A8. Modalidad de Despacho" value={codDesc(id.modalidadDespacho)} />
                <TCell label="A9. Destino/Régimen Posterior a depósito" value={codDesc(id.destinoRegimenAduanero)} />
                <TCell label="A10. Modalidad de Despacho Posterior a depósito" value={id.modDesPos || '01 - GENERAL'} />
                <TCell label="A11. Emisión de Parte de Recepción" value={codDesc(id.emiParRec)} />
              </tr>
            </Tbl>

{/* B. OPERADORES */}
<Band>B. Operadores</Band>
<table style={S.table}>
  <thead>
    <tr>
      <th style={{ ...S.th, fontSize: '9px', padding: '2px' }}>Datos</th>
      <th style={{ ...S.th, fontSize: '9px', padding: '2px' }}>Tipo de documento</th>
      <th style={{ ...S.th, fontSize: '9px', padding: '2px' }}>N° de documento</th>
      <th style={{ ...S.th, fontSize: '9px', padding: '2px' }}>Nombre/Razón social</th>
      <th style={{ ...S.th, fontSize: '9px', padding: '2px' }}>Categoría</th>
      <th style={{ ...S.th, fontSize: '9px', padding: '2px' }}>*Domicilio, Ciudad, País, Teléfono, Fax, Correo Electrónico</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style={{ ...S.td, fontSize: '9px', padding: '2px' }}>B1. Importador:</td>
      <td style={{ ...S.td, fontSize: '9px', padding: '2px' }}>{ops.importador?.tipoDocumento?.codigo || 'NIT'}</td>
      <td style={{ ...S.td, fontSize: '9px', padding: '2px' }}>{ops.importador?.numeroDocumento || ''}</td>
      <td style={{ ...S.td, fontSize: '9px', padding: '2px' }}>{ops.importador?.razonSocial || ''}</td>
      <td style={{ ...S.td, fontSize: '9px', padding: '2px' }}>{ops.importador?.categoria || ''}</td>
      <td style={{ ...S.td, fontSize: '9px', padding: '2px' }}>
        {ops.importador?.domicilio?.calleAvenida || ''} {ops.importador?.domicilio?.numero || ''}, {ops.importador?.domicilio?.barrioZona || ''}, {ops.importador?.domicilio?.ciudad || ''}, {ops.importador?.domicilio?.pais?.descripcion || ''} / {ops.importador?.domicilio?.telefono || ''} / {ops.importador?.domicilio?.correoElectronico || ''}
      </td>
    </tr>
    <tr>
      <td style={{ ...S.td, fontSize: '9px', padding: '2px' }}>B2. Consignatario:</td>
      <td style={{ ...S.td, fontSize: '9px', padding: '2px' }}>{ops.consignatario?.tipoDocumento?.codigo || 'NIT'}</td>
      <td style={{ ...S.td, fontSize: '9px', padding: '2px' }}>{ops.consignatario?.numeroDocumento || ''}</td>
      <td style={{ ...S.td, fontSize: '9px', padding: '2px' }}>{ops.consignatario?.razonSocial || ''}</td>
      <td style={{ ...S.td, fontSize: '9px', padding: '2px' }}>{ops.consignatario?.categoria || ''}</td>
      <td style={{ ...S.td, fontSize: '9px', padding: '2px' }}>
        {ops.consignatario?.domicilio?.calleAvenida || ''} {ops.consignatario?.domicilio?.numero || ''}, {ops.consignatario?.domicilio?.barrioZona || ''}, {ops.consignatario?.domicilio?.ciudad || ''}, {ops.consignatario?.domicilio?.pais?.descripcion || ''} / {ops.consignatario?.domicilio?.telefono || ''} / {ops.consignatario?.domicilio?.correoElectronico || ''}
      </td>
    </tr>
    <tr>
      <td style={{ ...S.td, fontSize: '7px', padding: '2px' }}>B3. Declarante:</td>
      <td style={{ ...S.td, fontSize: '7px', padding: '2px' }}>{ops.declarante?.tipoDocumento?.codigo || 'NIT'}</td>
      <td style={{ ...S.td, fontSize: '7px', padding: '2px' }}>{ops.declarante?.numeroDocumento || ''}</td>
      <td style={{ ...S.td, fontSize: '7px', padding: '2px' }}>{ops.declarante?.razonSocial || ''}</td>
      <td style={{ ...S.td, fontSize: '7px', padding: '2px' }}>{ops.declarante?.categoria || ''}</td>
      <td style={{ ...S.td, fontSize: '7px', padding: '2px' }}>
        {ops.declarante?.domicilio?.calleAvenida || ''} {ops.declarante?.domicilio?.numero || ''}, {ops.declarante?.domicilio?.barrioZona || ''}, {ops.declarante?.domicilio?.ciudad || ''}, {ops.declarante?.domicilio?.pais?.descripcion || ''} / {ops.declarante?.domicilio?.telefono || ''} / {ops.declarante?.domicilio?.correoElectronico || ''}
      </td>
    </tr>
  </tbody>
</table>

            {/* C. LUGARES */}
            <Band>C. Lugares</Band>
            <Tbl>
              <tr>
                <TCell label="C1. País de exportación" value={codDesc(lug.paisExportacion)} />
                <TCell label="C2. País de procedencia" value={codDesc(lug.paisProcedencia)} />
                <TCell label="C3. País de tránsito" value={codDesc(lug.paisTransito)} />
                <TCell label="C4. Aduana de ingreso" value={codDesc(lug.aduanaIngreso)} />
                <TCell label="C5. Aduana de destino" value={codDesc(lug.aduanaDestino)} />
                <TCell label="C6. Lugar de entrega" value={lug.lugarEntrega || ''} />
              </tr>
            </Tbl>

            {/* D. TRANSPORTE */}
            <Band>D. Transporte.</Band>
            <Tbl>
              <tr><TCell colSpan={4} label="D1.1 Tipo de Documento de Embarque" value={codDesc(emb.tipoDocumentoEmbarque)} /></tr>
              <tr><TCell label="D1.2 N° de documento de embarque" value={emb.numeroDocumentoEmbarque || ''} /><TCell label="1.3 País de embarque" value={codDesc(emb.paisEmbarque)} /><TCell colSpan={2} label="D1.4 Lugar de embarque" value={codDesc(emb.lugarEmbarque)} /></tr>
              <tr><TCell label="D1.5 Fecha de embarque" value={emb.fechaEmbarque || ''} /><TCell label="D1.6 Proviene de Zona Franca" value={emb.provieneZonaFranca?.descripcion || 'NO'} /><TCell label="D2. Modalidad de transporte hasta frontera" value={codDesc(tr.hastaFrontera)} /><TCell label="D3. Modalidad de transporte desde frontera" value={codDesc(tr.desdeFrontera)} /></tr>
            </Tbl>

            {/* TOTALES CONTROL */}
            <Band>Totales para control de la declaración</Band>
            <Tbl>
              <tr>
                <TCell label="Total N° de facturas" value="1" />
                <TCell label="Total N° de Items" value={totC.totalItems || mercs.length} />
                <TCell label="Valor FOB Total (USD)" value={fmt(valC.valorFobTotalUsd || totG.totalFob)} />
                <TCell label="Total N° de bultos" value={totG.totalBultos || ''} />
                <TCell label="Total peso bruto (kg)" value={fmt(totG.totalPesoBruto)} />
                <TCell label="Total peso neto (kg)" value={fmt(totC.totalPesoNeto)} />
              </tr>
            </Tbl>

            {/* E. INFORMACIÓN FACTURA */}
            <Band>E. Información y valores totales de la factura</Band>
            <Tbl>
              <tr><td colSpan={4} style={S.td}><span style={S.lbl}>E1. Proveedor:</span><span style={S.val}>{prov.razonSocial || ''}, {prov.domicilio?.calleAvenida || ''} {prov.domicilio?.numero || ''}, {prov.domicilio?.barrioZona || ''} {codDesc(prov.domicilio?.ciudad)}, {codDesc(prov.domicilio?.pais)}, ({prov.domicilio?.telefonoFax || ''}), {prov.domicilio?.correoElectronico || ''}</span></td></tr>
              <tr><TCell label="E1.1 Condición" value={codDesc(txn.proveedor?.condicionVendedor)} /><TCell label="E2. País de adquisición" value={codDesc(txn.proveedor?.paisAdquisicion)} /><TCell label="E6. Lugar de entrega" value={det.incoterms?.lugarEntrega || ''} /><TCell label="E7. Naturaleza transacción" value={codDesc(det.naturalezaTransaccion)} /></tr>
              <tr><TCell label="E3. N° de la factura" value={det.numeroFactura || ''} /><TCell label="E4. Fecha de la factura" value={det.fechaFactura || ''} /><TCell label="E5. Condición de entrega" value={codDesc(det.incoterms?.condicionEntrega)} /><TCell label="E11. Destino de la mercancía" value={codDesc(det.destinoMercancia)} /></tr>
              <tr><TCell label="E8. Moneda de transacción" value={codDesc(det.monedaTransaccion)} /><TCell label="E9. Valor de transacción" value={fmt(det.valorTransaccion)} /><TCell label="E10. T/C moneda de transacción" value={det.tipoCambio === 0 ? '0 (No aplica)' : String(det.tipoCambio || '')} /><TCell label="E12. Factura sujeta a descuento" value={det.facturaSujetoDescuento === 'true' ? 'SI' : 'NO'} /></tr>
              <tr><td colSpan={4} style={{ ...S.td, background: GL, fontWeight: 'bold', fontSize: '8px', padding: '2px 4px' }}>Detalles del pago de la transacción</td></tr>
              <tr><TCell label="E13. Forma de pago" value={`${pago.formaPago?.codigo || ''} - ${pago.formaPago?.descripcion || ''}`} /><TCell label="E14. Medio de pago" value={codDesc(pago.medioPago)} /><TCell label="E15. Valor FOB total (USD)" value={fmt(valC.valorFobTotalUsd || totG.totalFob)} /><TCell label="E16. Valor CIF total (USD)" value={fmt(valC.valorCifTotalUsd || 0)} /></tr>
            </Tbl>

            {/* F. TOTALES FACTURA */}
            <Band>F. Totales para control de la factura</Band>
            <Tbl>
              <tr><TCell label="F1. Total N° de páginas" value={totC.numeroPaginas || '1'} /><TCell label="F2. Total N° de Items" value={totC.totalItems || mercs.length} /><TCell label="F3. Total peso neto (kg)" value={fmt(totC.totalPesoNeto)} /></tr>
            </Tbl>

            {/* G. OBSERVACIONES */}
            <Band>G. Observaciones generales de la factura</Band>
            <Tbl>
              <tr><td style={{ ...S.td, fontSize: '9px' }}>{txn.observacionesGenerales || 'MERCANCÍA NUEVA — IMPORTACIÓN PARA CONSUMO'}</td></tr>
            </Tbl>

            {/* ÍTEMS */}
            {mercs.map((merc, idx) => {
              const id2 = merc.identificacionMercanciaItem || {};
              const vals = merc.informacionValoresTransaccionItem || {};
              const minis = id2.descripcionMercanciaComercial?.descripcionMinimasMercancias || [];
              const isLastItem = idx === mercs.length - 1;
              
              return (
                <div key={idx} style={{ marginTop: idx === 0 ? '0' : '12px' }}>
                  <Band>H. Identificación de la mercancía por ítem</Band>
                  <Tbl>
                    <tr>
                      <TCell label="H1. N° ítem" value={String(idx + 1)} w="7%" />
                      <TCell label="H3. Subpartida arancelaria" value={id2.subPartidaArancelaria?.codigo || ''} w="24%" />
                      <TCell label="Descripción arancelaria:" value={id2.subPartidaArancelaria?.descripcion || ''} w="42%" />
                      <TCell label="H6. Unidad física" value={(id2.unidadMedida || '').split('(')[0].trim() || 'UNIDAD'} w="14%" />
                      <TCell label="H7. Cantidad física" value={fmt(id2.cantidadUnidadFisica)} w="13%" />
                    </tr>
                  </Tbl>
                  <Band sub>H8. Descripción comercial de las mercancías</Band>
                  <Band sub>{`DESCRIPCIONES MÍNIMAS DE LA MERCANCÍA: ${id2.descripcionMercanciaComercial?.tipoMercancia?.descripcion || 'Comunes'}`}</Band>
                  <Tbl>
                    <tr>
                      <TCell label="H8.1 Nombre Mercancía" value={getMiniD(minis, 'NombreMercancia')} />
                      <TCell label="H8.2 Especifique Nombre Mercancía" value={getMini(minis, 'especifiqueNombreTxt')} />
                      <TCell label="H8.3 Marca comercial" value={getMini(minis, 'DescripcionComerciallaMercancia')} />
                      <TCell label="H8.4 Tipo" value={getMini(minis, 'Tipo')} />
                      <TCell label="H8.5 Clase" value={getMini(minis, 'Clase')} />
                    </tr>
                    <tr>
                      <TCell label="H8.6 Modelo" value={getMini(minis, 'Modelo')} />
                      <TCell label="H8.7 Cuantitativo 1" value={getMini(minis, 'Cuanti1') || '(-)'} />
                      <TCell label="H8.8 Composición" value={getMini(minis, 'Composicion') || getMini(minis, 'Cuanti2') || ''} />
                      <TCell label="H8.9 Forma de presentación" value={''} />
                      <TCell label="H8.10 Material" value={getMini(minis, 'Cuanti2') || ''} />
                    </tr>
                    <tr>
                      <TCell label="H8.11 Uso" value={getMiniD(minis, 'Uso')} />
                      <TCell label="H8.12 Otras características" value={getMini(minis, 'OtrasCaracteristicas') || '-'} />
                      <TCell label="H8.13 Año modelo" value={getMini(minis, 'AnoModelo') || '-'} />
                      <td colSpan={2} style={S.td}><span style={S.lbl}>H8.14 Año fabricación</span><span style={S.val}>{getMini(minis, 'AnoFabMer') || '-'}</span></td>
                    </tr>
                    <tr>
                      <TCell label="H9. Unidad comercial" value={`${id2.unidadComercial?.codigo || 'PCE'} - ${id2.unidadComercial?.descripcion || 'PIEZA'}`} />
                      <TCell label="H10. Cantidad comercial" value={fmt(id2.cantidadUnidadComercial)} />
                      <TCell label="H11. Precio unitario" value={id2.precioUnitario || ''} />
                      <TCell label="H12. País de origen" value={codDesc(id2.paisOrigen)} />
                      <TCell label="H13. Acuerdo comercial" value={id2.acuerdoComercial || ''} />
                    </tr>
                    <tr>
                      <TCell label="H14. Criterio de origen" value={id2.criterioCalificacionOrigen || ''} />
                      <TCell label="H15. Embalaje" value={codDesc(id2.embalaje)} />
                      <TCell label="H16. Peso neto (kg)" value={fmt(id2.pesoNeto)} />
                      <TCell label="H17. Relación Ítem-N° bulto(s)" value={id2.relacionItemBulto || ''} />
                      <TCell label="H18. Marcas en los bultos" value={id2.marcas || ''} />
                    </tr>
                    <tr><TCell colSpan={5} label="H19. Estado" value={codDesc(id2.estado)} /></tr>
                  </Tbl>
                  <Band>I. Información y valores de transacción por ítem</Band>
                  <Tbl>
                    <tr>
                      <TCell label="I1. Valor de transacción ítem" value={fmt(vals.valorTransaccionItemUSD)} />
                      <TCell label="I2. Valor FOB del ítem (USD)" value={fmt(vals.valorFOBItemUSD)} />
                      <TCell label="I3. Valor FOB unitario (USD)" value={fmt(vals.valorFOBUnitarioUsd)} />
                      <td style={S.td}></td>
                    </tr>
                  </Tbl>
                  <Band>J. Observaciones del ítem</Band>
                  <Tbl>
                    <tr>
                      <td style={{ ...S.td, fontSize: '9px' }} colSpan={2}>{String(merc.observaciones || '\u00A0')}</td>
                      <td style={S.td} colSpan={2}></td>
                    </tr>
                  </Tbl>

                  {/* K. ACTUACIONES con QR - solo en el último ítem */}
                  {isLastItem && (
                    <>
                      <Band>K. Actuaciones</Band>
                      <table style={S.table}>
                        <tbody>
                          <tr>
                            <td style={{ ...S.td, width: '55%', textAlign: 'center', verticalAlign: 'top', padding: '8px' }}>
                              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                                <QRCodeSVG 
                                  value={`DAM-${new Date().getFullYear()}-${id.numeroReferencia || 'UREAL01'}|${new Date().toISOString()}|${id.numeroReferencia || ''}|${totG.totalFob}|${totG.totalBultos}`}
                                  size={60}
                                  bgColor="#ffffff"
                                  fgColor="#000000"
                                  level="H"
                                  includeMargin={true}
                                />
                              </div>
                              <div style={{ marginTop: '10px', paddingTop: '20px', borderTop: '1px solid #000', width: '80%', margin: '0 auto', fontSize: '9px' }}>
                                Firma Declarante
                              </div>
                            </td>
                            <td style={{ ...S.td, verticalAlign: 'top', padding: '8px' }}>
                              <div style={{ background: GL, fontWeight: 'bold', fontSize: '8px', padding: '2px 4px', border: BRD, textAlign: 'center' }}>
                                Código de seguridad
                              </div>
                              <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px' }}>
                                {`${Math.random().toString(36).substring(2, 10).toUpperCase()}`}
                              </div>
                              <div style={{ fontSize: '7px', textAlign: 'center', color: '#666', marginTop: '5px' }}>
                                Generado automáticamente
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  )}

                  {/* L. Documentos de la declaración y M. Información adicional - solo en el último ítem */}
{/* L. Documentos de la declaración - versión ultra compacta */}
{isLastItem && (
  <>
    <Band>L. Documentos de la declaración</Band>
    <div style={{ fontSize: '8px', fontWeight: 'bold', background: GL, padding: '2px 4px', border: BRD, marginTop: '1px' }}>
      L.1 Documentos soporte
    </div>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px' }}>
      <thead>
        <tr>
          <th style={{ background: GL, border: BRD, padding: '2px 3px', fontWeight: 'bold' }}>Nº</th>
          <th style={{ background: GL, border: BRD, padding: '2px 3px', fontWeight: 'bold' }}>Tipo documento</th>
          <th style={{ background: GL, border: BRD, padding: '2px 3px', fontWeight: 'bold' }}>Número</th>
          <th style={{ background: GL, border: BRD, padding: '2px 3px', fontWeight: 'bold' }}>Emisor</th>
          <th style={{ background: GL, border: BRD, padding: '2px 3px', fontWeight: 'bold' }}>Fecha emisión</th>
          <th style={{ background: GL, border: BRD, padding: '2px 3px', fontWeight: 'bold' }}>Monto</th>
        </tr>
      </thead>
      <tbody>
        {documentosSoporte.map((doc, idxDoc) => (
          <tr key={idxDoc}>
            <td style={{ border: BRD, padding: '2px 3px' }}>{idxDoc + 1}</td>
            <td style={{ border: BRD, padding: '2px 3px' }}>{doc.tipo.split(' -')[0]}</td>
            <td style={{ border: BRD, padding: '2px 3px' }}>{doc.numero}</td>
            <td style={{ border: BRD, padding: '2px 3px' }}>{doc.emisor.substring(0, 35)}</td>
            <td style={{ border: BRD, padding: '2px 3px' }}>{doc.fechaEmision}</td>
            <td style={{ border: BRD, padding: '2px 3px' }}>{doc.monto ? `USD ${doc.monto}` : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <Band>M. Información adicional</Band>
    <div style={{ border: BRD, padding: '3px 4px', fontSize: '7.5px', background: '#fff' }}>
      Mercancía nueva - Importación bajo DAP La Paz, Bolivia. El comprador es responsable de todos los impuestos de importación en Bolivia (IVA 14.94% y aranceles).
    </div>
  </>
)}
                </div>
              );
            })}

            {/* Pie */}
            <div style={{ fontSize: '8px', color: '#999', textAlign: 'center', marginTop: '6px', borderTop: '0.5px solid #ccc', paddingTop: '5px' }}>
              Documento generado electrónicamente el: {new Date().toLocaleString('es-BO')} — DAM N°: {id.numeroReferencia || 'UREAL01'} — v{damData.versionExcel || '2.11'}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div style={{ 
          borderTop: '1px solid #ddd', 
          padding: '12px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: '#f8f9fa', 
          borderRadius: '0 0 8px 8px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <span style={{ fontSize: '12px', color: '#666' }}>
            📊 {mercs.length} ítems &nbsp;·&nbsp; FOB Total: <b>${fmt(totG.totalFob)} USD</b> &nbsp;·&nbsp; {totG.totalBultos || 0} bultos &nbsp;·&nbsp; {fmt(totG.totalPesoBruto)} kg
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={onClose} 
              style={{ 
                padding: '8px 20px', 
                fontSize: '13px', 
                background: '#fff', 
                border: '1px solid #ccc', 
                borderRadius: '6px', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.borderColor = '#999'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#ccc'; }}
            >
              Cancelar
            </button>
            <button 
              id="capture-btn" 
              onClick={captureScreenshot} 
              style={{ 
                padding: '8px 20px', 
                fontSize: '13px', 
                background: '#4CAF50', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#45a049'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#4CAF50'}
            >
              📸 Capturar Imagen
            </button>
            <button 
              onClick={generatePDF} 
              style={{ 
                padding: '8px 20px', 
                fontSize: '13px', 
                background: '#2c3e50', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1a2a3a'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2c3e50'}
            >
              <Download size={14} /> Descargar PDF Oficial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamReport;