<template id="home">
  <div class="container">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <div v-if="!loading">
      <h1>Home</h1>
      <hr />
      <h2>Statistiek</h2>
      <div class="row">
        <div class="col-6" v-if="permissions.voeding">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Voeding</h5>
              <p class="card-text">Vandaag: {{ aantalVoeding }} paketten</p>
              <voeding-chart :chartdata="voedingData"></voeding-chart>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authService } from "../_services/auth.service";
import VoedingChart from "./dashboard/voedingChart";
import { dashboardService } from "@/_services/dashboard.service";

export default {
  template: "#home",
  components: { VoedingChart },
  data: function () {
    return {
      loading: false,
      permissions: {
        voeding: false,
      },
      voedingData: {
        labels: [],
        datasets: [],
      },
      aantalVoeding: 0,
    };
  },

  methods: {
    handleVoedingResponse: function (resp) {
      this.voedingData = {
        labels: Object.keys(resp),
        datasets: [
          {
            label: "Paketten",
            backgroundColor: "#695AD8",
            data: Object.values(resp),
          },
        ],
      };

      for (let key in resp) {
        if (key.substr(0, 10) == new Date().toISOString().substr(0, 10)) {
          this.aantalVoeding = resp[key];
          break;
        }
      }
    },
  },

  created: function () {
    authService.check().catch(() => this.$router.push("/login"));
    authService.canIDo("GET", "/v1/dashboard/voeding").then((r) => {
      this.permissions.voeding = r;
      if (r) {
        dashboardService.getVoeding().then(this.handleVoedingResponse);
      }
    });
  },
};
</script>
