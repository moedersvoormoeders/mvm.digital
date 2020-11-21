<template id="nav">
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <a class="navbar-brand" href="#">Moeders voor Moeders <span v-if="apiURL == 'https://api.staging.mvm.digital'" class="badge badge-warning">Staging</span></a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <router-link class="nav-link" to="/search"><i class="far fa-tshirt"></i> Materiaal <span class="sr-only">(current)</span></router-link>
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
import config from 'config';

export default {
  data: function () {
    return {
      apiURL: config.apiUrl,
    };
  },
}
</script>