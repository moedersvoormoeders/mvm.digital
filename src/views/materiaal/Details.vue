<template>
  <div class="container" id="app">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <div v-if="!loading">
      <div class="row">
        <div class="col-12 mb-2 mt-2">
          <span class="float-left">
            <button
              type="button"
              class="btn btn-light btn-lg"
              :disabled="saving"
              v-on:click="goBack()"
            >
              <i class="fad fa-long-arrow-left" />Terug
            </button>
          </span>
          <span class="float-right">
            <button
              type="button"
              class="btn btn-info btn-lg"
              v-on:click="print()"
            >
              <i class="far fa-print" /> Print
            </button>
            &nbsp;
            <button
              type="button"
              class="btn btn-success btn-lg"
              v-on:click="save()"
              :disabled="saving || !hasChanges()"
            >
              <i class="far fa-save" /> Opslaan
            </button>
          </span>
        </div>
      </div>
      <h3>Info</h3>
      <div class="row mb-3 materiaal-info">
        <div class="col-3 mb-3">
          <h5>Naam</h5>
          <p class="info">{{klant.voornaam}} {{klant.naam}}</p>
        </div>
        <div class="col-4 mb-3">
          <h5>MVM Nummer</h5>
          <p class="info">{{klant.mvmNummer}}</p>
        </div>
        <div class="col-2 mb-3">
          <h5>Code</h5>
          <p class="info"><span :style="(klant.code || '').indexOf('NB') >= 0 ? 'color: red;' : ''">{{klant.code}}</span></p>
        </div>
        <div class="col-3 mb-3">
          <h5>Woonplaats</h5>
          <p class="info">{{klant.postcode}} {{klant.woonplaats}}</p>
        </div>
        <div class="col-4 mb-3">
          <h5>Classificatie</h5>
          <p class="info">{{klant.classificatie}}</p>
        </div>
        <div class="col-4">
          <h5>Gezinsleden</h5>
          <pre>{{info.huishouden}}</pre>
        </div>
        <div class="col-4">
          <h5>Opmerking</h5>
          <textarea class="form-control" v-model="opmerking" rows="2"></textarea>
        </div>
      </div>

      <div class="row">
        <div class="col-12 mx-auto">
          <div id="accordion" class="accordion">
            <div v-for="materiaalType in materiaalTypes" v-bind:key="idSafeName(materiaalType)">
              <div v-bind:id="idSafeName(materiaalType)+'heading'" class="card-header bg-white shadow-sm border-0">
                <h6 class="mb-0 font-weight-bold">
                  <a
                    href="#"
                    data-toggle="collapse"
                    v-bind:data-target="'#'+idSafeName(materiaalType)"
                    aria-expanded="false"
                    v-bind:aria-controls="idSafeName(materiaalType)"
                    class="d-block position-relative text-dark text-uppercase collapsible-link py-2"
                  >{{ materiaalType.naam }}</a>
                </h6>
              </div>
              <div
                v-bind:id="idSafeName(materiaalType)"
                v-bind:aria-labelledby="idSafeName(materiaalType)"
                data-parent="#accordion"
                class="collapse"
              >
                <div class="card-body">
                  <div class="row">
                    <h3 class="col-12">
                      <span class="float-right">
                        <button type="button" class="btn btn-info mr-2" v-on:click="showFilter ? resetFilter() : showFilter = true">
                          <i class="fas fa-filter" />
                        </button>
                        <button type="button" class="btn btn-success" v-on:click="addRow(materiaalType.ID, materiaalType.naam)">
                          <i class="fas fa-plus-square" /> Rij Toevoegen
                        </button>
                      </span>
                    </h3>
                  </div>
                  <table class="table">
                    <colgroup>
                      <col/>
                      <col/>
                      <col v-if="materiaalType.perKind"/>
                      <col/>
                      <col/>
                      <col v-if="materiaalType.opMaat"/>
                      <col/>
                    </colgroup>
                    <thead class="thead-dark">
                      <tr>
                        <th>
                          Print
                        </th>
                        <th>
                          Datum
                          <div v-if="showFilter">
                            <datepicker :format="'yyyy-MM-dd'" v-model="filter.datum"></datepicker>
                          </div>
                        </th>
                        <th>
                          Aantal
                        </th>
                        <th v-if="materiaalType.perKind">
                          Kind
                          <div v-if="showFilter">
                            <multiselect v-model="filter.ontvanger" :options="getKinderen()" placeholder="Filter"></multiselect>
                          </div>
                        </th>
                        <th>
                          Item
                          <div v-if="showFilter">
                            <multiselect v-model="filter.object" track-by="naam" label="naam" :options="materiaalType.opties" placeholder="Filter" :allow-empty="true"></multiselect>
                          </div>
                        </th>
                        <th v-if="materiaalType.opMaat">
                          Maat
                          <div v-if="showFilter">
                            <multiselect v-model="filter.maat" track-by="naam" label="naam" :options="(filter.object || []).maten || []" placeholder="Filter" @remove="filter.maat=null"></multiselect>
                          </div>
                        </th>
                        <th>Opmerking</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in materiaalVoorCategorie(materiaalType.naam)" v-bind:key="item.ID">
                        <td style="width: 50px;">
                          <input type="checkbox" v-model="item.print" />
                        </td>
                        <td style="width: 160px;">
                          <datepicker :format="'yyyy-MM-dd'" v-model="item.datum"></datepicker>
                        </td>
                        <td style="width: 70px;">
                          <input v-model.number="item.aantal" class="form-control" type="number" min="1" style="width: 60px;"/>
                        </td>
                        <td v-if="materiaalType.perKind">
                          <multiselect v-model="item.ontvanger" :options="getKinderen()" placeholder="Selecteer een"></multiselect>
                        </td>
                        <td>
                          <multiselect v-model="item.object" track-by="naam" label="naam" :options="materiaalType.opties" placeholder="Selecteer een" @select="selectedNewItem($event, item)" :allow-empty="false" deselect-label=""></multiselect>
                        </td>
                         <td v-if="materiaalType.opMaat">
                           <multiselect v-model="item.maat" track-by="naam" label="naam" :options="(item.object || []).maten || []" placeholder="Selecteer een" @remove="item.maat=null" :allow-empty="false" deselect-label=""></multiselect>
                        <td>
                          <input
                            v-model="item.opmerking"
                            class="form-control"
                            placeholder="Opmerking"
                            style="width: 170px;"
                          />
                        </td>
                        <td style="width: 50px;">
                          <button
                            type="button"
                            class="btn btn-outline-danger"
                            v-on:click="removeRow(item)"
                          >
                            <i class="fad fa-trash" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { materiaalService } from "../../_services/materiaal.service"
