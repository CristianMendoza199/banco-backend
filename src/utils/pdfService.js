const PDFDocument = require('pdfkit');
const moment = require('moment');

function generarEstadoCuentaPdf(cliente, transacciones, periodo) {
    const doc = new PDFDocument({margin: 50});

    doc.fontSize(20).text('estado de Cuenta',{align: 'center'});
    doc.moveDown();

    doc.fontSize(12).text(`Cliente: ${cliente.nombre}`);
    doc.text(`Email: ${cliente.email}`);
    doc.text(`Cuenta Id:${cliente.cuenta_id}`);
    doc.text(`Periodo: ${periodo.fecha_inicio} a ${periodo.fecha_fin}`);
    doc.moveDown();

    doc.fontSize(14).text('transacciones: ', {underline: true});
    doc.moveDown(0.5);

    const tabla = ['Fecha', 'Tipo', 'Monto'];
    tabla.forEach(col => doc.text(col, {continued: true, width:150}));

    doc.moveDown();

    transacciones.forEach(t => {
        doc.text(moment(t.fecha).format('YYYY-MM-DD'), {continued:true, width: 150});
        doc.text(t.tipo, {continued: true, width: 150});
        doc.text(`$${t.monto}`, {width: 150});
    });

    doc.end();
    return doc;
}

module.exports = {
    generarEstadoCuentaPdf
};