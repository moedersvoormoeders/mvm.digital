<template id="nav">
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <a class="navbar-brand" href="#"
        >Moeders voor Moeders
        <span
          v-if="apiURL == 'https://api.staging.mvm.digital'"
          class="badge badge-warning"
          >Staging</span
        ></a
      >
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li :class="$route.name == 'home' ? 'nav-item active' : 'nav-item'">
            <router-link class="nav-link" to="/home"
              ><i class="far fa-home"></i> Home</router-link
            >
          </li>
          <li
            v-if="permissions.materiaal"
            :class="
              $route.name.indexOf('materiaal') == 0
                ? 'nav-item active'
                : 'nav-item'
            "
          >
            <router-link class="nav-link" to="/materiaal/search"
              ><i class="far fa-tshirt"></i> Materiaal</router-link
            >
          </li>
          <li
            v-if="permissions.voeding"
            :class="
              $route.name.indexOf('voeding') == 0
                ? 'nav-item active'
                : 'nav-item'
            "
          >
            <router-link class="nav-link" to="/voeding/search"
              ><i class="far fa-utensils"></i> Voeding</router-link
            >
          </li>
          <li
            v-if="permissions.sinterklaas"
            :class="
              $route.name.indexOf('sinterklaas') == 0
                ? 'nav-item active'
                : 'nav-item'
            "
          >
            <router-link class="nav-link" to="/sinterklaas/search"
              ><i class="far fa-staff"></i> Sinterklaas</router-link
            >
          </li>
        </ul>
        <!-- <form class="form-inline my-2 my-lg-0">
          <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
        </form>-->
      </div>
    </nav>

    <!-- Nested route -->
    <router-view></router-view>
  </div>
</template>

<script>
import config from "config";
import { authService } from "../_services/auth.service";

export default {
  data: function () {
    return {
      apiURL: config.apiUrl,
      permissions: {
        materiaal: false,
        voeding: false,
        sinterklaas: false,
      },
    };
  },
  methods: {
    canIDo: async function (verb, path) {
      return await authService.canIDo(verb, path);
    },
  },
  created() {
    authService.canIDo("GET", "/v1/matariaal/klant").then((r) => {
      this.permissions.materiaal = r;
    });
    authService.canIDo("GET", "/v1/voeding/klant").then((r) => {
      this.permissions.voeding = r;
    });
    authService.canIDo("GET", "/v1/sinterklaas/klant").then((r) => {
      this.permissions.sinterklaas = r;
    });
  },
};
</script>
