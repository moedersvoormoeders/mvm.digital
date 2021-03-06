import Vue from "vue";
import VueRouter from "vue-router";
import MateriaalSearch from "../views/materiaal/Search.vue";
import MateriaalDetails from "../views/materiaal/Details.vue";
import VoedingSearch from "../views/voeding/Search.vue";
import VoedingDetails from "../views/voeding/Details.vue";
import SinterklaasSearch from "../views/sinterklaas/Search.vue";
import OnthaalSearch from "../views/onthaal/Search.vue";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Nav from "../views/Nav.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/mvm",
    name: "nav",
    component: Nav,
    children: [
      {
        path: "/home",
        name: "home",
        component: Home,
      },
      {
        path: "/materiaal/search",
        name: "materiaal-search",
        component: MateriaalSearch,
      },
      {
        path: "/materiaal/details/:id",
        name: "materiaal-details",
        component: MateriaalDetails,
        props: true,
      },
      {
        path: "/voeding/search",
        name: "voeding-search",
        component: VoedingSearch,
      },
      {
        path: "/voeding/details/:id",
        name: "voeding-details",
        component: VoedingDetails,
        props: true,
      },
      {
        path: "/sinterklaas/search",
        name: "sinterklaas-search",
        component: SinterklaasSearch,
      },
      {
        path: "/onthaal/search",
        name: "onthaal-search",
        component: OnthaalSearch,
      },
    ],
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ["/login"];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem("user");

  if (authRequired && !loggedIn) {
    return next("/login");
  }

  next();
});

router.push("home");

export default router;
