// Conveniently import this file anywhere to use db

import firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FBApiKey,
  authDomain: process.env.VUE_APP_FBAuthDomain,
  databaseURL: process.env.VUE_APP_FBDatabaseURL,
  projectId: process.env.VUE_APP_FBProjectId,
  storageBucket: process.env.VUE_APP_FBStorageBucket,
  messagingSenderId: process.env.VUE_APP_FBMessagingSenderId,
  appId: process.env.VUE_APP_FBAppId,
  measurementId: process.env.VUE_APP_FBMeasurementId
};

export const db = firebase.initializeApp(firebaseConfig).firestore();


