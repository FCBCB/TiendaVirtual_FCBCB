// src/pages/Dashboard/BL.jsx
import React, { useRef, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';

/**
 * BL — Straight Bill of Lading
 *
 * Props:
 *   blData  : object  — datos del BL (REQUERIDO)
 *   onClose : fn      — cierra el modal
 */
const BL = ({ blData, onClose }) => {
  const modalRef = useRef();
  const reportRef = useRef();

  // Si no hay datos, mostrar mensaje o no renderizar
  if (!blData) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <p>Error: No se recibieron datos para el Bill of Lading</p>
          <button onClick={onClose} style={{ padding: '8px 16px', marginTop: '10px' }}>Cerrar</button>
        </div>
      </div>
    );
  }

  const g = (path, fb = '') => {
    const keys = path.split('.');
    let v = blData;
    for (const k of keys) {
      if (v === undefined || v === null) return fb;
      v = v[k];
    }
    if (v === undefined || v === null) return fb;
    if (typeof v === 'object') return JSON.stringify(v);
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
      
      doc.save(`BL_${g('bolNo', 'SIN-NUMERO')}.pdf`);
      
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

  // ── CAPTURAR IMAGEN ──
  const captureImage = async () => {
    if (!reportRef.current) return;
    
    try {
      const { toPng } = await import('html-to-image');
      
      const button = document.getElementById('capture-btn');
      const originalText = button?.innerHTML || '📸 Capturar Imagen';
      
      if (button) {
        button.innerHTML = 'Capturando...';
        button.disabled = true;
      }
      
      const element = reportRef.current;
      
      const originalStyle = {
        width: element.style.width,
        minWidth: element.style.minWidth,
        maxWidth: element.style.maxWidth,
        overflow: element.style.overflow
      };
      
      element.style.width = '610px';
      element.style.minWidth = '610px';
      element.style.maxWidth = '610px';
      element.style.overflow = 'visible';
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        width: 610,
        height: element.scrollHeight,
        cacheBust: true
      });
      
      element.style.width = originalStyle.width;
      element.style.minWidth = originalStyle.minWidth;
      element.style.maxWidth = originalStyle.maxWidth;
      element.style.overflow = originalStyle.overflow;
      
      const link = document.createElement('a');
      link.download = `BL_${g('bolNo', 'SIN-NUMERO')}.png`;
      link.href = dataUrl;
      link.click();
      
      if (button) {
        button.innerHTML = originalText;
        button.disabled = false;
      }
      
    } catch (error) {
      console.error('Error capturando imagen:', error);
      alert('Error al capturar la imagen.');
      
      const button = document.getElementById('capture-btn');
      if (button) {
        button.innerHTML = '📸 Capturar Imagen';
        button.disabled = false;
      }
    }
  };

  // ── Barcode SVG ──
  const Barcode = ({ value = '', height = 22, fontSize = 6 }) => {
    if (!value) return (
      <div style={{ textAlign: 'center', color: '#bbb', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', padding: '8px 0' }}>
        BARCODE SPACE
      </div>
    );
    const CODE128B = {
      ' ': '11011001100','!':'11001101100','"':'11001100110','#':'10010011000',
      '$':'10010001100','%':'10001001100','&':'10011001000',"'":'10011000100',
      '(':'10001100100',')':'11001001000','*':'11001000100','+':'11000100100',
      ',':'10110011100','-':'10011011100','.':'10011001110','/':'10111001100',
      '0':'10011101100','1':'10011100110','2':'11001110010','3':'11001011100',
      '4':'11001001110','5':'11011100100','6':'11001110100','7':'11101101110',
      '8':'11101001100','9':'11100101100',':':'11100100110',';':'11101100100',
      '<':'11100110100','=':'11100110010','>':'11110101110','?':'11110100110',
      '@':'11100101110','A':'11101100010','B':'11101011100','C':'11101001110',
      'D':'11100101100','E':'11100100110','F':'11100110010','G':'11011011000',
      'H':'11011000110','I':'11000110110','J':'10100011000','K':'10001011000',
      'L':'10001000110','M':'10110001000','N':'10001101000','O':'10001100010',
      'P':'11010001000','Q':'11000101000','R':'11000100010','S':'10110111000',
      'T':'10110001110','U':'10001101110','V':'10111011000','W':'10111000110',
      'X':'10001110110','Y':'11101110110','Z':'11010001110',
    };
    const START_B = '11010010000';
    const STOP = '1100011101011';
    let bits = START_B;
    let checksum = 104;
    const chars = value.toUpperCase().split('');
    chars.forEach((ch, i) => {
      const pattern = CODE128B[ch] || CODE128B[' '];
      bits += pattern;
      checksum += (ch.charCodeAt(0) - 32) * (i + 1);
    });
    const checkChar = String.fromCharCode((checksum % 103) + 32);
    bits += (CODE128B[checkChar] || CODE128B[' ']);
    bits += STOP;
    const barW = 1.1;
    const totalW = bits.length * barW;
    return (
      <svg width="100%" height={height + fontSize + 4} viewBox={`0 0 ${totalW} ${height + fontSize + 4}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        {bits.split('').map((bit, i) =>
          bit === '1' ? <rect key={i} x={i * barW} y={0} width={barW} height={height} fill="#000" /> : null
        )}
        <text x={totalW / 2} y={height + fontSize + 1} textAnchor="middle" fontSize={fontSize} fontFamily="monospace" fill="#000">{value}</text>
      </svg>
    );
  };

  // ── Estilos para versión más angosta ──
  const border = '1px solid #555';
  const borderT = '0.5px solid #777';

  const td = (extra = {}) => ({
    border: borderT, padding: '1px 2px', boxSizing: 'border-box', verticalAlign: 'top', ...extra,
  });
  const lbl = { fontSize: '6px', fontWeight: 'bold', color: '#000', display: 'block', lineHeight: '1.2' };
  const val = { fontSize: '7px', color: '#000', whiteSpace: 'pre-wrap', lineHeight: '1.3', display: 'block', marginTop: '1px' };
  const Row = ({ children, style = {} }) => (
    <div style={{ display: 'flex', width: '100%', ...style }}>{children}</div>
  );
  const Cell = ({ label, value, style = {}, children }) => (
    <div style={td(style)}>
      {label && <span style={lbl}>{label}</span>}
      {value !== undefined && <span style={val}>{value}</span>}
      {children}
    </div>
  );
  const Chk = ({ checked, label }) => (
    <label style={{ fontSize: '6.5px', marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '2px', cursor: 'default' }}>
      <span style={{ display: 'inline-block', width: '8px', height: '8px', border: '1px solid #444', background: checked ? '#222' : '#fff', textAlign: 'center', lineHeight: '8px', fontSize: '6px', flexShrink: 0 }}>
        {checked ? '✓' : ''}
      </span>
      {label}
    </label>
  );

  const commodities = blData.commodities || [];

  // Generar datos para QR (firma digital)
  const qrDataShipper = JSON.stringify({
    tipo: 'FIRMA_DIGITAL_SHIPPER',
    nombre: g('shipperSignature'),
    bolNo: g('bolNo'),
    fecha: g('shipperDate'),
    empresa: g('shipFrom', '').split('\n')[0],
    timestamp: new Date().toISOString()
  });

  const qrDataCarrier = JSON.stringify({
    tipo: 'FIRMA_DIGITAL_CARRIER',
    nombre: g('carrierName', '').split('\n')[0],
    bolNo: g('bolNo'),
    scac: g('scac'),
    timestamp: new Date().toISOString()
  });

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
          width: '100%', maxWidth: '680px',
          display: 'flex', flexDirection: 'column',
          marginTop: '10px', marginBottom: '10px',
        }}
      >
        {/* ── TOP BAR ── */}
        <div style={{ background: '#1a1a2e', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '5px 5px 0 0' }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
            Straight Bill of Lading — BOL No: {g('bolNo', '—')}
          </span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
            <X size={14} /> Cerrar
          </button>
        </div>

        {/* ── DOCUMENT ── */}
        <div style={{ overflowY: 'auto', padding: '12px', background: '#bbb' }}>
          <div ref={reportRef} style={{ background: '#fff', maxWidth: '610px', margin: '0 auto', border, boxSizing: 'border-box', fontSize: '6.5px' }}>

            {/* ══ ROW 1: Title + Date ══ */}
            <Row>
              <div style={td({ width: '55%', padding: '3px 4px', borderBottom: borderT })}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', lineHeight: '1.2' }}>Straight Bill of Lading</div>
                <div style={{ fontSize: '7px', color: '#222' }}>Original – Not Negotiable</div>
              </div>
              <Cell label="Date:" value={g('date')} style={{ flex: 1, minHeight: '28px' }} />
            </Row>

            {/* ══ ROW 2: Ship From | Bill of Lading No + Barcode ══ */}
            <Row>
              <div style={td({ width: '55%', minHeight: '65px' })}>
                <span style={lbl}>Ship From:</span>
                <span style={val}>{g('shipFrom')}</span>
              </div>
              <div style={td({ flex: 1 })}>
                <span style={lbl}>Bill of Lading No:</span>
                <span style={{ ...val, fontWeight: 'bold' }}>{g('bolNo')}</span>
                <div style={{ marginTop: '4px', minHeight: '26px' }}>
                  <Barcode value={g('bolNo')} height={20} fontSize={5} />
                </div>
              </div>
            </Row>

            {/* ══ ROW 3: SID + FOB | Carrier Name + QR ══ */}
            <Row>
              <div style={td({ width: '55%' })}>
                <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={lbl}>SID#:</span>
                    <span style={val}>{g('sid')}</span>
                  </div>
                  <Chk checked={!!blData.fobFrom} label="FOB" />
                </Row>
              </div>
              <div style={td({ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}>
                <div style={{ flex: 1 }}>
                  <span style={lbl}>Carrier Name:</span>
                  <span style={val}>{g('carrierName')}</span>
                </div>
                <div style={{ marginLeft: '6px', flexShrink: 0 }}>
                  <QRCodeSVG 
                    value={qrDataCarrier}
                    size={38}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                  />
                  <span style={{ fontSize: '4px', display: 'block', textAlign: 'center', marginTop: '2px' }}>Firma Carrier</span>
                </div>
              </div>
            </Row>

            {/* ══ ROW 4: Ship To + Location No | Trailer No ══ */}
            <Row>
              <div style={td({ width: '55%', minHeight: '45px' })}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <span style={lbl}>Ship To:</span>
                  <span style={{ ...lbl, marginRight: '4px' }}>Location No: <span style={{ fontWeight: 'normal', fontSize: '7px' }}>{g('locationNo')}</span></span>
                </Row>
                <span style={val}>{g('shipTo')}</span>
              </div>
              <Cell label="Trailer No:" value={g('trailerNo')} style={{ flex: 1, minHeight: '16px' }} />
            </Row>

            {/* ══ ROW 5: blank continuation | Seal Numbers ══ */}
            <Row>
              <div style={td({ width: '55%', minHeight: '12px' })} />
              <Cell label="Seal Number(s):" value={g('sealNumbers')} style={{ flex: 1, minHeight: '12px' }} />
            </Row>

            {/* ══ ROW 6: CID + FOB | SCAC ══ */}
            <Row>
              <div style={td({ width: '55%' })}>
                <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={lbl}>CID#:</span>
                    <span style={val}>{g('cid')}</span>
                  </div>
                  <Chk checked={!!blData.fobTo} label="FOB" />
                </Row>
              </div>
              <Cell label="SCAC:" value={g('scac')} style={{ flex: 1, minHeight: '16px' }} />
            </Row>

            {/* ══ ROW 7: Ship To continuation | Pro No + Barcode ══ */}
            <Row>
              <div style={td({ width: '55%', minHeight: '12px' })} />
              <div style={td({ flex: 1, minHeight: '38px' })}>
                <span style={lbl}>Pro No:</span>
                <span style={{ ...val, fontWeight: 'bold' }}>{g('proNo')}</span>
                <div style={{ marginTop: '2px', minHeight: '24px' }}>
                  <Barcode value={g('proNo')} height={18} fontSize={5} />
                </div>
              </div>
            </Row>

            {/* ══ ROW 8: Freight Charge Terms | Special Instructions ══ */}
            <Row>
              <div style={td({ width: '55%', minHeight: '28px' })}>
                <span style={{ ...lbl, marginBottom: '2px', display: 'block' }}>Freight Charge Terms</span>
                <div>
                  <Chk checked={blData.freightTerms === 'prepaid'} label="Prepaid" />
                  <Chk checked={blData.freightTerms === 'collect'} label="Collect" />
                  <Chk checked={blData.freightTerms === '3rdParty'} label="3rd Party" />
                </div>
              </div>
              <div style={td({ flex: 1, minHeight: '28px' })}>
                <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={lbl}>Special Instructions:</span>
                  <Chk checked={!!blData.masterBOL} label="Master BOL" />
                </Row>
                <span style={val}>{g('specialInstructions')}</span>
              </div>
            </Row>

            {/* ══ ROW 9: 3rd Pty Freight Charges ══ */}
            <Row>
              <div style={td({ width: '55%', minHeight: '38px' })}>
                <span style={lbl}>3rd Pty Freight Charges - Bill To:</span>
                <span style={val}>{g('billTo')}</span>
              </div>
              <div style={td({ flex: 1, minHeight: '38px' })} />
            </Row>

            {/* ══ COMMODITY TABLE HEADER ══ */}
            <Row style={{ background: '#e8e8e8' }}>
              <div style={{ width: '13%', border: borderT, boxSizing: 'border-box', textAlign: 'center' }}>
                <div style={{ borderBottom: borderT, padding: '1px 2px', fontWeight: 'bold', fontSize: '6px' }}>Handling Unit</div>
                <Row>
                  <div style={{ flex: 1, borderRight: borderT, padding: '1px 2px', fontWeight: 'bold', fontSize: '5.5px', textAlign: 'center' }}>QTY</div>
                  <div style={{ flex: 1, padding: '1px 2px', fontWeight: 'bold', fontSize: '5.5px', textAlign: 'center' }}>TYPE</div>
                </Row>
              </div>
              <div style={{ width: '13%', border: borderT, boxSizing: 'border-box', textAlign: 'center' }}>
                <div style={{ borderBottom: borderT, padding: '1px 2px', fontWeight: 'bold', fontSize: '6px' }}>Package</div>
                <Row>
                  <div style={{ flex: 1, borderRight: borderT, padding: '1px 2px', fontWeight: 'bold', fontSize: '5.5px', textAlign: 'center' }}>QTY</div>
                  <div style={{ flex: 1, padding: '1px 2px', fontWeight: 'bold', fontSize: '5.5px', textAlign: 'center' }}>TYPE</div>
                </Row>
              </div>
              <div style={{ width: '8%', border: borderT, boxSizing: 'border-box', textAlign: 'center', padding: '1px 2px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '6px' }}>Weight</div>
                <div style={{ fontSize: '5.5px' }}>U.</div>
              </div>
              <div style={{ width: '5%', border: borderT, boxSizing: 'border-box', textAlign: 'center', padding: '1px 2px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '6px' }}>H.M.</div>
              </div>
              <div style={{ flex: 1, border: borderT, boxSizing: 'border-box', textAlign: 'center', padding: '1px 2px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '6px' }}>Commodity Description</div>
              </div>
              <div style={{ width: '13%', border: borderT, boxSizing: 'border-box', textAlign: 'center' }}>
                <div style={{ borderBottom: borderT, padding: '1px 2px', fontWeight: 'bold', fontSize: '6px' }}>LTL Only</div>
                <Row>
                  <div style={{ flex: 1, borderRight: borderT, padding: '1px 2px', fontWeight: 'bold', fontSize: '5.5px', textAlign: 'center' }}>NMFC</div>
                  <div style={{ flex: 1, padding: '1px 2px', fontWeight: 'bold', fontSize: '5.5px', textAlign: 'center' }}>Class</div>
                </Row>
              </div>
            </Row>

            {/* ══ COMMODITY ROWS ══ */}
            {commodities.length > 0 ? (
              commodities.filter(row => row.huQty || row.description).map((row, i) => (
                <Row key={i} style={{ minHeight: '12px' }}>
                  <div style={{ width: '6.5%', border: borderT, padding: '1px 2px', fontSize: '7px', boxSizing: 'border-box', textAlign: 'center' }}>{row.huQty || ''}</div>
                  <div style={{ width: '6.5%', border: borderT, padding: '1px 2px', fontSize: '7px', boxSizing: 'border-box', textAlign: 'center' }}>{row.huType || ''}</div>
                  <div style={{ width: '6.5%', border: borderT, padding: '1px 2px', fontSize: '7px', boxSizing: 'border-box', textAlign: 'center' }}>{row.pkgQty || ''}</div>
                  <div style={{ width: '6.5%', border: borderT, padding: '1px 2px', fontSize: '7px', boxSizing: 'border-box', textAlign: 'center' }}>{row.pkgType || ''}</div>
                  <div style={{ width: '8%', border: borderT, padding: '1px 2px', fontSize: '7px', boxSizing: 'border-box', textAlign: 'center' }}>{row.weight || ''}</div>
                  <div style={{ width: '5%', border: borderT, padding: '1px 2px', fontSize: '7px', boxSizing: 'border-box', textAlign: 'center' }}>{row.hm || ''}</div>
                  <div style={{ flex: 1, border: borderT, padding: '1px 3px', fontSize: '7px', boxSizing: 'border-box' }}>{row.description || ''}</div>
                  <div style={{ width: '6.5%', border: borderT, padding: '1px 2px', fontSize: '7px', boxSizing: 'border-box', textAlign: 'center' }}>{row.nmfc || ''}</div>
                  <div style={{ width: '6.5%', border: borderT, padding: '1px 2px', fontSize: '7px', boxSizing: 'border-box', textAlign: 'center' }}>{row.freightClass || ''}</div>
                </Row>
              ))
            ) : (
              <Row>
                <div style={{ flex: 1, border: borderT, padding: '6px', textAlign: 'center', color: '#999', fontSize: '7px' }}>
                  No hay datos de commodities
                </div>
              </Row>
            )}

            {/* ══ TOTALS ══ */}
            <Row style={{ background: '#efefef', borderTop: borderT, borderBottom: borderT }}>
              <div style={{ width: '6.5%', border: borderT, padding: '2px', fontWeight: 'bold', fontSize: '6.5px', textAlign: 'center', boxSizing: 'border-box' }}>{g('totalHuQty')}</div>
              <div style={{ width: '6.5%', border: borderT, padding: '2px', fontSize: '6.5px', boxSizing: 'border-box' }} />
              <div style={{ width: '6.5%', border: borderT, padding: '2px', fontWeight: 'bold', fontSize: '6.5px', textAlign: 'center', boxSizing: 'border-box' }}>{g('totalPkgQty')}</div>
              <div style={{ width: '6.5%', border: borderT, padding: '2px', fontSize: '6.5px', boxSizing: 'border-box' }} />
              <div style={{ width: '8%', border: borderT, padding: '2px', fontWeight: 'bold', fontSize: '6.5px', textAlign: 'center', boxSizing: 'border-box' }}>{g('totalWeight')}</div>
              <div style={{ width: '5%', border: borderT, padding: '2px', fontSize: '6.5px', boxSizing: 'border-box' }} />
              <div style={{ flex: 1, border: borderT, padding: '2px 3px', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', boxSizing: 'border-box' }}>Totals</div>
              <div style={{ width: '6.5%', border: borderT, padding: '2px', fontSize: '6.5px', boxSizing: 'border-box' }} />
              <div style={{ width: '6.5%', border: borderT, padding: '2px', fontSize: '6.5px', boxSizing: 'border-box' }} />
            </Row>

            {/* ══ SECTION: Value declaration + Carrier notice ══ */}
            <Row style={{ minHeight: '45px' }}>
              <div style={td({ width: '55%' })}>
                <div style={{ fontSize: '6px', lineHeight: '1.4', color: '#222' }}>
                  Where the rate is dependent on value, shippers are required to state specifically in writing the agreed or declared value of the property as follows:
                </div>
                <div style={{ fontSize: '6px', lineHeight: '1.4', color: '#222', marginTop: '3px' }}>
                  The agreed or declared value of the property is specifically stated by the shipper to be not exceeding
                </div>
                <div style={{ fontSize: '6px', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ flex: 1, borderBottom: '1px solid #555', minWidth: '40px' }}>&nbsp;</span>
                  <span>FOB</span>
                  <span style={{ flex: 1, borderBottom: '1px solid #555', minWidth: '40px' }}>&nbsp;</span>
                  <span>"</span>
                </div>
              </div>
              <div style={td({ flex: 1 })}>
                <div style={{ fontSize: '6px', lineHeight: '1.4', color: '#222' }}>
                  The carrier shall not make delivery of this shipment without payment of freight and all other lawful charges.
                </div>
              </div>
            </Row>

            {/* ══ NOTE ══ */}
            <div style={td({ background: '#f5f5f5', padding: '2px 4px' })}>
              <span style={{ fontSize: '6px', fontWeight: 'bold' }}>NOTE: Liability Limitation for loss or damage in this shipment may be applicable.</span>
            </div>

            {/* ══ LEGAL TEXT ══ */}
            <div style={td({ padding: '2px 4px' })}>
              <p style={{ margin: 0, fontSize: '5.5px', lineHeight: '1.5', color: '#222' }}>
                RECEIVED, subject to individually determined rates or contracts that have been agreed upon in writing between the carrier and shipper, if applicable, otherwise to the rates,
                classifications and rules that have been established by the carrier and are available to the shipper on request. The property described above, in apparent good order, except as
                noted (contents and condition of contents of packages unknown), marked, consigned, and destined as shown above.
              </p>
            </div>

            {/* ══ BOTTOM SECTION ══ */}
            <Row style={{ minHeight: '55px' }}>
              <div style={td({ width: '32%' })}>
                <div style={{ fontSize: '5.5px', lineHeight: '1.4', color: '#222' }}>
                  This is to certify that the above named materials are properly classified, packaged, marked and labeled.
                </div>
              </div>
              <div style={td({ width: '36%' })}>
                <Row>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '6px', marginBottom: '2px' }}>Trailer Loaded</div>
                    <div><Chk checked={blData.trailerLoaded === 'shipper'} label="By Shipper" /></div>
                    <div><Chk checked={blData.trailerLoaded === 'driver'} label="By Driver" /></div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '6px', marginBottom: '2px' }}>Freight Counted</div>
                    <div><Chk checked={blData.freightCounted === 'shipper'} label="By Shipper" /></div>
                    <div><Chk checked={blData.freightCounted === 'pallets'} label="Pallets" /></div>
                    <div><Chk checked={blData.freightCounted === 'pieces'} label="Pieces" /></div>
                  </div>
                </Row>
              </div>
              <div style={td({ flex: 1 })}>
                <div style={{ fontSize: '5.5px', lineHeight: '1.4', color: '#222' }}>
                  Carrier acknowledges receipt of packages and required placards.
                </div>
              </div>
            </Row>

            {/* ══ SIGNATURE ROW CON QR COMO FIRMA DIGITAL ══ */}
            <Row>
              {/* Shipper Signature con QR */}
              <div style={td({ width: '32%', minHeight: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '6px' }}>
                  <QRCodeSVG 
                    value={qrDataShipper}
                    size={35}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                  />
                  <span style={{ fontSize: '4.5px', marginTop: '2px', color: '#555' }}>Firma Digital Shipper</span>
                </div>
                <div>
                  <div style={{ borderBottom: '1px solid #555', fontSize: '7px', paddingBottom: '1px', textAlign: 'center' }}>{g('shipperSignature')}</div>
                  <div style={{ textAlign: 'center', fontSize: '6px', marginTop: '2px' }}>{g('shipperDate')}</div>
                  <div style={{ textAlign: 'center', fontSize: '5.5px', fontWeight: 'bold', marginTop: '2px' }}>Shipper Signature / Date</div>
                </div>
              </div>
              
              {/* Espacio central */}
              <div style={td({ width: '36%', textAlign: 'center', verticalAlign: 'middle', padding: '4px' })}>
                <div style={{ fontSize: '6px', color: '#888', textAlign: 'center' }}>
                  DOCUMENTO ELECTRÓNICO
                </div>
              </div>
              
              {/* Carrier Signature con QR */}
              <div style={td({ flex: 1, minHeight: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '6px' }}>
                  <QRCodeSVG 
                    value={qrDataCarrier}
                    size={35}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                  />
                  <span style={{ fontSize: '4.5px', marginTop: '2px', color: '#555' }}>Firma Digital Carrier</span>
                </div>
                <div>
                  <div style={{ borderBottom: '1px solid #555', fontSize: '7px', paddingBottom: '1px', textAlign: 'center' }}>{g('carrierSignature') || '_________________'}</div>
                  <div style={{ textAlign: 'center', fontSize: '6px', marginTop: '2px' }}>{g('pickupDate') || '_________________'}</div>
                  <div style={{ textAlign: 'center', fontSize: '5.5px', fontWeight: 'bold', marginTop: '2px' }}>Carrier Signature / Pickup Date</div>
                </div>
              </div>
            </Row>

          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{ borderTop: '1px solid #ddd', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f5', borderRadius: '0 0 5px 5px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#555' }}>
            BOL N°: <b>{g('bolNo', '—')}</b> &nbsp;·&nbsp; Shipper: <b>{g('shipFrom', '—').split('\n')[0] || '—'}</b>
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={onClose} style={{ padding: '7px 18px', fontSize: '12px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button 
              id="capture-btn"
              onClick={captureImage} 
              style={{ padding: '7px 18px', fontSize: '12px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}
            >
              📸 Capturar Imagen
            </button>
            <button 
              id="pdf-btn"
              onClick={generatePDF} 
              style={{ padding: '7px 18px', fontSize: '12px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}
            >
              <Download size={13} /> Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BL;