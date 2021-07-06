<template id="search">
  <div class="container">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <div v-if="!loading">
      <h1>Onthaal</h1>
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
                v-model="doelgroepnummer"
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
                <label class="input-group-text" for="prefix">Type</label>
              </div>
              <select class="custom-select" id="prefix" v-model="prefix">
                <option value="MVM">Doelgroep</option>
                <option value>Op naam zoeken</option>
              </select>
            </div>
          </div>
        </div>
      </form>
      <div class="container" v-if="results.length > 0">
        <div class="row" v-for="result in results" v-bind:key="result.id">
          <div class="col-12 col-md-1 text-center">
            <i
              class="fas fa-check-square fa-3x"
              style="color: green"
              v-if="result.classificatie == 'Actief'"
            ></i>
            <i
              class="fas fa-exclamation-triangle fa-3x"
              style="color: #e0cf50"
              v-if="result.classificatie == 'CONTROLE'"
            ></i>
            <i
              class="far fa-history fa-3x"
              style="color: #e0cf50"
              v-if="result.classificatie == 'TE VERLENGEN'"
            ></i>
            <i
              class="fas fa-times-octagon fa-3x"
              style="color: red"
              v-if="result.classificatie == 'Niet-actief'"
            ></i>
          </div>

          <div class="col-12 col-md-11">
            <div class="row">
              <div class="col-md-1 col-4">
                <div class="col-title">Nummer</div>
                {{ result.doelgroepnummer }}
              </div>
              <div class="col-md-1 col-4">
                <div class="col-title">Voornaam</div>
                {{ result.voornaam }}
              </div>
              <div class="col-md-2 col-4">
                <div class="col-title">Naam</div>
                {{ result.naam }}
              </div>
              <div class="col-md-1 col-4">
                <div class="col-title">Dag</div>
                {{ result.dag }}
              </div>
              <div class="col-md-1 col-4">
                <div class="col-title">Code</div>
                {{ result.code }}
              </div>
              <div class="col-md-1 col-4">
                <div class="col-title">Einddatum</div>
                {{ result.einddatum }}
              </div>
              <div class="col-md-1 col-4">
                <div class="col-title">Classificatie</div>
                {{ result.classificatie }}
              </div>
              <div class="col-md-4 col-12">
                <div class="col-title">Print</div>
                <form class="row">
                  <select class="col-6 m-1 form-control" v-model="printType">
                    <option>Gewoon</option>
                    <option>Voorrang</option>
                    <option>Leveren bij inschrijving</option>
                    <option>Andere</option>
                  </select>
                  <input
                    class="col-12 m-1 form-control"
                    v-if="printType == 'Andere'"
                    v-model="customPrintText"
                  />
                  <button
                    type="button"
                    class="col-4 m-1 p-1 btn btn-primary print-num"
                    v-on:click="print(result)"
                    v-bind:disabled="printing"
                  >
                    <i class="fad fa-print"></i>
                  </button>
                  <div class="col-1">
                    <i
                      class="far fa-check-square fa-3x"
                      style="color: green"
                      v-if="hasPrinted(result.doelgroepnummer)"
                    ></i>
                  </div>
                </form>
              </div>
              <div class="col-md-3 col-4" v-if="result.redenControle != ''">
                <div class="col-title">Reden Controle</div>
                {{ result.redenControle }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { klantenService } from "../../_services/klanten.service";
import { onthaalService } from "../../_services/onthaal.service";
import * as voedingHelper from "../../_helpers/voeding";
import { keyboardHelper } from "@/_helpers/keyboard.helper";
import { authService } from "@/_services/auth.service";

export default {
  template: "#search",
  components: {},
  data: function () {
    return {
      printed: {},
      printType: "Gewoon",
      loading: false,
      doelgroepnummer: "",
      prefix: "MVM",
      searching: false,
      printing: false,
      ticketCount: 1,
      results: [],
      customPrintText: "",
    };
  },

  methods: {
    hasPrinted: function (number) {
      const today = new Date().toLocaleDateString();

      if (!this.printed[today]) {
        return false;
      }

      return (this.printed[new Date().toLocaleDateString()] || []).includes(
        number
      );
    },
    print: async function (result) {
      try {
        this.printing = true;

        const voedingResult = await onthaalService.lookUpVoeding(
          result.doelgroepnummer
        );

        const contacten = await klantenService.getContacten(
          result.doelgroepnummer
        );

        result.ticketCount = this.ticketCount;
        result.needsMelkpoeder = voedingHelper.needsMelkpoeder(voedingResult);
        result.needsVerjaardag = voedingHelper.needsVerjaardag(contacten);
        result.specialeVoeding = voedingResult.specialeVoeding;
        result.opmerking = voedingResult.opmerking;
        result.printType = this.printType;
        if (result.printType == "Andere") {
          result.printType = this.customPrintText;
        }

        await sendPrint(result);

        this.$Simplert.open({
          title: "Print verstuurd",
          message: "Print opdracht verstuurd naar de voeding",
          type: "success",
          customCloseBtnText: "Sluiten",
          onClose: function () {
            this.$refs.search.focus();
          },
        });

        const today = new Date().toLocaleDateString();
        if (!this.printed[today]) {
          this.$set(this.printed, today, []);
        }
        this.$set(
          this.printed,
          today,
          this.printed[today].concat([result.doelgroepnummer])
        );
        this.ticketCount++;
      } catch (e) {
        this.$Simplert.open({
          title: "Error!",
          message: e,
          type: "error",
          customCloseBtnText: "Sluiten",
          onClose: function () {
            this.$refs.search.focus();
          },
        });
      }

      this.printing = false;
    },
    search: async function () {
      try {
        // reset printType
        this.printType = "Gewoon";
        this.customPrintText = "";
        this.searching = true;

        let searchPrefix = this.prefix;
        let seachTerm = this.doelgroepnummer;

        if (
          this.doelgroepnummer.length >= 11 &&
          !isNaN(parseInt(this.doelgroepnummer, 10))
        ) {
          // we have a rijksregisternummer!
          seachTerm = this.doelgroepnummer.substring(0, 11);
          searchPrefix = "";
        }

        this.results = [];

        if (searchPrefix == "MVM") {
          this.doelgroepnummer = keyboardHelper.superCrazyAzertyBarcodeFix(
            this.doelgroepnummer
          );

          const result = await klantenService.lookUpNumber(
            `${searchPrefix}${seachTerm}`
          );

          this.results.push({
            id: result.zohoID,
            naam: result.naam,
            voornaam: result.voornaam,
            doelgroepnummer: result.mvmNummer,
            code: result.code,
            dag: result.dag,
            classificatie: result.classificatie,
            redenControle: result.redenControle,
            einddatum: result.einddatum,
            typeVoeding: result.typeVoeding,
            kinderen: result.aantalOnder12Jaar,
            volwassenen: result.aantalBovenOf12Jaar,
          });

          this.doelgroepnummer = "";
        } else {
          for (let result of await klantenService.search(
            `${searchPrefix}${seachTerm}`
          )) {
            this.results.push({
              id: result.zohoID,
              naam: result.naam,
              voornaam: result.voornaam,
              doelgroepnummer: result.mvmNummer,
              code: result.code,
              dag: result.dag,
              classificatie: result.classificatie,
              redenControle: result.redenControle,
              einddatum: result.einddatum,
              typeVoeding: result.typeVoeding,
              kinderen: result.aantalOnder12Jaar,
              volwassenen: result.aantalBovenOf12Jaar,
            });
          }
        }
      } catch (e) {
        this.$Simplert.open({
          title: "Geen Resultaten!",
          message: e,
          type: "error",
          customCloseBtnText: "Sluiten",
        });
      }

      this.searching = false;
    },
  },

  created: function () {
    authService.check().catch(() => this.$router.push("/login"));
  },
};

async function sendPrint(data = {}) {
  console.log(data);
  const response = await fetch("https://voeding.print.mvm.digital/print", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  return await response.json();
}
</script>

<style scoped>
.col-title {
  font-weight: bold;
  display: block;
}
</style>
