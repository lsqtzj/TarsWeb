<template>
  <svg class="icon">
    <use :xlink:href="`#${name}`"/>
  </svg>
</template>

<script>
  export default {
    name: 'Icon',
    props: {
      name: {
        type: String,
        required: true,
      },
    },
  };
</script>

<style lang="postcss">
  .icon {
    fill: currentcolor;
    height: 1em;
    vertical-align: -.25ex;
    width: 1em;
  }
</style>
