<template>
  <div class="page_server_publish">
    <!-- 服务列表 -->
    <div v-if="!showHistory">
      <let-table ref="table" v-if="serverList && serverList.length > 0" :data="serverList"
                 :title="$t('serverList.title.serverList')" :empty-msg="$t('common.noService')">
        <let-table-column>
          <template slot="head" slot-scope="props">
            <let-checkbox v-model="isCheckedAll"></let-checkbox>
          </template>
          <template slot-scope="scope">
            <let-checkbox v-model="scope.row.isChecked" :value="scope.row.id"></let-checkbox>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.th.ip')" prop="node_name"></let-table-column>
        <let-table-column :title="$t('serverList.table.th.enableSet')">
          <template slot-scope="scope">
            <span>{{ scope.row.enable_set ? $t('common.enable') : $t('common.disable') }}</span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('common.set.setName')" prop="set_name"></let-table-column>
        <let-table-column :title="$t('common.set.setArea')" prop="set_area"></let-table-column>
        <let-table-column :title="$t('common.set.setGroup')" prop="set_group"></let-table-column>
        <let-table-column :title="$t('serverList.table.th.configStatus')">
          <template slot-scope="scope">
            <span :class="scope.row.setting_state == 'active' ? 'status-active' : 'status-off'"></span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.th.currStatus')">
          <template slot-scope="scope">
            <span :class="scope.row.present_state == 'active' ? 'status-active' : 'status-off'"></span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.th.version')" prop="patch_version"></let-table-column>
        <let-table-column :title="$t('serverList.table.th.time')">
          <template slot-scope="scope">
            <span style="word-break: break-word">{{handleNoPublishedTime(scope.row.patch_time)}}</span>
          </template>
        </let-table-column>
        <let-pagination slot="pagination" align="right"
                        :total="totalPage" :page="page" @change="changePage">
        </let-pagination>
        <div slot="operations" style="margin-left: -15px;">
          <let-button theme="primary" size="small" @click="openPublishModal">{{$t('pub.btn.pub')}}</let-button>
          <let-button size="small" v-if="serverList && serverList.length > 0" @click="gotoHistory">
            {{$t('pub.btn.history')}}
          </let-button>
        </div>
      </let-table>
      <!-- 发布服务弹出框 -->
      <let-modal
        v-model="publishModal.show"
        :title="$t('index.rightView.tab.patch')"
        width="880px"
        :footShow="false"
        @close="closePublishModal"
        @on-confirm="savePublishServer">
        <let-form
          v-if="publishModal.model"
          ref="publishForm"
          itemWidth="100%">
          <let-form-item :label="$t('serverList.servant.appService')">
            {{publishModal.model.application}}·{{publishModal.model.server_name}}
          </let-form-item>
          <let-form-item :label="$t('pub.dlg.ip')">
            <div v-for="server in publishModal.model.serverList" :key="server.id">{{server.node_name}}</div>
          </let-form-item>
          <let-form-item :label="$t('serverList.servant.comment')" v-if="serverType == 'tars'">
            <let-input v-model="publishModal.model.update_text"></let-input>
          </let-form-item>
          <let-form-item :label="$t('pub.dlg.patchType')" v-if="patchRadioData.length>1">
            <let-radio-group type="button" size="small" @change="patchChange" v-model="patchType"
                             :data="patchRadioData">
            </let-radio-group>
          </let-form-item>
          <let-form-item :label="$t('pub.dlg.releaseVersion')" v-if="publishModal.model.show">
            <let-select
              size="small"
              v-model="publishModal.model.patch_id"
              required
              :required-tip="$t('pub.dlg.ab')"
              v-if="serverType == 'tars'"
            >
              <let-option v-for="d in publishModal.model.patchList" :key="d.id" :value="d.id">
                {{d.id}} | {{d.posttime}} | {{d.comment}}
              </let-option>
            </let-select>
            <let-button v-if="serverType == 'tars'" theme="primary" size="small" class="mt10" @click="showUploadModal">
              {{$t('pub.dlg.upload')}}
            </let-button>
            <br>
            <!--proxy、router、dcache 发布选择框-->
            <let-table :data="publishModal.model.patchList" :empty-msg="$t('common.nodata')" v-if="serverType !== 'tars'">
              <let-table-column>
                <template slot-scope="scope">
                  <!--<let-checkbox v-model="scope.row.isChecked" :value="scope.row.id"></let-checkbox>-->
                  <let-radio v-model="publishModal.publishId" :label="scope.row.id">&nbsp;</let-radio>
                </template>
              </let-table-column>
              <let-table-column title="ID" prop="id">
                <template slot-scope="scope">
                  {{scope.row.id}}
                  <span :title="$t('releasePackage.default')"
                        style="color: green; display: inline-block;width:1em;height:1em;">
                        <icon v-if="scope.row.default_version == 1" name="default"/>
                      </span>
                </template>
              </let-table-column>
              <let-table-column :title="$t('releasePackage.moduleName')" prop="server"></let-table-column>
              <let-table-column :title="$t('releasePackage.cacheType')" v-if="serverType === 'dcache'">
                <template slot-scope="scope">
                  <span>{{scope.row.package_type==1?"KVcache": "MKVcache"}}</span>
                </template>
              </let-table-column>
              <let-table-column :title="$t('serverList.servant.comment')" prop="comment"></let-table-column>
              <let-table-column :title="$t('releasePackage.uploadTime')" prop="posttime"></let-table-column>
              <let-pagination slot="pagination" align="right"
                              :total="publishModal.totalPatchPage" :page="publishModal.patchPage"
                              @change="patchChangePage">
              </let-pagination>
            </let-table>
            <let-button theme="primary" size="small" class="mt10" @click="savePublishServer">{{$t('common.patch')}}
            </let-button>
          </let-form-item>
          <let-form-item :label="$t('serverList.table.th.version')" v-else>
            <let-select size="small" required :required-tip="$t('deployService.table.tips.empty')"
                        v-model="tagVersion"
                        requred>
              <let-option v-for="it in tagList" :key="`${it.version}`" :value="it.path +'--'+ it.version">
                {{it.version}}
              </let-option>
            </let-select>
            <let-button theme="primary" size="small" class="mt10" @click="addCompileTask">
              {{$t('pub.dlg.compileAndPublish')}}
            </let-button>
            <let-button size="small" class="mt10" @click="openPubConfModal" v-if="false">{{$t('pub.dlg.conf')}}
            </let-button>
          </let-form-item>
        </let-form>
      </let-modal>

      <!-- 上传发布包弹出框 -->
      <let-modal
        v-model="uploadModal.show"
        :title="$t('pub.dlg.upload')"
        width="880px"
        :footShow="false"
        @on-cancel="closeUploadModal">
        <let-form
          v-if="uploadModal.model"
          ref="uploadForm"
          itemWidth="100%"
          @submit.native.prevent="uploadPatchPackage">
          <let-form-item :label="$t('pub.dlg.releasePkg')" itemWidth="400px">
            <let-uploader
              :placeholder="$t('pub.dlg.defaultValue')"
              @upload="uploadFile">{{$t('common.submit')}}
            </let-uploader>
            <span v-if="uploadModal.model.file">{{uploadModal.model.file.name}}</span>
          </let-form-item>
          <let-form-item :label="$t('serverList.servant.comment')">
            <let-input
              type="textarea"
              :rows="3"
              v-model="uploadModal.model.comment"
            >
            </let-input>
          </let-form-item>
          <let-button type="submit" theme="primary">{{$t('serverList.servant.upload')}}</let-button>
        </let-form>
      </let-modal>

      <!-- 发布结果弹出框 -->
      <PublishStatus ref="publishStatus"></PublishStatus>
      <!--
      <let-modal
        v-model="finishModal.show"
        :title="$t('serverList.table.th.result')"
        width="880px"
        :footShow="false"
        @on-cancel="closeFinishModal">
        <let-table
          v-if="finishModal.model"
          :title="$t('serverList.servant.taskID') + finishModal.model.task_no"
          :data="finishModal.model.items">
          <let-table-column :title="$t('serverList.table.th.ip')" prop="node_name"></let-table-column>
          <let-table-column :title="$t('common.status')">
            <template slot-scope="scope">
              <let-tag
                :theme="scope.row.status == 2 ? 'success' : (scope.row.status == 3 ? 'danger' : '')" checked>
                {{statusConfig[scope.row.status] + (scope.row.status != 2 && scope.row.status != 3 ? '...' : '')}}
              </let-tag>
            </template>
          </let-table-column>
        </let-table>
      </let-modal>
      -->
    </div>

    <!-- 发布历史 -->
    <div v-if="showHistory">
      <let-form inline itemWidth="300px" @submit.native.prevent="getHistoryList">
        <let-form-item :label="$t('pub.date')">
          <let-date-range-picker :start.sync="startTime" :end.sync="endTime"></let-date-range-picker>
        </let-form-item>
        <let-form-item>
          <let-button type="submit" theme="primary">{{$t('operate.search')}}</let-button>
        </let-form-item>
      </let-form>
      <let-table ref="historyTable" :data="totalHistoryList"
                 :title="$t('historyList.title')" :empty-msg="$t('common.nodata')">
        <let-table-column :title="$t('serverList.servant.taskID')" prop="task_no"></let-table-column>
        <let-table-column :title="$t('historyList.table.th.c2')">
          <template slot-scope="scope">
            <span>{{scope.row.serial ? $t('common.yes') : $t('common.no')}}</span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.dlg.title.taskStatus')">
          <template slot-scope="scope">
            <span>{{ statusMap[scope.row.status] || '-'}}</span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('historyList.table.th.c4')">
          <template slot-scope="scope">
            <let-table-operation @click="viewTask(scope.row.task_no)">{{$t('operate.view')}}</let-table-operation>
          </template>
        </let-table-column>
        <let-pagination slot="pagination" align="right"
                        :total="historyTotalPage" :page="historyPage" @change="changeHistoryPage">
        </let-pagination>
        <div slot="operations" style="margin-left: -15px;">
          <let-button theme="primary" size="small" @click="showHistory=false">{{$t('operate.goback')}}</let-button>
        </div>
      </let-table>


      <!-- 子任务详情弹出框 -->
      <let-modal
        v-model="taskModal.show"
        :title="$t('historyList.table.th.c4')"
        width="880px"
        :footShow="false"
        @on-cancel="taskModal.show = false">
        <let-table
          v-if="taskModal.model"
          :data="taskModal.model.items">
          <let-table-column :title="$t('historyList.dlg.th.c1')" prop="item_no"></let-table-column>
          <let-table-column :title="$t('historyList.dlg.th.c2')" prop="application"></let-table-column>
          <let-table-column :title="$t('historyList.dlg.th.c3')" prop="server_name"></let-table-column>
          <let-table-column :title="$t('historyList.dlg.th.c4')" prop="node_name"></let-table-column>
          <let-table-column :title="$t('historyList.dlg.th.c5')" prop="command"></let-table-column>
          <let-table-column :title="$t('monitor.search.start')" prop="start_time"></let-table-column>
          <let-table-column :title="$t('monitor.search.end')" prop="end_time"></let-table-column>
          <let-table-column :title="$t('common.status')" prop="status_info"></let-table-column>
          <let-table-column :title="$t('historyList.dlg.th.c7')" prop="execute_info"></let-table-column>
        </let-table>
      </let-modal>
    </div>

    <!-- 配置编译接口 -->
    <let-modal
      v-model="publishUrlConfModal.show"
      :title="$t('pub.dlg.conf')"
      width="800px"
      :footShow="true"
      @on-confirm="saveCompilerUrl"
      @on-cancel="publishUrlConfModal.show = false">
      <let-form ref="compilerForm"
                itemWidth="100%"
                v-if="publishUrlConfModal.model"
                required>
        <let-form-item :label="$t('pub.dlg.tag')">
          <let-input size="small"
                     v-model="publishUrlConfModal.model.tag"
                     :placeholder="$t('pub.tips.tag')"
                     :required-tip="$t('deployService.table.tips.empty')"
                     required></let-input>
        </let-form-item>
      </let-form>
    </let-modal>

    <!-- 编译进度 -->
    <let-modal
      v-model="compilerModal.show"
      :title="$t('pub.dlg.compileProgress')"
      width="880px"
      :footShow="false">
      <let-table
        v-if="compilerModal.model"
        :data="compilerModal.model.progress">
        <let-table-column :title="$t('historyList.dlg.th.c2')" prop="application"></let-table-column>
        <let-table-column :title="$t('historyList.dlg.th.c3')" prop="server_name"></let-table-column>
        <let-table-column :title="$t('historyList.dlg.th.c4')" prop="node"></let-table-column>
        <let-table-column :title="$t('historyList.dlg.th.c8')" prop="status">
          <template slot-scope="scope">
            <span v-if="scope.row.state=='1'" class="running">{{scope.row.status}}</span>
            <span v-else-if="scope.row.state=='2'" class="success">{{scope.row.status}}</span>
            <span v-else class="stop">{{scope.row.status}}</span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('monitor.search.start')" prop="start_time"></let-table-column>
        <let-table-column :title="$t('monitor.search.end')" prop="end_time"></let-table-column>
      </let-table>
    </let-modal>

  </div>
