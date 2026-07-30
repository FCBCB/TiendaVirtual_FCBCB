// src/pages/Dashboard/MIC.jsx
import React, { useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Download, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * MIC — Manifiesto Internacional de Carga por Carretera / DTA
 */
const MIC = ({ micData = {}, onClose }) => {
  const modalRef = useRef();
  const reportRef = useRef();

  const g = (path, fb = '') => {
    const keys = path.split('.');
    let v = micData;
    for (const k of keys) {
      if (v === undefined || v === null) return fb;
      v = v[k];
    }
    if (v === undefined || v === null) return fb;
    if (typeof v === 'object') {
      if (v.nombre) return String(v.nombre);
      if (v.direccion) return String(v.direccion);
      return '';
    }
    return String(v);
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose?.();
  };

// ═══════════════════════════════════════════════════════════════
//  GENERACIÓN PDF EN FORMATO CARTA
// ═══════════════════════════════════════════════════════════════
const generatePDF = async () => {
  if (!reportRef.current) return;
  
  try {
    const { toPng } = await import('html-to-image');
    
    const button = document.getElementById('pdf-btn');
    const originalText = button?.innerHTML || 'Descargar PDF';
    
    if (button) {
      button.innerHTML = 'Generando PDF...';
      button.disabled = true;
    }
    
    const element = reportRef.current;
    
    const originalStyle = {
      width: element.style.width,
      minWidth: element.style.minWidth,
      maxWidth: element.style.maxWidth,
      overflow: element.style.overflow
    };
    
    element.style.width = '650px';
    element.style.minWidth = '650px';
    element.style.maxWidth = '650px';
    element.style.overflow = 'visible';
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      width: 650,
      height: element.scrollHeight,
      cacheBust: true
    });
    
    element.style.width = originalStyle.width;
    element.style.minWidth = originalStyle.minWidth;
    element.style.maxWidth = originalStyle.maxWidth;
    element.style.overflow = originalStyle.overflow;
    
    const doc = new jsPDF({
      unit: 'mm',
      format: 'letter',
      orientation: 'portrait'
    });
    
    const pdfWidth = doc.internal.pageSize.getWidth();
    const margin = 8;
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (element.scrollHeight * imgWidth) / 650;
    
    let heightLeft = imgHeight;
    let position = margin;
    
    doc.addImage(dataUrl, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= (doc.internal.pageSize.getHeight() - margin * 2);
    
    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft);
      doc.addPage();
      doc.addImage(dataUrl, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (doc.internal.pageSize.getHeight() - margin * 2);
    }
    
    // ✅ CORREGIDO: usar 'numero' en lugar de 'bolNo'
    doc.save(`MIC_${g('numero', 'SIN-NUMERO')}.pdf`);
    
    if (button) {
      button.innerHTML = originalText;
      button.disabled = false;
    }
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('Error al generar el PDF. Por favor, intenta de nuevo.');
    
    const button = document.getElementById('pdf-btn');
    if (button) {
      button.innerHTML = 'Descargar PDF';
      button.disabled = false;
    }
  }
};

  // Datos para QR (firma digital)
  const qrData = JSON.stringify({
    tipo: 'MIC',
    numero: g('numero'),
    porteador: g('porteador.nombre', '').substring(0, 50),
    destinatario: g('destinatario.nombre', '').substring(0, 50),
    fechaEmision: g('fechaEmision'),
    pesoTotal: g('pesoBruto'),
    timestamp: new Date().toISOString()
  });

  // ─────────────────────────────────────────
  // Código de barras
  // ─────────────────────────────────────────
  const Barcode = ({ value = '', height = 28, fontSize = 7 }) => {
    if (!value) return null;

    const CODE128B = {
      ' ': '11011001100', '!': '11001101100', '"': '11001100110', '#': '10010011000',
      '$': '10010001100', '%': '10001001100', '&': '10011001000', "'": '10011000100',
      '(': '10001100100', ')': '11001001000', '*': '11001000100', '+': '11000100100',
      ',': '10110011100', '-': '10011011100', '.': '10011001110', '/': '10111001100',
      '0': '10011101100', '1': '10011100110', '2': '11001110010', '3': '11001011100',
      '4': '11001001110', '5': '11011100100', '6': '11001110100', '7': '11101101110',
      '8': '11101001100', '9': '11100101100', ':': '11100100110', ';': '11101100100',
      '<': '11100110100', '=': '11100110010', '>': '11110101110', '?': '11110100110',
      '@': '11100101110', 'A': '11101100010', 'B': '11101011100', 'C': '11101001110',
      'D': '11100101100', 'E': '11100100110', 'F': '11100110010', 'G': '11011011000',
      'H': '11011000110', 'I': '11000110110', 'J': '10100011000', 'K': '10001011000',
      'L': '10001000110', 'M': '10110001000', 'N': '10001101000', 'O': '10001100010',
      'P': '11010001000', 'Q': '11000101000', 'R': '11000100010', 'S': '10110111000',
      'T': '10110001110', 'U': '10001101110', 'V': '10111011000', 'W': '10111000110',
      'X': '10001110110', 'Y': '11101110110', 'Z': '11010001110',
    };
    const START_B = '11010010000';
    const STOP = '1100011101011';

    let bits = START_B;
    let checksum = 104;
    const chars = value.toUpperCase().split('');
    chars.forEach((ch, i) => {
      const pattern = CODE128B[ch] || CODE128B[' '];
      bits += pattern;
      const charVal = ch.charCodeAt(0) - 32;
      checksum += charVal * (i + 1);
    });
    const checkVal = checksum % 103;
    const checkChar = String.fromCharCode(checkVal + 32);
    bits += (CODE128B[checkChar] || CODE128B[' ']);
    bits += STOP;

    const barW = 1.2;
    const totalW = bits.length * barW;

    return (
      <svg width={totalW} height={height + fontSize + 4} xmlns="http://www.w3.org/2000/svg">
        {bits.split('').map((bit, i) =>
          bit === '1' ? <rect key={i} x={i * barW} y={0} width={barW} height={height} fill="#000" /> : null
        )}
        <text x={totalW / 2} y={height + fontSize + 1} textAnchor="middle" fontSize={fontSize} fontFamily="monospace" fill="#000">
          {value}
        </text>
      </svg>
    );
  };

  // ─────────────────────────────────────────
  // Estilos
  // ─────────────────────────────────────────
  const B = '0.6px solid #333';
  const Bt = '0.4px solid #555';

  const cellStyle = (extra = {}) => ({
    border: Bt, padding: '2px 3px', boxSizing: 'border-box', verticalAlign: 'top', ...extra,
  });
  const labelStyle = { fontSize: '5.5px', fontWeight: 'bold', lineHeight: '1.2', color: '#222', marginBottom: '1px' };
  const valueStyle = { fontSize: '7.5px', lineHeight: '1.35', color: '#000', whiteSpace: 'pre-wrap' };

  const Cell = ({ label, value, style = {}, children }) => (
    <div style={cellStyle(style)}>
      {label && <div style={labelStyle}>{label}</div>}
      {value !== undefined && <div style={valueStyle}>{value}</div>}
      {children}
    </div>
  );

  const Row = ({ children, style = {} }) => (
    <div style={{ display: 'flex', width: '100%', ...style }}>{children}</div>
  );

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 9999, padding: '10px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        overflowY: 'auto',
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: '#fff', borderRadius: '5px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          width: '100%', maxWidth: '720px',
          display: 'flex', flexDirection: 'column',
          marginTop: '10px', marginBottom: '10px',
        }}
      >
        {/* Barra superior */}
        <div style={{ background: '#0d2137', padding: '9px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '5px 5px 0 0' }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
            MIC/DTA — Manifiesto Internacional de Carga — N°: {g('numero', '—')}
          </span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
            <X size={14} /> Cerrar
          </button>
        </div>

        {/* Contenido */}
        <div style={{ overflowY: 'auto', padding: '12px', background: '#ccc' }}>
          <div
            ref={reportRef}
            style={{ background: '#fff', maxWidth: '650px', margin: '0 auto', border: B, boxSizing: 'border-box', fontSize: '6.5px' }}
          >
            {/* ══ ENCABEZADO con QR ══ */}
            <Row style={{ borderBottom: Bt, minHeight: '50px' }}>
              <div style={{ width: '100px', flexShrink: 0, background: '#d0d0d0', border: Bt, padding: '4px 6px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <QRCodeSVG value={qrData} size={45} bgColor="#ffffff" fgColor="#000000" level="H" includeMargin={true} />
                <span style={{ fontSize: '5px', marginTop: '2px' }}>Firma Digital</span>
              </div>
              <div style={{ flex: 1, border: Bt, padding: '4px 6px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '9px', lineHeight: '1.3' }}>
                  Manifiesto Internacional de Carga por Carretera / Declaración de Tránsito Aduanero
                </div>
                <div style={{ fontSize: '6.5px', color: '#444', fontStyle: 'italic', lineHeight: '1.3' }}>
                  Manifesto Internacional de Carga Rodoviária / Declaração de Trânsito Aduaneiro
                </div>
              </div>
              <div style={{ width: '80px', border: Bt, padding: '4px', textAlign: 'center', background: '#d0d0d0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>MIC</div>
                <div style={{ fontSize: '6px' }}>/ DTA</div>
              </div>
            </Row>

            {/* ══ FILA 1: Porteador | Tránsito + Nº + Hoja + Fecha ══ */}
            <Row>
              <div style={{ width: '55%' }}>
                <Cell
                  label="1 Nombre y domicilio del porteador"
                  value={[g('porteador.nombre'), g('porteador.direccion'), g('porteador.extra')].filter(Boolean).join('\n')}
                  style={{ minHeight: '55px' }}
                />
              </div>
              <div style={{ width: '45%' }}>
                <Row>
                  <Cell label="3 Tránsito aduanero" value={g('transito', 'SI')} style={{ width: '35%', minHeight: '18px' }} />
                  <div style={cellStyle({ flex: 1, minHeight: '18px', background: '#f5f5f5', textAlign: 'center' })}>
                    <div style={labelStyle}>4 Nº</div>
                    <div style={{ fontSize: '9px', fontWeight: 'bold' }}>{g('numero')}</div>
                  </div>
                </Row>
                <Cell value={g('numeroRef')} style={{ minHeight: '10px', background: '#f9f9f9', fontSize: '6px' }} />
                <Row>
                  <Cell label="5 Hoja" value={g('hoja', '1/1')} style={{ width: '40%', minHeight: '14px' }} />
                  <Cell label="6 Fecha emisión" value={g('fechaEmision')} style={{ flex: 1, minHeight: '14px' }} />
                </Row>
              </div>
            </Row>

            {/* ══ FILA 2: Aduana partida + RUT | Destino ══ */}
            <Row>
              <Cell label="7 Aduana, ciudad y país de partida" value={g('aduanaPartida')} style={{ width: '35%', minHeight: '16px' }} />
              <Cell label="2 Rol de contribuyente / RUT" value={g('rutPorteador')} style={{ width: '20%', minHeight: '16px' }} />
              <Cell label="8 Ciudad y país de destino final" value={g('destinoFinal')} style={{ flex: 1, minHeight: '16px' }} />
            </Row>

            {/* ══ FILA 3: Camión Original | Camión Sustituto ══ */}
            <Row>
              <div style={{ width: '55%' }}>
                <Cell label="9 CAMIÓN ORIGINAL: Propietario" value={[g('camionOriginal.propietario'), g('camionOriginal.direccion')].filter(Boolean).join('\n')} style={{ minHeight: '32px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Cell label="16 CAMIÓN SUSTITUTO: Propietario" value={[g('camionSustituto.propietario'), g('camionSustituto.direccion')].filter(Boolean).join('\n')} style={{ minHeight: '32px' }} />
              </div>
            </Row>

            {/* ══ FILA 4-6: Datos camión ══ */}
            <Row>
              <Cell label="10 RUT" value={g('camionOriginal.rut')} style={{ width: '22%', minHeight: '14px' }} />
              <Cell label="11 Placa" value={g('camionOriginal.placa')} style={{ width: '33%', minHeight: '14px' }} />
              <Cell label="17 RUT" value={g('camionSustituto.rut', '')} style={{ width: '22%', minHeight: '14px' }} />
              <Cell label="18 Placa" value={g('camionSustituto.placa', '')} style={{ flex: 1, minHeight: '14px' }} />
            </Row>
            <Row>
              <Cell label="12 Marca y número" value={[g('camionOriginal.marca'), g('camionOriginal.vin')].filter(Boolean).join('\n')} style={{ width: '22%', minHeight: '18px' }} />
              <Cell label="13 Capacidad (t)" value={g('camionOriginal.capacidad')} style={{ width: '33%', minHeight: '18px' }} />
              <Cell label="19 Marca y número" value={g('camionSustituto.marca', '')} style={{ width: '22%', minHeight: '18px' }} />
              <Cell label="20 Capacidad (t)" value={g('camionSustituto.capacidad', '')} style={{ flex: 1, minHeight: '18px' }} />
            </Row>
            <Row>
              <Cell label="14 Año" value={g('camionOriginal.anio')} style={{ width: '22%', minHeight: '14px' }} />
              <Cell label="15 Remolque" value={g('camionOriginal.remolque')} style={{ width: '33%', minHeight: '14px' }} />
              <Cell label="21 Año" value={g('camionSustituto.anio', '')} style={{ width: '22%', minHeight: '14px' }} />
              <Cell label="22 Remolque" value={g('camionSustituto.remolque', '')} style={{ flex: 1, minHeight: '14px' }} />
            </Row>

            {/* ══ FILA 7: Carta Porte + Aduana Destino | Remitente ══ */}
            <Row>
              <div style={{ width: '55%' }}>
                <Row>
                  <Cell label="23 Nº carta porte" value={g('cartaPorte')} style={{ width: '40%', minHeight: '28px' }} />
                  <Cell label="24 Aduana destino" value={[g('aduanaDestino'), g('depFiscal')].filter(Boolean).join('\n')} style={{ flex: 1, minHeight: '28px' }} />
                </Row>
              </div>
              <Cell label="33 Remitente" value={[g('remitente.nombre'), g('remitente.direccion')].filter(Boolean).join('\n')} style={{ flex: 1, minHeight: '28px' }} />
            </Row>

            {/* ══ FILA 8: Valores | Destinatario ══ */}
            <Row>
              <div style={{ width: '55%' }}>
                <Row>
                  <Cell label="25 Moneda" value={g('moneda')} style={{ width: '18%', minHeight: '30px' }} />
                  <Cell label="26 Origen" value={g('origenMercancia')} style={{ width: '22%', minHeight: '30px' }} />
                  <Cell label="27 Valor FOT" value={g('valorFOT')} style={{ width: '20%', minHeight: '30px' }} />
                  <Cell label="28 Flete US$" value={g('fleteUSD')} style={{ width: '20%', minHeight: '30px' }} />
                  <Cell label="29 Seguro US$" value={g('seguroUSD')} style={{ flex: 1, minHeight: '30px' }} />
                </Row>
              </div>
              <Cell label="34 Destinatario" value={[g('destinatario.nombre'), `NIT ${g('destinatario.nit')}`, g('destinatario.direccion')].filter(Boolean).join('\n')} style={{ flex: 1, minHeight: '30px' }} />
            </Row>

            {/* ══ FILA 9: Bultos | Consignatario ══ */}
            <Row>
              <div style={{ width: '55%' }}>
                <Row>
                  <div style={cellStyle({ width: '28%', minHeight: '28px' })}>
                    <div style={labelStyle}>30 Tipo bultos</div>
                    <div style={{ fontSize: '8px', fontWeight: 'bold' }}>{g('tipoBultos')}</div>
                    <div style={{ fontSize: '7px' }}>{g('tipoBultosNum')}</div>
                  </div>
                  <Cell label="31 Cantidad bultos" value={g('cantidadBultos')} style={{ width: '36%', minHeight: '28px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }} />
                  <Cell label="32 Peso bruto (kg)" value={g('pesoBruto')} style={{ flex: 1, minHeight: '28px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }} />
                </Row>
              </div>
              <Cell label="35 Consignatario" value={[g('consignatario.nombre'), `NIT ${g('consignatario.nit')}`, g('consignatario.direccion')].filter(Boolean).join('\n')} style={{ flex: 1, minHeight: '28px' }} />
            </Row>

            {/* ══ FILA 10: Documentos Anexos ══ */}
            <Row>
              <Cell label="36 Documentos anexos" value={g('documentosAnexos')} style={{ width: '55%', minHeight: '24px' }} />
              <Cell style={{ flex: 1, minHeight: '24px' }} />
            </Row>

            {/* ══ FILA 11: Precintos ══ */}
            <Row>
              <Cell label="37 Número de los precintos" value={g('precintos', '')} style={{ flex: 1, minHeight: '12px' }} />
            </Row>

            {/* ══ FILA 12: Descripción mercancías ══ */}
            <Row>
              <div style={cellStyle({ flex: 1, minHeight: '75px' })}>
                <div style={labelStyle}>38 Marcas y números de los bultos, descripción de las mercancías</div>
                <div style={{ fontSize: '7px', lineHeight: '1.4', marginTop: '3px', whiteSpace: 'pre-wrap' }}>{g('descripcionMercancia')}</div>
              </div>
            </Row>

            {/* ══ FILA 13: Declaración | DTA ══ */}
            <Row>
              <div style={cellStyle({ width: '55%', minHeight: '60px' })}>
                <div style={{ fontSize: '5px', lineHeight: '1.4', color: '#333' }}>
                  Declaramos que las informaciones prestadas en este Documento son expresión de verdad, que los datos referentes a las
                  mercancías fueron transcriptos exactamente conforme a la declaración del remitente, los cuales son de su exclusiva
                  responsabilidad, y que esta operación obedece a lo dispuesto en el Convenio sobre Transporte Internacional Terrestre
                  de los Países del Cono Sur.
                </div>
              </div>
              <div style={cellStyle({ flex: 1, minHeight: '60px' })}>
                <div style={labelStyle}>40 Nº DTA, ruta y plazo de transporte</div>
                <div style={{ fontSize: '6.5px', lineHeight: '1.35', whiteSpace: 'pre-wrap' }}>{g('rutaDTA')}</div>
                <div style={{ marginTop: '4px', fontSize: '6px' }}>RUT {g('rutDTA')}</div>
                <div style={{ marginTop: '2px', fontSize: '7px', fontWeight: 'bold' }}>{g('firmaDTA')}</div>
                <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center' }}>
                  <Barcode value={g('numero')} height={20} fontSize={5.5} />
                </div>
              </div>
            </Row>

            {/* ══ FILA 14: Firmas ══ */}
            <Row>
              <div style={cellStyle({ width: '55%', minHeight: '45px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}>
                <div style={labelStyle}>39 Firma y sello del porteador</div>
                <div style={{ fontSize: '7px', fontWeight: 'bold', marginTop: '6px' }}>{g('firmaPorteador')}</div>
                <div style={{ fontSize: '6px', color: '#555', marginTop: '6px', borderTop: '0.4px solid #aaa', paddingTop: '4px', width: '60%' }}>
                  Fecha / Data
                </div>
              </div>
              <div style={cellStyle({ flex: 1, minHeight: '45px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}>
                <div style={labelStyle}>41 Firma y sello de la Aduana de Partida</div>
                <div style={{ marginTop: 'auto', paddingTop: '6px', borderTop: '0.4px solid #aaa', width: '60%', fontSize: '6px', color: '#555' }}>
                  Fecha / Data
                </div>
              </div>
            </Row>

            {/* Pie */}
            <div style={{ padding: '3px 6px', textAlign: 'center', fontSize: '5.5px', color: '#999', borderTop: '0.5px solid #bbb' }}>
              Generado: {new Date().toLocaleString('es-BO')} | MIC N°: {g('numero', '—')} | Firma Digital QR válida
            </div>
          </div>
        </div>

        {/* Botones */}
        <div style={{ borderTop: '1px solid #ddd', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f5', borderRadius: '0 0 5px 5px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#555' }}>
            MIC N°: <b>{g('numero', '—')}</b> &nbsp;·&nbsp; Porteador: <b>{g('porteador.nombre', '—').substring(0, 35)}</b>
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={onClose} style={{ padding: '7px 18px', fontSize: '12px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button id="pdf-btn" onClick={generatePDF} style={{ padding: '7px 18px', fontSize: '12px', background: '#0d2137', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Download size={13} /> Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIC;