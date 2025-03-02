<template>
  <div class="page_operation_templates">
    
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('deployService.form.template')">
        <let-input size="small" v-model="query.template_name"></let-input>
      </let-form-item>
      <let-form-item :label="$t('template.search.parentTemplate')">
        <let-input size="small" v-model="query.parents_name"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
      </let-form-item>
      <div style="float: right">
        <let-button size="small" theme="primary" @click="addItem">{{$t('template.btn.addTempate')}}</let-button>
      </div>
    </let-form>

    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('deployService.form.template')" prop="template_name" width="25%"></let-table-column>
      <let-table-column :title="$t('template.search.parentTemplate')" prop="parents_name" width="25%"></let-table-column>
      <let-table-column :title="$t('cfg.btn.lastUpdate')" prop="posttime"></let-table-column>
      <let-table-column :title="$t('operate.operates')" width="300px">
        <template slot-scope="scope">
          <let-table-operation @click="mergeItem(scope.row)">{{$t('operate.merge')}}</let-table-operation>
          <let-table-operation @click="viewItem(scope.row)">{{$t('operate.view')}}</let-table-operation>
          <let-table-operation @click="editItem(scope.row)">{{$t('operate.update')}}</let-table-operation>
          <let-table-operation @click="removeItem(scope.row)">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <let-modal v-model="viewModal.show" :title="$t('template.view.title')" width="800px">
      <pre v-if="viewModal.model">{{viewModal.model.profile}}</pre>
      <div slot="foot"></div>
    </let-modal>

    <let-modal
      v-model="detailModal.show"
      :title="detailModal.isNew ? this.$t('template.add.title') : this.$t('template.update.title')"
      width="800px"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="700px">
        <let-form-item :label="$t('deployService.form.template')" required>
          <let-input
            size="small"
            v-model="detailModal.model.template_name"
            :placeholder="$t('template.add.templateFormatTips')"
            required
            :required-tip="$t('template.add.templateNameTips')"
            pattern="^[a-zA-Z-]([.a-zA-Z0-9-]+)?$"
            :pattern-tip="$t('template.add.templateFormatTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('template.search.parentTemplate')" required>
          <let-select
            size="small"
            v-model="detailModal.model.parents_name"
            :placeholder="$t('pub.dlg.defaultValue')"
            required
            :required-tip="$t('deployService.table.tips.empty')"
          >
            <let-option value>{{$t('pub.dlg.defaultValue')}}</let-option>
            <let-option
              v-for="d in items"
              :key="d.id"
              :value="d.template_name"
            >{{d.template_name}}</let-option>
          </let-select>
        </let-form-item>
        <let-form-item :label="$t('template.form.content')" required>
          <let-input
            type="textarea"
            :rows="10"
            size="small"
            v-model="detailModal.model.profile"
            required
            :required-tip="$t('deployService.table.tips.empty')"
          ></let-input>
        </let-form-item>
      </let-form>
    </let-modal>
  </div>
</template>

<script>
export default {
  name: 'OperationTemplates',

  data() {
    return {
      query: {
        template_name: '',
        parents_name: '',
      },
      items: [],
      viewModal: {
        show: false,
        model: null,
      },
      detailModal: {
        show: false,
        model: null,
        isNew: false
      },
    };
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    fetchData() {
      const loading = this.$refs.table.$loading.show();
      return this.$ajax.getJSON('/server/api/query_profile_template', this.query).then((data) => {
        loading.hide();
        this.items = data;
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    search() {
      this.fetchData();
    },

    closeDetailModal() {
      this.$refs.detailForm.resetValid();
      this.detailModal.show = false;
      this.detailModal.model = null;
    },

    addItem() {
      this.detailModal.model = {};
      this.detailModal.show = true;
      this.detailModal.isNew = true;
    },

    viewItem(d) {
      this.viewModal.model = d;
      this.viewModal.show = true;
    },

    editItem(d) {
      this.detailModal.model = d;
      this.detailModal.show = true;
      this.detailModal.isNew = false;
    },
    mergeItem(model) {
      const loading = this.$Loading.show();
        this.$ajax.getJSON('/server/api/get_merge_profile_template', {template_name:model.template_name}).then((data) => {
          loading.hide();
          // console.log(data);
          model.profile = data.template;
          this.viewModal.model = model;
          this.viewModal.show = true;
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
    },
    saveItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.detailModal.model;
        const url = model.id ? '/server/api/update_profile_template' : '/server/api/add_profile_template';

        const loading = this.$Loading.show();
        this.$ajax.postJSON(url, model).then(() => {
          loading.hide();
          this.$tip.success(this.$t('common.success'));
          this.closeDetailModal();
          this.fetchData();
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }
    },

    removeItem(d) {
      this.$confirm(this.$t('template.delete.confirmTips'), this.$t('common.alert')).then(() => {
        const loading = this.$Loading.show();
        this.$ajax.getJSON('/server/api/delete_profile_template', { id: d.id }).then(() => {
          loading.hide();
          this.fetchData().then(() => {
            this.$tip.success(this.$t('common.success'));
          });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }).catch(() => {});
    },
  },
};
</script>

<style lang="postcss">
.page_operation_templates {
  pre {
    color: #909FA3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }
}
</style>
