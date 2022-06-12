import { atom } from "recoil";
import api from "./../util/api";

const busState = atom({
  key: "busState",
  default: {
    selectedId: "",
    busses: [],
  },
  effects: [
    async ({ setSelf }) => {
      let res = await api.get("/api/v1/bus");
      setSelf((state) => ({
        ...state,
        busses: res.data.data,
      }));
    },
  ],
});

export { busState };
