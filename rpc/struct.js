/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

const AdminRegProxy = require("./proxy/AdminRegProxy");
const ConfigFProxy = require("./proxy/ConfigFProxy");
const DCacheOptProxy = require("./proxy/DCacheOptProxy");
const MonitorQueryProxy = require("./proxy/MonitorQueryProxy");
const PatchProxy = require("./proxy/PatchProxy");
// const WebConf = require("../config/webConf");
const {
    RPCStruct
} = require('./service');
const TopologyProxy = require("./topology/TopologyProxy");

module.exports = {

    adminRegStruct: RPCStruct(AdminRegProxy, 'tars'),

    configFStruct: RPCStruct(ConfigFProxy, 'tars'),

    monitorQueryStruct: RPCStruct(MonitorQueryProxy, 'tars'),

    DCacheOptStruct: RPCStruct(DCacheOptProxy, 'DCache'),

    PatchStruct: RPCStruct(PatchProxy, 'tars'),

    topologyStruct: RPCStruct(TopologyProxy, 'tars')
};