import { klantenService } from "../../_services/klanten.service"
import * as moment from "moment"

import Datepicker from "vuejs-datepicker";
import Multiselect from "vue-multiselect";

export default {
  props: ["id"],
  components: {
    Datepicker,
    Multiselect
  },
  data: function() {
    return {
      filter: {},
      showFilter: false,
      klant: {},
      loading: true,
      originalData: "", //JSON stored here
      saving: false,
      gekregen: [],
      opmerking: "",
      info: {},
      materiaalTypes: {},
      contacten: [],
      newItemCount: 0,
    };
  },
  methods: {
    validate: function () {
      for (let gekregen of this.gekregen) {
        console.log(gekregen)
        if (!gekregen.object || gekregen.object.ID <= 0) {
          throw new Error("item niet ingevuld")
        }

        if (this.materiaalTypes[gekregen.object.categorie.naam].opMaat && (!gekregen.maat || !gekregen.maat.ID)) {
          throw new Error("maat niet ingevuld")
        }

        if (this.materiaalTypes[gekregen.object.categorie.naam].perKind && !gekregen.ontvanger) {
          throw new Error("ontvanger niet ingevuld")
        }
        if (gekregen.maat) {
          gekregen.MaatID = gekregen.maat.ID
        }
        gekregen.objectId = gekregen.object.ID
        gekregen.datum = moment(new Date(gekregen.datum)).format("YYYY-MM-DDTHH:mm:ssZ") // damn you Go
      }
    },
    idSafeName: function(cat) {
      return cat.naam.replace(" ", "")
    },
    materiaalVoorCategorie: function(catNaam) {
      const materiaal = this.gekregen.filter(item => item.object.categorie.naam == catNaam)
      if (!this.filter || !this.showFilter) {
        return materiaal
      }

      const filteredMat = []

      for (let object of materiaal) {
        let shouldDisplay = true

        if (this.filter.datum && this.filter.datum.toString() != object.datum.toString()) {
          shouldDisplay = false
        } else if (this.filter.ontvanger && this.filter.ontvanger != object.ontvanger) {
          shouldDisplay = false
        } else if (this.filter.object && this.filter.object.ID && this.filter.object.ID != object.object.ID) {
          shouldDisplay = false
        } else if (this.filter.maat && this.filter.maat.ID && this.filter.maat.ID != object.maat.ID) {
          shouldDisplay = false
        }

        if (shouldDisplay) {
          filteredMat.push(object)
        }
      }

      return filteredMat
    },
    getKinderen: function() {
      const out = []
      for (let contact of this.contacten) {
        out.push(`${contact.voornaam} ${contact.naam}`);
      }
      return out;
    },
    selectedNewItem: function (selectedOption, item) {
      item.maat = null
      console.log(selectedOption)
      if (selectedOption && selectedOption.maten && selectedOption.maten.length == 1 ) {
        item.maat = selectedOption.maten[0]
      }
    },
    addRow: function(catID, catNaam) {
      this.resetFilter()
      this.gekregen = [{
        aantal: 1,
        ontvanger: "",
        naam: "",
        maat: "",
        opmerking: "",
        object: {ID: 0, naam: "", categorie: {ID: catID, naam: catNaam}},
        datum: new Date(),
        print: true,
        _intID: this.newItemCount,
      }].concat(this.gekregen)

      this.newItemCount++
    },
    removeRow: function(obj) {
      this.gekregen = this.gekregen.filter(aObj => aObj != obj)
    },
    getGeslacht: function (naam) {
      // why is this function here...
      // well turns out I spent so much designing the database
      // without for one second even thinking about gender...
      for (let contact of this.contacten) {
        if (`${contact.voornaam} ${contact.naam}` == naam) {
          return contact.geslacht
        }
      }
      return "onbekend"
    },
    print: async function () {
      try {
        this.validate()
        await this.save()

        let items = []

        for (let gekregen of this.gekregen) {
          console.log(gekregen)
          if (gekregen.print) {
            items.push({
              object: gekregen.object.naam,
              opmerking: gekregen.opmerking,
              maat: gekregen.maat ? gekregen.maat.naam : null,
              ontvanger: gekregen.ontvanger ? { naam: gekregen.ontvanger, geslacht: this.getGeslacht(gekregen.ontvanger) } : null,
              prijs: gekregen.object.prijs,
            })
          }
        }

        if (items.length < 1) {
          throw new Error("Niets om te printen")
        }

        await sendPrint({
          klant: this.klant,
          items,
        })
      } catch (e) {
          this.$Simplert.open({
            title: "Error bij printen!",
            message: e,
            type: "error",
            customCloseBtnText: "Sluiten"
          });
        }
    },
    save: async function () {
      try {
        this.validate()
        console.log(this.gekregen)
        const resp = await materiaalService.saveForNumber(this.klant.mvmNummer, { gekregen: this.gekregen, opmerking: this.opmerking })
        this.$Simplert.open({
          title: "Opgeslagen!",
          message: resp.message,
          type: "success",
          customCloseBtnText: "Sluiten"
        });
        this.originalData = JSON.stringify({gekregen: this.gekregen, opmerking: this.opmerking}, getCircularReplacer());

        const materiaalResponse = await materiaalService.lookUpNumber(this.id);
        if (materiaalResponse.gekregen && materiaalResponse.gekregen.length != this.gekregen.length) {
          return this.save()
        }
        return true
      } catch (e) {
        this.$Simplert.open({
          title: "Error bij opslaan!",
          message: e,
          type: "error",
          customCloseBtnText: "Sluiten"
        });
        return false
      }
    },
    hasChanges: function() {
      if (JSON.stringify({gekregen: this.gekregen, opmerking: this.opmerking}, getCircularReplacer()) != this.originalData) {
        return true;
      }
      return false;
    },
    goBack: function() {
      let vm = this;
      if (this.hasChanges()) {
        this.$Simplert.open({
          title: "Er zijn niet opgeslagen wijzigingen!",
          message: "wil je deze opslaan?",
          type: "info",
          useConfirmBtn: true,
          onConfirm: function() {
            vm.save().then((ok) => {
              if (ok) {
                vm.$router.push({ name: "materiaal-search" });
              }
            })
          },
          onClose: function() {
            vm.$router.push({ name: "materiaal-search" });
          },
          customConfirmBtnClass: "btn btn-warning",
          customConfirmBtnText: "Opslaan",
          customCloseBtnText: "Teruggaan zonder opslagen"
        });
      } else {
        vm.$router.push({ name: "materiaal-search" });
      }
    },
     resetFilter: function () {
      this.filter = {
          ontvanger: "",
          naam: "",
          maat: "",
      }

      this.showFilter = false
     }
  },

  created: async function() {
    this.loading = true;
    this.resetFilter()

    let materiaalResponse;
    let klantResponse;
    let materiaalOpties;

    try {
      materiaalResponse = await materiaalService.lookUpNumber(this.id);
      klantResponse=  await klantenService.lookUpNumber(this.id);
      this.contacten = await klantenService.getContacten(this.id);
      materiaalOpties = await materiaalService.getObjectOptions();

      // fix a nil response on contacts
      if (!this.contacten) {
        this.contacten = []
      }
    }catch (e) {
      this.$Simplert.open({
        title: "Error!",
        message: e,
        type: "error",
        customCloseBtnText: "Sluiten"
      });

      return
    }

    if (materiaalResponse.gekregen) {
      this.gekregen = materiaalResponse.gekregen
    }

    this.originalData = JSON.stringify({gekregen: materiaalResponse.gekregen, opmerking: materiaalResponse.opmerking});

    for (let optie of materiaalOpties) {
      if (!this.materiaalTypes[optie.categorie.naam]) {
        this.materiaalTypes[optie.categorie.naam] = optie.categorie
        this.materiaalTypes[optie.categorie.naam].opties = []
      }
      this.materiaalTypes[optie.categorie.naam].opties.push(optie)
      console.log(this.materiaalTypes[optie.categorie.naam].opties)
    }

    this.klant = klantResponse;
    this.opmerking = materiaalResponse.opmerking
      ? materiaalResponse.opmerking
      : "";

    this.huishoudenData = [];
    for (let contact of this.contacten) {
      // note to future self, you will regret this slice. I told you so!
      this.huishoudenData.push(
        `${contact.geboorteDatum.slice(0,10)} ${contact.geslacht} - ${contact.voornaam} ${contact.naam}`
      );
    }
    this.info.huishouden = this.huishoudenData.sort().reverse().join("\n");
    this.loading = false;
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

// TODO: abstract away in a service
async function sendPrint(data = {}) {
  console.log(data)
  const response = await fetch("https://onthaal.print.mvm.digital/print", {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  });
  return await response.json();
}
</script>

<style src="../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
ul {
  padding-left: 20px;
}

.multiselect__element {
  display: block;
  background-color: #e4f1e4;
}

.materiaal-info h5 {
  font-size: 1.1rem;
}

.info {
  font-weight: bolder;
  font-size: 1.4rem;
}

/* this is a pain */
.vdp-datepicker {
  width: 150px;
}
.vdp-datepicker input {
  width: 150px;
}

.table .thead-dark th .vdp-datepicker {
  color: #000;
}

</style>
