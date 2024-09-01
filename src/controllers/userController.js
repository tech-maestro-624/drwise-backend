const userService = require('../services/userService')

exports.get = async(req,res) => {
    try {
        const data = await userService.get(req.body)
        return res.status(200).json(data)
    } catch (error) {
        return res.status(400).json({error : error.message})
    }
}