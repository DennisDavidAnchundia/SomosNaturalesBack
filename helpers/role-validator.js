const Role = require('../models/rol')

const rolValid = async (rol = '') => {
    const rolExist = await Role.findOne({ rol })
    if (!rolExist) {
        throw new Error('El rol no esta registrado en la db')
    }
}


module.exports=rolValid;