</template>

<script>

  import PublishStatus from '../publish/status';
  export default {
    name: 'ServerPublish',
    components: {
      PublishStatus,
    },
    data() {
      return {
        serverType: this.servertype || 'tars',
        activeKey: '',
        treeData: [],
        totalServerList: [],
        serverList: [],
        isCheckedAll: false,
        totalPage: 0,
        pageSize: 20,
        page: 1,
        publishModal: {
          publishId: null, //发布包id
          show: false,
          model: null,
          module_name: '',
          application: '',
          totalPatchPage: 0,
          patchPageSize: 10,
          patchPage: 1,
        },
        finishModal: {
          show: false,
          model: {
            task_no: '',
            items: []
          },
        },
        statusConfig: {
          0: this.$t('serverList.restart.notStart'),
          1: this.$t('serverList.restart.running'),
          2: this.$t('serverList.restart.success'),
          3: this.$t('serverList.restart.failed'),
          4: this.$t('serverList.restart.cancel'),
          5: this.$t('serverList.restart.parial'),
        },
        statusMap: {
          0: 'EM_T_NOT_START',
          1: 'EM_T_RUNNING',
          2: 'EM_T_SUCCESS',
          3: 'EM_T_FAILED',
          4: 'EM_T_CANCEL',
          5: 'EM_T_PARIAL',
        },
        showHistory: false,
        startTime: '',
        endTime: '',
        totalHistoryList: [],
        historyList: [],
        historyTotalPage: 0,
        historyPage: 1,
        historyPageSize: 20,
        taskModal: {
          show: false,
          modal: true,
        },
        uploadModal: {
          show: false,
          model: null,
        },
        patchType: 'patch',
        patchRadioData: [
          {value: 'patch', text: this.$t('pub.dlg.upload')}

        ],
        tagList: [],
        tagVersion: '',
        publishUrlConfModal: {
          show: false,
          model: {tag: '', compiler: '', task: ''},
        },
        compilerModal: {
          show: false,
          model: null
        },
        pkgUpload: {
          show: false,
          model: null
        }
      };
    },
    props: ['treeid', 'servertype'],
    methods: {
      getCompileConf(){
        this.$ajax.getJSON('/server/api/get_compile_conf').then((data) => {
          if (data.enable) {
            this.patchRadioData.push({value: 'compile', text: this.$t('pub.dlg.compileAndPublish')});
          }
        }).catch((err) => {
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        })
      },
      getServerList() {
        // 获取服务列表
        const loading = this.$Loading.show();
        this.$ajax.getJSON('/server/api/server_list', {
          // tree_node_id: this.$route.params.treeid,
          tree_node_id: this.treeid,
        }).then((data) => {
          loading.hide();
          const items = data || [];
          items.forEach((item) => {
            item.isChecked = false;
          });
          this.totalServerList = items;
          this.totalPage = Math.ceil(this.totalServerList.length / this.pageSize);
          this.page = 1;
          this.updateServerList();
        }).catch((err) => {
          loading.hide();
          this.$confirm(err.err_msg || err.message || this.$t('serverList.table.msg.fail')).then(() => {
            this.getServerList();
          });
        });
      },
      changePage(page) {
        this.page = page;
      },
      openPublishModal() {
        const checkedServerList = this.serverList.filter(item => item.isChecked);
        if (checkedServerList.length <= 0) {
          this.$tip.warning(this.$t('pub.dlg.a'));
          return;
        }
        const first = checkedServerList[0];
        this.publishModal.publishId = null; //发布包id
        this.publishModal.model = {
          application: first.application,
          server_name: first.server_name,
          serverList: checkedServerList,
          patchList: [],
          patch_id: '',
          update_text: '',
          show: true,
        };
        // 区分服务的类型，获取发布包 router、proxy、dcache、tars
        let {serverType} = this;
        let module_name = first.server_name;
        let patchPage = 1;
        let patchPageSize = 5;
        if (serverType == 'router') {
          module_name = 'RouterServer'
        } else if (serverType == 'proxy') {
          module_name = 'ProxyServer'
        } else if (serverType == 'dbaccess') {
          module_name = 'CombinDbAccessServer'
        } else if (serverType == 'dcache') {
          module_name = 'DCacheServerGroup'
        }
        this.publishModal.module_name = module_name;
        this.publishModal.application = first.application;
        this.publishModal.patchPage = patchPage;
        this.publishModal.patchPageSize = patchPageSize;
        this.getPatchList(first.application, module_name, patchPage, patchPageSize).then((data) => {
          this.publishModal.model.patchList = data.rows;
          this.publishModal.totalPatchPage = Math.ceil(data.count / patchPageSize);
          this.publishModal.show = true;

        });
      },
      patchChangePage(page) {
        this.publishModal.patchPage = page;
        let {module_name, application, patchPage, patchPageSize} = this.publishModal;
        this.getPatchList(application, module_name, patchPage, patchPageSize).then((data) => {
          this.publishModal.model.patchList = data.rows;
          this.publishModal.totalPatchPage = Math.ceil(data.count / patchPageSize);
        });
      },
      getPatchList(application, serverName, currPage, pageSize) {
        return this.$ajax.getJSON('/server/api/server_patch_list', {
          application,
          module_name: serverName,
          curr_page: currPage,
          page_size: pageSize
        });
      },
      closePublishModal() {
        // 关闭发布弹出框
        this.publishModal.show = false;
        this.publishModal.modal = null;
        this.patchType = 'patch';
        this.$refs.publishForm.resetValid();
      },
      savePublishServer() {
        // 发布
        if (this.$refs.publishForm.validate()) {
          const items = [];
          let patch_id = this.serverType === 'tars'? this.publishModal.model.patch_id.toString() : this.publishModal.publishId;
          if (!patch_id) return this.$tip.warning(this.$t('pub.dlg.ab'));
          // 区分服务的类型，获取发布包 router、proxy、dcache、tars
          let {serverType} = this;
          let group_name = "";
          if (serverType == 'router') {
            group_name = 'RouterServer'
          } else if (serverType == 'proxy') {
            group_name = 'ProxyServer'
          } else if (serverType == 'dbaccess') {
            group_name = 'CombinDbAccessServer'
          } else if (serverType == 'dcache') {
            group_name = 'DCacheServerGroup'
          }
          this.$refs.publishStatus.savePublishServer(this.publishModal, this.closePublishModal, group_name, patch_id);
          // this.publishModal.model.serverList.forEach((item) => {
          //   items.push({
          //     server_id: item.id.toString(),
          //     command: 'patch_tars',
          //     parameters: {
          //       patch_id: patch_id,
          //       bak_flag: item.bak_flag,
          //       update_text: this.publishModal.model.update_text,
          //       group_name
          //     },
          //   });
          // });
          // const loading = this.$Loading.show();
          // this.$ajax.postJSON('/server/api/add_task', {
          //   serial: true,
          //   items,
          // }).then((data) => {
          //   loading.hide();
          //   this.closePublishModal();
          //   this.finishModal.model.task_no = data;
          //   this.finishModal.show = true;
          //   // 实时更新状态
          //   this.getTaskRepeat(data);
          // }).catch((err) => {
          //   loading.hide();
          //   this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
          // });
        }
      },
      closeFinishModal() {
        // 关闭发布结果弹出框
        this.finishModal.show = false;
        this.finishModal.modal = null;
        this.$refs.finishForm.resetValid();
      },
      // getTaskRepeat(taskId) {
      //   let timerId;
      //   timerId && clearTimeout(timerId);
      //   const getTask = () => {
      //     this.$ajax.getJSON('/server/api/task', {
      //       task_no: taskId,
      //     }).then((data) => {
      //       let done = true;
      //       data.items.forEach((item) => {
      //         // 2、3 成功，失败
      //         if (![2, 3].includes(item.status)) {
      //           done = false;
      //         }
      //       });
      //       done ? clearTimeout(timerId) : timerId = setTimeout(getTask, 2000);
      //       this.finishModal.model.items = data.items;
      //     }).catch((err) => {
      //       clearTimeout(timerId);
      //       this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      //     });
      //   };
      //   getTask();
      // },
      updateServerList() {
        // 更新服务列表
        const start = (this.page - 1) * this.pageSize;
        const end = this.page * this.pageSize;
        this.serverList = this.totalServerList.slice(start, end);
      },
      gotoHistory() {
        // 切换到发布历史
        this.showHistory = true;
        this.getHistoryList(1);
      },
      getHistoryList(curr_page) {
        // 更新历史记录
        if (typeof curr_page != 'number') {
          curr_page = 1;
        }
        const loading = this.$Loading.show();
        const params = {
          application: this.serverList[0].application || '',
          server_name: this.serverList[0].server_name || '',
          from: this.startTime,
          to: this.endTime,
          page_size: this.historyPageSize,
          curr_page: curr_page
        };
        this.historyPage = curr_page;
        this.$ajax.getJSON(`/server/api/task_list`, params).then((data) => {
          loading.hide();
          this.totalHistoryList = data.rows || [];
          this.historyTotalPage = Math.ceil(data.count / this.historyPageSize);
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      },
      viewTask(taskId) {
        this.$ajax.getJSON('/server/api/task', {
          task_no: taskId,
        }).then((data) => {
          this.taskModal.model = data;
          this.taskModal.show = true;
        });
      },
      changeHistoryPage(page) {
        this.getHistoryList(page);
      },
      showUploadModal() {
        if (this.serverList.length <= 0) {
          this.$tip.warning(this.$t('pub.dlg.a'));
        }
        this.uploadModal.model = {
          application: this.serverList[0].application || '',
          server_name: this.serverList[0].server_name || '',
          file: null,
          comment: '',
        };
        this.uploadModal.show = true;
      },
      closeUploadModal() {
        // 关闭上传文件弹出框
        this.uploadModal.show = false;
        this.uploadModal.model = null;
        this.$refs.uploadForm.resetValid();
      },
      uploadFile(file) {
        this.uploadModal.model.file = file;
      },
      uploadPatchPackage() {
        // 上传发布包
        if (this.$refs.uploadForm.validate()) {
          const loading = this.$Loading.show();
          const formdata = new FormData();
          formdata.append('application', this.uploadModal.model.application);
          formdata.append('module_name', this.uploadModal.model.server_name);
          formdata.append('suse', this.uploadModal.model.file);
          formdata.append('comment', this.uploadModal.model.comment);
          formdata.append('task_id', new Date().getTime());
          this.$ajax.postForm('/server/api/upload_patch_package', formdata).then(() => {
            this.getPatchList(this.uploadModal.model.application, this.uploadModal.model.server_name, 1, 50).then((data) => {
              loading.hide();
              this.publishModal.model.patchList = data.rows;
              this.closeUploadModal();
            });
          }).catch((err) => {
            loading.hide();
            this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
          });
        }
      },

      // 处理未发布时间显示
      handleNoPublishedTime(timeStr, noPubTip = this.$t('pub.dlg.unpublished')) {
        if (timeStr === '0000:00:00 00:00:00') {
          return noPubTip;
        }
        return timeStr;
      },
      // 选择上传方式或编译发布方式
      patchChange() {
        if (this.patchType == 'patch') {
          this.publishModal.model.show = true;
        } else {
          this.publishModal.model.show = false;
          this.getCodeVersion();
        }
      },
      getCodeVersion() {
        this.$ajax.get('/server/api/get_tag_list', {
          application: this.publishModal.model.application,
          server_name: this.publishModal.model.server_name
        }).then(data => {
          if (data.data == '') {
            this.openPubConfModal();
          } else {
            this.tagList = data.data;
          }
        }).catch(e => {
          this.tagList = [];
          this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
        })
      },
      openPubConfModal() {
        this.publishUrlConfModal.show = true;
        this.$ajax.getJSON('/server/api/get_tag_conf', {
          application: this.publishModal.model.application,
          server_name: this.publishModal.model.server_name,
        }).then(data => {
          this.publishUrlConfModal.model.tag = data.path;
        }).catch(err => {
          this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
        })
      },
      saveCompilerUrl() {
        if (this.$refs.compilerForm.validate()) {
          const loading = this.$Loading.show();
          this.$ajax.getJSON('/server/api/set_tag_conf', {
            path: this.publishUrlConfModal.model.tag,
            application: this.publishModal.model.application,
            server_name: this.publishModal.model.server_name,
          }).then(data => {
            loading.hide();
            this.$tip.success(this.$t('common.success'));
            this.publishUrlConfModal.show = false;
            this.getCodeVersion();
          }).catch(err => {
            loading.hide();
            this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
          })
        }
      },
      addCompileTask() {
        this.$ajax.getJSON('/server/api/get_compile_conf').then(data => {
          const compileUrl = data.getVersionList;
          if (!compileUrl) {
            this.openPubConfModal();
            return;
          } else {
            let nodes = this.publishModal.model.serverList.map(item => item.node_name);
            let opts = {
              application: this.publishModal.model.application,
              server_name: this.publishModal.model.server_name,
              node: nodes.join(';'),
              path: this.tagVersion.split('--')[0],
              version: this.tagVersion.split('--')[1],
              comment: this.publishModal.model.update_text || '',
              compileUrl: compileUrl
            };
            const loading = this.$Loading.show();
            this.$ajax.postJSON('/server/api/do_compile', opts).then(data => {
              loading.hide();
              this.compilerModal.show = true;
              const taskNo = typeof data === 'string' ? data : data.data;
              this.getStatus(taskNo);
              //this.taskStatus(taskNo);
            }).catch(err => {
              loading.hide();
              this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
            })
          }
        }).catch(err => {
          this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
        })
      },
      taskStatus(taskNo) {
        this.getStatus(taskNo);
      },
      getStatus(taskNo) {
        const f = () => {
          let t = null;
          t && clearTimeout(t);
          this.$ajax.getJSON('/server/api/compiler_task', {taskNo}).then(data => {
            const ret = typeof data === 'array' ? data : data.data;
            ret[0].status = this.statusConfig[ret[0].state];
            if (ret[0].state == 1) {
              t = setTimeout(f, 2000);
            }
            if (this.compilerModal.model) {
              Object.assign(this.compilerModal.model, {progress: ret})
            } else {
              this.compilerModal.model = {progress: ret};
            }
            // 编译成功后轮询发布包回传情况
            if (ret[0].state == 2) {
              const loading = this.$Loading({text: '回传发布包'});
              loading.show();
              this.compilerModal.show = false;
              let timer = () => {
                this.$ajax.getJSON('/server/api/get_server_patch', {task_id: taskNo}).then(data => {
                  if (Object.keys(data).length !== 0) {
                    loading.hide();
                    this.publishModal.model.patch_id = data.id;
                    this.publishModal.show = false;
                    this.savePublishServer();
                  } else {
                    setTimeout(timer, 2000);
                  }
                }).catch(err => {
                  loading.hide();
                  this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
                });
              }
              setTimeout(timer, 2000);
            }
          }).catch(err => {
            this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
          })
        }
        f();
      }
    },
    mounted() {
      this.getServerList();
      this.getCompileConf();
    },
    watch: {
      isCheckedAll() {
        const isCheckedAll = this.isCheckedAll;
        this.serverList.forEach((item) => {
          item.isChecked = isCheckedAll;
        });
      },
      page() {
        this.updateServerList();
      }
    },
  };
</script>

<style lang="postcss">
  @import '../../assets/css/variable.css';

  .page_server_publish {
    padding-bottom: 32px;

  .mt10 {
    margin-top: 10px;
  }

  .running {
    color: #3f5ae0
  }

  .success {
    color: #6accab
  }

  .stop {
    color: #f56c77
  }

  }
</style>
