const configurationService = require('../services/configurationService')

exports.setConfig = async(req,res) => {
    try {
        const config = await configurationService.setConfig(req.body.key, req.body.value, req?.body?.description)
        return res.status(200).json(config)
    } catch (error) {
        return res.status(400).json({error : error.message})
    }
}

exports.getAll = async(req,res) => {
    try {
        const config = await configurationService.getAllConfigs()
        return res.status(200).json(config)
    } catch (error) {
        return res.status(400).json({error : error.message})
    }
}
