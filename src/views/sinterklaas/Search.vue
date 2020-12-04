<template id="sinterklaas-search">
  <div class="container">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <div v-if="!loading">
      <h1>Sinterklaas</h1>
      <form m v-on:submit.prevent="search">
        <div class="row">
          <div class="col-8 big-search">
            <div class="input-group mb-1">
              <div class="input-group-prepend">
                <div class="input-group-text">{{ prefix }}</div>
              </div>
              <input type="text" class="form-control" ref="search" v-model="searchQuery" v-focus/>
            </div>
          </div>
          <div class="col-4">
            <button
                type="button"
                class="btn btn-lg btn-success"
                v-on:click="search()"
                :disabled="searching"
            >
              <i class="fas fa-search"></i><span class="d-none d-md-inline"> Zoeken</span>
            </button>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4 col-12">
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <label class="input-group-text" for="inputGroupSelect01">Type</label>
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
      <div class="container p-0" v-if="results.length > 0">
        <div class="card" v-for="result in results" v-bind:key="result.id">
          <div class="card-body">
            <h3 class="card-title">Gezin</h3>
            <div class="row">
              <div class="col-4">
                <div class="col-title">MVM Nummer</div>
                {{ result.mvmNummer }}
              </div>
              <div class="col-4">
                <div class="col-title">Naam</div>
                {{ result.naam }}
              </div>
              <div class="col-4">
                <div class="col-title">Tijdslot</div>
                {{ result.tijdslot }}
              </div>
            </div>


            <h3 class="card-title mb-1 mt-3">Kinderen</h3>
            <div class="row pakket-header">
              <div class="col-1">
                <div class="col-title">Braaf</div>
              </div>
              <div class="col-1">
                <div class="col-title">Komt</div>
              </div>
              <div class="col-2">
                <div class="col-title">Naam</div>
              </div>
              <div class="col-2">
                <div class="col-title">Leeftijd</div>
              </div>
              <div class="col-2">
                <div class="col-title">Geslacht</div>
              </div>
              <div class="col-4">
                <div class="col-title">Opmerking</div>
              </div>
            </div>
            <div class="pakket-body">
              <div class="row pakket-row" v-for="pakket in result.paketten" v-bind:key="pakket.naam">
                <div class="col-1">
                  <!-- TODO: do not hard code before the first year all children were not nice -->
                  <i class="fas fa-check-square fa-2x" style="color:green"></i>
                </div>
                <div class="col-1">
                  {{ pakket.komt ? "Ja" : "Nee" }}
                </div>
                <div class="col-2">
                  {{ pakket.naam }}
                </div>
                <div class="col-2">
                  {{ pakket.leeftijd }}
                </div>
                <div class="col-2">
                  {{ pakket.geslacht }}
                </div>
                <div class="col-4">
                  {{ pakket.opmerking }}
                </div>
              </div>
            </div>

            <div class="row mt-5">
              <button type="button" class="col-5 m-1 btn btn-primary print-num" v-on:click="print(result)"><i
                  class="fad fa-print"></i></button>
              <div class="col-3">
                <i class="fas fa-check-square fa-3x" style="color:green" v-if="hasPrinted(result.mvmNummer)"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {sinterklaasService} from "../../_services/sinterklaas.service"
import {klantenService} from "../../_services/klanten.service"
import {authService} from "../../_services/auth.service"

export default {
  template: "#sinterklaas-search",
  components: {},
  data: function () {
    return {
      loading: false,
      searchQuery: "",
      prefix: "MVM",
      searching: false,
      results: [],
      printed: [],
    };
  },

  methods: {
    hasPrinted: function (number) {
      if (this.printed.indexOf(number) >= 0) {
        return true
      }

      return false
    },
    print: async function (result) {
      try {
        const kinderen = []
        const newPaketten = []
        for (let pakket of result.paketten) {
          if (pakket.komt) {
            newPaketten.push(pakket)
            kinderen.push(pakket.naam)
          }
        }

        await sinterklaasService.saveKinderenForNumber(result.mvmNummer, kinderen)
        const klantInfo = await klantenService.lookUpNumber(result.mvmNummer)

        const response = await fetch("https://onthaal.print.mvm.digital/sinterklaas", {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
          body: JSON.stringify({
            snoep: {
              mvmNummer: result.mvmNummer,
              naam: result.naam,
              kinderen: klantInfo.aantalOnder12Jaar,
              volwassenen: klantInfo.aantalBovenOf12Jaar,
            },
            speelgoed: {
              naam: result.naam,
              mvmNummer: result.mvmNummer,
              paketten: newPaketten,
            },
          }, getCircularReplacer())
        });
        const resp = await response.json();
        if (resp.status == "error") {
          throw resp
        }

        this.$Simplert.open({
          title: "Print verstuurd",
          message: "Print opdracht verstuurd",
          type: "success",
          customCloseBtnText: "Sluiten",
          onClose: function() {
            this.$refs.search.focus()
          }
        });

        this.printed.push(result.mvmNummer)
      } catch (e) {
        this.$Simplert.open({
          title: "Print error!",
          message: e,
          type: "error",
          customCloseBtnText: "Sluiten"
        })
      }
    },
    search: function () {
      let vm = this;

      if (this.prefix != "MVM") {
        alert("Nog niet ondersteund, Maartje haar schuld...")
        return
      }

      sinterklaasService.lookUpNumber(`${this.prefix}${this.searchQuery}`).then(function (result) {
        vm.searching = false;

        vm.results = [];
        vm.results.push(result);

        vm.searchQuery = "";

      }).catch((error) =>
          vm.$Simplert.open({
            title: "Geen Resultaten!",
            message: error,
            type: "error",
            customCloseBtnText: "Sluiten"
          })
      );
    }
  },

  created: function () {
    authService.check().catch(() => this.$router.push("/login"))
  }
};

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

</script>

<style scoped>
.col-title {
  font-weight: bold;
  display: block;
}

.pakket-row {
  padding: 10px 0px 10px 0px;
  border-bottom: #6c757d solid 1px;
}
.pakket-row div{

}

.pakket-header {
  border-bottom: #6c757d solid 2px;
  margin-bottom: 10px;
}

.pakket-body {
  margin: 0px;
  padding: 0px;
}
</style>