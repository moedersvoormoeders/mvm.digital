<template id="login">
  <div class="bg">
  <div class="container vertical-center">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-5 col-10 login-box">
          <div class="row justify-content-center">
            <img src="/images/logo.png" alt="Moeders voor Moeders" id="logo" class="col-12"/>
          </div>
          <h2>Materiaal</h2>
          <form m v-on:submit.prevent="login">
            <div class="form-group">
              <label class="sr-only" for="username">Gebruikersnaam</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <div class="input-group-text"><i class="fas fa-user"></i></div>
                </div>
                <input type="text" class="form-control" name="username" id="username" v-model="username" placeholder="Gebruikersnaam">
              </div>
            </div>
            <div class="form-group">
              <label class="sr-only" for="password">Wachtwoord</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <div class="input-group-text"><i class="fas fa-key"></i></div>
                </div>
                <input type="password" class="form-control" name="password" id="password" v-model="password" placeholder="Wachtwoord">
              </div>
            </div>
            <button class="btn btn-primary" :disabled="submitted" type="submit" ><i class="fas fa-sign-in-alt"></i> Login</button>
          </form>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>

import { authService } from "../_services/auth.service"

export default {
  template: "#login",
  components: {},
  data: function () {
    return {
      username: "",
      password: "",
      submitted: false,
    };
  },

  methods: {
    login: async function () {
      this.submitted = true;
      if (this.username && this.password) {
        try {
          await authService.login(this.username, this.password)
          this.$router.push("/search")
          this.submitted = false;
        } catch(e) {
          this.submitted = false;
          this.$Simplert.open({
            title: "Login error!",
            message: e,
            type : "error",
            customCloseBtnText: "Sluiten",
          });
        }
      }
    },
  },

  created: function () {},
};
</script>


<style scoped>
.bg {
  background-image: url(/images/moeders.jpg);
  background-repeat:no-repeat;
  background-position:center center;
  background-attachment:fixed; 
  background-size: cover;
}

.login-box {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 10px;
}
.vertical-center {
  min-height: 100vh;

  display: flex;
  align-items: center;
}

#logo {
  max-width: 35%;
  height: auto;
}

h2 {
  text-align: center;
}

</style>