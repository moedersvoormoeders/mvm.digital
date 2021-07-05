<template id="search">
  <div class="container">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <div v-if="!loading">
      <h1>Materiaal</h1>
      <form m v-on:submit.prevent="search">
        <div class="row">
          <div class="col-8 big-search">
            <div class="input-group mb-1">
              <div class="input-group-prepend">
                <div class="input-group-text">{{ prefix }}</div>
              </div>
              <input
                type="text"
                class="form-control"
                ref="search"
                v-model="searchQuery"
                v-focus
              />
            </div>
          </div>
          <div class="col-4">
            <button
              type="button"
              class="btn btn-lg btn-success"
              v-on:click="search()"
              :disabled="searching"
            >
              <i class="fas fa-search"></i
              ><span class="d-none d-md-inline"> Zoeken</span>
            </button>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4 col-12">
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <label class="input-group-text" for="inputGroupSelect01"
                  >Type</label
                >
              </div>
              <select class="custom-select" v-model="prefix">
                <option value="MVM">Doelgroep</option>
                <option value="E">Eenmaligen</option>
                <option value>Op naam zoeken</option>
              </select>
            </div>
          </div>
        </div>
      </form>
      <div class="container" v-if="results.length > 0">
        <!--TODO: search results-->
      </div>
    </div>
  </div>
</template>

<script>
import { klantenService } from "../../_services/klanten.service";
import { authService } from "../../_services/auth.service";
import { keyboardHelper } from "@/_helpers/keyboard.helper";

export default {
  template: "#search",
  components: {},
  data: function () {
    return {
      loading: false,
      searchQuery: "",
      prefix: "MVM",
      searching: false,
      results: [],
    };
  },

  methods: {
    search: function () {
      let vm = this;

      if (this.prefix != "MVM") {
        alert("Nog niet ondersteund, Maartje haar schuld...");
        return;
      }

      this.searchQuery = keyboardHelper.superCrazyAzertyBarcodeFix(
        this.searchQuery
      );

      klantenService
        .lookUpNumber(`${this.prefix}${this.searchQuery}`)
        .then(function (result) {
          vm.searching = false;

          vm.results = [];

          vm.results.push({
            id: result.zohoID,
            naam: result.naam,
            voornaam: result.voornaam,
            doelgroepnummer: result.mvmNummer,
            code: result.code,
          });

          // TODO: implement multi results in the API backend

          vm.$router.push({
            name: "materiaal-details",
            params: { id: result.mvmNummer },
          });

          vm.doelgroepnummer = "";
        })
        .catch((error) =>
          vm.$Simplert.open({
            title: "Geen Resultaten!",
            message: error,
            type: "error",
            customCloseBtnText: "Sluiten",
          })
        );
    },
  },

  created: function () {
    authService.check().catch(() => this.$router.push("/login"));
  },
};
</script>

<style scoped>
.col-title {
  font-weight: bold;
  display: block;
}
</style>
