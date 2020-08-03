import Vue from "vue";
import Vuex from "vuex";
import { db } from "@/db.js";
import moment from "moment";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    events: []
  },
  mutations: {
    setEvents: (state, events) => {
      state.events = events;
    }
  },
  actions: {
    setEvents: async context => {
      const snapshot: any = await db.collection("calEvent").get();
      const events: any[] = [];
      snapshot.forEach((doc: { data: () => any; id: any }) => {
        const appData = doc.data();
        appData.id = doc.id;
        /*         appData.start = moment(appData.start).format("YYYY-MM-DD")
        appData.end = moment(appData.end).format("YYYY-MM-DD") */
        events.push(appData);
      });
      console.log(events, "dixie");
      context.commit("setEvents", events);
    }
  },
  modules: {}
});
