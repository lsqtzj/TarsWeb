<template>
  <div id="app">
    <k8s-header></k8s-header>
    <p id="web_version">Version:{{ web_version }}</p>
    <!-- 切换 tab 缓存接口（主要为左侧目录树） -->
    <keep-alive>
      <router-view class="main-width"></router-view>
    </keep-alive>

    <!-- <app-footer class="app_index__footer"></app-footer> -->
  </div>
</template>

<script>
import Axios from "axios";
import K8sHeader from "./components/app/k8s-header";
import AppFooter from "./components/app/footer";

export default {
  name: "App",
  components: {
    K8sHeader,
    AppFooter,
  },
  data() {
    return {
      web_version: " loading··",
    };
  },
  mounted() {
    Axios.create({ baseURL: "/" })({
      method: "get",
      url: "/web/k8s_version",
    }).then((response) => {
      this.web_version = response.data;
      this.$store.commit({
        type: "version",
        version: this.web_version,
      });
    });
  },
};
</script>

<style lang="postcss">
@import "./assets/font/lato/Lato.css";
@import "./assets/css/reset.css";
@import "./assets/css/variable.css";

#web_version {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #888;
  font-size: 12px;
}
.clearfix {
  *zoom: 1;

  & :after,
  & :before {
    display: table;
    content: " ";
  }

  & :after {
    clear: both;
  }
}
.toe {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
}

.disabled {
  opacity: 0.65;
  pointer-events: none;
}

.hidden {
  display: none;
}

.main-width {
  margin: 0 auto;
  /* max-width: var(--main-width); */
  padding: 0 var(--gap-small);
}

#app {
  display: flex;
  flex-flow: column;
  overflow: hidden;
  position: relative;
  /* height: 100%; */
  font-size: 14px;
}

.app_index__footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

/* 调换弹窗确定取消左右顺序 */
.let-dialog .let-dialog__foot .let-align__inner {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;

  .let-button:first-child {
    margin-right: 0;
    margin-left: 16px;
  }
}
</style>
