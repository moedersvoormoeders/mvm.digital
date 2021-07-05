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
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-info btn-lg"
                v-on:click="voedingVandaag('gewoon')"
              >
                <i class="far fa-shopping-cart" /> Voeding Vandaag
              </button>
              <button
                type="button"
                class="btn btn-info dropdown-toggle dropdown-toggle-split btn-lg"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span class="sr-only">Dropdown openen</span>
              </button>
              <div class="dropdown-menu">
                <a class="dropdown-item" v-on:click="voedingVandaag('gewoon')"
                  >Gewoon</a
                >
                <a
                  class="dropdown-item"
                  v-on:click="voedingVandaag('verjaardag')"
                  >Met verjaardag</a
                >
                <a
                  class="dropdown-item"
                  v-on:click="voedingVandaag('vuilzakken')"
                  >Met vuilzakken</a
                >
                <a
                  class="dropdown-item"
                  v-on:click="voedingVandaag('melkpoeder')"
                  >Met (zelfde) melkpoeder</a
                >
              </div>
            </div>
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
          <p class="info">{{ klant.voornaam }} {{ klant.naam }}</p>
        </div>
        <div class="col-4 mb-3">
          <h5>MVM Nummer</h5>
          <p class="info">{{ klant.mvmNummer }}</p>
        </div>
        <div class="col-2 mb-3">
          <h5>Code</h5>
          <p class="info">
            <span
              :style="
                (klant.code || '').indexOf('NB') >= 0 ? 'color: red;' : ''
              "
              >{{ klant.code }}</span
            >
          </p>
        </div>
        <div class="col-3 mb-3">
          <h5>Woonplaats</h5>
          <p class="info">{{ klant.postcode }} {{ klant.woonplaats }}</p>
        </div>
        <div class="col-4">
          <h5>Gezinsleden</h5>
          <div class="gezinsleden" v-html="klant.huishouden"></div>
        </div>
        <div class="col-2">
          <h5>Type Voeding</h5>
          <p class="info">{{ klant.typeVoeding }}</p>
        </div>
        <div class="col-3">
          <h5>Speciale voeding</h5>
          <input
            type="text"
            class="form-control"
            v-model="info.specialeVoeding"
          />
        </div>
        <div class="col-3">
          <h5>Opmerking</h5>
          <textarea
            class="form-control"
            v-model="info.opmerking"
            rows="2"
          ></textarea>
        </div>
      </div>
      <div class="row">
        <h3 class="col-12">
          <span class="float-right">
            <button type="button" class="btn btn-success" v-on:click="addRow()">
              <i class="fas fa-plus-square" /> Rij Toevoegen
            </button>
          </span>
        </h3>
      </div>

      <div>
        <table class="table">
          <colgroup>
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead class="thead-dark">
            <tr>
              <th>Datum</th>
              <th>Aantal</th>
              <th>Item</th>
              <th>Opmerking</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in gekregen"
              v-bind:key="item.ID"
              v-bind:class="rowColors[getDate(item.datum)] ? 'stripe' : ''"
            >
              <td style="width: 160px">
                <datepicker
                  :format="'yyyy-MM-dd'"
                  v-model="item.datum"
                ></datepicker>
              </td>
              <td style="width: 70px">
                <input
                  v-model.number="item.aantal"
                  class="form-control"
                  type="number"
                  min="1"
                  style="width: 60px"
                />
              </td>
              <td>
                <multiselect
                  v-model="item.object"
                  track-by="naam"
                  label="naam"
                  :options="objecten"
                  placeholder="Selecteer een"
                  @select="selectedNewItem($event, item)"
                  :allow-empty="false"
                  deselect-label=""
                ></multiselect>
              </td>
              <td>
                <input
                  v-model="item.opmerking"
                  class="form-control"
                  placeholder="Opmerking"
                  style="width: 170px"
                />
              </td>
              <td style="width: 50px">
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

      <paginate
        :page-count="pageCount"
        :page-range="3"
        :margin-pages="0"
        containerClass="pagination"
        page-class="page-item"
        page-link-class="page-link"
        prev-text="Vorige"
        prev-class="page-item"
        prev-link-class="page-link"
        next-text="Volgende"
        next-class="page-item"
        next-link-class="page-link"
        :click-handler="pageClickCallback"
      >
      </paginate>
    </div>
  </div>
</template>

<script>
import { klantenService } from "../../_services/klanten.service";
import { voedingService } from "../../_services/voeding.service";
import { isJarig } from "../../_helpers/voeding";

import { find } from "lodash";

import Datepicker from "vuejs-datepicker";
import Multiselect from "vue-multiselect";

