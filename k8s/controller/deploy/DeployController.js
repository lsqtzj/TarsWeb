const logger = require('../../../logger')
const CommonService = require('../../service/common/CommonService');
const DeployService = require('../../service/deploy/DeployService');

const DeployController = {};

/**
 * 服务部署创建
 */
DeployController.ServerDeployCreate = async(ctx) => {
    let { Token = '',
        ServerApp = '', ServerName = '', ServerMark = '', ServerK8S = {}, ServerServant = {}, ServerOption = {}
    } = ctx.paramsObj

    let Uid = ctx.uid;

    if(ServerServant){
        for(let item in ServerServant){
            delete ServerServant[item].HostPort
            ServerServant[item].Port = Math.floor(ServerServant[item].Port) || 0
            ServerServant[item].Threads = Math.floor(ServerServant[item].Threads) || 0
            ServerServant[item].Connections = Math.floor(ServerServant[item].Connections) || 0
            ServerServant[item].Capacity = Math.floor(ServerServant[item].Capacity) || 0
            ServerServant[item].Timeout = Math.floor(ServerServant[item].Timeout) || 0
        }
    }

    if(ServerK8S){
        ServerK8S.Replicas = ServerK8S.Replicas ? Math.floor(ServerK8S.Replicas) : 1
    }

    try {
        const metadata = {
            ServerApp,
            ServerName,
            ServerMark,
            ServerK8S,
            ServerServant,
            ServerOption,
            Uid
        }

        let result = await DeployService.serverDeployCreate(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data)
    } catch (e) {
        logger.error('[ServerDeployCreate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}
/**
 * 服务部署列表
 * @param  {String}  Token                登录签名
 * @param  {String}  ServerApp            应用名
 * @param  {String}  ServerName           服务名
 */
DeployController.ServerDeploySelect = async(ctx) => {
    let { Token = '', ServerApp = '', ServerName = '', deployName = '', } = ctx.paramsObj
    try {

        let result = await DeployService.serverDeploySelect(ctx.uid, ServerApp, ServerName,deployName);
        ctx.makeResObj(result.ret, result.msg, result.data)

    } catch (e) {
        logger.error('[ServerDeploySelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
},
/**
 * 服务部署更新
 */
DeployController.ServerDeployUpdate = async(ctx) => {
    let { Token = '', DeployId = '',
        ServerK8S = {}, ServerServant = {}, ServerOption = {},
    } = ctx.paramsObj

    try {
        const metadata = {
            DeployId,
        }
        const target = {
            ServerServant,
            ServerOption,
            ServerK8S,
        }
        let result = await DeployService.serverDeployUpdate(metadata, target);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerDeployUpdate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
},
/**
 * 服务部署删除
 * @param  {String}  Token                登录签名
 * @param  {Number}  DeployId             服务ID
 */
DeployController.ServerDeployDelete = async(ctx) => {
    let { Token = '', DeployId = '' } = ctx.paramsObj

    try {
        const metadata = {
            DeployId: DeployId,
        }

        let result = await DeployService.serverDeployDelete(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServerDeployDelete]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
},

module.exports = DeployController;