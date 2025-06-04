const model = require('../models/cuentaModel');

exports.crearCuenta = async (req, res) =>{
    try{
        const result = await model.crearCuenta(req.body);
        res.status(201).json({
            status_code:201,
            status_desc: 'Cuenta creada exitosamente',
            result: result.rows[0] ?? null
        });

    }catch (error){
        console.error('error en el controlador al crear cuenta', error.message);
        res.status(500).json({
            status_code:500,
            status_desc: 'Error al crear la cuenta',
            error: error.message
        });
    }
};