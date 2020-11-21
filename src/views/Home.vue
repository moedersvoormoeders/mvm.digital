<template id="home">
  <div class="container">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <div v-if="!loading">
      <h1>Home</h1>
    </div>
  </div>
</template>

<script>
import { authService } from "../_services/auth.service"

export default {
  template: "#home",
  components: {},
  data: function() {
    return {
      loading: false,
    };
  },

  created: function() {
    authService.check().catch(() => this.$router.push("/login"))
  }
};
</script>
