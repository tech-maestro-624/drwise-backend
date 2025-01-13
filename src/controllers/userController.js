const userService = require('../services/userService')

exports.get = async(req,res) => {
    try {
        const data = await userService.get(req.query)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error);
        
        return res.status(400).json({error : error.message})
    }
}

exports.update =async(req,res)=> {
    try {
        const data = await userService.update(req.params.id,req.body)
        return res.status(200).json(data)
    } catch (error) {
        return res.status(400).json({error : error.message})
    }
}

exports.updatePushNotifyToken = async(req,res)=>{
    try {
        const data = await userService.updatePushNotifyToken(req.user._id,req.body.token)
        return res.status(200).json(data)

    } catch (error) {
        return res.status(400).json({error : error.message})
        
    }
}

exports.create = async(req,res) => {
    try {
        const data = await userService.create(req.body)
        return res.status(200).json(data)
    } catch (error) {
        return res.status(400).json({error : error.message})
    }
}

exports.sendNotification = async(req,res) => {
    const data = req.body
    try {
      const notify = await userService.sendNotification(data)
      return res.status(200).json(notify)
    } catch (error) {
      return res.status(500).json({success : false,error : error.message})
    }
  }
  exports.delete = async (req, res) => {
    try {
        const result = await userService.delete(req.params.id);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
