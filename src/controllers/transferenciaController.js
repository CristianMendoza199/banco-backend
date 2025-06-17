const model = require('../models/transferenciaModel');

exports.realizarTransferencia = async(req, res) => {
    try {
        const { cuenta_origen, cuenta_destino, monto } = req.body;
        const cliente_id = req.user.cliente_id;

        await model.TranferirMonto({cuenta_origen, cuenta_destino, monto});

        res.status(200).json({
            status_code: 200,
            status_desc: 'transferencia exitosa!'
    });
    }catch(error) {
        res.status(500).json({
            status_code: 500,
            status_desc: 'error al realizar la transferencia', error: error.message
        });
    }
};