export default {
  props: ["id"],
  components: {
    Datepicker,
    Multiselect,
  },
  data: function () {
    return {
      klant: {},
      loading: true,
      originalData: "", //JSON stored here
      originalGekregen: "", // JSON of gekregen
      saving: false,
      pageCount: 0,
      gekregen: [],
      info: {
        opmerking: "",
        specialeVoeding: "",
      },
      objecten: [],
      contacten: [],
      deleted: [],
      pageNumber: 1,
    };
  },
  computed: {
    rowColors: function () {
      let out = {};

      let prevDate = null;
      let prevColor = true; // true = colored line
      for (let item of this.gekregen) {
        if (this.getDate(prevDate) != this.getDate(item.datum)) {
          prevColor = !prevColor;
          prevDate = this.getDate(item.datum);

          out[this.getDate(item.datum)] = prevColor;
        }
      }

      return out;
    },
  },
  methods: {
    voedingVandaag: function (extra) {
      for (let row of this.gekregen) {
        if (
          new Date(row.datum).getWeek() === new Date().getWeek() &&
          new Date(row.datum).getFullYear() === new Date().getFullYear() &&
          row.object &&
          row.object.naam === "Voeding"
        ) {
          this.$Simplert.open({
            title: "Error!",
            message: "Klant heeft deze week al voeding gehad",
            type: "error",
            customCloseBtnText: "sluiten",
          });

          return;
        }
      }

      // declaring here as JS doesn't allow it inside cases
      let melkpoeder;

      this.addRow({
        aantal: 1,
        object: find(this.objecten, { naam: "Voeding" }),
        datum: new Date(),
      });
      switch (extra) {
        case "verjaardag":
          this.addRow({
            aantal: 1,
            object: find(this.objecten, { naam: "Verjaardag" }),
            datum: new Date(),
          });
          break;
        case "vuilzakken":
          this.addRow({
            aantal: 1,
            object: find(this.objecten, { naam: "Vuilzakken" }),
            datum: new Date(),
          });
          break;
        case "melkpoeder":
          for (let row of this.gekregen) {
            if (
              row.object &&
              row.object.naam &&
              row.object.naam.indexOf("Melkpoeder") > -1
            ) {
              melkpoeder = row.object;
              break;
            }
          }

          if (!melkpoeder) {
            this.$Simplert.open({
              title: "Error!",
              message:
                "Geen melkpoeder in het verleden gegeven, voeg deze eerst manueel toe.",
              type: "error",
              customCloseBtnText: "sluiten",
            });
            return;
          }
          this.addRow({
            aantal: 1,
            object: melkpoeder,
            datum: new Date(),
          });
          break;
      }

      this.save();
    },
    selectedNewItem: function () {},
    getDate: (d) => {
      const date = new Date(d);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    },
    validate: function () {
      for (let gekregen of this.gekregen) {
        if (!gekregen.object || !gekregen.object.ID) {
          throw new Error("Gekregen niet ingevuld!");
        }
        if (!gekregen.datum) {
          throw new Error("Datum niet ingevuld!");
        }
      }
    },
    addRow: function (obj) {
      if (!obj) {
        obj = {
          aantal: 1,
          datum: new Date(),
        };
      }
      this.gekregen = [obj].concat(this.gekregen);
    },
    removeRow: function (obj) {
      if (obj.ID > 0) {
        this.deleted.push(obj.ID);
      }
      this.gekregen = this.gekregen.filter((aObj) => aObj != obj);
    },
    save: async function () {
      try {
        this.validate();

        const voedingResponse = await voedingService.saveForNumber(
          this.id,
          this.info
        );
        if (voedingResponse.status !== "ok") {
          throw new Error(voedingResponse.message);
        }
        this.storeInfo(voedingResponse.data);

        for (let i in this.gekregen) {
          if (!this.gekregen.hasOwnProperty(i)) {
            continue;
          }
          const resp = await voedingService.saveRow(this.id, this.gekregen[i]);
          if (resp.status !== "ok") {
            throw new Error(resp.message);
          }
          this.gekregen[i] = resp.data;
        }

        for (let id of this.deleted) {
          const resp = await voedingService.deleteRow(this.id, id);
          if (resp.status !== "ok") {
            throw new Error(resp.message);
          }
        }

        this.deleted = [];

        await this.loadPage(this.pageNumber);

        this.$Simplert.open({
          title: "Opgeslagen!",
          message: "",
          type: "success",
          customCloseBtnText: "Sluiten",
        });

        return true;
      } catch (e) {
        this.$Simplert.open({
          title: "Error bij opslaan!",
          message: e,
          type: "error",
          customCloseBtnText: "Sluiten",
        });
        return false;
      }
    },
    hasChanges: function () {
      if (this.deleted.length > 0) {
        return true;
      }

      if (!this.originalData) {
        return false;
      }
      const old = JSON.parse(this.originalData);
      if (
        old.specialeVoeding !== this.info.specialeVoeding ||
        old.opmerking !== this.info.opmerking
      ) {
        return true;
      }

      if (JSON.stringify(this.gekregen) !== this.originalGekregen) {
        return true;
      }

      return false;
    },
    storeInfo: function (data) {
      this.originalData = JSON.stringify(data);

      // a poor woman's copy function
      this.info = JSON.parse(this.originalData);
      this.info.gekregen = null;
    },
    goBack: function () {
      let vm = this;
      if (this.hasChanges()) {
        this.$Simplert.open({
          title: "Er zijn niet opgeslagen wijzigingen!",
          message: "wil je deze opslaan?",
          type: "info",
          useConfirmBtn: true,
          onConfirm: function () {
            vm.save().then((ok) => {
              if (ok) {
                vm.$router.push({ name: "voeding-search" });
              }
            });
          },
          onClose: function () {
            vm.$router.push({ name: "voeding-search" });
          },
          customConfirmBtnClass: "btn btn-warning",
          customConfirmBtnText: "Opslaan",
          customCloseBtnText: "Teruggaan zonder opslagen",
        });
      } else {
        vm.$router.push({ name: "voeding-search" });
      }
    },
    pageClickCallback: async function (num) {
      if (this.hasChanges()) {
        this.$Simplert.open({
          title: "Er zijn niet opgeslagen wijzigingen!",
          message: "wil je deze opslaan?",
          type: "info",
          useConfirmBtn: true,
          onConfirm: () => {
            this.save().then((ok) => {
              if (ok) {
                this.loadPage(num);
              }
            });
          },
          onClose: () => {
            this.loadPage(num);
          },
          customConfirmBtnClass: "btn btn-warning",
          customConfirmBtnText: "Opslaan",
          customCloseBtnText: "Verdergaan zonder opslagen",
        });

        return;
      }
      this.loadPage(num);
    },
    loadPage: async function (num) {
      this.pageNumber = num;

      const { data, totalEntries } = await voedingService.lookPageUpNumber(
        this.id,
        num
      );

      this.gekregen = data;
      this.originalGekregen = JSON.stringify(data);
      this.pageCount = Math.ceil(totalEntries / 10);
      if (this.pageCount < 1) {
        this.pageCount = 1;
      }
    },
  },

  created: async function () {
    this.loading = true;

    let klantResponse;
    let voedingResponse;
    let contacten;
    try {
      klantResponse = await klantenService.lookUpNumber(this.id);
      voedingResponse = await voedingService.lookUpNumber(this.id);
      contacten = await klantenService.getContacten(this.id);
      this.objecten = await voedingService.getObjectOptions();

      await this.loadPage(1);

      // fix a nil response on contacts
      if (!contacten) {
        contacten = [];
      }
    } catch (e) {
      this.$Simplert.open({
        title: "Error!",
        message: e,
        type: "error",
        customCloseBtnText: "Sluiten",
      });

      return;
    }

    this.klant = klantResponse;

    const huishoudenData = [];

    huishoudenData.push(
      `${this.klant.geboortedatum} ${this.klant.geslacht} - ${this.klant.voornaam} ${this.klant.naam}`
    );

    if (isJarig(this.klant.geboortedatum)) {
      huishoudenData[huishoudenData.length - 1] = `${
        huishoudenData[huishoudenData.length - 1]
      }<span class="jarig"> - jarig</span>`;
    }

    for (let contact of contacten) {
      // note to future self, you will regret this slice. I told you so!
      huishoudenData.push(
        `${contact.geboorteDatum.slice(0, 10)} ${contact.geslacht} - ${
          contact.voornaam
        } ${contact.naam}`
      );

      if (isJarig(contact.geboorteDatum)) {
        huishoudenData[huishoudenData.length - 1] = `${
          huishoudenData[huishoudenData.length - 1]
        }<span class="jarig"> - jarig</span>`;
      }
    }
    this.klant.huishouden = huishoudenData.sort().reverse().join("</br>");

    this.storeInfo(voedingResponse);

    this.loading = false;
  },
};
</script>

<style
  src="../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css"
></style>
<style>
.stripe {
  background-color: #c6cbd0;
}
.jarig {
  color: #ff391e;
}
.gezinsleden {
  font-family: "Roboto Mono", monospace;
}
</style>
